// ─── Task Data Types & Mock Data ─────────────────────────────────────────────

export type TaskStatus = "To Do" | "In Progress" | "Completed" | "On Hold" | "Cancelled";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";
export type RelatedModule =
  | "Customers"
  | "Contacts"
  | "Leads"
  | "Deals"
  | "Opportunities"
  | "Companies"
  | "Activities"
  | "";

// ─── API shape (matches backend) ─────────────────────────────────────────────

export interface ApiTask {
  id: number;
  title: string;
  description: string;
  assignee: string;
  assignee_initials: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "completed" | "on_hold" | "cancelled";
  due_date: string;          // ISO date  "2026-05-20"
  reminder?: string | null;
  related_module?: string;
  related_record?: string;
  estimated_time?: string;
  tags?: string[];
  is_recurring?: boolean;
  has_checklist?: boolean;
  created_at: string;        // ISO datetime
  updated_at: string;
}

// ─── Front-end shape ─────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeInitials: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;           // "YYYY-MM-DD"
  reminder?: string;
  relatedModule?: RelatedModule;
  relatedRecord?: string;
  estimatedTime?: string;
  tags?: string[];
  isRecurring?: boolean;
  hasChecklist?: boolean;
  createdDate: string;       // "YYYY-MM-DD"
}

// ─── Status mappings ─────────────────────────────────────────────────────────

export const STATUS_FROM_API: Record<ApiTask["status"], TaskStatus> = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

export const STATUS_TO_API: Record<TaskStatus, ApiTask["status"]> = {
  "To Do": "todo",
  "In Progress": "in_progress",
  "Completed": "completed",
  "On Hold": "on_hold",
  "Cancelled": "cancelled",
};

// ─── Priority mappings ───────────────────────────────────────────────────────

export const PRIORITY_FROM_API: Record<ApiTask["priority"], TaskPriority> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_TO_API: Record<TaskPriority, ApiTask["priority"]> = {
  Low: "low",
  Medium: "medium",
  High: "high",
  Urgent: "urgent",
};

// ─── Mapper ──────────────────────────────────────────────────────────────────

export function toTask(api: ApiTask): Task {
  return {
    id: String(api.id),
    title: api.title,
    description: api.description,
    assignee: api.assignee,
    assigneeInitials: api.assignee_initials || api.assignee.substring(0, 2).toUpperCase(),
    priority: PRIORITY_FROM_API[api.priority],
    status: STATUS_FROM_API[api.status],
    dueDate: api.due_date?.slice(0, 10) ?? "",
    reminder: api.reminder ?? undefined,
    relatedModule: (api.related_module as RelatedModule) ?? "",
    relatedRecord: api.related_record ?? undefined,
    estimatedTime: api.estimated_time ?? undefined,
    tags: api.tags ?? [],
    isRecurring: api.is_recurring ?? false,
    hasChecklist: api.has_checklist ?? false,
    createdDate: api.created_at?.slice(0, 10) ?? "",
  };
}

// ─── API list wrapper ────────────────────────────────────────────────────────

export interface ApiTaskList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiTask[];
}

// ─── Form values (for New/Edit form) ─────────────────────────────────────────

export interface TaskFormValues {
  title: string;
  description: string;
  assignee: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  reminder: string;
  relatedModule: RelatedModule;
  relatedRecord: string;
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
  priority: "High",
  status: "To Do",
  dueDate: "",
  reminder: "",
  relatedModule: "",
  relatedRecord: "",
  estimatedTime: "",
  tags: [],
  isRecurring: false,
  hasChecklist: false,
  trackTime: false,
};

// ─── Mock data (used when API not available) ──────────────────────────────────

export const MOCK_ASSIGNEES = [
  { name: "Test User",  initials: "TU" },
  { name: "Sara Khan",  initials: "SK" },
  { name: "Abdullah",   initials: "AB" },
  { name: "Junaid",     initials: "JN" },
  { name: "Unza",       initials: "UN" },
  { name: "Enzela",     initials: "EN" },
];

export const MOCK_TASKS: Task[] = [
  {
    id: "T001",
    title: "Follow up with Acme Corp",
    description: "Contact Acme Corp regarding new proposal and schedule a demo.",
    assignee: "Test User",
    assigneeInitials: "TU",
    priority: "High",
    status: "To Do",
    dueDate: "2026-05-20",
    createdDate: "2026-05-15",
    tags: ["follow-up", "sales"],
  },
  {
    id: "T002",
    title: "Prepare Q2 Sales Report",
    description: "Compile and prepare the Q2 sales performance report.",
    assignee: "Sara Khan",
    assigneeInitials: "SK",
    priority: "Medium",
    status: "In Progress",
    dueDate: "2026-05-22",
    createdDate: "2026-05-14",
    tags: ["report"],
  },
  {
    id: "T003",
    title: "Client Onboarding - Beta Ltd.",
    description: "Complete onboarding process for Beta Ltd. and provide access.",
    assignee: "Abdullah",
    assigneeInitials: "AB",
    priority: "High",
    status: "In Progress",
    dueDate: "2026-05-18",
    createdDate: "2026-05-12",
    tags: ["onboarding"],
  },
  {
    id: "T004",
    title: "Update Product Documentation",
    description: "Update documentation for the new CRM features.",
    assignee: "Junaid",
    assigneeInitials: "JN",
    priority: "Low",
    status: "To Do",
    dueDate: "2026-05-25",
    createdDate: "2026-05-10",
    tags: ["docs"],
  },
  {
    id: "T005",
    title: "Fix Report Export Issue",
    description: "Resolve the issue with exporting reports in PDF format.",
    assignee: "Enzela",
    assigneeInitials: "EN",
    priority: "High",
    status: "Completed",
    dueDate: "2026-05-12",
    createdDate: "2026-05-08",
    tags: ["bug", "reports"],
  },
  {
    id: "T006",
    title: "Integrate Email Template API",
    description: "Integrate the new email template API with CRM.",
    assignee: "Unza",
    assigneeInitials: "UN",
    priority: "Medium",
    status: "Completed",
    dueDate: "2026-05-09",
    createdDate: "2026-05-07",
    tags: ["integration"],
  },
  {
    id: "T007",
    title: "Design New Landing Page",
    description: "Create a new landing page design for the upcoming product launch.",
    assignee: "Sara Khan",
    assigneeInitials: "SK",
    priority: "Medium",
    status: "To Do",
    dueDate: "2026-05-27",
    createdDate: "2026-05-13",
    tags: ["design"],
  },
  {
    id: "T008",
    title: "API Security Testing",
    description: "Perform comprehensive security testing on all API endpoints.",
    assignee: "Enzela",
    assigneeInitials: "EN",
    priority: "Low",
    status: "In Progress",
    dueDate: "2026-05-21",
    createdDate: "2026-05-11",
    tags: ["security", "testing"],
  },
  {
    id: "T009",
    title: "Review Customer Feedback",
    description: "Analyze and categorize customer feedback for Q2.",
    assignee: "Abdullah",
    assigneeInitials: "AB",
    priority: "Medium",
    status: "To Do",
    dueDate: "2026-05-28",
    createdDate: "2026-05-14",
    tags: ["feedback"],
  },
  {
    id: "T010",
    title: "Setup Google Analytics",
    description: "Configure and set up Google Analytics for the CRM platform.",
    assignee: "Junaid",
    assigneeInitials: "JN",
    priority: "Low",
    status: "Completed",
    dueDate: "2026-05-11",
    createdDate: "2026-05-06",
    tags: ["analytics"],
  },
  {
    id: "T011",
    title: "Create Email Templates",
    description: "Design and create email templates for onboarding campaigns.",
    assignee: "Unza",
    assigneeInitials: "UN",
    priority: "Medium",
    status: "Completed",
    dueDate: "2026-05-07",
    createdDate: "2026-05-03",
    tags: ["email", "templates"],
  },
  {
    id: "T012",
    title: "Database Backup Setup",
    description: "Configure automated daily database backups.",
    assignee: "Test User",
    assigneeInitials: "TU",
    priority: "Low",
    status: "Completed",
    dueDate: "2026-05-06",
    createdDate: "2026-05-01",
    tags: ["infrastructure"],
  },
  {
    id: "T013",
    title: "Third-party Integration",
    description: "Integrate third-party payment gateway into the CRM system.",
    assignee: "Abdullah",
    assigneeInitials: "AB",
    priority: "Medium",
    status: "On Hold",
    dueDate: "2026-05-30",
    createdDate: "2026-05-12",
    tags: ["integration"],
  },
  {
    id: "T014",
    title: "Mobile App UI Review",
    description: "Conduct a thorough UI/UX review of the mobile application.",
    assignee: "Sara Khan",
    assigneeInitials: "SK",
    priority: "Medium",
    status: "On Hold",
    dueDate: "2026-05-29",
    createdDate: "2026-05-10",
    tags: ["mobile", "ui"],
  },
];

// ─── Helper: days remaining ───────────────────────────────────────────────────

export function getDaysRemaining(dueDate: string): { days: number; label: string; isOverdue: boolean; isToday: boolean } {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return { days: 0, label: "Today", isOverdue: false, isToday: true };
  if (diff < 0) return { days: Math.abs(diff), label: `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? "s" : ""} overdue`, isOverdue: true, isToday: false };
  return { days: diff, label: `${diff} day${diff !== 1 ? "s" : ""} left`, isOverdue: false, isToday: false };
}

// ─── Avatar color palette ─────────────────────────────────────────────────────

export const AVATAR_COLORS: [string, string][] = [
  ["#4f46e5", "#7c3aed"],
  ["#0891b2", "#0e7490"],
  ["#059669", "#047857"],
  ["#d97706", "#b45309"],
  ["#dc2626", "#b91c1c"],
  ["#7c3aed", "#6d28d9"],
  ["#0d9488", "#0f766e"],
];

export function getAvatarColor(name: string): [string, string] {
  const idx = ((name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}
