"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OpportunityTable from "@/components/opportunities/OpportunityTable";
import SearchBar from "@/components/customers/SearchBar";
import Pagination from "@/components/customers/Pagination";
import {
  ApiOpportunityList,
  Opportunity,
  OpportunityStage,
  OpportunityStatus,
  toOpportunity,
  STAGE_TO_API,
  STATUS_TO_API,
} from "@/data/opportunities";
import { apiRequest, getAccessToken, emitDataChanged } from "@/lib/api";
import { Target, CheckCircle, Trophy, DollarSign, BarChart2 } from "lucide-react";
import ThemeLoader from "@/components/ui/ThemeLoader";

const PAGE_SIZE = 10;
type FilterStage = "All" | OpportunityStage;
type FilterStatus = "All" | OpportunityStatus;
const ALL_STAGES: OpportunityStage[] = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const ALL_STATUSES: OpportunityStatus[] = ["Active", "On Hold", "Inactive"];

interface OpportunityStats {
  total: number;
  active: number;
  closedWon: number;
  pipelineValue: number;
  avgProbability: number;
}

export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState<OpportunityStats>({ total: 0, active: 0, closedWon: 0, pipelineValue: 0, avgProbability: 0 });
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<FilterStage>("All");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<Opportunity | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    const stageQ = stageFilter === "All" ? undefined : STAGE_TO_API[stageFilter];
    const statusQ = statusFilter === "All" ? undefined : STATUS_TO_API[statusFilter];
    if (stageQ) params.set("stage", stageQ);
    if (statusQ) params.set("status", statusQ);
    params.set("page", String(currentPage));

    const run = async () => {
      try {
        const data = await apiRequest<ApiOpportunityList>(`/api/opportunities/?${params.toString()}`);
        if (cancelled) return;
        setOpportunities(data.results.map(toOpportunity));
        setTotalCount(data.count);
        setError(null);
        const maxPage = Math.max(1, Math.ceil(data.count / PAGE_SIZE));
        if (currentPage > maxPage) setCurrentPage(maxPage);
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
        if (!getAccessToken()) router.push("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [search, stageFilter, statusFilter, currentPage, refreshKey, router]);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const s = await apiRequest<{
          total_opportunities: number;
          active_opportunities: number;
          closed_won: number;
          pipeline_value: string;
          average_probability: number;
        }>("/api/opportunities/statistics/");
        if (cancelled) return;
        setStats({
          total: s.total_opportunities,
          active: s.active_opportunities,
          closedWon: s.closed_won,
          pipelineValue: Number(s.pipeline_value),
          avgProbability: s.average_probability,
        });
      } catch { /* keep last known values */ }
    };
    void fetchStats();
    return () => { cancelled = true; };
  }, [refreshKey]);

  function handleSearch(val: string) { setSearch(val); setCurrentPage(1); }
  function handleStageFilter(val: FilterStage) { setStageFilter(val); setCurrentPage(1); }
  function handleStatusFilter(val: FilterStatus) { setStatusFilter(val); setCurrentPage(1); }

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  async function handleDeleteConfirmed() {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await apiRequest(`/api/opportunities/${deleteModal.id}/`, { method: "DELETE" });
      emitDataChanged();
      showToast(`"${deleteModal.name}" has been deleted.`);
      setDeleteModal(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      showToast(`Failed to delete: ${(err as Error).message}`);
    } finally {
      setDeleting(false);
    }
  }

  const STAT_CARDS = [
    { label: "Total Opportunities", value: String(stats.total),                        icon: <Target size={18} />,      color: "#4f46e5", bg: "#eef2ff" },
    { label: "Active",              value: String(stats.active),                       icon: <CheckCircle size={18} />, color: "#16a34a", bg: "#dcfce7" },
    { label: "Closed Won",          value: String(stats.closedWon),                    icon: <Trophy size={18} />,      color: "#d97706", bg: "#fef3c7" },
    { label: "Pipeline Value",      value: `$${stats.pipelineValue.toLocaleString()}`, icon: <DollarSign size={18} />,  color: "#0891b2", bg: "#ecfeff" },
    { label: "Avg Probability",     value: `${stats.avgProbability}%`,                 icon: <BarChart2 size={18} />,   color: "#7c3aed", bg: "#faf5ff" },
  ];

  return (
    <DashboardLayout>
      <div className="page-wrapper">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Opportunities</h1>
            <p className="page-subtitle">Track and manage all your sales opportunities.</p>
          </div>
          <button className="btn-add" onClick={() => router.push("/opportunities/new")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Opportunity
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="msg-error" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
            <span>Failed to load opportunities: {error}</span>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              style={{ flexShrink: 0, padding: "6px 14px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.3)", background: "#fff", color: "#b91c1c", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="dashboard-stats-grid" style={{ gridTemplateColumns: "repeat(5, minmax(0,1fr))" }}>
          {STAT_CARDS.map((card) => (
            <div
              key={card.label}
              className="stat-card-dashboard"
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.08)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <div className="stat-card-dashboard-icon" style={{ background: card.bg, color: card.color }}>
                {card.icon}
              </div>
              <div className="stat-card-dashboard-content">
                <p className="stat-card-dashboard-label">{card.label}</p>
                <p className="stat-card-dashboard-value" style={{ color: card.color }}>
                  {loading && !error ? "…" : card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="table-card">
          <div className="table-toolbar" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <div className="table-toolbar-row">
              <div className="table-search-wrap">
                <SearchBar value={search} onChange={handleSearch} placeholder="Search by name, customer, or company…" resultCount={totalCount} />
              </div>
              <div className="filter-tabs">
                {(["All", ...ALL_STATUSES] as FilterStatus[]).map((tab) => (
                  <button key={tab} className={`filter-tab${statusFilter === tab ? " active" : ""}`} onClick={() => handleStatusFilter(tab)}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="stage-filters">
              <span className="stage-filter-label">Stage:</span>
              {(["All", ...ALL_STAGES] as FilterStage[]).map((tab) => (
                <button key={tab} className={`stage-tab${stageFilter === tab ? " active" : ""}`} onClick={() => handleStageFilter(tab)}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading && !error ? (
            <ThemeLoader label="Loading opportunities..." minHeight={200} />
          ) : (
            <>
              <OpportunityTable
                opportunities={opportunities}
                onView={(o) => router.push(`/opportunities/${o.id}`)}
                onEdit={(o) => router.push(`/opportunities/${o.id}/edit`)}
                onDelete={setDeleteModal}
              />

              {totalCount > 0 && (
                <div className="pagination-wrap">
                  <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalCount} itemsPerPage={PAGE_SIZE} onPageChange={setCurrentPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDeleteModal(null); }}>
          <div className="modal-box">
            <div className="modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <h2 className="modal-title">Delete Opportunity</h2>
            <p className="modal-text">Are you sure you want to delete <strong style={{ color: "var(--foreground)" }}>{deleteModal.name}</strong>? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteModal(null)} disabled={deleting}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteConfirmed} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
          {toastMsg}
        </div>
      )}
    </DashboardLayout>
  );
}
