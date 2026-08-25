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
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Page Header */}
        <div>
          <button
            className="back-btn"
            onClick={() => router.push("/tasks")}
            style={{ marginBottom: "8px" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Tasks
          </button>

          <h1 className="page-title">Edit Task</h1>

          <p className="page-subtitle">
            Update the task details and save your changes.
          </p>
        </div>

        {error && <div className="msg-error">{error}</div>}

        {/* Form Card */}
        <form
          id="edit-task-form"
          onSubmit={handleSubmit}
          noValidate
          className="company-form-card"
        >
          <div className="form-section">
            <div className="form-section-header">
              <h2>Task Details</h2>
              <p>Update all the required fields below.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="tasks-form-layout">
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
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                task
                  ? router.push(`/tasks/${task.id}`)
                  : router.push("/tasks")
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button type="submit" className="btn-add" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={15} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
