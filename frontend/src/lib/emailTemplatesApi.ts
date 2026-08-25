import { apiRequest } from "@/lib/api";
import type { EmailTemplate, TemplateCategory, TemplateType, TemplateStatus } from "@/data/emailTemplates";

// ─────────────────────────────────────────────
// Backend types
// ─────────────────────────────────────────────

export type ApiTemplateCategory =
  | "onboarding"
  | "follow_up"
  | "proposal"
  | "thank_you"
  | "general"
  | "newsletter"
  | "support";

export type ApiTemplateType = "public" | "private";
export type ApiTemplateStatus = "active" | "inactive";

export interface ApiEmailTemplateListItem {
  id: number;
  name: string;
  subject: string;
  category: ApiTemplateCategory;
  status: ApiTemplateStatus;
  template_type: ApiTemplateType;
  updated_at: string;
}

export interface ApiEmailTemplate extends ApiEmailTemplateListItem {
  content: string;
  description: string;
  language: string;
  variables_used: string[];
  created_by: number | null;
  created_by_name: string | null;
  updated_by: number | null;
  updated_by_name: string | null;
  created_at: string;
}

export interface CreateEmailTemplatePayload {
  name: string;
  subject: string;
  content: string;
  description?: string;
  category?: ApiTemplateCategory;
  template_type?: ApiTemplateType;
  status?: ApiTemplateStatus;
  language?: string;
  variables_used?: string[];
}

export type UpdateEmailTemplatePayload = Partial<CreateEmailTemplatePayload>;

export interface TemplateActivityItem {
  id: number;
  action: "created" | "updated" | "duplicated" | "status_changed" | "deleted";
  action_display: string;
  user: number | null;
  user_name: string | null;
  detail: string;
  timestamp: string;
}

export interface TemplatePreview {
  subject: string;
  rendered_content: string;
  variables_used: string[];
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

export const CATEGORY_LABELS: Record<ApiTemplateCategory, string> = {
  onboarding: "Onboarding",
  follow_up: "Follow-up",
  proposal: "Proposal",
  thank_you: "Thank You",
  general: "General",
  newsletter: "Newsletter",
  support: "Support",
};

export const CATEGORY_VALUES: Record<string, ApiTemplateCategory> = {
  Onboarding: "onboarding",
  "Follow-up": "follow_up",
  Proposal: "proposal",
  "Thank You": "thank_you",
  General: "general",
  Newsletter: "newsletter",
  Support: "support",
};

export const TYPE_LABELS: Record<ApiTemplateType, string> = {
  public: "Public",
  private: "Private",
};

export const TYPE_VALUES: Record<string, ApiTemplateType> = {
  Public: "public",
  Private: "private",
};

export const STATUS_LABELS: Record<ApiTemplateStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export const STATUS_VALUES: Record<string, ApiTemplateStatus> = {
  Active: "active",
  Inactive: "inactive",
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
};

export function languageLabel(value: string): string {
  return LANGUAGE_LABELS[value] ?? value ?? "";
}

/** ["first_name", ...] -> ["{{first_name}}", ...] */
export function variablesToPlaceholders(vars: string[]): string[] {
  return vars.map(v => `{{${v}}}`);
}

/** Maps an API detail payload onto the UI EmailTemplate shape. */
export function mapEmailTemplateDetail(t: ApiEmailTemplate): EmailTemplate {
  return {
    id: String(t.id),
    name: t.name,
    subject: t.subject,
    content: t.content ?? "",
    category: CATEGORY_LABELS[t.category] as TemplateCategory,
    type: TYPE_LABELS[t.template_type] as TemplateType,
    status: STATUS_LABELS[t.status] as TemplateStatus,
    description: t.description || "",
    createdBy: t.created_by_name || "—",
    createdAt: t.created_at,
    updatedAt: t.updated_at,
    variables: variablesToPlaceholders(t.variables_used ?? []),
    language: languageLabel(t.language),
  };
}

// ─────────────────────────────────────────────
// Endpoints
// ─────────────────────────────────────────────

async function listAll(
  params: Record<string, string> = {}
): Promise<ApiEmailTemplateListItem[]> {
  const query = new URLSearchParams({ page_size: "100", ...params });
  let url: string | null = `/api/email-templates/?${query.toString()}`;
  let results: ApiEmailTemplateListItem[] = [];

  while (url) {
    const page: Paginated<ApiEmailTemplateListItem> = await apiRequest<Paginated<ApiEmailTemplateListItem>>(url);
    results = [...results, ...page.results];
    url = page.next ? page.next.replace(/^https?:\/\/[^/]+/, "") : null;
  }
  return results;
}

/** All visible templates (public + own private). */
export async function listEmailTemplates(): Promise<ApiEmailTemplateListItem[]> {
  return listAll();
}

export async function getEmailTemplate(id: number | string): Promise<ApiEmailTemplate> {
  return apiRequest<ApiEmailTemplate>(`/api/email-templates/${id}/`);
}

export async function createEmailTemplate(
  payload: CreateEmailTemplatePayload
): Promise<ApiEmailTemplate> {
  return apiRequest<ApiEmailTemplate>("/api/email-templates/", {
    method: "POST",
    body: payload,
  });
}

export async function updateEmailTemplate(
  id: number | string,
  payload: UpdateEmailTemplatePayload
): Promise<ApiEmailTemplate> {
  return apiRequest<ApiEmailTemplate>(`/api/email-templates/${id}/`, {
    method: "PATCH",
    body: payload,
  });
}

/** Soft-deletes the template (owner only). */
export async function deleteEmailTemplate(id: number | string): Promise<void> {
  return apiRequest<void>(`/api/email-templates/${id}/`, { method: "DELETE" });
}

/** Creates a copy named "<name> (Copy)" and returns it. */
export async function duplicateEmailTemplate(id: number | string): Promise<ApiEmailTemplate> {
  return apiRequest<ApiEmailTemplate>(`/api/email-templates/${id}/duplicate/`, {
    method: "POST",
  });
}

export async function updateEmailTemplateStatus(
  id: number | string,
  status: ApiTemplateStatus
): Promise<ApiEmailTemplate> {
  return apiRequest<ApiEmailTemplate>(`/api/email-templates/${id}/status/`, {
    method: "PATCH",
    body: { status },
  });
}

/** Rendered preview with sample values substituted for the variables. */
export async function previewEmailTemplate(
  id: number | string,
  sampleValues: Record<string, string> = {}
): Promise<TemplatePreview> {
  return apiRequest<TemplatePreview>(`/api/email-templates/${id}/preview/`, {
    method: "POST",
    body: { sample_values: sampleValues },
  });
}

export async function getEmailTemplateActivity(
  id: number | string
): Promise<TemplateActivityItem[]> {
  return apiRequest<TemplateActivityItem[]>(`/api/email-templates/${id}/activity/`);
}
