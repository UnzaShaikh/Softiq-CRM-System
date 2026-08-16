"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import TaskTable from "@/components/tasks/TaskTable";
import SearchBar from "@/components/customers/SearchBar";
import Pagination from "@/components/customers/Pagination";
import ThemeLoader from "@/components/ui/ThemeLoader";
import {
  Task,
  TaskStatus,
  TaskPriority,
  MOCK_TASKS,
  MOCK_ASSIGNEES,
} from "@/data/tasks";
import {
  ClipboardList,
  Circle,
  Loader2,
  CheckCircle2,
  Kanban,
} from "lucide-react";

// hexToRgba helper — same as dashboard StatCard
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(79,70,229,${alpha})`;
  return `rgba(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)},${alpha})`;
}

const PAGE_SIZE = 10;

const ALL_STATUSES: TaskStatus[] = [
  "To Do",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
];
const ALL_PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];

type FilterStatus   = "All" | TaskStatus;
type FilterPriority = "All" | TaskPriority;
type FilterAssignee = "All" | string;

export default function TasksPage() {
  const router = useRouter();

  /* ── data (static mock; swap for apiRequest when backend is ready) ── */
  const [tasks]   = useState<Task[]>(MOCK_TASKS);
  const [loading] = useState(false);
  const [error]   = useState<string | null>(null);

  /* ── filters ── */
  const [search,          setSearch]          = useState("");
  const [statusFilter,    setStatusFilter]    = useState<FilterStatus>("All");
  const [priorityFilter,  setPriorityFilter]  = useState<FilterPriority>("All");
  const [assigneeFilter,  setAssigneeFilter]  = useState<FilterAssignee>("All");
  const [dueDateFilter,   setDueDateFilter]   = useState("");
  const [showFilters,     setShowFilters]     = useState(false);

  /* ── pagination ── */
  const [currentPage, setCurrentPage] = useState(1);

  /* ── modal / toast ── */
  const [deleteModal, setDeleteModal] = useState<Task | null>(null);
  const [toastMsg,    setToastMsg]    = useState<string | null>(null);

  /* ── computed stats ── */
  const stats = useMemo(() => ({
    total:      tasks.length,
    todo:       tasks.filter((t) => t.status === "To Do").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    completed:  tasks.filter((t) => t.status === "Completed").length,
    overdue: tasks.filter((t) => {
      if (t.status === "Completed" || t.status === "Cancelled") return false;
      return t.dueDate && new Date(t.dueDate) < new Date(new Date().toDateString());
    }).length,
  }), [tasks]);

  /* ── filtered + paginated ── */
  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const q = search.toLowerCase();
      if (
        q &&
        !t.title.toLowerCase().includes(q) &&
        !t.description.toLowerCase().includes(q) &&
        !t.assignee.toLowerCase().includes(q)
      )
        return false;
      if (statusFilter   !== "All" && t.status   !== statusFilter)   return false;
      if (priorityFilter !== "All" && t.priority  !== priorityFilter) return false;
      if (assigneeFilter !== "All" && t.assignee  !== assigneeFilter) return false;
      if (dueDateFilter && t.dueDate !== dueDateFilter)              return false;
      return true;
    });
  }, [tasks, search, statusFilter, priorityFilter, assigneeFilter, dueDateFilter]);

  const totalPages   = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated    = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearch(val: string) {
    setSearch(val);
    setCurrentPage(1);
  }

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  function handleDeleteConfirmed() {
    if (!deleteModal) return;
    showToast(`"${deleteModal.title}" has been deleted.`);
    setDeleteModal(null);
  }

  function clearFilters() {
    setStatusFilter("All");
    setPriorityFilter("All");
    setAssigneeFilter("All");
    setDueDateFilter("");
    setCurrentPage(1);
  }

  const hasActiveFilters =
    statusFilter   !== "All" ||
    priorityFilter !== "All" ||
    assigneeFilter !== "All" ||
    dueDateFilter  !== "";

  /* ── stat cards config ── */
  const STAT_CARDS = [
    {
      label: "Total Tasks",
      value: stats.total,
      change: "All tasks",
      icon: <ClipboardList size={18} />,
      color: "#4f46e5",
    },
    {
      label: "To Do",
      value: stats.todo,
      change: "Pending tasks",
      icon: <Circle size={18} />,
      color: "#2563eb",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      change: "Tasks in progress",
      icon: <Loader2 size={18} />,
      color: "#b45309",
    },
    {
      label: "Completed",
      value: stats.completed,
      change: "Completed tasks",
      icon: <CheckCircle2 size={18} />,
      color: "#15803d",
    },
  ];

  return (
    <DashboardLayout>
      <div className="page-wrapper">

        {/* ── Page Header ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Tasks</h1>
            <p className="page-subtitle">
              Organize, assign and track tasks to get more things done.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="tasks-btn-secondary"
              onClick={() => router.push("/tasks/kanban")}
            >
              <Kanban size={15} />
              View Kanban
            </button>
            <button
              className="btn-add"
              onClick={() => router.push("/tasks/new")}
            >
              <svg
                width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Task
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="dashboard-stats-grid">
          {STAT_CARDS.map((card) => (
            <div
              key={card.label}
              className="stat-card-dashboard"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.08)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              {/* Icon */}
              <div
                className="stat-card-dashboard-icon"
                style={{
                  background: hexToRgba(card.color, 0.1),
                  color: card.color,
                }}
              >
                {card.icon}
              </div>

              {/* Content */}
              <div className="stat-card-dashboard-content">
                <p className="stat-card-dashboard-label">{card.label}</p>
                <p className="stat-card-dashboard-value">{card.value}</p>
                <div className="stat-card-dashboard-change">
                  <span className="stat-card-dashboard-since">{card.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table Card ── */}
        <div className="table-card">

          {/* Toolbar row 1 — search + filter dropdown toggles */}
          <div className="tasks-toolbar">
            <div style={{ flex: "1 1 260px", minWidth: 0 }}>
              <SearchBar
                value={search}
                onChange={handleSearch}
                placeholder="Search tasks by name, description…"
                resultCount={filtered.length}
              />
            </div>

            {/* Inline filter controls */}
            <div className="tasks-filter-row">
              {/* Status filter */}
              <select
                className="tasks-filter-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as FilterStatus);
                  setCurrentPage(1);
                }}
                aria-label="Filter by status"
              >
                <option value="All">All Status</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Priority filter */}
              <select
                className="tasks-filter-select"
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value as FilterPriority);
                  setCurrentPage(1);
                }}
                aria-label="Filter by priority"
              >
                <option value="All">All Priorities</option>
                {ALL_PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              {/* Assignee filter */}
              <select
                className="tasks-filter-select"
                value={assigneeFilter}
                onChange={(e) => {
                  setAssigneeFilter(e.target.value as FilterAssignee);
                  setCurrentPage(1);
                }}
                aria-label="Filter by assignee"
              >
                <option value="All">All Assignees</option>
                {MOCK_ASSIGNEES.map((a) => (
                  <option key={a.name} value={a.name}>{a.name}</option>
                ))}
              </select>

              {/* Due date filter */}
              <div style={{ position: "relative" }}>
                <svg
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    pointerEvents: "none",
                  }}
                  width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <input
                  type="date"
                  className="tasks-filter-select tasks-date-input"
                  value={dueDateFilter}
                  onChange={(e) => {
                    setDueDateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter by due date"
                />
              </div>

              {/* Filters toggle button */}
              <button
                className={`tasks-filters-btn${showFilters ? " active" : ""}${hasActiveFilters ? " has-filters" : ""}`}
                onClick={() => setShowFilters((v) => !v)}
              >
                <svg
                  width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Filters
                {hasActiveFilters && (
                  <span className="tasks-filters-badge">
                    {[statusFilter, priorityFilter, assigneeFilter, dueDateFilter].filter(
                      (v) => v !== "All" && v !== ""
                    ).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active filters strip + clear */}
          {hasActiveFilters && (
            <div className="tasks-active-filters">
              <span className="tasks-active-filters-label">Active filters:</span>
              {statusFilter !== "All" && (
                <span className="tasks-filter-chip">
                  Status: {statusFilter}
                  <button
                    onClick={() => { setStatusFilter("All"); setCurrentPage(1); }}
                    className="tasks-chip-remove"
                    aria-label="Remove status filter"
                  >×</button>
                </span>
              )}
              {priorityFilter !== "All" && (
                <span className="tasks-filter-chip">
                  Priority: {priorityFilter}
                  <button
                    onClick={() => { setPriorityFilter("All"); setCurrentPage(1); }}
                    className="tasks-chip-remove"
                    aria-label="Remove priority filter"
                  >×</button>
                </span>
              )}
              {assigneeFilter !== "All" && (
                <span className="tasks-filter-chip">
                  Assignee: {assigneeFilter}
                  <button
                    onClick={() => { setAssigneeFilter("All"); setCurrentPage(1); }}
                    className="tasks-chip-remove"
                    aria-label="Remove assignee filter"
                  >×</button>
                </span>
              )}
              {dueDateFilter !== "" && (
                <span className="tasks-filter-chip">
                  Due: {new Date(dueDateFilter).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  <button
                    onClick={() => { setDueDateFilter(""); setCurrentPage(1); }}
                    className="tasks-chip-remove"
                    aria-label="Remove date filter"
                  >×</button>
                </span>
              )}
              <button onClick={clearFilters} className="tasks-clear-filters">
                Clear all
              </button>
            </div>
          )}

          {/* Table body */}
          {loading ? (
            <ThemeLoader label="Loading tasks…" minHeight={240} />
          ) : error ? (
            <div className="empty-state">
              <p className="empty-state-title" style={{ color: "var(--error)" }}>
                {error}
              </p>
            </div>
          ) : (
            <TaskTable
              tasks={paginated}
              onView={(t) => router.push(`/tasks/${t.id}`)}
              onEdit={(t) => router.push(`/tasks/${t.id}/edit`)}
              onDelete={setDeleteModal}
            />
          )}

          {/* Pagination */}
          {!loading && !error && filtered.length > 0 && (
            <div className="pagination-wrap">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Delete Modal ── */}
      {deleteModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteModal(null);
          }}
        >
          <div className="modal-box">
            <div className="modal-icon">
              <svg
                width="24" height="24" viewBox="0 0 24 24"
                fill="none" stroke="#ef4444"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" /><path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <h2 className="modal-title">Delete Task</h2>
            <p className="modal-text">
              Are you sure you want to delete{" "}
              <strong style={{ color: "var(--foreground)" }}>
                {deleteModal.title}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setDeleteModal(null)}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteConfirmed}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toastMsg && (
        <div className="toast">
          <svg
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="#22c55e"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toastMsg}
        </div>
      )}
    </DashboardLayout>
  );
}
