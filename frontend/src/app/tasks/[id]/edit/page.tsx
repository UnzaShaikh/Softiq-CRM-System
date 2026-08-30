"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";

import {
  ApiTask,
  ApiTaskPriority,
  ApiTaskStatus,
  getTask,
  updateTask,
} from "@/lib/tasksApi";

import {
  toTask,
  Task,
} from "@/data/tasks";

import {
  cacheTask,
  getCachedTask,
} from "@/data/taskCache";

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
  {
    value: "todo",
    label: "To Do",
  },
  {
    value: "in_progress",
    label: "In Progress",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "on_hold",
    label: "On Hold",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

const PRIORITY_OPTIONS: {
  value: ApiTaskPriority;
  label: string;
}[] = [
  {
    value: "low",
    label: "Low",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "high",
    label: "High",
  },
];

function cachedToApiTask(
  task: Task
): ApiTask {
  return {
    id: Number(task.id),

    title: task.title,

    description:
      task.description || "",

    assignee:
      task.assigneeId,

    assignee_details:
      task.assigneeId
        ? {
            id: task.assigneeId,
            username:
              task.assignee,
            email: "",
            full_name:
              task.assignee,
          }
        : null,

    priority:
      task.priority === "Low"
        ? "low"
        : task.priority === "High"
          ? "high"
          : "medium",

    status:
      task.status === "To Do"
        ? "todo"
        : task.status ===
            "In Progress"
          ? "in_progress"
          : task.status ===
              "Completed"
            ? "completed"
            : task.status ===
                "On Hold"
              ? "on_hold"
              : "cancelled",

    due_date:
      task.dueDate || null,

    created_at:
      task.createdDate,

    updated_at:
      task.createdDate,

    is_overdue: false,

    reminder:
      task.reminder || null,

    related_content_type:
      null,

    related_object_id:
      null,

    related_object_details:
      task.relatedRecord
        ? {
            id: 0,
            str: task.relatedRecord,
            model: null,
          }
        : null,

    tags: task.tags.map(
      (name, index) => ({
        id: index,
        name,
      })
    ),

    checklist_items: [],

    attachments: [],

    estimated_time:
      task.estimatedTime
        ? Number(
            task.estimatedTime
          )
        : null,

    time_tracked: 0,

    tracking_enabled:
      task.isRecurring,

    repeat_config:
      null,

    created_by: null,

    updated_by: null,
  };
}

export default function EditTaskPage() {
  const router = useRouter();

  const params =
    useParams<{ id: string }>();

  const taskId = params?.id;

  const cached =
    taskId
      ? getCachedTask(taskId)
      : null;

  const [task, setTask] =
    useState<ApiTask | null>(
      cached
        ? cachedToApiTask(cached)
        : null
    );

  const [title, setTitle] =
    useState(
      cached?.title || ""
    );

  const [description, setDescription] =
    useState(
      cached?.description || ""
    );

  const [status, setStatus] =
    useState<ApiTaskStatus>(
      cached
        ? cachedToApiTask(
            cached
          ).status
        : "todo"
    );

  const [priority, setPriority] =
    useState<ApiTaskPriority>(
      cached
        ? cachedToApiTask(
            cached
          ).priority
        : "medium"
    );

  const [dueDate, setDueDate] =
    useState(
      cached?.dueDate || ""
    );

  const [reminder, setReminder] =
    useState(
      cached?.reminder || ""
    );

  const [estimatedTime, setEstimatedTime] =
    useState(
      cached?.estimatedTime || ""
    );

  const [trackingEnabled, setTrackingEnabled] =
    useState(
      cached?.isRecurring || false
    );

  const [loading, setLoading] =
    useState(!cached);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // ─────────────────────────────────────────────
  // Load cache immediately, then refresh API
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!taskId) return;

    let cancelled = false;

    const run = async () => {
      try {
        const result =
          await getTask(taskId);

        if (cancelled) return;

        setTask(result);

        setTitle(
          result.title || ""
        );

        setDescription(
          result.description || ""
        );

        setStatus(
          result.status
        );

        setPriority(
          result.priority
        );

        setDueDate(
          result.due_date
            ? result.due_date.slice(
                0,
                10
              )
            : ""
        );

        setReminder(
          result.reminder || ""
        );

        setEstimatedTime(
          result.estimated_time !==
            null
            ? String(
                result.estimated_time
              )
            : ""
        );

        setTrackingEnabled(
          Boolean(
            result.tracking_enabled
          )
        );

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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!task) return;

    if (!title.trim()) {
      setError(
        "Task title is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updated =
        await updateTask(
          task.id,
          {
            title:
              title.trim(),

            description:
              description.trim(),

            status,

            priority,

            due_date:
              dueDate
                ? `${dueDate}T23:59:59`
                : null,

            reminder:
              reminder || null,

            estimated_time:
              estimatedTime
                ? Number(
                    estimatedTime
                  )
                : null,

            tracking_enabled:
              trackingEnabled,
          }
        );

      setTask(updated);

      cacheTask(
        toTask(updated)
      );

      router.push(
        `/tasks/${task.id}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update task."
      );
    } finally {
      setSaving(false);
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
              router.push(
                "/tasks"
              )
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
            <p className="empty-state-title">
              Unable to load task
            </p>

            <p className="empty-state-description">
              {error}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div
        style={{
          display: "flex",
          flexDirection:
            "column",
          gap: 20,
        }}
      >

        <div>
          <button
            className="back-btn"
            onClick={() =>
              router.push(
                "/tasks"
              )
            }
            style={{
              marginBottom: 8,
            }}
          >
            <ArrowLeft size={16} />
            Back to Tasks
          </button>

          <h1 className="page-title">
            Edit Task
          </h1>

          <p className="page-subtitle">
            Update the task details
            and save your changes.
          </p>
        </div>

        {error && (
          <div className="msg-error">
            {error}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          className="company-form-card"
          noValidate
        >
          <div className="form-section">

            <div className="form-section-header">
              <h2>
                Task Details
              </h2>

              <p>
                Update the required
                fields below.
              </p>
            </div>

            <div className="tasks-form-layout">

              <div className="tasks-form-main">

                <div className="tasks-form-card">

                  <div className="tasks-form-card-header">
                    <ClipboardEdit
                      size={17}
                      color="#4f46e5"
                    />

                    <h2 className="tasks-form-card-title">
                      Task Information
                    </h2>
                  </div>

                  <div className="tasks-form-field">

                    <label className="tasks-form-label">
                      Task Title{" "}
                      <span className="tasks-required">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      className="tasks-form-input"
                      value={title}
                      onChange={(event) =>
                        setTitle(
                          event.target.value
                        )
                      }
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
                      value={
                        description
                      }
                      onChange={(
                        event
                      ) =>
                        setDescription(
                          event.target
                            .value
                        )
                      }
                      rows={7}
                    />
                  </div>

                  <div className="tasks-form-row-3">

                    <div className="tasks-form-field">
                      <label className="tasks-form-label">
                        Priority
                      </label>

                      <select
                        className="tasks-form-select"
                        value={
                          priority
                        }
                        onChange={(
                          event
                        ) =>
                          setPriority(
                            event.target
                              .value as ApiTaskPriority
                          )
                        }
                      >
                        {PRIORITY_OPTIONS.map(
                          (
                            option
                          ) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="tasks-form-field">
                      <label className="tasks-form-label">
                        Status
                      </label>

                      <select
                        className="tasks-form-select"
                        value={
                          status
                        }
                        onChange={(
                          event
                        ) =>
                          setStatus(
                            event.target
                              .value as ApiTaskStatus
                          )
                        }
                      >
                        {STATUS_OPTIONS.map(
                          (
                            option
                          ) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="tasks-form-field">
                      <label className="tasks-form-label">
                        Due Date
                      </label>

                      <input
                        type="date"
                        className="tasks-form-input"
                        value={
                          dueDate
                        }
                        onChange={(
                          event
                        ) =>
                          setDueDate(
                            event.target
                              .value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="tasks-form-sidebar">

                <div className="tasks-form-card">

                  <div className="tasks-form-card-header">
                    <ClipboardEdit
                      size={17}
                      color="#4f46e5"
                    />

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
                        padding:
                          "11px 12px",
                        border:
                          "1px solid #e2e8f0",
                        borderRadius: 8,
                        background:
                          "#f8fafc",
                        color:
                          "#334155",
                      }}
                    >
                      {task
                        .assignee_details
                        ?.full_name ||
                        task
                          .assignee_details
                          ?.username ||
                        "Unassigned"}
                    </div>
                  </div>

                  <div className="tasks-form-field">

                    <label className="tasks-form-label">
                      Reminder
                    </label>

                    <input
                      type="datetime-local"
                      className="tasks-form-input"
                      value={
                        reminder
                      }
                      onChange={(
                        event
                      ) =>
                        setReminder(
                          event.target
                            .value
                        )
                      }
                    />
                  </div>

                  <div className="tasks-form-field">

                    <label className="tasks-form-label">
                      Estimated Time
                      (minutes)
                    </label>

                    <input
                      type="number"
                      min="0"
                      className="tasks-form-input"
                      value={
                        estimatedTime
                      }
                      onChange={(
                        event
                      ) =>
                        setEstimatedTime(
                          event.target
                            .value
                        )
                      }
                    />
                  </div>

                  <label
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: 9,
                      cursor:
                        "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        trackingEnabled
                      }
                      onChange={(
                        event
                      ) =>
                        setTrackingEnabled(
                          event.target
                            .checked
                        )
                      }
                    />

                    Enable time tracking
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">

            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                router.push(
                  task
                    ? `/tasks/${task.id}`
                    : "/tasks"
                )
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-add"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
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
    </DashboardLayout>
  );
}