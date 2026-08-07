"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OpportunityTable from "@/components/opportunities/OpportunityTable";
import SearchBar from "@/components/customers/SearchBar";
import Pagination from "@/components/customers/Pagination";
import opportunitiesData, { Opportunity, OpportunityStage, OpportunityStatus } from "@/data/opportunities";
import { Target, CheckCircle, Trophy, DollarSign, BarChart2 } from "lucide-react";

const ITEMS_PER_PAGE = 8;
type FilterStage = "All" | OpportunityStage;
type FilterStatus = "All" | OpportunityStatus;
const ALL_STAGES: OpportunityStage[] = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const ALL_STATUSES: OpportunityStatus[] = ["Active", "On Hold", "Inactive"];

export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>(opportunitiesData);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<FilterStage>("All");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<Opportunity | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return opportunities.filter((o) => {
      const matchSearch = !q || o.name.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.company.toLowerCase().includes(q);
      const matchStage = stageFilter === "All" || o.stage === stageFilter;
      const matchStatus = statusFilter === "All" || o.status === statusFilter;
      return matchSearch && matchStage && matchStatus;
    });
  }, [opportunities, search, stageFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filtered, currentPage]);

  function handleSearch(val: string) { setSearch(val); setCurrentPage(1); }

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  function handleDeleteConfirmed() {
    if (!deleteModal) return;
    setOpportunities((prev) => prev.filter((o) => o.id !== deleteModal.id));
    showToast(`"${deleteModal.name}" has been deleted.`);
    setDeleteModal(null);
  }

  const totalValue = opportunities.reduce((s, o) => s + o.dealValue, 0);
  const activeCount = opportunities.filter((o) => o.status === "Active").length;
  const closedWon = opportunities.filter((o) => o.stage === "Closed Won").length;
  const avgProbability = opportunities.length > 0 ? Math.round(opportunities.reduce((s, o) => s + o.probability, 0) / opportunities.length) : 0;

  const STAT_CARDS = [
    { label: "Total Opportunities", value: opportunities.length,              icon: <Target size={20} />,      color: "#4f46e5", bg: "#eef2ff" },
    { label: "Active",              value: activeCount,                       icon: <CheckCircle size={20} />, color: "#16a34a", bg: "#dcfce7" },
    { label: "Closed Won",          value: closedWon,                         icon: <Trophy size={20} />,      color: "#d97706", bg: "#fef3c7" },
    { label: "Pipeline Value",      value: `$${totalValue.toLocaleString()}`, icon: <DollarSign size={20} />,  color: "#0891b2", bg: "#ecfeff" },
    { label: "Avg Probability",     value: `${avgProbability}%`,              icon: <BarChart2 size={20} />,   color: "#7c3aed", bg: "#faf5ff" },
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

        {/* Stats */}
        <div className="stats-grid">
          {STAT_CARDS.map((card) => (
            <div key={card.label} className="stat-card">
              <div className="stat-card-icon" style={{ background: card.bg }}>{card.icon}</div>
              <div>
                <p className="stat-card-value" style={{ color: card.color }}>{card.value}</p>
                <p className="stat-card-label">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="table-card">
          <div className="table-toolbar" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <div className="table-toolbar-row">
              <div className="table-search-wrap">
                <SearchBar value={search} onChange={handleSearch} placeholder="Search by name, customer, or company…" resultCount={filtered.length} />
              </div>
              <div className="filter-tabs">
                {(["All", ...ALL_STATUSES] as FilterStatus[]).map((tab) => (
                  <button key={tab} className={`filter-tab${statusFilter === tab ? " active" : ""}`} onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="stage-filters">
              <span className="stage-filter-label">Stage:</span>
              {(["All", ...ALL_STAGES] as FilterStage[]).map((tab) => (
                <button key={tab} className={`stage-tab${stageFilter === tab ? " active" : ""}`} onClick={() => { setStageFilter(tab); setCurrentPage(1); }}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <OpportunityTable
            opportunities={paginated}
            onView={(o) => router.push(`/opportunities/${o.id}`)}
            onEdit={(o) => router.push(`/opportunities/${o.id}/edit`)}
            onDelete={setDeleteModal}
          />

          {filtered.length > 0 && (
            <div className="pagination-wrap">
              <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
            </div>
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
              <button className="btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteConfirmed}>Delete</button>
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
