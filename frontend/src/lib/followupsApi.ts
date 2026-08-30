import {
  apiRequest,
  API_URL,
} from "@/lib/api";

import type {
  Followup,
  FollowupType,
  FollowupStatus,
  FollowupPriority,
} from "@/data/followups";

/* =================================================
 * Backend types
 * ================================================= */

export type ApiFollowUpType =
  | "call"
  | "email"
  | "meeting"
  | "task"
  | "follow_up";

export type ApiFollowUpStatus =
  | "upcoming"
  | "completed"
  | "overdue"
  | "cancelled";

export type ApiFollowUpPriority =
  | "high"
  | "medium"
  | "low";

export interface ApiFollowUp {
  id: number;

  followup_id: string;

  subject: string;

  notes: string;

  customer: number | null;

  lead: number | null;

  deal: number | null;

  related_to: string | null;

  related_type: string | null;

  company: number | null;

  company_name: string | null;

  type: ApiFollowUpType;

  priority: ApiFollowUpPriority;

  status: ApiFollowUpStatus;

  is_overdue: boolean;

  due_date: string;

  due_time: string | null;

  assigned_to: number | null;

  assigned_to_name: string | null;

  created_by: number | null;

  created_by_name: string | null;

  created_at: string;

  updated_at: string;
}

/* =================================================
 * Payloads
 * ================================================= */

export interface CreateFollowUpPayload {
  subject: string;

  notes?: string;

  customer?: number | null;

  lead?: number | null;

  deal?: number | null;

  company?: number | null;

  type: ApiFollowUpType;

  priority?: ApiFollowUpPriority;

  status?: ApiFollowUpStatus;

  due_date: string;

  due_time?: string | null;

  assigned_to?: number | null;
}

export type UpdateFollowUpPayload =
  Partial<CreateFollowUpPayload>;

/* =================================================
 * Supporting API types
 * ================================================= */

export interface FollowUpStatistics {
  total_followups: number;

  upcoming: number;

  completed: number;

  overdue: number;

  conversion_rate: number;
}

export interface FollowUpOptions {
  types: {
    value: ApiFollowUpType;
    label: string;
  }[];

  priorities: {
    value: ApiFollowUpPriority;
    label: string;
  }[];

  statuses: {
    value: ApiFollowUpStatus;
    label: string;
  }[];
}

interface Paginated<T> {
  count: number;

  next: string | null;

  previous: string | null;

  results: T[];
}

/* =================================================
 * UI label maps
 * ================================================= */

export const TYPE_LABELS: Record<
  ApiFollowUpType,
  FollowupType
> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  task: "Task",
  follow_up: "Follow-up",
};

export const STATUS_LABELS: Record<
  ApiFollowUpStatus,
  FollowupStatus
> = {
  upcoming: "Upcoming",
  completed: "Completed",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

export const PRIORITY_LABELS: Record<
  ApiFollowUpPriority,
  FollowupPriority
> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

/* =================================================
 * API value maps
 * ================================================= */

const TYPE_VALUES: Record<
  FollowupType,
  ApiFollowUpType
> = {
  Call: "call",
  Email: "email",
  Meeting: "meeting",
  Task: "task",
  "Follow-up": "follow_up",
};

const STATUS_VALUES: Record<
  FollowupStatus,
  ApiFollowUpStatus
> = {
  Upcoming: "upcoming",
  Completed: "completed",
  Overdue: "overdue",
  Cancelled: "cancelled",
};

const PRIORITY_VALUES: Record<
  FollowupPriority,
  ApiFollowUpPriority
> = {
  High: "high",
  Medium: "medium",
  Low: "low",
};

/* =================================================
 * Formatting helpers
 * ================================================= */

function formatTime(
  value: string | null
): string {
  if (!value) {
    return "—";
  }

  const [hourString, minuteString] =
    value.split(":");

  const hour = Number(hourString);

  if (Number.isNaN(hour)) {
    return value;
  }

  const minute =
    minuteString ?? "00";

  const suffix =
    hour >= 12
      ? "PM"
      : "AM";

  const hour12 =
    hour % 12 === 0
      ? 12
      : hour % 12;

  return `${hour12}:${minute} ${suffix}`;
}

function getInitials(
  name: string | null
): string {
  if (!name) {
    return "—";
  }

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part =>
      part.charAt(0).toUpperCase()
    )
    .join("");
}

/* =================================================
 * Relationship helpers
 * ================================================= */

export function relatedKey(
  followup: Pick<
    ApiFollowUp,
    "customer" | "lead" | "deal"
  >
): string {
  if (followup.customer) {
    return `customer:${followup.customer}`;
  }

  if (followup.lead) {
    return `lead:${followup.lead}`;
  }

  if (followup.deal) {
    return `deal:${followup.deal}`;
  }

  return "";
}

export function parseRelatedKey(
  key: string
): {
  customer?: number;
  lead?: number;
  deal?: number;
} {
  const [kind, idString] =
    key.split(":");

  const id = Number(idString);

  if (
    !idString ||
    Number.isNaN(id)
  ) {
    return {};
  }

  if (kind === "customer") {
    return {
      customer: id,
    };
  }

  if (kind === "lead") {
    return {
      lead: id,
    };
  }

  if (kind === "deal") {
    return {
      deal: id,
    };
  }

  return {};
}

/* =================================================
 * UI → API values
 * ================================================= */

export function toTypeValue(
  value: string
): ApiFollowUpType {
  return (
    TYPE_VALUES[
      value as FollowupType
    ] ?? "follow_up"
  );
}

export function toStatusValue(
  value: string
): ApiFollowUpStatus {
  return (
    STATUS_VALUES[
      value as FollowupStatus
    ] ?? "upcoming"
  );
}

export function toPriorityValue(
  value: string
): ApiFollowUpPriority {
  return (
    PRIORITY_VALUES[
      value as FollowupPriority
    ] ?? "medium"
  );
}

/* =================================================
 * List
 * ================================================= */

export async function listFollowUps(): Promise<
  ApiFollowUp[]
> {
  const firstPage =
    await apiRequest<
      Paginated<ApiFollowUp>
    >(
      "/api/followups/?page_size=100"
    );

  let results =
    firstPage.results;

  let next =
    firstPage.next;

  while (next) {
    const nextUrl =
      next.replace(
        /^https?:\/\/[^/]+/,
        ""
      );

    const page =
      await apiRequest<
        Paginated<ApiFollowUp>
      >(nextUrl);

    results = [
      ...results,
      ...page.results,
    ];

    next =
      page.next;
  }

  return results;
}

/* =================================================
 * Get single
 * ================================================= */

export async function getFollowUp(
  id: number | string
): Promise<ApiFollowUp> {
  return apiRequest<ApiFollowUp>(
    `/api/followups/${id}/`
  );
}

/* =================================================
 * Create
 * ================================================= */

export async function createFollowUp(
  payload: CreateFollowUpPayload
): Promise<ApiFollowUp> {
  return apiRequest<ApiFollowUp>(
    "/api/followups/",
    {
      method: "POST",
      body: payload,
    }
  );
}

/* =================================================
 * Update
 * ================================================= */

export async function updateFollowUp(
  id: number | string,
  payload: UpdateFollowUpPayload
): Promise<ApiFollowUp> {
  return apiRequest<ApiFollowUp>(
    `/api/followups/${id}/`,
    {
      method: "PATCH",
      body: payload,
    }
  );
}

/* =================================================
 * Delete
 * ================================================= */

export async function deleteFollowUp(
  id: number | string
): Promise<void> {
  await apiRequest(
    `/api/followups/${id}/`,
    {
      method: "DELETE",
    }
  );
}

/* =================================================
 * Statistics
 * ================================================= */

export async function getFollowUpStatistics(): Promise<
  FollowUpStatistics
> {
  return apiRequest<FollowUpStatistics>(
    "/api/followups/statistics/"
  );
}

/* =================================================
 * Reminders
 * ================================================= */

export async function getFollowUpReminders(
  limit = 5
): Promise<ApiFollowUp[]> {
  const data =
    await apiRequest<{
      count: number;
      results: ApiFollowUp[];
    }>(
      `/api/followups/reminders/?limit=${limit}`
    );

  return data.results;
}

/* =================================================
 * Backend options
 * ================================================= */

export async function getFollowUpOptions(): Promise<
  FollowUpOptions
> {
  return apiRequest<FollowUpOptions>(
    "/api/followups/options/"
  );
}

/* =================================================
 * Export
 * ================================================= */

export async function exportFollowUpsCsv(): Promise<void> {
  const {
    getAccessToken,
  } = await import("@/lib/api");

  const token =
    getAccessToken();

  const response =
    await fetch(
      `${API_URL}/api/followups/export/`,
      {
        headers: token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : undefined,
      }
    );

  if (!response.ok) {
    throw new Error(
      `Export failed with status ${response.status}`
    );
  }

  const blob =
    await response.blob();

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = url;

  anchor.download =
    "followups.csv";

  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);
}

/* =================================================
 * Related options
 * ================================================= */

export interface RelatedOption {
  key: string;

  name: string;

  detail: string;
}

export async function getCustomerOptions(): Promise<
  RelatedOption[]
> {
  const data =
    await apiRequest<
      {
        id: number;
        name: string;
        company: string;
      }[]
    >(
      "/api/opportunities/dropdowns/customers/"
    );

  return data.map(customer => ({
    key:
      `customer:${customer.id}`,

    name:
      customer.name,

    detail:
      customer.company || "",
  }));
}

export async function getLeadOptions(): Promise<
  RelatedOption[]
> {
  const page =
    await apiRequest<
      Paginated<{
        id: number;
        first_name: string;
        last_name: string;
        company: string | null;
      }>
    >(
      "/api/leads/?page_size=100"
    );

  return page.results.map(lead => ({
    key:
      `lead:${lead.id}`,

    name:
      `${lead.first_name} ${lead.last_name}`.trim(),

    detail:
      lead.company || "",
  }));
}

export async function getDealOptions(): Promise<
  RelatedOption[]
> {
  const page =
    await apiRequest<
      Paginated<{
        id: number;
        name: string;
      }>
    >(
      "/api/deals/?page_size=100"
    );

  return page.results.map(deal => ({
    key:
      `deal:${deal.id}`,

    name:
      deal.name,

    detail:
      "Deal",
  }));
}

export interface CompanyOption {
  id: number;

  name: string;
}

export async function getCompanyOptions(): Promise<
  CompanyOption[]
> {
  const page =
    await apiRequest<
      Paginated<CompanyOption>
    >(
      "/api/companies/?page_size=100"
    );

  return page.results.map(company => ({
    id:
      company.id,

    name:
      company.name,
  }));
}

/* =================================================
 * API → UI mapping
 * ================================================= */

export function mapFollowUp(
  followup: ApiFollowUp
): Followup {
  return {
    id:
      String(followup.id),

    code:
      followup.followup_id,

    subject:
      followup.subject,

    relatedTo:
      followup.related_to ||
      "—",

    company:
      followup.company_name ||
      "—",

    type:
      TYPE_LABELS[
        followup.type
      ] ?? "Follow-up",

    dueDate:
      (
        followup.due_date ||
        ""
      ).slice(0, 10),

    dueTime:
      formatTime(
        followup.due_time
      ),

    priority:
      PRIORITY_LABELS[
        followup.priority
      ] ?? "Medium",

    status:
      STATUS_LABELS[
        followup.status
      ] ?? "Upcoming",

    assignedTo:
      followup.assigned_to_name ||
      "—",

    assignedInitials:
      getInitials(
        followup.assigned_to_name
      ),

    notes:
      followup.notes ||
      "",

    createdDate:
      (
        followup.created_at ||
        ""
      ).slice(0, 10),

    relatedKey:
      relatedKey(followup),

    companyId:
      followup.company
        ? String(
            followup.company
          )
        : "",
  };
}