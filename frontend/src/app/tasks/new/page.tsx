"use client";
import { KeyboardEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  TaskStatus,
  TaskPriority,
  TaskFormValues,
  DEFAULT_TASK_FORM,
  RelatedModule,
} from "@/data/tasks";
import {
  createTask,
  type ApiTaskPriority,
  type ApiTaskStatus,
} from "@/lib/tasksApi";
import { apiRequest } from "@/lib/api";
import {
  ClipboardEdit,
  FileText,
  ChevronDown,
  Calendar,
  Bell,
  Tag,
  Paperclip,
  Link2,
  CheckSquare,
  Clock,
  Repeat2,
  Upload,
} from "lucide-react";

const ALL_STATUSES: TaskStatus[] = [
  "To Do",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
];

const ALL_PRIORITIES: TaskPriority[] = [
  "Low",
  "Medium",
  "High",
];

const ALL_MODULES: RelatedModule[] = [
  "Customers",
  "Contacts",
  "Leads",
  "Deals",
  "Opportunities",
  "Companies",
  "Activities",
];

const PRIORITY_DOT: Record<TaskPriority, string> = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#ef4444",
};

type NewTaskFormValues = TaskFormValues & {
  relatedRecord: string;
};

const STATUS_DOT: Record<TaskStatus, string> = {
  "To Do": "#3b82f6",
  "In Progress": "#f59e0b",
  Completed: "#22c55e",
  "On Hold": "#64748b",
  Cancelled: "#ef4444",
};

interface BackendUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined?: string;
  role?: string | null;
  role_id?: number | null;
}

interface BackendUserList {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: BackendUser[];
}

interface FormErrors {
  title?: string;
  assignee?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
}

function NewTaskForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialStatus = searchParams.get("status");

  const statusFromQuery: TaskStatus =
    initialStatus === "In Progress"
      ? "In Progress"
      : initialStatus === "Completed"
        ? "Completed"
        : initialStatus === "On Hold"
          ? "On Hold"
          : initialStatus === "Cancelled"
            ? "Cancelled"
            : "To Do";

  const [form, setForm] = useState<NewTaskFormValues>(() => ({
    ...DEFAULT_TASK_FORM,
    status: statusFromQuery,
    relatedRecord: "",
  }));

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [users, setUsers] = useState<BackendUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUsers() {
      try {
        setUsersLoading(true);
        setUsersError(null);

        const response = await apiRequest<
          BackendUserList | BackendUser[]
        >("/api/users/admin/?is_active=true");

        const fetchedUsers = Array.isArray(response)
          ? response
          : response?.results ?? [];

        if (!mounted) {
          return;
        }

        const activeUsers = fetchedUsers.filter(
          (user) => user.is_active !== false
        );

        setUsers(activeUsers);
      } catch (error) {
        console.error(
          "Failed to load users for task assignee:",
          error
        );

        if (!mounted) {
          return;
        }

        setUsers([]);
        setUsersError(
          error instanceof Error
            ? error.message
            : "Unable to load users."
        );
      } finally {
        if (mounted) {
          setUsersLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      mounted = false;
    };
  }, []);

  function setField<K extends keyof NewTaskFormValues>(
    key: K,
    value: NewTaskFormValues[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    if (errors[key as keyof FormErrors]) {
      setErrors((previous) => ({
        ...previous,
        [key]: undefined,
      }));
    }
  }

  function addTag() {
    const tag = tagInput.trim();

    if (tag && !form.tags.includes(tag)) {
      setField("tags", [...form.tags, tag]);
    }

    setTagInput("");
  }

  function removeTag(tag: string) {
    setField(
      "tags",
      form.tags.filter((item) => item !== tag)
    );
  }

  function handleTagKeyDown(
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }

    if (
      event.key === "Backspace" &&
      !tagInput &&
      form.tags.length > 0
    ) {
      setField(
        "tags",
        form.tags.slice(0, -1)
      );
    }
  }

  function validate(): boolean {
    const validationErrors: FormErrors = {};

    if (!form.title.trim()) {
      validationErrors.title =
        "Task title is required.";
    }

    if (!form.assignee) {
      validationErrors.assignee =
        "Please select an assignee.";
    }

    if (!form.dueDate) {
      validationErrors.dueDate =
        "Please set a due date.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) {
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const assigneeId = form.assignee
        ? Number(form.assignee)
        : null;

      if (
        assigneeId === null ||
        !Number.isFinite(assigneeId)
      ) {
        setErrors({
          assignee: "Please select a valid assignee.",
        });

        setSaving(false);
        return;
      }

      const statusMap: Record<
        TaskStatus,
        ApiTaskStatus
      > = {
        "To Do": "todo",
        "In Progress": "in_progress",
        Completed: "completed",
        "On Hold": "on_hold",
        Cancelled: "cancelled",
      };

      const priorityMap: Record<
        TaskPriority,
        ApiTaskPriority
      > = {
        Low: "low",
        Medium: "medium",
        High: "high",
      };

      const payload = {
        title: form.title.trim(),

        description:
          form.description?.trim() || "",

        assignee: assigneeId,

        priority:
          priorityMap[form.priority],

        status:
          statusMap[form.status],

        due_date: form.dueDate
          ? `${form.dueDate}T23:59:59`
          : null,

        reminder:
          form.reminder || null,

        tags: form.tags,

        estimated_time:
          form.estimatedTime
            ? Number.parseInt(
                form.estimatedTime,
                10
              ) || null
            : null,

        tracking_enabled:
          form.trackTime,

        repeat_config: null,
      };

      console.log(
        "Creating task with payload:",
        payload
      );

      await createTask(payload);

      router.push("/tasks");
      router.refresh();
    } catch (error) {
      console.error(
        "Failed to create task:",
        error
      );

      setErrors({
        title:
          error instanceof Error
            ? error.message
            : "Failed to create task. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  function handleDragOver(
    event: React.DragEvent
  ) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(
    event: React.DragEvent
  ) {
    event.preventDefault();
    setIsDragging(false);
  }

  return (
    <DashboardLayout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div>
          <button
            type="button"
            className="back-btn"
            onClick={() =>
              router.push("/tasks")
            }
            style={{
              marginBottom: "8px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>

            Back to Tasks
          </button>

          <h1 className="page-title">
            New Task
          </h1>

          <p className="page-subtitle">
            Fill in the details to create a new
            task.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
          noValidate
          className="company-form-card"
        >
          <div className="form-section">
            <div className="form-section-header">
              <h2>Task Details</h2>
              <p>
                Fill in all the required fields
                below.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div className="tasks-form-layout">
                <div className="tasks-form-main">
                  <div className="tasks-form-card">
                    <div className="tasks-form-card-header">
                      <ClipboardEdit
                        size={16}
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
                        className={`tasks-form-input${
                          errors.title
                            ? " tasks-input-error"
                            : ""
                        }`}
                        placeholder="Enter task title"
                        value={form.title}
                        onChange={(event) =>
                          setField(
                            "title",
                            event.target.value
                          )
                        }
                        maxLength={200}
                        autoFocus
                      />

                      {errors.title ? (
                        <p className="tasks-field-error">
                          {errors.title}
                        </p>
                      ) : (
                        <p className="tasks-field-hint">
                          A clear title helps
                          everyone understand
                          the task.
                        </p>
                      )}
                    </div>

                    <div className="tasks-form-field">
                      <label className="tasks-form-label">
                        Description
                      </label>

                      <div className="tasks-rich-toolbar">
                        {["B", "I", "U"].map(
                          (format) => (
                            <button
                              key={format}
                              type="button"
                              className="tasks-rich-btn"
                              style={{
                                fontWeight:
                                  format === "B"
                                    ? 700
                                    : 400,
                                fontStyle:
                                  format === "I"
                                    ? "italic"
                                    : "normal",
                                textDecoration:
                                  format === "U"
                                    ? "underline"
                                    : "none",
                              }}
                            >
                              {format}
                            </button>
                          )
                        )}

                        <button
                          type="button"
                          className="tasks-rich-btn tasks-rich-btn-icon"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line
                              x1="8"
                              y1="6"
                              x2="21"
                              y2="6"
                            />
                            <line
                              x1="8"
                              y1="12"
                              x2="21"
                              y2="12"
                            />
                            <line
                              x1="8"
                              y1="18"
                              x2="21"
                              y2="18"
                            />
                            <line
                              x1="3"
                              y1="6"
                              x2="3.01"
                              y2="6"
                            />
                            <line
                              x1="3"
                              y1="12"
                              x2="3.01"
                              y2="12"
                            />
                            <line
                              x1="3"
                              y1="18"
                              x2="3.01"
                              y2="18"
                            />
                          </svg>
                        </button>

                        <button
                          type="button"
                          className="tasks-rich-btn tasks-rich-btn-icon"
                        >
                          <Link2 size={12} />
                        </button>

                        <div className="tasks-rich-divider" />

                        <button
                          type="button"
                          className="tasks-rich-btn tasks-rich-btn-icon"
                        >
                          <CheckSquare size={12} />
                        </button>
                      </div>

                      <textarea
                        className="tasks-form-textarea"
                        placeholder="Enter task description…"
                        value={form.description}
                        onChange={(event) =>
                          setField(
                            "description",
                            event.target.value
                          )
                        }
                        rows={4}
                      />

                      <p className="tasks-field-hint">
                        Provide more details about
                        this task.
                      </p>
                    </div>

                    <div className="tasks-form-row-3">
                      <div className="tasks-form-field">
                        <label className="tasks-form-label">
                          Assignee{" "}
                          <span className="tasks-required">
                            *
                          </span>
                        </label>

                        <div className="tasks-select-wrap">
                          <select
                            className={`tasks-form-select${
                              errors.assignee
                                ? " tasks-input-error"
                                : ""
                            }`}
                            value={form.assignee}
                            onChange={(event) =>
                              setField(
                                "assignee",
                                event.target.value
                              )
                            }
                            disabled={usersLoading}
                            aria-label="Select assignee"
                          >
                            <option value="">
                              {usersLoading
                                ? "Loading users…"
                                : "Select assignee"}
                            </option>

                            {!usersLoading &&
                              users.length === 0 && (
                                <option
                                  value=""
                                  disabled
                                >
                                  {usersError
                                    ? "Unable to load users"
                                    : "No active users found"}
                                </option>
                              )}

                            {users.map((user) => {
                              const fullName =
                                `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();

                              const displayName =
                                fullName ||
                                user.username ||
                                user.email;

                              return (
                                <option
                                  key={user.id}
                                  value={String(
                                    user.id
                                  )}
                                >
                                  {displayName}
                                </option>
                              );
                            })}
                          </select>

                          <ChevronDown
                            size={14}
                            className="tasks-select-chevron"
                          />
                        </div>

                        {errors.assignee ? (
                          <p className="tasks-field-error">
                            {errors.assignee}
                          </p>
                        ) : usersError ? (
                          <p className="tasks-field-error">
                            {usersError}
                          </p>
                        ) : (
                          <p className="tasks-field-hint">
                            Choose the person
                            responsible for this
                            task.
                          </p>
                        )}
                      </div>

                      <div className="tasks-form-field">
                        <label className="tasks-form-label">
                          Priority{" "}
                          <span className="tasks-required">
                            *
                          </span>
                        </label>

                        <div className="tasks-select-wrap">
                          <span
                            style={{
                              position: "absolute",
                              left: 12,
                              top: "50%",
                              transform:
                                "translateY(-50%)",
                              width: 8,
                              height: 8,
                              borderRadius:
                                "50%",
                              background:
                                PRIORITY_DOT[
                                  form.priority
                                ],
                              pointerEvents:
                                "none",
                              zIndex: 1,
                            }}
                          />

                          <select
                            className="tasks-form-select tasks-select-with-dot"
                            value={
                              form.priority
                            }
                            onChange={(event) =>
                              setField(
                                "priority",
                                event.target
                                  .value as TaskPriority
                              )
                            }
                            aria-label="Select priority"
                          >
                            {ALL_PRIORITIES.map(
                              (priority) => (
                                <option
                                  key={priority}
                                  value={
                                    priority
                                  }
                                >
                                  {priority}
                                </option>
                              )
                            )}
                          </select>

                          <ChevronDown
                            size={14}
                            className="tasks-select-chevron"
                          />
                        </div>

                        <p className="tasks-field-hint">
                          Set the priority level
                          for this task.
                        </p>
                      </div>

                      <div className="tasks-form-field">
                        <label className="tasks-form-label">
                          Status{" "}
                          <span className="tasks-required">
                            *
                          </span>
                        </label>

                        <div className="tasks-select-wrap">
                          <span
                            style={{
                              position: "absolute",
                              left: 12,
                              top: "50%",
                              transform:
                                "translateY(-50%)",
                              width: 8,
                              height: 8,
                              borderRadius:
                                "50%",
                              background:
                                STATUS_DOT[
                                  form.status
                                ],
                              pointerEvents:
                                "none",
                              zIndex: 1,
                            }}
                          />

                          <select
                            className="tasks-form-select tasks-select-with-dot"
                            value={form.status}
                            onChange={(event) =>
                              setField(
                                "status",
                                event.target
                                  .value as TaskStatus
                              )
                            }
                            aria-label="Select status"
                          >
                            {ALL_STATUSES.map(
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

                          <ChevronDown
                            size={14}
                            className="tasks-select-chevron"
                          />
                        </div>

                        <p className="tasks-field-hint">
                          Select the current
                          status.
                        </p>
                      </div>
                    </div>

                    <div className="tasks-form-row-2">
                      <div className="tasks-form-field">
                        <label className="tasks-form-label">
                          Due Date{" "}
                          <span className="tasks-required">
                            *
                          </span>
                        </label>

                        <div
                          style={{
                            position:
                              "relative",
                          }}
                        >
                          <Calendar
                            size={15}
                            style={{
                              position:
                                "absolute",
                              left: 12,
                              top: "50%",
                              transform:
                                "translateY(-50%)",
                              color: "#94a3b8",
                              pointerEvents:
                                "none",
                              zIndex: 1,
                            }}
                          />

                          <input
                            type="date"
                            className={`tasks-form-input tasks-date-field${
                              errors.dueDate
                                ? " tasks-input-error"
                                : ""
                            }`}
                            value={form.dueDate}
                            onChange={(event) =>
                              setField(
                                "dueDate",
                                event.target.value
                              )
                            }
                          />
                        </div>

                        {errors.dueDate ? (
                          <p className="tasks-field-error">
                            {errors.dueDate}
                          </p>
                        ) : (
                          <p className="tasks-field-hint">
                            Set the due date for
                            task completion.
                          </p>
                        )}
                      </div>

                      <div className="tasks-form-field">
                        <label className="tasks-form-label">
                          Reminder
                        </label>

                        <div
                          style={{
                            position:
                              "relative",
                          }}
                        >
                          <Bell
                            size={15}
                            style={{
                              position:
                                "absolute",
                              left: 12,
                              top: "50%",
                              transform:
                                "translateY(-50%)",
                              color: "#94a3b8",
                              pointerEvents:
                                "none",
                              zIndex: 1,
                            }}
                          />

                          <input
                            type="datetime-local"
                            className="tasks-form-input tasks-date-field"
                            value={
                              form.reminder
                            }
                            onChange={(event) =>
                              setField(
                                "reminder",
                                event.target.value
                              )
                            }
                          />
                        </div>

                        <p className="tasks-field-hint">
                          Get a reminder before
                          the due date.
                        </p>
                      </div>
                    </div>

                    <div className="tasks-form-field">
                      <label className="tasks-form-label">
                        <Tag
                          size={13}
                          style={{
                            display:
                              "inline",
                            marginRight: 5,
                            verticalAlign:
                              "middle",
                          }}
                        />
                        Tags
                      </label>

                      <div
                        className={`tasks-tags-input-wrap${
                          form.tags.length
                            ? " has-tags"
                            : ""
                        }`}
                      >
                        {form.tags.map((tag) => (
                          <span
                            key={tag}
                            className="tasks-tag-chip"
                          >
                            {tag}

                            <button
                              type="button"
                              className="tasks-tag-remove"
                              onClick={() =>
                                removeTag(
                                  tag
                                )
                              }
                            >
                              ×
                            </button>
                          </span>
                        ))}

                        <input
                          type="text"
                          className="tasks-tags-input"
                          placeholder={
                            form.tags.length ===
                            0
                              ? "Add tags (press Enter)"
                              : ""
                          }
                          value={tagInput}
                          onChange={(event) =>
                            setTagInput(
                              event.target.value
                            )
                          }
                          onKeyDown={
                            handleTagKeyDown
                          }
                          onBlur={addTag}
                        />
                      </div>

                      <p className="tasks-field-hint">
                        Add relevant tags to
                        categorize this task.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="tasks-form-sidebar">
                  <div className="tasks-form-card">
                    <div className="tasks-form-card-header">
                      <FileText
                        size={16}
                        color="#4f46e5"
                      />

                      <h2 className="tasks-form-card-title">
                        Task Details
                      </h2>
                    </div>

                    <div className="tasks-form-field">
                      <label className="tasks-form-label">
                        Related To
                      </label>

                      <div className="tasks-select-wrap">
                        <select
                          className="tasks-form-select"
                          value={
                            form.relatedModule
                          }
                          onChange={(event) => {
                            setField(
                              "relatedModule",
                              event.target
                                .value as RelatedModule
                            );

                            setField(
                              "relatedRecord",
                              ""
                            );
                          }}
                        >
                          <option value="">
                            Select related module
                          </option>

                          {ALL_MODULES.map(
                            (module) => (
                              <option
                                key={module}
                                value={module}
                              >
                                {module}
                              </option>
                            )
                          )}
                        </select>

                        <ChevronDown
                          size={14}
                          className="tasks-select-chevron"
                        />
                      </div>

                      <p className="tasks-field-hint">
                        Link this task to a CRM
                        module.
                      </p>
                    </div>

                    <div className="tasks-form-field">
                      <label className="tasks-form-label">
                        Related Record
                      </label>

                      <div className="tasks-select-wrap">
                        <select
                          className="tasks-form-select"
                          value={
                            form.relatedRecord
                          }
                          onChange={(event) =>
                            setField(
                              "relatedRecord",
                              event.target.value
                            )
                          }
                          disabled={
                            !form.relatedModule
                          }
                        >
                          <option value="">
                            Select record
                            (optional)
                          </option>

                          {form.relatedModule && (
                            <option value="record-1">
                              Sample{" "}
                              {form.relatedModule}{" "}
                              Record
                            </option>
                          )}
                        </select>

                        <ChevronDown
                          size={14}
                          className="tasks-select-chevron"
                        />
                      </div>

                      <p className="tasks-field-hint">
                        Choose a specific
                        record.
                      </p>
                    </div>

                    <div className="tasks-form-field">
                      <label className="tasks-form-label">
                        <Clock
                          size={13}
                          style={{
                            display: "inline",
                            marginRight: 5,
                            verticalAlign:
                              "middle",
                          }}
                        />
                        Estimated Time
                      </label>

                      <div
                        style={{
                          position:
                            "relative",
                        }}
                      >
                        <Clock
                          size={15}
                          style={{
                            position:
                              "absolute",
                            left: 12,
                            top: "50%",
                            transform:
                              "translateY(-50%)",
                            color:
                              "#94a3b8",
                          }}
                        />

                        <input
                          type="text"
                          className="tasks-form-input"
                          style={{
                            paddingLeft: 36,
                          }}
                          placeholder="Enter time"
                          value={
                            form.estimatedTime
                          }
                          onChange={(event) =>
                            setField(
                              "estimatedTime",
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <p className="tasks-field-hint">
                        Estimated time to
                        complete (e.g., 2h
                        30m).
                      </p>
                    </div>

                    <div className="tasks-form-field">
                      <label className="tasks-form-label">
                        Tracking
                      </label>

                      <div className="tasks-toggle-row">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={
                            form.trackTime
                          }
                          className={`tasks-toggle${
                            form.trackTime
                              ? " tasks-toggle-on"
                              : ""
                          }`}
                          onClick={() =>
                            setField(
                              "trackTime",
                              !form.trackTime
                            )
                          }
                        />

                        <span className="tasks-toggle-label">
                          Track time spent on
                          this task.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="tasks-form-card">
                    <div className="tasks-form-card-header">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                        />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 1 1.82-.33l.06.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>

                      <h2 className="tasks-form-card-title">
                        Additional Options
                      </h2>
                    </div>

                    <div className="tasks-form-field">
                      <div className="tasks-toggle-row">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={
                            form.isRecurring
                          }
                          className={`tasks-toggle${
                            form.isRecurring
                              ? " tasks-toggle-on"
                              : ""
                          }`}
                          onClick={() =>
                            setField(
                              "isRecurring",
                              !form.isRecurring
                            )
                          }
                        />

                        <div>
                          <p className="tasks-toggle-title">
                            <Repeat2
                              size={13}
                              style={{
                                display:
                                  "inline",
                                marginRight: 5,
                                verticalAlign:
                                  "middle",
                              }}
                            />
                            Repeat Task
                          </p>

                          <p className="tasks-toggle-sub">
                            Make this a recurring
                            task.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="tasks-form-field">
                      <div className="tasks-toggle-row">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={
                            form.hasChecklist
                          }
                          className={`tasks-toggle${
                            form.hasChecklist
                              ? " tasks-toggle-on"
                              : ""
                          }`}
                          onClick={() =>
                            setField(
                              "hasChecklist",
                              !form.hasChecklist
                            )
                          }
                        />

                        <div>
                          <p className="tasks-toggle-title">
                            <CheckSquare
                              size={13}
                              style={{
                                display:
                                  "inline",
                                marginRight: 5,
                                verticalAlign:
                                  "middle",
                              }}
                            />
                            Add Checklist
                          </p>

                          <p className="tasks-toggle-sub">
                            Break this task down
                            into checklist
                            items.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className="tasks-form-field"
                      style={{
                        marginBottom: 0,
                      }}
                    >
                      <p className="tasks-form-label">
                        <Paperclip
                          size={13}
                          style={{
                            display: "inline",
                            marginRight: 5,
                            verticalAlign:
                              "middle",
                          }}
                        />
                        Add Attachment
                      </p>

                      <div
                        className={`tasks-dropzone${
                          isDragging
                            ? " tasks-dropzone-active"
                            : ""
                        }`}
                        onDragOver={
                          handleDragOver
                        }
                        onDragLeave={
                          handleDragLeave
                        }
                        onDrop={handleDrop}
                        onClick={() =>
                          document
                            .getElementById(
                              "task-file-input"
                            )
                            ?.click()
                        }
                        role="button"
                        tabIndex={0}
                      >
                        <Upload
                          size={22}
                          color="#a5b4fc"
                          style={{
                            margin:
                              "0 auto 8px",
                            display: "block",
                          }}
                        />

                        <p className="tasks-dropzone-text">
                          <span className="tasks-dropzone-link">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>

                        <p className="tasks-dropzone-hint">
                          PNG, JPG, PDF up to
                          10MB
                        </p>
                      </div>

                      <input
                        id="task-file-input"
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf"
                        multiple
                        style={{
                          display: "none",
                        }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                router.push("/tasks")
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
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      animation:
                        "spin 0.8s linear infinite",
                    }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>

                  Creating…
                </>
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </DashboardLayout>
  );
}

export default function NewTaskPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "240px",
              padding: "24px",
            }}
          >
            Loading…
          </div>
        </DashboardLayout>
      }
    >
      <NewTaskForm />
    </Suspense>
  );
}
