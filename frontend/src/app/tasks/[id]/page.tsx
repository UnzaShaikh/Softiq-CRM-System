"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import { usePermission } from "@/hooks/usePermissions";

import {
  ApiTask,
  getTask,
  deleteTask,
} from "@/lib/tasksApi";

import {
  toTask,
  Task,
} from "@/data/tasks";

import {
  cacheTask,
  getCachedTask,
  removeCachedTask,
  removeTaskFromCachedLists,
} from "@/data/taskCache";

import { emitDataChanged } from "@/lib/api";

import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

function formatDate(
  value: string | null
) {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function statusLabel(
  status: ApiTask["status"]
) {
  const map: Record<
    ApiTask["status"],
    string
  > = {
    todo: "To Do",
    in_progress: "In Progress",
    completed: "Completed",
    on_hold: "On Hold",
    cancelled: "Cancelled",
  };

  return map[status];
}

function priorityLabel(
  priority: ApiTask["priority"]
) {
  return (
    priority.charAt(0).toUpperCase() +
    priority.slice(1)
  );
}

function statusColor(
  status: ApiTask["status"]
) {
  const map: Record<
    ApiTask["status"],
    string
  > = {
    todo: "#2563eb",
    in_progress: "#d97706",
    completed: "#15803d",
    on_hold: "#64748b",
    cancelled: "#dc2626",
  };

  return map[status];
}

function priorityColor(
  priority: ApiTask["priority"]
) {
  const map: Record<
    ApiTask["priority"],
    string
  > = {
    low: "#16a34a",
    medium: "#d97706",
    high: "#dc2626",
  };

  return map[priority];
}

export default function TaskDetailsPage() {
  const router = useRouter();

  const params =
    useParams<{ id: string }>();

  const taskId = params?.id;

  const canEdit = usePermission("tasks", "edit");
  const canDelete = usePermission("tasks", "delete");

  const [task, setTask] =
    useState<ApiTask | null>(() => {
      if (!taskId) return null;

      const cached =
        getCachedTask(taskId);

      return cached
        ? ({
            id: Number(cached.id),
            title: cached.title,
            description:
              cached.description,
            assignee:
              cached.assigneeId,
            assignee_details:
              cached.assigneeId
                ? {
                    id: cached.assigneeId,
                    username:
                      cached.assignee,
                    email: "",
                    full_name:
                      cached.assignee,
                  }
                : null,
            priority:
              cached.priority === "Low"
                ? "low"
                : cached.priority ===
                    "High"
                  ? "high"
                  : "medium",
            status:
              cached.status === "To Do"
                ? "todo"
                : cached.status ===
                    "In Progress"
                  ? "in_progress"
                  : cached.status ===
                      "Completed"
                    ? "completed"
                    : cached.status ===
                        "On Hold"
                      ? "on_hold"
                      : "cancelled",
            due_date:
              cached.dueDate || null,
            created_at:
              cached.createdDate,
            updated_at:
              cached.createdDate,
            is_overdue: false,
            reminder:
              cached.reminder || null,
            related_content_type:
              null,
            related_object_id:
              null,
            related_object_details:
              cached.relatedRecord
                ? {
                    id: 0,
                    str: cached.relatedRecord,
                    model: null,
                  }
                : null,
            tags:
              cached.tags.map(
                (name, index) => ({
                  id: index,
                  name,
                })
              ),
            checklist_items: [],
            attachments: [],
            estimated_time:
              cached.estimatedTime
                ? Number(
                    cached.estimatedTime
                  )
                : null,
            time_tracked: 0,
            tracking_enabled: false,
            repeat_config:
              cached.isRecurring
                ? {}
                : null,
            created_by: null,
            updated_by: null,
          } as ApiTask)
        : null;
    });

  const cachedExists =
    Boolean(
      taskId &&
        getCachedTask(taskId)
    );

  const [loading, setLoading] =
    useState(!cachedExists);

  const [error, setError] =
    useState<string | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  useEffect(() => {
    if (!taskId) return;

    let cancelled = false;

    const run = async () => {
      try {
        const result =
          await getTask(taskId);

        if (cancelled) return;

        setTask(result);

        cacheTask(
          toTask(result)
        );

        setError(null);
      } catch (err) {
        if (cancelled) return;

        if (!task) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load task."
          );
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
  }, [taskId]);

  async function handleDelete() {
    if (!task) return;

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${task.title}"?`
      );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await deleteTask(task.id);

      removeCachedTask(
        task.id
      );

      removeTaskFromCachedLists(
        task.id
      );

      emitDataChanged();

      router.push("/tasks");
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Failed to delete task."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading && !task) {
    return (
      <DashboardLayout>
        <ThemeLoader
          label="Loading task..."
        />
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout>
        <div className="page-wrapper">

          <button
            className="tasks-btn-secondary"
            onClick={() =>
              router.push("/tasks")
            }
          >
            <ArrowLeft size={15} />
            Back to Tasks
          </button>

          <div
            className="empty-state"
            style={{
              marginTop: 24,
            }}
          >
            <AlertCircle
              size={42}
              color="#ef4444"
            />

            <p className="empty-state-title">
              Task not found
            </p>

            <p className="empty-state-description">
              {error ||
                "The requested task could not be loaded."}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-wrapper">

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "flex-start",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 7,
              }}
            >
              <button
                onClick={() =>
                  router.push(
                    "/tasks"
                  )
                }
                style={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                Tasks
              </button>

              <span>›</span>

              <span>
                View Task
              </span>
            </div>

            <h1 className="page-title">
              {task.title}
            </h1>

            <p className="page-subtitle">
              View task details, status
              and activity information.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            <button
              className="tasks-btn-secondary"
              onClick={() =>
                router.push(
                  "/tasks"
                )
              }
            >
              <ArrowLeft size={15} />
              Back
            </button>

            {canEdit && (
            <button
              className="tasks-btn-secondary"
              onClick={() =>
                router.push(
                  `/tasks/${task.id}/edit`
                )
              }
            >
              <Pencil size={15} />
              Edit
            </button>
            )}

            {canDelete && (
            <button
              className="tasks-btn-secondary"
              onClick={handleDelete}
              disabled={deleting}
              style={{
                color: "#dc2626",
              }}
            >
              <Trash2 size={15} />
              {deleting
                ? "Deleting..."
                : "Delete"}
            </button>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 2fr) minmax(280px, 1fr)",
            gap: 18,
          }}
        >

          <div className="tasks-form-card">

            <div className="tasks-form-card-header">
              <CheckCircle2
                size={17}
                color="#4f46e5"
              />

              <h2 className="tasks-form-card-title">
                Task Information
              </h2>
            </div>

            <div
              style={{
                paddingTop: 20,
              }}
            >
              <p className="tasks-form-label">
                Description
              </p>

              <div
                style={{
                  color: task.description
                    ? "#334155"
                    : "#94a3b8",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  marginBottom: 22,
                }}
              >
                {task.description ||
                  "No description provided."}
              </div>

              {task.checklist_items
                ?.length > 0 && (
                <div
                  style={{
                    marginBottom: 22,
                  }}
                >
                  <p className="tasks-form-label">
                    Checklist
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection:
                        "column",
                      gap: 9,
                    }}
                  >
                    {task.checklist_items.map(
                      (item) => (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: 9,
                          }}
                        >
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 5,
                              border:
                                "1px solid #cbd5e1",
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                            }}
                          >
                            {item.is_completed
                              ? "✓"
                              : ""}
                          </span>

                          <span
                            style={{
                              textDecoration:
                                item.is_completed
                                  ? "line-through"
                                  : "none",
                              color:
                                item.is_completed
                                  ? "#94a3b8"
                                  : "#334155",
                            }}
                          >
                            {item.text}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {task.tags?.length > 0 && (
                <div>
                  <p className="tasks-form-label">
                    Tags
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 7,
                    }}
                  >
                    {task.tags.map(
                      (tag) => (
                        <span
                          key={tag.id}
                          style={{
                            padding:
                              "5px 9px",
                            borderRadius:
                              999,
                            background:
                              "#eef2ff",
                            color:
                              "#4f46e5",
                            fontSize:
                              "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          {tag.name}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="tasks-form-card">

            <div className="tasks-form-card-header">
              <Calendar
                size={17}
                color="#4f46e5"
              />

              <h2 className="tasks-form-card-title">
                Task Details
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection:
                  "column",
                gap: 18,
                paddingTop: 20,
              }}
            >
              <div>
                <span className="tasks-form-label">
                  Status
                </span>

                <div
                  style={{
                    marginTop: 7,
                    color:
                      statusColor(
                        task.status
                      ),
                    fontWeight: 600,
                  }}
                >
                  {statusLabel(
                    task.status
                  )}
                </div>
              </div>

              <div>
                <span className="tasks-form-label">
                  Priority
                </span>

                <div
                  style={{
                    marginTop: 7,
                    color:
                      priorityColor(
                        task.priority
                      ),
                    fontWeight: 600,
                  }}
                >
                  {priorityLabel(
                    task.priority
                  )}
                </div>
              </div>

              <div>
                <span className="tasks-form-label">
                  Assignee
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: 8,
                    marginTop: 7,
                  }}
                >
                  <User
                    size={16}
                    color="#64748b"
                  />

                  {task
                    .assignee_details
                    ?.full_name ||
                    task
                      .assignee_details
                      ?.username ||
                    "Unassigned"}
                </div>
              </div>

              <div>
                <span className="tasks-form-label">
                  Due Date
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: 8,
                    marginTop: 7,
                    color:
                      task.is_overdue
                        ? "#dc2626"
                        : "#334155",
                  }}
                >
                  <Calendar size={16} />

                  {formatDate(
                    task.due_date
                  )}

                  {task.is_overdue &&
                    " · Overdue"}
                </div>
              </div>

              <div>
                <span className="tasks-form-label">
                  Reminder
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: 8,
                    marginTop: 7,
                  }}
                >
                  <Clock
                    size={16}
                    color="#64748b"
                  />

                  {task.reminder ||
                    "No reminder"}
                </div>
              </div>

              <div>
                <span className="tasks-form-label">
                  Time Tracking
                </span>

                <div
                  style={{
                    marginTop: 7,
                  }}
                >
                  {task.time_tracked ||
                    0}{" "}
                  minutes
                  {task.tracking_enabled
                    ? " · Enabled"
                    : " · Disabled"}
                </div>
              </div>

              <div>
                <span className="tasks-form-label">
                  Created
                </span>

                <div
                  style={{
                    marginTop: 7,
                    color: "#64748b",
                  }}
                >
                  {formatDate(
                    task.created_at
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}