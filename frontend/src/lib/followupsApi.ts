import { apiRequest, API_URL } from "@/lib/api";
import type { Followup, FollowupType, FollowupStatus, FollowupPriority } from "@/data/followups";

// ─────────────────────────────────────────────
// Backend types (snake_case, as returned by DRF)
// ─────────────────────────────────────────────

export type ApiFollowUpType = "call" | "email" | "meeting" | "task" | "follow_up";
export type ApiFollowUpStatus = "upcoming" | "completed" | "overdue" | "cancelled";
export type ApiFollowUpPriority = "high" | "medium" | "low";

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

export type UpdateFollowUpPayload = Partial<CreateFollowUpPayload>;

export interface FollowUpStatistics {
  total_followups: number;
  upcoming: number;
  completed: number;
  overdue: number;
  conversion_rate: number;
}

export interface FollowUpOptions {
  types: { value: ApiFollowUpType; label: string }[];
  priorities: { value: ApiFollowUpPriority; label: string }[];
  statuses: { value: ApiFollowUpStatus; label: string }[];
}

interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─────────────────────────────────────────────
// Label maps (API value <-> UI label)
// ─────────────────────────────────────────────

export const TYPE_LABELS: Record<ApiFollowUpType, string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  task: "Task",
  follow_up: "Follow-up",
};

export const STATUS_LABELS: Record<ApiFollowUpStatus, string> = {
  upcoming: "Upcoming",
  completed: "Completed",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

export const PRIORITY_LABELS: Record<ApiFollowUpPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const TYPE_VALUES: Record<string, ApiFollowUpType> = {
  Call: "call",
  Email: "email",
  Meeting: "meeting",
  Task: "task",
  "Follow-up": "follow_up",
};

const STATUS_VALUES: Record<string, ApiFollowUpStatus> = {
  Upcoming: "upcoming",
  Completed: "completed",
  Overdue: "overdue",
  Cancelled: "cancelled",
};

const PRIORITY_VALUES: Record<string, ApiFollowUpPriority> = {
  High: "high",
  Medium: "medium",
  Low: "low",
};

/** "10:00:00" -> "10:00 AM" */
function formatTime(value: string | null): string {
  if (!value) return "—";
  const [hStr, mStr] = value.split(":");
  const h = Number(hStr);
  if (Number.isNaN(h)) return value;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr ?? "00"} ${suffix}`;
}

function initials(name: string | null): string {
  if (!name) return "—";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]!.toUpperCase())
    .join("");
}

/** Encodes the related record as "customer:3" / "lead:1" / "deal:7" for form selects. */
export function relatedKey(f: Pick<ApiFollowUp, "customer" | "lead" | "deal">): string {
  if (f.customer) return `customer:${f.customer}`;
  if (f.lead) return `lead:${f.lead}`;
  if (f.deal) return `deal:${f.deal}`;
  return "";
}

/** Parses a "customer:3"-style form value into payload fields. */
export function parseRelatedKey(
  key: string
): { customer?: number; lead?: number; deal?: number } {
  const [kind, idStr] = key.split(":");
  const id = Number(idStr);
  if (!idStr || Number.isNaN(id)) return {};
  if (kind === "customer") return { customer: id };
  if (kind === "lead") return { lead: id };
  if (kind === "deal") return { deal: id };
  return {};
}

export function toTypeValue(label: string): ApiFollowUpType {
  return TYPE_VALUES[label] ?? "follow_up";
}
export function toStatusValue(label: string): ApiFollowUpStatus {
  return STATUS_VALUES[label] ?? "upcoming";
}
export function toPriorityValue(label: string): ApiFollowUpPriority {
  return PRIORITY_VALUES[label] ?? "medium";
}

// ─────────────────────────────────────────────
// List helpers
// ─────────────────────────────────────────────

async function listAll<T>(
  path: string,
  params: Record<string, string | number | undefined> = {}
): Promise<T[]> {
  const query = new URLSearchParams({ page_size: "100" });
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });

  let url: string | null = `/api/followups/?${query.toString()}`;
  let results: T[] = [];

  while (url) {
    const page: Paginated<T> = await apiRequest<Paginated<T>>(url);
    results = [...results, ...page.results];
    url = page.next ? page.next.replace(/^https?:\/\/[^/]+/, "") : null;
  }
  return results;
}

// ─────────────────────────────────────────────
// Endpoints
// ─────────────────────────────────────────────

export async function listFollowUps(): Promise<ApiFollowUp[]> {
  return listAll<ApiFollowUp>("");
}

export async function getFollowUp(id: number | string): Promise<ApiFollowUp> {
  return apiRequest<ApiFollowUp>(`/api/followups/${id}/`);
}

export async function createFollowUp(payload: CreateFollowUpPayload): Promise<ApiFollowUp> {
  return apiRequest<ApiFollowUp>("/api/followups/", { method: "POST", body: payload });
}

export async function updateFollowUp(
  id: number | string,
  payload: UpdateFollowUpPayload
): Promise<ApiFollowUp> {
  return apiRequest<ApiFollowUp>(`/api/followups/${id}/`, { method: "PATCH", body: payload });
}

export async function deleteFollowUp(id: number | string): Promise<void> {
  return apiRequest<void>(`/api/followups/${id}/`, { method: "DELETE" });
}

export async function getFollowUpStatistics(): Promise<FollowUpStatistics> {
  return apiRequest<FollowUpStatistics>("/api/followups/statistics/");
}

export async function getFollowUpReminders(limit = 5): Promise<ApiFollowUp[]> {
  const data = await apiRequest<{ count: number; results: ApiFollowUp[] }>(
    `/api/followups/reminders/?limit=${limit}`
  );
  return data.results;
}

export async function getFollowUpOptions(): Promise<FollowUpOptions> {
  return apiRequest<FollowUpOptions>("/api/followups/options/");
}

/** Downloads the filtered CSV export using the authenticated session. */
export async function exportFollowUpsCsv(): Promise<void> {
  const { getAccessToken } = await import("@/lib/api");
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/followups/export/`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`Export failed with status ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "followups.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────
// Related-record options for form dropdowns
// ─────────────────────────────────────────────

export interface RelatedOption {
  key: string; // "customer:3"
  name: string;
  detail: string;
}

/** Lightweight customers list used by opportunities dropdowns. */
export async function getCustomerOptions(): Promise<RelatedOption[]> {
  const data = await apiRequest<{ id: number; name: string; company: string }[]>(
    "/api/opportunities/dropdowns/customers/"
  );
  return data.map(c => ({ key: `customer:${c.id}`, name: c.name, detail: c.company || "" }));
}

export async function getLeadOptions(): Promise<RelatedOption[]> {
  const page = await apiRequest<Paginated<{ id: number; first_name: string; last_name: string; company: string | null }>>(
    "/api/leads/?page_size=100"
  );
  return page.results.map(l => ({
    key: `lead:${l.id}`,
    name: `${l.first_name} ${l.last_name}`.trim(),
    detail: l.company || "",
  }));
}

export async function getDealOptions(): Promise<RelatedOption[]> {
  const page = await apiRequest<Paginated<{ id: number; name: string }>>(
    "/api/deals/?page_size=100"
  );
  return page.results.map(d => ({ key: `deal:${d.id}`, name: d.name, detail: "Deal" }));
}

export interface CompanyOption {
  id: number;
  name: string;
}

export async function getCompanyOptions(): Promise<CompanyOption[]> {
  const page = await apiRequest<Paginated<CompanyOption>>("/api/companies/?page_size=100");
  return page.results.map(c => ({ id: c.id, name: c.name }));
}

// ─────────────────────────────────────────────
// Mapping into the existing UI Followup shape
// ─────────────────────────────────────────────

export function mapFollowUp(f: ApiFollowUp): Followup {
  return {
    id: String(f.id),
    code: f.followup_id,
    subject: f.subject,
    relatedTo: f.related_to || "—",
    company: f.company_name || "—",
    type: (TYPE_LABELS[f.type] ?? f.type) as FollowupType,
    dueDate: (f.due_date || "").slice(0, 10),
    dueTime: formatTime(f.due_time),
    priority: (PRIORITY_LABELS[f.priority] ?? f.priority) as FollowupPriority,
    status: (STATUS_LABELS[f.status] ?? f.status) as FollowupStatus,
    assignedTo: f.assigned_to_name || "—",
    assignedInitials: initials(f.assigned_to_name),
    notes: f.notes || "",
    createdDate: (f.created_at || "").slice(0, 10),
  };
}
