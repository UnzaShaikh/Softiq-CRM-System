export type ActivityType = "Call" | "Meeting" | "Email" | "Task" | "Follow-up";
export type ActivityStatus = "Scheduled" | "Completed" | "Cancelled" | "Overdue";
export type ActivityPriority = "High" | "Medium" | "Low";

export interface ApiActivity {
  id: number;
  title: string;
  type: "call" | "meeting" | "email" | "task" | "follow_up";
  status: "scheduled" | "completed" | "cancelled" | "overdue";
  priority: "high" | "medium" | "low";
  date: string;
  time: string;
  duration: number;
  assigned_to: number | null;
  assigned_to_name: string | null;
  customer: number | null;
  lead: number | null;
  deal: number | null;
  related_to: string | null;
  related_type: "Customer" | "Lead" | "Deal" | null;
  description: string;
  location: string;
  created_by: number | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiActivityList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiActivity[];
}

export interface ApiActivitySummary {
  total_activities: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  overdue: number;
}

export interface Activity {
  id: number;
  title: string;
  type: ActivityType;
  status: ActivityStatus;
  priority: ActivityPriority;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  assignedTo: string;
  assignedToId: number | null;
  relatedTo: string;
  relatedType: "Customer" | "Lead" | "Deal" | "—";
  customer: number | null;
  lead: number | null;
  deal: number | null;
  description: string;
  location: string;
  createdDate: string;
  createdByName: string | null;
}

export interface DropdownOption {
  id: number;
  username?: string;
  name: string;
}

export interface ActivityDropdowns {
  users: DropdownOption[];
  customers: DropdownOption[];
  leads: DropdownOption[];
  deals: DropdownOption[];
}

export const TYPE_FROM_API: Record<ApiActivity["type"], ActivityType> = {
  call: "Call",
  meeting: "Meeting",
  email: "Email",
  task: "Task",
  follow_up: "Follow-up",
};

export const TYPE_TO_API: Record<ActivityType, ApiActivity["type"]> = {
  Call: "call",
  Meeting: "meeting",
  Email: "email",
  Task: "task",
  "Follow-up": "follow_up",
};

export const STATUS_FROM_API: Record<ApiActivity["status"], ActivityStatus> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  overdue: "Overdue",
};

export const STATUS_TO_API: Record<ActivityStatus, ApiActivity["status"]> = {
  Scheduled: "scheduled",
  Completed: "completed",
  Cancelled: "cancelled",
  Overdue: "overdue",
};

export const PRIORITY_FROM_API: Record<ApiActivity["priority"], ActivityPriority> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const PRIORITY_TO_API: Record<ActivityPriority, ApiActivity["priority"]> = {
  High: "high",
  Medium: "medium",
  Low: "low",
};

export function toActivity(api: ApiActivity): Activity {
  return {
    id: api.id,
    title: api.title,
    type: TYPE_FROM_API[api.type],
    status: STATUS_FROM_API[api.status],
    priority: PRIORITY_FROM_API[api.priority],
    date: api.date,
    time: api.time ? api.time.slice(0, 5) : "",
    duration: api.duration,
    assignedTo: api.assigned_to_name || "—",
    assignedToId: api.assigned_to,
    relatedTo: api.related_to || "—",
    relatedType: api.related_type || "—",
    customer: api.customer,
    lead: api.lead,
    deal: api.deal,
    description: api.description || "",
    location: api.location || "",
    createdDate: api.created_at ? api.created_at.slice(0, 10) : "",
    createdByName: api.created_by_name,
  };
}

export interface ActivityFormValues {
  title: string;
  type: ActivityType | "";
  status: ActivityStatus | "";
  priority: ActivityPriority | "";
  date: string;
  time: string;
  duration: string;
  assignedTo: string; // user id as string, "" = unassigned
  relatedType: "Customer" | "Lead" | "Deal" | "";
  relatedTo: string; // related entity id as string
  location: string;
  description: string;
}

export function toActivityFormValues(api: ApiActivity): ActivityFormValues {
  return {
    title: api.title,
    type: TYPE_FROM_API[api.type],
    status: STATUS_FROM_API[api.status],
    priority: PRIORITY_FROM_API[api.priority],
    date: api.date,
    time: api.time ? api.time.slice(0, 5) : "",
    duration: String(api.duration),
    assignedTo: api.assigned_to ? String(api.assigned_to) : "",
    relatedType: api.related_type || "",
    relatedTo: api.related_type === "Customer" && api.customer
      ? String(api.customer)
      : api.related_type === "Lead" && api.lead
        ? String(api.lead)
        : api.related_type === "Deal" && api.deal
          ? String(api.deal)
          : "",
    location: api.location || "",
    description: api.description || "",
  };
}

export function toActivityApiPayload(
  form: ActivityFormValues
): Partial<ApiActivity> {
  return {
    title: form.title,
    type: TYPE_TO_API[form.type as ActivityType],
    status: STATUS_TO_API[form.status as ActivityStatus],
    priority: PRIORITY_TO_API[form.priority as ActivityPriority],
    date: form.date,
    time: form.time,
    duration: Number(form.duration),
    assigned_to: form.assignedTo ? Number(form.assignedTo) : null,
    customer:
      form.relatedType === "Customer" && form.relatedTo
        ? Number(form.relatedTo)
        : null,
    lead:
      form.relatedType === "Lead" && form.relatedTo
        ? Number(form.relatedTo)
        : null,
    deal:
      form.relatedType === "Deal" && form.relatedTo
        ? Number(form.relatedTo)
        : null,
    location: form.location,
    description: form.description,
  };
}

export function apiErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    try {
      const parsed = JSON.parse(err.message);
      if (parsed && typeof parsed === "object") {
        const firstValue = Object.values(parsed)[0];
        if (Array.isArray(firstValue)) return String(firstValue[0]);
        if (firstValue !== undefined && firstValue !== null) {
          return String(firstValue);
        }
      }
    } catch {
      // message is not JSON, fall through to raw message
    }
    return err.message;
  }
  return "Something went wrong.";
}
