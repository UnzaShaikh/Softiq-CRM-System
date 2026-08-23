"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  ApiTask,
  ApiTaskPriority,
  ApiTaskStatus,
  getTask,
  updateTask,
} from "@/lib/tasksApi";
import {
  ArrowLeft,
  Save,
  X,
  Loader2,
  ClipboardEdit,
} from "lucide-react";

const STATUS_OPTIONS: {
  value: ApiTaskStatus;
  label: string;
}[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
];

const PRIORITY_OPTIONS: {
  value: ApiTaskPriority;
  label: string;
}[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const taskId = params?.id;

  const [task, setTask] = useState<ApiTask | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ApiTaskStatus>("todo");
  const [priority, setPriority] = useState<ApiTaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [reminder, setReminder] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;

    async function loadTask() {
      try {
        setLoading(true);
        setError(null);

        const result = await getTask(taskId);

        setTask(result);
        setTitle(result.title || "");
        setDescription(result.description || "");
        setStatus(result.status);
        setPriority(result.priority);
        setDueDate(result.due_date ? result.due_date.slice(0, 10) : "");
        setReminder(result.reminder || "");
        setEstimatedTime(
          result.estimated_time !== null
            ? String(result.estimated_time)
            : ""
        );
        setTrackingEnabled(Boolean(result.tracking_enabled));
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!task) return;

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updated = await updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        due_date: dueDate
          ? `${dueDate}T23:59:59`
          : null,
        reminder: reminder || null,
        estimated_time: estimatedTime
          ? Number(estimatedTime)
          : null,
        tracking_enabled: trackingEnabled,
      });

      setTask(updated);

      router.push(`/tasks/${task.id}`);
      router.refresh();
    } catch (err) {
      console.error("Failed to update task:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update task."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="page-wrapper">
          <div className="empty-state">
            <Loader2
              size={30}
              className="animate-spin"
              style={{ marginBottom: 12 }}
            />
            <p className="empty-state-title">Loading task...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !task) {
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
            <p className="empty-state-title">Unable to load task</p>
            <p className="empty-state-description">{error}</p>
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
                Edit Task
              </span>
            </div>

            <h1 className="page-title" style={{ marginBottom: 4 }}>
              Edit Task
            </h1>

            <p className="page-subtitle">
              Update the task details and save your changes.
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
                task
                  ? router.push(`/tasks/${task.id}`)
                  : router.push("/tasks")
              }
              disabled={saving}
            >
              <X size={15} />
              Cancel
            </button>

            <button
              className="btn-add"
              onClick={() =>
                document
                  .getElementById("edit-task-form")
                  ?.dispatchEvent(
                    new Event("submit", {
                      bubbles: true,
                      cancelable: true,
                    })
                  )
              }
              disabled={saving}
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: "11px 14px",
              borderRadius: 8,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}

        <form
          id="edit-task-form"
          onSubmit={handleSubmit}
          className="tasks-form-layout"
        >
          <div className="tasks-form-main">
            <div className="tasks-form-card">
              <div className="tasks-form-card-header">
                <ClipboardEdit size={17} color="#4f46e5" />
                <h2 className="tasks-form-card-title">
                  Task Information
                </h2>
              </div>

              <div className="tasks-form-field">
                <label className="tasks-form-label">
                  Task Title <span className="tasks-required">*</span>
                </label>

                <input
                  type="text"
                  className="tasks-form-input"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter task title"
                  maxLength={200}
                  autoFocus
                />
              </div>

              <div className="tasks-form-field">
                <label className="tasks-form-label">
                  Description
                </label>

                <textarea
                  className="tasks-form-textarea"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Enter task description..."
                  rows={7}
                />
              </div>

              <div className="tasks-form-row-3">
                <div className="tasks-form-field">
                  <label className="tasks-form-label">
                    Priority
                  </label>

                  <div className="tasks-select-wrap">
                    <select
                      className="tasks-form-select"
                      value={priority}
                      onChange={(event) =>
                        setPriority(
                          event.target.value as ApiTaskPriority
                        )
                      }
                    >
                      {PRIORITY_OPTIONS.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="tasks-form-field">
                  <label className="tasks-form-label">
                    Status
                  </label>

                  <div className="tasks-select-wrap">
                    <select
                      className="tasks-form-select"
                      value={status}
                      onChange={(event) =>
                        setStatus(
                          event.target.value as ApiTaskStatus
                        )
                      }
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="tasks-form-field">
                  <label className="tasks-form-label">
                    Due Date
                  </label>

                  <input
                    type="date"
                    className="tasks-form-input"
                    value={dueDate}
                    onChange={(event) =>
                      setDueDate(event.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="tasks-form-sidebar">
            <div className="tasks-form-card">
              <div className="tasks-form-card-header">
                <ClipboardEdit size={17} color="#4f46e5" />
                <h2 className="tasks-form-card-title">
                  Additional Details
                </h2>
              </div>

              <div className="tasks-form-field">
                <label className="tasks-form-label">
                  Assignee
                </label>

                <div
                  style={{
                    padding: "11px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    background: "#f8fafc",
                    color: "#334155",
                    fontSize: "0.875rem",
                  }}
                >
                  {task?.assignee_details?.full_name ||
                    task?.assignee_details?.username ||
                    "Unassigned"}
                </div>

                <p className="tasks-field-hint">
                  The current assignee is preserved while editing.
                </p>
              </div>

              <div className="tasks-form-field">
                <label className="tasks-form-label">
                  Reminder
                </label>

                <input
                  type="text"
                  className="tasks-form-input"
                  value={reminder}
                  onChange={(event) =>
                    setReminder(event.target.value)
                  }
                  placeholder="e.g. 15 minutes before"
                />
              </div>

              <div className="tasks-form-field">
                <label className="tasks-form-label">
                  Estimated Time (minutes)
                </label>

                <input
                  type="number"
                  min="0"
                  className="tasks-form-input"
                  value={estimatedTime}
                  onChange={(event) =>
                    setEstimatedTime(event.target.value)
                  }
                  placeholder="e.g. 60"
                />
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  cursor: "pointer",
                  color: "#334155",
                  fontSize: "0.875rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={trackingEnabled}
                  onChange={(event) =>
                    setTrackingEnabled(event.target.checked)
                  }
                />
                Enable time tracking
              </label>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}