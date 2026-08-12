"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ActivityCalendar from "@/components/activities/ActivityCalendar";
import ActivityTable from "@/components/activities/ActivityTable";
import SearchBar from "@/components/customers/SearchBar";
import Pagination from "@/components/customers/Pagination";
import ThemeLoader from "@/components/ui/ThemeLoader";
import {
  Activity,
  ActivityStatus,
  ActivityType,
  ActivityPriority,
  ApiActivityList,
  ApiActivitySummary,
  toActivity,
  STATUS_TO_API,
  TYPE_TO_API,
  PRIORITY_TO_API,
} from "@/data/activity";
import { apiRequest, emitDataChanged, getAccessToken } from "@/lib/api";
import { Calendar, List, CheckCircle, Clock, AlertCircle } from "lucide-react";

const PAGE_SIZE = 8;
type FilterStatus = "All" | ActivityStatus;
type FilterType = "All" | ActivityType;
type FilterPriority = "All" | ActivityPriority;
type ViewMode = "list" | "calendar";
type SortKey = "title" | "type" | "status" | "priority" | "date" | "assignedTo";
type SortDir = "asc" | "desc";

const ALL_STATUSES: ActivityStatus[] = ["Scheduled", "Completed", "Cancelled", "Overdue"];
const ALL_TYPES: ActivityType[] = ["Call", "Meeting", "Email", "Task", "Follow-up"];
const ALL_PRIORITIES: ActivityPriority[] = ["High", "Medium", "Low"];

const ORDERING_FIELD: Record<SortKey, string> = {
  title: "title",
  type: "type",
  status: "status",
  priority: "priority",
  date: "date",
  assignedTo: "assigned_to__username",
};

export default function ActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [calendarActivities, setCalendarActivities] = useState<Activity[]>([]);
  const [summary, setSummary] = useState<ApiActivitySummary>({ total_activities: 0, scheduled: 0, completed: 0, cancelled: 0, overdue: 0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>("All");
  const [assignedToFilter, setAssignedToFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<Activity | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const ordering = useMemo(() => `${sortDir === "asc" ? "" : "-"}${ORDERING_FIELD[sortKey]}`, [sortKey, sortDir]);

  useEffect(() => {
    let cancelled = false;
    const loadUsers = async () => {
      try {
        const data = await apiRequest<{ users: { id: number; name: string }[] }>("/api/activities/dropdowns/");
        if (!cancelled) setUsers(data.users ?? []);
      } catch {
        // dropdown failure is non-fatal
      }
    };
    void loadUsers();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter !== "All") params.set("status", STATUS_TO_API[statusFilter]);
    if (typeFilter !== "All") params.set("type", TYPE_TO_API[typeFilter]);
    if (priorityFilter !== "All") params.set("priority", PRIORITY_TO_API[priorityFilter]);
    if (assignedToFilter) params.set("assigned_to", assignedToFilter);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    params.set("ordering", ordering);
    params.set("page", String(currentPage));
    params.set("page_size", String(PAGE_SIZE));

    const run = async () => {
      try {
        const data = await apiRequest<ApiActivityList>(`/api/activities/?${params.toString()}`);
        if (cancelled) return;
        setActivities(data.results.map(toActivity));
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
  }, [search, statusFilter, typeFilter, priorityFilter, assignedToFilter, dateFrom, dateTo, currentPage, ordering, refreshKey, router]);

  useEffect(() => {
    let cancelled = false;
    const fetchSummary = async () => {
      try {
        const s = await apiRequest<ApiActivitySummary>("/api/activities/summary/");
        if (!cancelled) setSummary(s);
      } catch { /* keep last known values */ }
    };
    void fetchSummary();
    return () => { cancelled = true; };
  }, [refreshKey]);

  useEffect(() => {
    if (viewMode !== "calendar") return;
    let cancelled = false;
    const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateFromCal = `${calendarYear}-${pad(calendarMonth + 1)}-01`;
    const dateToCal = `${calendarYear}-${pad(calendarMonth + 1)}-${pad(lastDay.getDate())}`;

    const params = new URLSearchParams();
    params.set("date_from", dateFromCal);
    params.set("date_to", dateToCal);
    params.set("page_size", "200");
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter !== "All") params.set("status", STATUS_TO_API[statusFilter]);
    if (typeFilter !== "All") params.set("type", TYPE_TO_API[typeFilter]);
    if (priorityFilter !== "All") params.set("priority", PRIORITY_TO_API[priorityFilter]);
    if (assignedToFilter) params.set("assigned_to", assignedToFilter);
    if (dateFrom) params.set("date_from", dateFrom > dateFromCal ? dateFrom : dateFromCal);
    if (dateTo) params.set("date_to", dateTo && dateTo < dateToCal ? dateTo : dateToCal);

    const run = async () => {
      try {
        const data = await apiRequest<ApiActivityList>(`/api/activities/?${params.toString()}`);
        if (!cancelled) setCalendarActivities(data.results.map(toActivity));
      } catch { /* keep last known values */ }
    };
    void run();
    return () => { cancelled = true; };
  }, [viewMode, calendarYear, calendarMonth, search, statusFilter, typeFilter, priorityFilter, assignedToFilter, dateFrom, dateTo, refreshKey]);

  function handleSearch(val: string) { setSearch(val); setCurrentPage(1); }
  function handleStatusFilter(val: FilterStatus) { setStatusFilter(val); setCurrentPage(1); }
  function handleTypeFilter(val: FilterType) { setTypeFilter(val); setCurrentPage(1); }
  function handlePriorityFilter(val: FilterPriority) { setPriorityFilter(val); setCurrentPage(1); }
  function handleAssignedToFilter(val: string) { setAssignedToFilter(val); setCurrentPage(1); }

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setCurrentPage(1);
  }

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  async function handleDeleteConfirmed() {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await apiRequest(`/api/activities/${deleteModal.id}/`, { method: "DELETE" });
      emitDataChanged();
      showToast(`"${deleteModal.title}" has been deleted.`);
      setDeleteModal(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      showToast(`Failed to delete: ${(err as Error).message}`);
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(activity: Activity, status: ActivityStatus) {
    try {
      await apiRequest(`/api/activities/${activity.id}/status/`, {
        method: "PATCH",
        body: { status: STATUS_TO_API[status] },
      });
      emitDataChanged();
      showToast(`"${activity.title}" marked as ${status.toLowerCase()}.`);
      setRefreshKey(k => k + 1);
    } catch (err) {
      showToast(`Failed to update status: ${(err as Error).message}`);
    }
  }

  const STAT_CARDS = [
    { label: "Total Activities", value: summary.total_activities, icon: <Calendar size={20} />, color: "#4f46e5", bg: "#eef2ff" },
    { label: "Scheduled",        value: summary.scheduled,        icon: <Clock size={20} />,        color: "#0891b2", bg: "#ecfeff" },
    { label: "Completed",        value: summary.completed,        icon: <CheckCircle size={20} />,  color: "#16a34a", bg: "#dcfce7" },
    { label: "Overdue",          value: summary.overdue,          icon: <AlertCircle size={20} />,  color: "#dc2626", bg: "#fef2f2" },
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

        {/* Error banner */}
        {error && (
          <div className="msg-error" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
            <span>Failed to load activities: {error}</span>
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              style={{ flexShrink: 0, padding: "6px 14px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.3)", background: "#fff", color: "#b91c1c", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          {STAT_CARDS.map((card) => (
            <div key={card.label} className="stat-card">
              <div className="stat-card-icon" style={{ background: card.bg }}>{card.icon}</div>
              <div>
                <p className="stat-card-value" style={{ color: card.color }}>{loading && !error ? "…" : card.value}</p>
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
          <ActivityCalendar
            activities={calendarActivities}
            onActivityClick={(a) => router.push(`/activities/${a.id}`)}
            year={calendarYear}
            month={calendarMonth}
            onMonthChange={(y, m) => { setCalendarYear(y); setCalendarMonth(m); }}
          />
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="table-card">
            {/* Toolbar */}
            <div className="table-toolbar" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <div className="table-toolbar-row">
                <div className="table-search-wrap">
                  <SearchBar value={search} onChange={handleSearch} placeholder="Search activities…" resultCount={totalCount} />
                </div>
                <div className="filter-tabs">
                  {(["All", ...ALL_STATUSES] as FilterStatus[]).map(tab => (
                    <button key={tab} className={`filter-tab${statusFilter === tab ? " active" : ""}`} onClick={() => handleStatusFilter(tab)}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <div className="stage-filters">
                  <span className="stage-filter-label">Type:</span>
                  {(["All", ...ALL_TYPES] as FilterType[]).map(tab => (
                    <button key={tab} className={`stage-tab${typeFilter === tab ? " active" : ""}`} onClick={() => handleTypeFilter(tab)}>
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="stage-filters">
                  <span className="stage-filter-label">Priority:</span>
                  {(["All", ...ALL_PRIORITIES] as FilterPriority[]).map(tab => (
                    <button key={tab} className={`stage-tab${priorityFilter === tab ? " active" : ""}`} onClick={() => handlePriorityFilter(tab)}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <label style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>Assigned To:</label>
                <select
                  value={assignedToFilter}
                  onChange={e => handleAssignedToFilter(e.target.value)}
                  className="form-input"
                  style={{ padding: "5px 10px", fontSize: "0.8rem", width: "160px" }}
                >
                  <option value="">All users</option>
                  {users.map(u => (
                    <option key={u.id} value={String(u.id)}>{u.name}</option>
                  ))}
                </select>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
                  <label style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>From:</label>
                  <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
                    className="form-input" style={{ padding: "5px 10px", fontSize: "0.8rem", width: "140px" }} />
                  <label style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>To:</label>
                  <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
                    className="form-input" style={{ padding: "5px 10px", fontSize: "0.8rem", width: "140px" }} />
                  {(dateFrom || dateTo) && (
                    <button onClick={() => { setDateFrom(""); setDateTo(""); setCurrentPage(1); }} style={{ fontSize: "0.78rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Clear</button>
                  )}
                </div>
              </div>
            </div>

            {loading && !error ? (
              <ThemeLoader label="Loading activities..." minHeight={200} />
            ) : (
              <>
                <ActivityTable
                  activities={activities}
                  onView={(a) => router.push(`/activities/${a.id}`)}
                  onEdit={(a) => router.push(`/activities/${a.id}/edit`)}
                  onDelete={setDeleteModal}
                  onStatusChange={handleStatusChange}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />

                {totalCount > 0 && (
                  <div className="pagination-wrap">
                    <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalCount} itemsPerPage={PAGE_SIZE} onPageChange={setCurrentPage} />
                  </div>
                )}
              </>
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
