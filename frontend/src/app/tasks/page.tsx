"use client";

import { useEffect, useMemo, useState } from "react";
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
  ApiTask,
  toTask,
} from "@/data/tasks";
import {
  listTasks,
  deleteTask,
} from "@/lib/tasksApi";
import {
  cacheTask,
  cacheTaskList,
  getCachedTaskList,
  removeCachedTask,
  removeTaskFromCachedLists,
} from "@/data/taskCache";
import { emitDataChanged, getAccessToken } from "@/lib/api";
import { usePermission } from "@/hooks/usePermissions";
import {
  ClipboardList,
  Circle,
  Loader2,
  CheckCircle2,
  Kanban,
} from "lucide-react";

const PAGE_SIZE = 10;

const STATUS_OPTIONS: TaskStatus[] = [
  "To Do",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
];

const PRIORITY_OPTIONS: TaskPriority[] = [
  "Low",
  "Medium",
  "High",
];

type FilterStatus = "All" | TaskStatus;
type FilterPriority = "All" | TaskPriority;

export default function TasksPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalCount, setTotalCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<FilterStatus>("All");

  const [priorityFilter, setPriorityFilter] =
    useState<FilterPriority>("All");

  const [dueDateFilter, setDueDateFilter] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [deleteModal, setDeleteModal] =
    useState<Task | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const [toastMsg, setToastMsg] =
    useState<string | null>(null);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const canCreate = usePermission(
    "tasks",
    "create"
  );

  const canDelete = usePermission(
    "tasks",
    "delete"
  );

  const cacheKey = useMemo(() => {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set(
        "search",
        search.trim()
      );
    }

    if (statusFilter !== "All") {
      const statusMap: Record<
        TaskStatus,
        string
      > = {
        "To Do": "todo",
        "In Progress": "in_progress",
        Completed: "completed",
        "On Hold": "on_hold",
        Cancelled: "cancelled",
      };

      params.set(
        "status",
        statusMap[statusFilter]
      );
    }

    if (priorityFilter !== "All") {
      const priorityMap: Record<
        TaskPriority,
        string
      > = {
        Low: "low",
        Medium: "medium",
        High: "high",
      };

      params.set(
        "priority",
        priorityMap[priorityFilter]
      );
    }

    if (dueDateFilter) {
      params.set(
        "due_date",
        dueDateFilter
      );
    }

    params.set(
      "page",
      String(currentPage)
    );

    return params.toString() || "page=1";
  }, [
    search,
    statusFilter,
    priorityFilter,
    dueDateFilter,
    currentPage,
  ]);

  // ─────────────────────────────────────────────
  // Restore cache after hydration
  // ─────────────────────────────────────────────

  useEffect(() => {
    const cached =
      getCachedTaskList(cacheKey);

    if (!cached) return;

    setTasks(cached.tasks);
    setTotalCount(cached.totalCount);
    setLoading(false);
    setError(null);
  }, [cacheKey]);

  // ─────────────────────────────────────────────
  // Fetch actual backend data
  // ─────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const params: Record<
      string,
      string | number | undefined
    > = {
      page: currentPage,
    };

    if (search.trim()) {
      params.search =
        search.trim();
    }

    if (statusFilter !== "All") {
      const statusMap: Record<
        TaskStatus,
        string
      > = {
        "To Do": "todo",
        "In Progress": "in_progress",
        Completed: "completed",
        "On Hold": "on_hold",
        Cancelled: "cancelled",
      };

      params.status =
        statusMap[statusFilter];
    }

    if (priorityFilter !== "All") {
      const priorityMap: Record<
        TaskPriority,
        string
      > = {
        Low: "low",
        Medium: "medium",
        High: "high",
      };

      params.priority =
        priorityMap[priorityFilter];
    }

    if (dueDateFilter) {
      params.due_date =
        dueDateFilter;
    }

    const cached =
      getCachedTaskList(cacheKey);

    if (!cached) {
      setLoading(true);
    }

    const run = async () => {
      try {
        const response =
          await listTasks(params);

        if (cancelled) return;

        const mapped =
          response.results.map(
            (item: ApiTask) =>
              toTask(item)
          );

        setTasks(mapped);
        setTotalCount(response.count);
        setError(null);

        cacheTaskList(
          cacheKey,
          mapped,
          response.count
        );

        const maxPage = Math.max(
          1,
          Math.ceil(
            response.count /
              PAGE_SIZE
          )
        );

        if (
          currentPage > maxPage
        ) {
          setCurrentPage(maxPage);
        }
      } catch (err) {
        if (cancelled) return;

        if (!cached) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load tasks."
          );

          if (!getAccessToken()) {
            router.push("/login");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    cacheKey,
    currentPage,
    search,
    statusFilter,
    priorityFilter,
    dueDateFilter,
    refreshKey,
    router,
  ]);

  // ─────────────────────────────────────────────
  // Stats
  // ─────────────────────────────────────────────

  const stats = useMemo(() => {
    return {
      total: totalCount,

      todo: tasks.filter(
        (task) =>
          task.status === "To Do"
      ).length,

      inProgress: tasks.filter(
        (task) =>
          task.status ===
          "In Progress"
      ).length,

      completed: tasks.filter(
        (task) =>
          task.status ===
          "Completed"
      ).length,
    };
  }, [tasks, totalCount]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalCount / PAGE_SIZE
    )
  );

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

  function handleSearch(
    value: string
  ) {
    setSearch(value);
    setCurrentPage(1);
  }

  function showToast(
    message: string
  ) {
    setToastMsg(message);

    window.setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  }

  async function handleDelete() {
    if (!deleteModal) return;

    setDeleting(true);

    try {
      await deleteTask(
        deleteModal.id
      );

      removeCachedTask(
        deleteModal.id
      );

      removeTaskFromCachedLists(
        deleteModal.id
      );

      emitDataChanged();

      setTasks((current) =>
        current.filter(
          (task) =>
            task.id !==
            deleteModal.id
        )
      );

      setTotalCount(
        (count) =>
          Math.max(0, count - 1)
      );

      showToast(
        `"${deleteModal.title}" has been deleted.`
      );

      setDeleteModal(null);

      setRefreshKey(
        (value) => value + 1
      );
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Failed to delete task."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="page-wrapper">

        <div className="page-header">
          <div>
            <h1 className="page-title">
              Tasks
            </h1>

            <p className="page-subtitle">
              Organize, assign and track
              tasks to get more things done.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <button
              className="tasks-btn-secondary"
              onClick={() =>
                router.push(
                  "/tasks/kanban"
                )
              }
            >
              <Kanban size={15} />
              View Kanban
            </button>

            {canCreate && (
              <button
                className="btn-add"
                onClick={() =>
                  router.push(
                    "/tasks/new"
                  )
                }
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line
                    x1="12"
                    y1="5"
                    x2="12"
                    y2="19"
                  />
                  <line
                    x1="5"
                    y1="12"
                    x2="19"
                    y2="12"
                  />
                </svg>

                New Task
              </button>
            )}
          </div>
        </div>

        <div className="dashboard-stats-grid">
          <StatCard
            label="Total Tasks"
            value={stats.total}
            icon={<ClipboardList size={18} />}
          />

          <StatCard
            label="To Do"
            value={stats.todo}
            icon={<Circle size={18} />}
          />

          <StatCard
            label="In Progress"
            value={stats.inProgress}
            icon={<Loader2 size={18} />}
          />

          <StatCard
            label="Completed"
            value={stats.completed}
            icon={<CheckCircle2 size={18} />}
          />
        </div>

        <div className="table-card">

          <div className="tasks-toolbar">
            <div
              style={{
                flex: "1 1 260px",
                minWidth: 0,
              }}
            >
              <SearchBar
                value={search}
                onChange={handleSearch}
                placeholder="Search tasks by name, description…"
                resultCount={
                  totalCount
                }
              />
            </div>

            <div className="tasks-filter-row">

              <select
                className="tasks-filter-select"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(
                    event.target
                      .value as FilterStatus
                  );
                  setCurrentPage(1);
                }}
              >
                <option value="All">
                  All Status
                </option>

                {STATUS_OPTIONS.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>

              <select
                className="tasks-filter-select"
                value={priorityFilter}
                onChange={(event) => {
                  setPriorityFilter(
                    event.target
                      .value as FilterPriority
                  );
                  setCurrentPage(1);
                }}
              >
                <option value="All">
                  All Priorities
                </option>

                {PRIORITY_OPTIONS.map(
                  (priority) => (
                    <option
                      key={priority}
                      value={priority}
                    >
                      {priority}
                    </option>
                  )
                )}
              </select>

              <input
                type="date"
                className="tasks-filter-select"
                value={dueDateFilter}
                onChange={(event) => {
                  setDueDateFilter(
                    event.target.value
                  );
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {loading &&
          tasks.length === 0 ? (
            <ThemeLoader
              label="Loading tasks..."
              minHeight={220}
            />
          ) : error &&
            tasks.length === 0 ? (
            <div className="empty-state">
              <p
                className="empty-state-title"
                style={{
                  color:
                    "var(--error)",
                }}
              >
                {error}
              </p>
            </div>
          ) : (
            <TaskTable
              tasks={tasks}
              onView={(task) => {
                cacheTask(task);

                router.push(
                  `/tasks/${task.id}`
                );
              }}
              onEdit={(task) => {
                cacheTask(task);

                router.push(
                  `/tasks/${task.id}/edit`
                );
              }}
              onDelete={
                canDelete
                  ? setDeleteModal
                  : () => {}
              }
            />
          )}

          {!loading &&
            !error &&
            totalCount > 0 && (
              <div className="pagination-wrap">
                <Pagination
                  currentPage={
                    currentPage
                  }
                  totalPages={
                    totalPages
                  }
                  totalItems={
                    totalCount
                  }
                  itemsPerPage={
                    PAGE_SIZE
                  }
                  onPageChange={
                    setCurrentPage
                  }
                />
              </div>
            )}
        </div>
      </div>

      {deleteModal && (
        <div
          className="modal-overlay"
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setDeleteModal(null);
            }
          }}
        >
          <div className="modal-box">
            <div className="modal-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>

            <h2 className="modal-title">
              Delete Task
            </h2>

            <p className="modal-text">
              Are you sure you want to
              delete{" "}
              <strong>
                {deleteModal.title}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() =>
                  setDeleteModal(null)
                }
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="toast">
          {toastMsg}
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="stat-card-dashboard">
      <div className="stat-card-dashboard-icon">
        {icon}
      </div>

      <div className="stat-card-dashboard-content">
        <p className="stat-card-dashboard-label">
          {label}
        </p>

        <p className="stat-card-dashboard-value">
          {value}
        </p>
      </div>
    </div>
  );
}