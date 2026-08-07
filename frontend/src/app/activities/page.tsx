"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ActivityCalendar from "@/components/activities/ActivityCalendar";
import ActivityTable from "@/components/activities/ActivityTable";
import SearchBar from "@/components/customers/SearchBar";
import Pagination from "@/components/customers/Pagination";
import activitiesData, { Activity, ActivityStatus, ActivityType } from "@/data/activities";
import { ActivityStatusBadge } from "@/components/activities/ActivityStatusBadge";
import { Calendar, List, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

const ITEMS_PER_PAGE = 8;
type FilterStatus = "All" | ActivityStatus;
type FilterType = "All" | ActivityType;
type ViewMode = "list" | "calendar";

const ALL_STATUSES: ActivityStatus[] = ["Scheduled", "Completed", "Cancelled", "Overdue"];
const ALL_TYPES: ActivityType[] = ["Call", "Meeting", "Email", "Task", "Follow-up"];

export default function ActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>(activitiesData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [deleteModal, setDeleteModal] = useState<Activity | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return activities.filter((a) => {
      const matchSearch = !q || a.title.toLowerCase().includes(q) || a.relatedTo.toLowerCase().includes(q) || a.assignedTo.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || a.status === statusFilter;
      const matchType = typeFilter === "All" || a.type === typeFilter;
      const matchDateFrom = !dateFrom || a.date >= dateFrom;
      const matchDateTo = !dateTo || a.date <= dateTo;
      return matchSearch && matchStatus && matchType && matchDateFrom && matchDateTo;
    });
  }, [activities, search, statusFilter, typeFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filtered, currentPage]);

  function handleSearch(val: string) { setSearch(val); setCurrentPage(1); }

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  function handleDeleteConfirmed() {
    if (!deleteModal) return;
    setActivities(prev => prev.filter(a => a.id !== deleteModal.id));
    showToast(`"${deleteModal.title}" has been deleted.`);
    setDeleteModal(null);
  }

  const scheduled = activities.filter(a => a.status === "Scheduled").length;
  const completed = activities.filter(a => a.status === "Completed").length;
  const overdue = activities.filter(a => a.status === "Overdue").length;
  const cancelled = activities.filter(a => a.status === "Cancelled").length;

  const STAT_CARDS = [
    { label: "Total Activities", value: activities.length, icon: <Calendar size={20} />, color: "#4f46e5", bg: "#eef2ff" },
    { label: "Scheduled",        value: scheduled,         icon: <Clock size={20} />,    color: "#0891b2", bg: "#ecfeff" },
    { label: "Completed",        value: completed,         icon: <CheckCircle size={20} />, color: "#16a34a", bg: "#dcfce7" },
    { label: "Overdue",          value: overdue,           icon: <AlertCircle size={20} />, color: "#dc2626", bg: "#fef2f2" },
  ];

  return (
    <DashboardLayout>
      <div className="page-wrapper">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Activities</h1>
            <p className="page-subtitle">Schedule and manage all your CRM activities.</p>
          </div>
          <button className="btn-add" onClick={() => router.push("/activities/new")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Schedule Activity
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {STAT_CARDS.map((card) => (
            <div key={card.label} className="stat-card">
              <div className="stat-card-icon" style={{ background: card.bg, color: card.color }}>{card.icon}</div>
              <div>
                <p className="stat-card-value" style={{ color: card.color }}>{card.value}</p>
                <p className="stat-card-label">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* View Toggle */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div className="filter-tabs">
            <button className={`filter-tab${viewMode === "list" ? " active" : ""}`} onClick={() => setViewMode("list")} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <List size={14} /> List
            </button>
            <button className={`filter-tab${viewMode === "calendar" ? " active" : ""}`} onClick={() => setViewMode("calendar")} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Calendar size={14} /> Calendar
            </button>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === "calendar" && (
          <ActivityCalendar activities={filtered} onActivityClick={(a) => router.push(`/activities/${a.id}`)} />
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="table-card">
            {/* Toolbar */}
            <div className="table-toolbar" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <div className="table-toolbar-row">
                <div className="table-search-wrap">
                  <SearchBar value={search} onChange={handleSearch} placeholder="Search activities…" resultCount={filtered.length} />
                </div>
                {/* Status filter */}
                <div className="filter-tabs">
                  {(["All", ...ALL_STATUSES] as FilterStatus[]).map(tab => (
                    <button key={tab} className={`filter-tab${statusFilter === tab ? " active" : ""}`} onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type + Date filters */}
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div className="stage-filters">
                  <span className="stage-filter-label">Type:</span>
                  {(["All", ...ALL_TYPES] as FilterType[]).map(tab => (
                    <button key={tab} className={`stage-tab${typeFilter === tab ? " active" : ""}`} onClick={() => { setTypeFilter(tab); setCurrentPage(1); }}>
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Date range */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
                  <label style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>From:</label>
                  <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
                    className="form-input" style={{ padding: "5px 10px", fontSize: "0.8rem", width: "140px" }} />
                  <label style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>To:</label>
                  <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
                    className="form-input" style={{ padding: "5px 10px", fontSize: "0.8rem", width: "140px" }} />
                  {(dateFrom || dateTo) && (
                    <button onClick={() => { setDateFrom(""); setDateTo(""); }} style={{ fontSize: "0.78rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Clear</button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-title">No activities found.</p>
                <p className="empty-state-sub">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <ActivityTable
                activities={paginated}
                onView={(a) => router.push(`/activities/${a.id}`)}
                onEdit={(a) => router.push(`/activities/${a.id}/edit`)}
                onDelete={setDeleteModal}
              />
            )}

            {filtered.length > 0 && (
              <div className="pagination-wrap">
                <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
              </div>
            )}
          </div>
        )}
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
            <h2 className="modal-title">Delete Activity</h2>
            <p className="modal-text">Are you sure you want to delete <strong style={{ color: "var(--foreground)" }}>{deleteModal.title}</strong>? This cannot be undone.</p>
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
