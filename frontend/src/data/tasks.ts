// ─────────────────────────────────────────────────────────────
// Tasks data types
// Backend source of truth:
// Task model supports:
// status: todo | in_progress | completed | on_hold | cancelled
// priority: low | medium | high
// ─────────────────────────────────────────────────────────────

export type TaskStatus =
  | "To Do"
  | "In Progress"
  | "Completed"
  | "On Hold"
  | "Cancelled";

export type TaskPriority =
  | "Low"
  | "Medium"
  | "High";

export type RelatedModule =
  | "Customers"
  | "Contacts"
  | "Leads"
  | "Deals"
  | "Opportunities"
  | "Companies"
  | "Activities"
  | "";

export type ApiTaskStatus =
  | "todo"
  | "in_progress"
  | "completed"
  | "on_hold"
  | "cancelled";

export type ApiTaskPriority =
  | "low"
  | "medium"
  | "high";

// ─────────────────────────────────────────────────────────────
// API types
// ─────────────────────────────────────────────────────────────

export interface ApiTaskUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
}

export interface ApiTaskRelatedObject {
  id: number;
  str: string;
  model: string | null;
}

export interface ApiTaskTag {
  id: number;
  name: string;
}

export interface ApiChecklistItem {
  id: number;
  task: number;
  text: string;
  is_completed: boolean;
  created_at: string;
}

export interface ApiTaskAttachment {
  id: number;
  task: number;
  file: string;
  uploaded_at: string;
  uploaded_by: number | null;
  uploaded_by_name: string | null;
}

export interface ApiTask {
  id: number;
  title: string;
  description: string | null;

  assignee: number | null;
  assignee_details: ApiTaskUser | null;

  priority: ApiTaskPriority;
  status: ApiTaskStatus;

  due_date: string | null;
  created_at: string;
  updated_at: string;
  is_overdue: boolean;

  reminder: string | null;

  related_content_type: number | null;
  related_object_id: number | null;
  related_object_details: ApiTaskRelatedObject | null;

  tags: ApiTaskTag[];
  checklist_items: ApiChecklistItem[];
  attachments: ApiTaskAttachment[];

  estimated_time: number | null;
  time_tracked: number;
  tracking_enabled: boolean;

  repeat_config: Record<string, unknown> | null;

  created_by: number | null;
  updated_by: number | null;
}

// ─────────────────────────────────────────────────────────────
// Frontend type
// ─────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description: string;

  assignee: string;
  assigneeId: number | null;
  assigneeInitials: string;

  priority: TaskPriority;
  status: TaskStatus;

  dueDate: string;
  reminder?: string;

  relatedModule?: RelatedModule;
  relatedRecord?: string;

  estimatedTime?: string;
  tags: string[];

  isRecurring: boolean;
  hasChecklist: boolean;

  createdDate: string;
}

// ─────────────────────────────────────────────────────────────
// API mappings
// ─────────────────────────────────────────────────────────────

export const STATUS_FROM_API: Record<ApiTaskStatus, TaskStatus> = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

export const STATUS_TO_API: Record<TaskStatus, ApiTaskStatus> = {
  "To Do": "todo",
  "In Progress": "in_progress",
  Completed: "completed",
  "On Hold": "on_hold",
  Cancelled: "cancelled",
};

export const PRIORITY_FROM_API: Record<
  ApiTaskPriority,
  TaskPriority
> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PRIORITY_TO_API: Record<
  TaskPriority,
  ApiTaskPriority
> = {
  Low: "low",
  Medium: "medium",
  High: "high",
};

// ─────────────────────────────────────────────────────────────
// Mapper
// ─────────────────────────────────────────────────────────────

function getAssigneeName(api: ApiTask): string {
  return (
    api.assignee_details?.full_name ||
    api.assignee_details?.username ||
    "Unassigned"
  );
}

function getInitials(name: string): string {
  if (!name || name === "Unassigned") return "U";

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getRelatedModule(api: ApiTask): RelatedModule {
  const model =
    api.related_object_details?.model?.toLowerCase() || "";

  if (model.includes("customer")) return "Customers";
  if (model.includes("contact")) return "Contacts";
  if (model.includes("lead")) return "Leads";
  if (model.includes("deal")) return "Deals";
  if (model.includes("opportunit")) return "Opportunities";
  if (model.includes("compan")) return "Companies";
  if (model.includes("activit")) return "Activities";

  return "";
}

export function toTask(api: ApiTask): Task {
  const assigneeName = getAssigneeName(api);

  return {
    id: String(api.id),

    title: api.title || "",

    description: api.description || "",

    assignee: assigneeName,

    assigneeId: api.assignee,

    assigneeInitials: getInitials(assigneeName),

    priority:
      PRIORITY_FROM_API[api.priority] || "Medium",

    status:
      STATUS_FROM_API[api.status] || "To Do",

    dueDate:
      api.due_date?.slice(0, 10) || "",

    reminder:
      api.reminder || undefined,

    relatedModule:
      getRelatedModule(api),

    relatedRecord:
      api.related_object_details?.str || undefined,

    estimatedTime:
      api.estimated_time !== null
        ? String(api.estimated_time)
        : undefined,

    tags:
      api.tags?.map((tag) => tag.name) || [],

    isRecurring:
      Boolean(api.repeat_config),

    hasChecklist:
      Boolean(api.checklist_items?.length),

    createdDate:
      api.created_at?.slice(0, 10) || "",
  };
}

// ─────────────────────────────────────────────────────────────
// API list
// ─────────────────────────────────────────────────────────────

export interface ApiTaskList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiTask[];
}

// ─────────────────────────────────────────────────────────────
// Form
// ─────────────────────────────────────────────────────────────

export interface TaskFormValues {
  title: string;
  description: string;

  assignee: string;
  assigneeId: number | null;

  priority: TaskPriority;
  status: TaskStatus;

  dueDate: string;
  reminder: string;

  relatedModule: RelatedModule;
  relatedRecordId: string;

  estimatedTime: string;

  tags: string[];

  isRecurring: boolean;
  hasChecklist: boolean;
  trackTime: boolean;
}

export const DEFAULT_TASK_FORM: TaskFormValues = {
  title: "",
  description: "",

  assignee: "",
  assigneeId: null,

  priority: "High",
  status: "To Do",

  dueDate: "",
  reminder: "",

  relatedModule: "",
  relatedRecordId: "",

  estimatedTime: "",

  tags: [],

  isRecurring: false,
  hasChecklist: false,
  trackTime: false,
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

export function getDaysRemaining(
  dueDate: string
): {
  days: number;
  label: string;
  isOverdue: boolean;
  isToday: boolean;
} {
  if (!dueDate) {
    return {
      days: 0,
      label: "No due date",
      isOverdue: false,
      isToday: false,
    };
  }

  const due = new Date(`${dueDate}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diff = Math.round(
    (due.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (diff === 0) {
    return {
      days: 0,
      label: "Today",
      isOverdue: false,
      isToday: true,
    };
  }

  if (diff < 0) {
    const days = Math.abs(diff);

    return {
      days,
      label: `${days} day${days !== 1 ? "s" : ""} overdue`,
      isOverdue: true,
      isToday: false,
    };
  }

  return {
    days: diff,
    label: `${diff} day${diff !== 1 ? "s" : ""} left`,
    isOverdue: false,
    isToday: false,
  };
}

export const AVATAR_COLORS: [string, string][] = [
  ["#4f46e5", "#7c3aed"],
  ["#0891b2", "#0e7490"],
  ["#059669", "#047857"],
  ["#d97706", "#b45309"],
  ["#dc2626", "#b91c1c"],
  ["#7c3aed", "#6d28d9"],
  ["#0d9488", "#0f766e"],
];

export function getAvatarColor(
  name: string
): [string, string] {
  if (!name) return AVATAR_COLORS[0];

  const idx =
    ((name.charCodeAt(0) || 0) +
      (name.charCodeAt(1) || 0)) %
    AVATAR_COLORS.length;

  return AVATAR_COLORS[idx];
}