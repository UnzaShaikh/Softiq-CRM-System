import { apiRequest } from "@/lib/api";
import type {
  EmailTemplate,
  TemplateCategory,
  TemplateType,
  TemplateStatus,
} from "@/data/emailTemplates";

// ============================================================
// Backend Types
// ============================================================

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

// ============================================================
// API Response Types
// ============================================================

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

export type UpdateEmailTemplatePayload =
  Partial<CreateEmailTemplatePayload>;

export interface TemplateActivityItem {
  id: number;
  action:
    | "created"
    | "updated"
    | "duplicated"
    | "status_changed"
    | "deleted";
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

// ============================================================
// Pagination
// ============================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================
// Label Maps
// ============================================================

export const CATEGORY_LABELS: Record<
  ApiTemplateCategory,
  TemplateCategory
> = {
  onboarding: "Onboarding",
  follow_up: "Follow-up",
  proposal: "Proposal",
  thank_you: "Thank You",
  general: "General",
  newsletter: "Newsletter",
  support: "Support",
};

export const CATEGORY_VALUES: Record<
  string,
  ApiTemplateCategory
> = {
  Onboarding: "onboarding",
  "Follow-up": "follow_up",
  Proposal: "proposal",
  "Thank You": "thank_you",
  General: "general",
  Newsletter: "newsletter",
  Support: "support",
};

export const TYPE_LABELS: Record<
  ApiTemplateType,
  TemplateType
> = {
  public: "Public",
  private: "Private",
};

export const TYPE_VALUES: Record<
  string,
  ApiTemplateType
> = {
  Public: "public",
  Private: "private",
};

export const STATUS_LABELS: Record<
  ApiTemplateStatus,
  TemplateStatus
> = {
  active: "Active",
  inactive: "Inactive",
};

export const STATUS_VALUES: Record<
  string,
  ApiTemplateStatus
> = {
  Active: "active",
  Inactive: "inactive",
};

// ============================================================
// Language
// ============================================================

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
};

export function languageLabel(value: string): string {
  return LANGUAGE_LABELS[value] ?? value ?? "";
}

// ============================================================
// Variables
// ============================================================

export function variablesToPlaceholders(
  variables: string[]
): string[] {
  return variables.map(
    (variable) => `{{${variable}}}`
  );
}

// ============================================================
// API -> UI Mapping
// ============================================================

export function mapEmailTemplateDetail(
  template: ApiEmailTemplate
): EmailTemplate {
  return {
    id: String(template.id),
    name: template.name,
    subject: template.subject,
    content: template.content ?? "",
    category: CATEGORY_LABELS[template.category],
    type: TYPE_LABELS[template.template_type],
    status: STATUS_LABELS[template.status],
    description: template.description || "",
    createdBy:
      template.created_by_name || "—",
    createdAt: template.created_at,
    updatedAt: template.updated_at,
    variables: variablesToPlaceholders(
      template.variables_used ?? []
    ),
    language: languageLabel(template.language),
  };
}

// ============================================================
// Pagination Helper
// ============================================================

function getNextPageUrl(
  next: string | null
): string | null {
  if (!next) {
    return null;
  }

  return next.replace(
    /^https?:\/\/[^/]+/,
    ""
  );
}

// ============================================================
// List All Templates
// ============================================================

async function listAll(
  params: Record<string, string> = {}
): Promise<ApiEmailTemplateListItem[]> {
  const query = new URLSearchParams({
    page_size: "100",
    ...params,
  });

  let url: string | null =
    `/api/email-templates/?${query.toString()}`;

  const results: ApiEmailTemplateListItem[] = [];

  while (url) {
    const response = await apiRequest<
      | PaginatedResponse<ApiEmailTemplateListItem>
      | ApiEmailTemplateListItem[]
    >(url);

    if (Array.isArray(response)) {
      results.push(...response);
      break;
    }

    if (Array.isArray(response.results)) {
      results.push(...response.results);
    }

    url = getNextPageUrl(response.next);
  }

  return results;
}

// ============================================================
// List
// ============================================================

export async function listEmailTemplates(): Promise<
  ApiEmailTemplateListItem[]
> {
  return listAll();
}

// ============================================================
// Get Single Template
// ============================================================

export async function getEmailTemplate(
  id: number | string
): Promise<ApiEmailTemplate> {
  return apiRequest<ApiEmailTemplate>(
    `/api/email-templates/${id}/`
  );
}

// ============================================================
// Create
// ============================================================

export async function createEmailTemplate(
  payload: CreateEmailTemplatePayload
): Promise<ApiEmailTemplate> {
  return apiRequest<ApiEmailTemplate>(
    "/api/email-templates/",
    {
      method: "POST",
      body: payload,
    }
  );
}

// ============================================================
// Update
// ============================================================

export async function updateEmailTemplate(
  id: number | string,
  payload: UpdateEmailTemplatePayload
): Promise<ApiEmailTemplate> {
  return apiRequest<ApiEmailTemplate>(
    `/api/email-templates/${id}/`,
    {
      method: "PATCH",
      body: payload,
    }
  );
}

// ============================================================
// Delete
// ============================================================

export async function deleteEmailTemplate(
  id: number | string
): Promise<void> {
  await apiRequest<void>(
    `/api/email-templates/${id}/`,
    {
      method: "DELETE",
    }
  );
}

// ============================================================
// Duplicate
// ============================================================

export async function duplicateEmailTemplate(
  id: number | string
): Promise<ApiEmailTemplate> {
  return apiRequest<ApiEmailTemplate>(
    `/api/email-templates/${id}/duplicate/`,
    {
      method: "POST",
    }
  );
}

// ============================================================
// Status
// ============================================================

export async function updateEmailTemplateStatus(
  id: number | string,
  status: ApiTemplateStatus
): Promise<ApiEmailTemplate> {
  return apiRequest<ApiEmailTemplate>(
    `/api/email-templates/${id}/status/`,
    {
      method: "PATCH",
      body: {
        status,
      },
    }
  );
}

// ============================================================
// Preview
// ============================================================

export async function previewEmailTemplate(
  id: number | string,
  sampleValues: Record<string, string> = {}
): Promise<TemplatePreview> {
  return apiRequest<TemplatePreview>(
    `/api/email-templates/${id}/preview/`,
    {
      method: "POST",
      body: {
        sample_values: sampleValues,
      },
    }
  );
}

// ============================================================
// Activity
// ============================================================

export async function getEmailTemplateActivity(
  id: number | string
): Promise<TemplateActivityItem[]> {
  return apiRequest<TemplateActivityItem[]>(
    `/api/email-templates/${id}/activity/`
  );
}