"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import TaskPriorityBadge from "@/components/tasks/TaskPriorityBadge";
import {
  Task,
  TaskStatus,
  TaskPriority,
  getAvatarColor,
  getDaysRemaining,
} from "@/data/tasks";
import {
  ApiTask,
  getKanbanTasks,
} from "@/lib/tasksApi";
import { ArrowLeft, SlidersHorizontal, Plus } from "lucide-react";

/* ── Kanban columns in display order ── */
const KANBAN_COLUMNS: {
  status: TaskStatus;
  label: string;
  color: string;
  emptyIcon: React.ReactNode;
  emptyText: string;
  addBtnColor: string;
}[] = [
  {
    status: "To Do",
    label: "To Do",
    color: "#3b82f6",
    emptyIcon: null,
    emptyText: "No tasks to do.",
    addBtnColor: "#3b82f6",
  },
  {
    status: "In Progress",
    label: "In Progress",
    color: "#f59e0b",
    emptyIcon: null,
    emptyText: "Nothing in progress.",
    addBtnColor: "#f59e0b",
  },
  {
    status: "Completed",
    label: "Completed",
    color: "#22c55e",
    emptyIcon: null,
    emptyText: "No completed tasks.",
    addBtnColor: "#22c55e",
  },
  {
    status: "On Hold",
    label: "On Hold",
    color: "#f59e0b",
    emptyIcon: null,
    emptyText: "No tasks on hold.",
    addBtnColor: "#f59e0b",
  },
  {
    status: "Cancelled",
    label: "Cancelled",
    color: "#ef4444",
    emptyIcon: (
      <svg
        width="56" height="56" viewBox="0 0 24 24"
        fill="none" stroke="#fca5a5"
        strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
        style={{ display: "block", margin: "0 auto 12px" }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
    emptyText: "Tasks that are cancelled will appear here.",
    addBtnColor: "#ef4444",
  },
];

type SortMode = "Priority" | "Due Date" | "Assignee" | "Title";

export default function KanbanPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [sortMode,       setSortMode]       = useState<SortMode>("Priority");
  const [showFilters,    setShowFilters]    = useState(false);
  const [toastMsg,       setToastMsg]       = useState<string | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);

  function mapApiTask(api: ApiTask): Task {
    const assigneeName =
      api.assignee_details?.full_name ||
      api.assignee_details?.username ||
      "Unassigned";

    return {
      id: String(api.id),
      title: api.title,
      description: api.description || "",
      assignee: assigneeName,
      assigneeInitials:
        assigneeName === "Unassigned"
          ? "U"
          : assigneeName
              .split(/\\s+/)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
      priority:
        api.priority === "low"
          ? "Low"
          : api.priority === "high"
            ? "High"
            : "Medium",
      status:
        api.status === "todo"
          ? "To Do"
          : api.status === "in_progress"
            ? "In Progress"
            : api.status === "completed"
              ? "Completed"
              : api.status === "on_hold"
                ? "On Hold"
                : "Cancelled",
      dueDate: api.due_date ? api.due_date.slice(0, 10) : "",
      reminder: api.reminder || undefined,
      tags: api.tags?.map((tag) => tag.name) || [],
      createdDate: api.created_at ? api.created_at.slice(0, 10) : "",
    };
  }

  async function loadKanban() {
    try {
      setLoading(true);
      setError(null);
      const response = await getKanbanTasks();
      const allTasks = [
        ...(response.todo || []),
        ...(response.in_progress || []),
        ...(response.completed || []),
        ...(response.on_hold || []),
        ...(response.cancelled || []),
      ];
      setTasks(allTasks.map(mapApiTask));
    } catch (err) {
      console.error("Failed to load kanban tasks:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load kanban tasks."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadKanban();
  }, []);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  /* ── sort helper ── */
  const PRIORITY_ORDER: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };

  function sortTasks(list: Task[]): Task[] {
    return [...list].sort((a, b) => {
      if (sortMode === "Priority") {
        return (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0);
      }
      if (sortMode === "Due Date") {
        return (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
      }
      if (sortMode === "Assignee") {
        return a.assignee.localeCompare(b.assignee);
      }
      return a.title.localeCompare(b.title);
    });
  }

  /* ── grouped by status, filtered by assignee ── */
  const grouped = useMemo(() => {
    const filtered = tasks.filter(
      (t) => assigneeFilter === "All" || t.assignee === assigneeFilter
    );
    const map: Record<TaskStatus, Task[]> = {
      "To Do":       [],
      "In Progress": [],
      Completed:     [],
      "On Hold":     [],
      Cancelled:     [],
    };
    filtered.forEach((t) => map[t.status]?.push(t));
    Object.keys(map).forEach((k) => {
      map[k as TaskStatus] = sortTasks(map[k as TaskStatus]);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, assigneeFilter, sortMode]);

  return (
    <DashboardLayout>
      <div className="page-wrapper" style={{ minWidth: 0 }}>

        {/* ── Page Header ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Tasks – Kanban View</h1>
            <p className="page-subtitle">
              Visualize and manage tasks across different stages.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="tasks-btn-secondary"
              onClick={() => router.push("/tasks")}
            >
              <ArrowLeft size={15} />
              Back to List
            </button>
            <button
              className={`tasks-btn-secondary${showFilters ? " active" : ""}`}
              onClick={() => setShowFilters((v) => !v)}
            >
              <SlidersHorizontal size={15} />
              Filters
            </button>
            <button
              className="btn-add"
              onClick={() => router.push("/tasks/new")}
            >
              <Plus size={15} />
              New Task
            </button>
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div className="tasks-kanban-filterbar">
          {/* Assignee select */}
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <svg
              style={{
                position: "absolute",
                left: 10,
                pointerEvents: "none",
                color: "#64748b",
              }}
              width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <select
              className="tasks-kanban-assignee-select"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              aria-label="Filter by assignee"
            >
              <option value="All">All Assignees</option>
              {Array.from(new Set(tasks.map((t) => t.assignee))).filter(Boolean).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Sort control */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: "0.8125rem",
                color: "#64748b",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              Sort by:
            </span>
            <select
              className="tasks-kanban-sort-select"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              aria-label="Sort tasks"
            >
              {(["Priority", "Due Date", "Assignee", "Title"] as SortMode[]).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Kanban Board ── */}
        {loading ? (
          <div className="empty-state">
            <p className="empty-state-title">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p className="empty-state-title" style={{ color: "var(--error)" }}>
              {error}
            </p>
          </div>
        ) : (
        <div className="tasks-kanban-board">
          {KANBAN_COLUMNS.map((col) => {
            const colTasks = grouped[col.status] ?? [];
            return (
              <div key={col.status} className="tasks-kanban-col">

                {/* Column header */}
                <div className="tasks-kanban-col-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: col.color,
                        flexShrink: 0,
                      }}
                    />
                    <span className="tasks-kanban-col-title">{col.label}</span>
                    <span
                      className="tasks-kanban-col-count"
                      style={{ color: col.color }}
                    >
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    className="tasks-kanban-col-menu"
                    aria-label="Column options"
                    title="Column options"
                  >
                    <svg
                      width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor"
                      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <circle cx="12" cy="5"  r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>
                </div>

                {/* Task cards */}
                <div className="tasks-kanban-cards">
                  {colTasks.length === 0 ? (
                    <div className="tasks-kanban-empty">
                      {col.emptyIcon}
                      {col.status === "Cancelled" && (
                        <p className="tasks-kanban-empty-title">No cancelled tasks</p>
                      )}
                      <p className="tasks-kanban-empty-sub">{col.emptyText}</p>
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <KanbanCard
                        key={task.id}
                        task={task}
                        onEdit={() => router.push(`/tasks/${task.id}/edit`)}
                        onDelete={() => {
                          showToast(`"${task.title}" removed.`);
                        }}
                      />
                    ))
                  )}
                </div>

                {/* Add Task footer */}
                <button
                  className="tasks-kanban-add-btn"
                  style={{ color: col.addBtnColor, borderColor: col.addBtnColor + "33" }}
                  onClick={() => router.push(`/tasks/new?status=${encodeURIComponent(col.status)}`)}
                >
                  <Plus size={14} />
                  Add Task
                </button>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Toast */}
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

/* ─────────────────────────────────────────────────────────────────────────────
   Kanban Task Card
───────────────────────────────────────────────────────────────────────────── */

function KanbanCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [c1, c2]  = getAvatarColor(task.assignee);
  const due       = task.dueDate ? getDaysRemaining(task.dueDate) : null;
  const isCompleted = task.status === "Completed";

  return (
    <div className="tasks-kanban-card">
      {/* Card top row: title + actions */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <p className="tasks-kanban-card-title">{task.title}</p>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button
            className="tasks-kanban-card-action"
            onClick={onEdit}
            title="Edit task"
            aria-label="Edit task"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            className="tasks-kanban-card-action tasks-kanban-card-action-delete"
            onClick={onDelete}
            title="Delete task"
            aria-label="Delete task"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Assignee + Priority row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.625rem",
              flexShrink: 0,
              userSelect: "none",
            }}
          >
            {task.assigneeInitials}
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              color: "#64748b",
              fontWeight: 500,
              maxWidth: 90,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {task.assignee}
          </span>
        </div>
        <TaskPriorityBadge priority={task.priority} />
      </div>

      {/* Due date row */}
      {task.dueDate && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg
              width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="#94a3b8"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span
              style={{
                fontSize: "0.72rem",
                color: "#64748b",
                fontWeight: 500,
              }}
            >
              {new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {isCompleted ? (
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                color: "#15803d",
                background: "#dcfce7",
                padding: "2px 7px",
                borderRadius: 999,
              }}
            >
              Completed
            </span>
          ) : due ? (
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                color: due.isOverdue ? "#ef4444" : due.isToday ? "#f59e0b" : "#64748b",
              }}
            >
              {due.label}
            </span>
          ) : null}
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                color: "#4f46e5",
                background: "#eef2ff",
                padding: "2px 7px",
                borderRadius: 999,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}