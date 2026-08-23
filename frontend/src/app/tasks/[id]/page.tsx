"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ApiTask, getTask, deleteTask } from "@/lib/tasksApi";
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

function formatDate(value: string | null) {
  if (!value) return "Not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusLabel(status: ApiTask["status"]) {
  const map: Record<ApiTask["status"], string> = {
    todo: "To Do",
    in_progress: "In Progress",
    completed: "Completed",
    on_hold: "On Hold",
    cancelled: "Cancelled",
  };

  return map[status];
}

function priorityLabel(priority: ApiTask["priority"]) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function statusColor(status: ApiTask["status"]) {
  const map: Record<ApiTask["status"], string> = {
    todo: "#2563eb",
    in_progress: "#d97706",
    completed: "#15803d",
    on_hold: "#64748b",
    cancelled: "#dc2626",
  };

  return map[status];
}

function priorityColor(priority: ApiTask["priority"]) {
  const map: Record<ApiTask["priority"], string> = {
    low: "#16a34a",
    medium: "#d97706",
    high: "#dc2626",
  };

  return map[priority];
}

export default function TaskDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const taskId = params?.id;

  const [task, setTask] = useState<ApiTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!taskId) return;

    async function loadTask() {
      try {
        setLoading(true);
        setError(null);
        const result = await getTask(taskId);
        setTask(result);
      } catch (err) {
        console.error("Failed to load task:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load task."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTask();
  }, [taskId]);

  async function handleDelete() {
    if (!task) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteTask(task.id);
      router.push("/tasks");
      router.refresh();
    } catch (err) {
      console.error("Failed to delete task:", err);
      window.alert(
        err instanceof Error ? err.message : "Failed to delete task."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="page-wrapper">
          <div className="empty-state">
            <p className="empty-state-title">Loading task...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !task) {
    return (
      <DashboardLayout>
        <div className="page-wrapper">
          <button
            className="tasks-btn-secondary"
            onClick={() => router.push("/tasks")}
          >
            <ArrowLeft size={15} />
            Back to Tasks
          </button>

          <div className="empty-state" style={{ marginTop: 24 }}>
            <AlertCircle
              size={42}
              color="#ef4444"
              style={{ marginBottom: 12 }}
            />
            <p className="empty-state-title">Task not found</p>
            <p className="empty-state-description">
              {error || "The requested task could not be loaded."}
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
            alignItems: "flex-start",
            justifyContent: "space-between",
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
                onClick={() => router.push("/tasks")}
                style={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  color: "#64748b",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "0.8125rem",
                }}
              >
                Tasks
              </button>
              <span style={{ color: "#94a3b8" }}>›</span>
              <span style={{ color: "#94a3b8", fontSize: "0.8125rem" }}>
                View Task
              </span>
            </div>

            <h1 className="page-title" style={{ marginBottom: 4 }}>
              {task.title}
            </h1>

            <p className="page-subtitle">
              View task details, status and activity information.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <button
              className="tasks-btn-secondary"
              onClick={() => router.push("/tasks")}
            >
              <ArrowLeft size={15} />
              Back
            </button>

            <button
              className="tasks-btn-secondary"
              onClick={() => router.push(`/tasks/${task.id}/edit`)}
            >
              <Pencil size={15} />
              Edit
            </button>

            <button
              className="tasks-btn-secondary"
              onClick={handleDelete}
              disabled={deleting}
              style={{ color: "#dc2626" }}
            >
              <Trash2 size={15} />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
            gap: 18,
            alignItems: "start",
          }}
        >
          <div className="tasks-form-card">
            <div className="tasks-form-card-header">
              <CheckCircle2 size={17} color="#4f46e5" />
              <h2 className="tasks-form-card-title">Task Information</h2>
            </div>

            <div style={{ padding: "20px 0 0" }}>
              <div style={{ marginBottom: 22 }}>
                <p className="tasks-form-label">Description</p>
                <div
                  style={{
                    color: task.description ? "#334155" : "#94a3b8",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {task.description || "No description provided."}
                </div>
              </div>

              {task.checklist_items?.length > 0 && (
                <div style={{ marginBottom: 22 }}>
                  <p className="tasks-form-label">Checklist</p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 9,
                    }}
                  >
                    {task.checklist_items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                          color: "#334155",
                        }}
                      >
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 5,
                            border: `1px solid ${
                              item.is_completed ? "#22c55e" : "#cbd5e1"
                            }`,
                            background: item.is_completed
                              ? "#dcfce7"
                              : "#fff",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#15803d",
                            fontSize: 12,
                          }}
                        >
                          {item.is_completed ? "✓" : ""}
                        </span>
                        <span
                          style={{
                            textDecoration: item.is_completed
                              ? "line-through"
                              : "none",
                            color: item.is_completed ? "#94a3b8" : "#334155",
                          }}
                        >
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {task.tags?.length > 0 && (
                <div>
                  <p className="tasks-form-label">Tags</p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 7,
                    }}
                  >
                    {task.tags.map((tag) => (
                      <span
                        key={tag.id}
                        style={{
                          padding: "5px 9px",
                          borderRadius: 999,
                          background: "#eef2ff",
                          color: "#4f46e5",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="tasks-form-card">
            <div className="tasks-form-card-header">
              <Calendar size={17} color="#4f46e5" />
              <h2 className="tasks-form-card-title">Task Details</h2>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
                paddingTop: 20,
              }}
            >
              <div>
                <span className="tasks-form-label">Status</span>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    marginTop: 7,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: `${statusColor(task.status)}15`,
                    color: statusColor(task.status),
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: statusColor(task.status),
                    }}
                  />
                  {statusLabel(task.status)}
                </div>
              </div>

              <div>
                <span className="tasks-form-label">Priority</span>
                <div
                  style={{
                    marginTop: 7,
                    color: priorityColor(task.priority),
                    fontWeight: 600,
                  }}
                >
                  {priorityLabel(task.priority)}
                </div>
              </div>

              <div>
                <span className="tasks-form-label">Assignee</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 7,
                    color: "#334155",
                  }}
                >
                  <User size={16} color="#64748b" />
                  {task.assignee_details?.full_name ||
                    task.assignee_details?.username ||
                    "Unassigned"}
                </div>
              </div>

              <div>
                <span className="tasks-form-label">Due Date</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 7,
                    color: task.is_overdue ? "#dc2626" : "#334155",
                    fontWeight: task.is_overdue ? 600 : 400,
                  }}
                >
                  <Calendar size={16} />
                  {formatDate(task.due_date)}
                  {task.is_overdue && " · Overdue"}
                </div>
              </div>

              <div>
                <span className="tasks-form-label">Reminder</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 7,
                    color: "#334155",
                  }}
                >
                  <Clock size={16} color="#64748b" />
                  {task.reminder || "No reminder"}
                </div>
              </div>

              <div>
                <span className="tasks-form-label">Time Tracking</span>
                <div
                  style={{
                    marginTop: 7,
                    color: "#334155",
                  }}
                >
                  {task.time_tracked || 0} minutes
                  {task.tracking_enabled ? " · Enabled" : " · Disabled"}
                </div>
              </div>

              <div>
                <span className="tasks-form-label">Created</span>
                <div style={{ marginTop: 7, color: "#64748b" }}>
                  {formatDate(task.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}