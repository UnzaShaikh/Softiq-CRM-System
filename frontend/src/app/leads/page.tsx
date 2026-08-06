"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LeadTable from "@/components/leads/LeadTable";
import SearchBar from "@/components/customers/SearchBar";
import Pagination from "@/components/customers/Pagination";
import { leads as leadsData, Lead, LeadStatus } from "@/data/leads";

const ITEMS_PER_PAGE = 8;
type FilterStatus = "All" | LeadStatus;
const ALL_STATUSES: LeadStatus[] = ["New", "Contacted", "Qualified", "Lost"];
const STATUS_COLORS: Record<LeadStatus, string> = {
  "New": "#3b82f6", "Contacted": "#f59e0b", "Qualified": "#22c55e", "Lost": "#ef4444",
};

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(leadsData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<Lead | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return leads.filter((l) => {
      const matchSearch = !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.source.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leads, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filtered, currentPage]);

  function handleSearch(val: string) { setSearch(val); setCurrentPage(1); }
  function handleStatusFilter(val: FilterStatus) { setStatusFilter(val); setCurrentPage(1); }

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  function handleDeleteConfirmed() {
    if (!deleteModal) return;
    setLeads((prev) => prev.filter((l) => l.id !== deleteModal.id));
    showToast(`"${deleteModal.name}" has been deleted.`);
    setDeleteModal(null);
  }

  const totalValue = leads.reduce((s, l) => s + (l.score || 0), 0);
  const closedWon = leads.filter((l) => l.status === "Qualified").length;
  const newLeads = leads.filter((l) => l.status === "New").length;

  const STAT_CARDS = [
    { label: "Total Leads",    value: leads.length, icon: "🎯", color: "#4f46e5", bg: "#eef2ff" },
    { label: "New Leads",      value: newLeads,     icon: "✨", color: "#0891b2", bg: "#ecfeff" },
    { label: "Qualified",      value: closedWon,    icon: "🏆", color: "#16a34a", bg: "#dcfce7" },
    { label: "Avg Score",      value: leads.length > 0 ? Math.round(totalValue / leads.length) : 0, icon: "💯", color: "#d97706", bg: "#fef3c7" },
  ];

  return (
    <DashboardLayout>
      <div className="page-wrapper">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Leads</h1>
            <p className="page-subtitle">Track and manage all your sales leads.</p>
          </div>
          <button className="btn-add" onClick={() => router.push("/leads/new")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Lead
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
          <div className="table-toolbar">
            <div className="table-search-wrap">
              <SearchBar value={search} onChange={handleSearch} placeholder="Search leads by name, email, company…" resultCount={filtered.length} />
            </div>
            <div className="filter-tabs">
              {(["All", ...ALL_STATUSES] as FilterStatus[]).map((tab) => (
                <button key={tab} className={`filter-tab${statusFilter === tab ? " active" : ""}`} onClick={() => handleStatusFilter(tab)}>
                  {tab !== "All" && (
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: STATUS_COLORS[tab as LeadStatus], marginRight: 5, verticalAlign: "middle" }} />
                  )}
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <LeadTable leads={paginated} onView={(l) => router.push(`/leads/${l.id}`)} onEdit={(l) => router.push(`/leads/${l.id}/edit`)} onDelete={setDeleteModal} />

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
            <h2 className="modal-title">Delete Lead</h2>
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
