import { API_URL, getAccessToken } from "@/lib/api";

// ---------- Shared helpers ----------

async function parseError(res: Response): Promise<string> {
  try {
    const err = await res.json();
    if (typeof err.detail === "string") return err.detail;
    // DRF field errors -> "field: message" lines
    return (
      Object.entries(err)
        .map(([field, msgs]) =>
          `${field.replace(/_/g, " ")}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`
        )
        .join("\n") || `Request failed with status ${res.status}`
    );
  } catch {
    return `Request failed with status ${res.status}`;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(await parseError(res));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function jsonRequest<T>(path: string, method: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---------- General Settings ----------

export interface GeneralSettings {
  project_name: string;
  project_code: string;
  project_description: string;
  project_timezone: string;
  logo_url: string | null;
}

export interface UpdateGeneralSettingsPayload {
  project_name?: string;
  project_code?: string;
  project_description?: string;
  project_timezone?: string;
}

export function getGeneralSettings(): Promise<GeneralSettings> {
  return request<GeneralSettings>(`/api/settings/project/general/`);
}

export function updateGeneralSettings(
  payload: UpdateGeneralSettingsPayload
): Promise<GeneralSettings> {
  return jsonRequest<GeneralSettings>(
    `/api/settings/project/general/`,
    "PATCH",
    payload
  );
}

export function uploadProjectLogo(file: File): Promise<GeneralSettings> {
  const form = new FormData();
  form.append("logo", file);
  const token = getAccessToken();
  return fetch(`${API_URL}/api/settings/project/general/logo/`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  }).then(async (res) => {
    if (!res.ok) throw new Error(await parseError(res));
    return (await res.json()) as GeneralSettings;
  });
}

export function removeProjectLogo(): Promise<GeneralSettings> {
  return jsonRequest<GeneralSettings>(
    `/api/settings/project/general/logo/`,
    "DELETE",
    undefined
  );
}

// ---------- Company Information ----------

export interface CompanyInfo {
  company_name: string;
  website: string;
  tagline: string;
  industry: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  tax_number: string;
  currency: string;
  company_description: string;
}

export type UpdateCompanyInfoPayload = Partial<CompanyInfo>;

export function getCompanyInfo(): Promise<CompanyInfo> {
  return request<CompanyInfo>(`/api/settings/project/company/`);
}

export function updateCompanyInfo(
  payload: UpdateCompanyInfoPayload
): Promise<CompanyInfo> {
  return jsonRequest<CompanyInfo>(
    `/api/settings/project/company/`,
    "PATCH",
    payload
  );
}

// ---------- Localization ----------

export interface LocalizationSettings {
  language: string;
  region: string;
  timezone: string;
  week_starts_on: string;
  fiscal_year_start: string;
  date_format: string;
  time_format: string;
  datetime_format: string;
  localization_currency: string;
  currency_position: string;
  decimal_separator: string;
  thousands_separator: string;
  decimal_places: number;
}

export type UpdateLocalizationPayload = Partial<
  Omit<LocalizationSettings, "decimal_places"> & { decimal_places?: number }
>;

export function getLocalizationSettings(): Promise<LocalizationSettings> {
  return request<LocalizationSettings>(`/api/settings/project/localization/`);
}

export function updateLocalizationSettings(
  payload: UpdateLocalizationPayload
): Promise<LocalizationSettings> {
  return jsonRequest<LocalizationSettings>(
    `/api/settings/project/localization/`,
    "PATCH",
    payload
  );
}

// ---------- Email Settings ----------

export interface EmailSettings {
  from_name: string;
  from_email: string;
  reply_to_email: string;
  email_signature: string;
  smtp_host: string;
  smtp_port: number;
  smtp_encryption: string;
  smtp_username: string;
  has_smtp_password: boolean;
  enable_email_tracking: boolean;
  enable_link_tracking: boolean;
  log_emails_to_activity: boolean;
  attach_email_signature: boolean;
}

export interface UpdateEmailSettingsPayload {
  from_name?: string;
  from_email?: string;
  reply_to_email?: string;
  email_signature?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_encryption?: string;
  smtp_username?: string;
  /** Send only when the user changed the password; omit to keep stored value. */
  smtp_password?: string;
  enable_email_tracking?: boolean;
  enable_link_tracking?: boolean;
  log_emails_to_activity?: boolean;
  attach_email_signature?: boolean;
}

export function getEmailSettings(): Promise<EmailSettings> {
  return request<EmailSettings>(`/api/settings/project/email/`);
}

export function updateEmailSettings(
  payload: UpdateEmailSettingsPayload
): Promise<EmailSettings> {
  return jsonRequest<EmailSettings>(
    `/api/settings/project/email/`,
    "PATCH",
    payload
  );
}

export function sendTestEmail(email: string): Promise<{ detail: string }> {
  return jsonRequest<{ detail: string }>(
    `/api/settings/project/email/test/`,
    "POST",
    { email }
  );
}

// ---------- Security Settings ----------

export interface SecuritySettings {
  two_factor_auth: boolean;
  login_notifications: boolean;
  session_timeout: number;
  max_login_attempts: number;
  password_expiry_days: number;
  require_uppercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  min_password_length: number;
  ip_whitelist: string;
  force_https: boolean;
  audit_log: boolean;
}

export type UpdateSecuritySettingsPayload = Partial<{
  [K in keyof SecuritySettings]: number | boolean | string;
}>;

export function getSecuritySettings(): Promise<SecuritySettings> {
  return request<SecuritySettings>(`/api/settings/project/security/`);
}

export function updateSecuritySettings(
  payload: UpdateSecuritySettingsPayload
): Promise<SecuritySettings> {
  return jsonRequest<SecuritySettings>(
    `/api/settings/project/security/`,
    "PATCH",
    payload
  );
}

// ---------- Roles & Permissions ----------

export type PermissionAction = "view" | "create" | "edit" | "delete";
export interface ModulePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}
export type RolePermissions = Record<string, ModulePermissions>;

export const CRM_MODULES = [
  "dashboard",
  "customers",
  "contacts",
  "leads",
  "opportunities",
  "deals",
  "activities",
  "companies",
  "notes",
  "followups",
  "tasks",
  "email_templates",
  "reports",
  "settings",
] as const;

export interface Role {
  id: number;
  name: string;
  description: string;
  access_level: string;
  color: string;
  bg_color: string;
  permissions: RolePermissions;
  is_system: boolean;
  users_assigned: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  access_level?: string;
  color?: string;
  bg_color?: string;
  permissions?: RolePermissions;
}

export type UpdateRolePayload = Partial<CreateRolePayload>;

interface RoleListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Role[];
}

/** Builds a full permissions object (all modules) from partial input. */
export function buildPermissions(
  source?: RolePermissions | null,
  defaults?: Partial<ModulePermissions>
): RolePermissions {
  return Object.fromEntries(
    CRM_MODULES.map((m) => [
      m,
      { view: false, create: false, edit: false, delete: false, ...defaults, ...(source?.[m] ?? {}) },
    ])
  ) as RolePermissions;
}

export async function listRoles(): Promise<Role[]> {
  const first = await request<RoleListResponse>(`/api/settings/roles/`);
  let results = first.results;
  let url: string | null = first.next;
  while (url) {
    const page: RoleListResponse = await request<RoleListResponse>(
      url.replace(`${API_URL}`, "")
    );
    results = [...results, ...page.results];
    url = page.next;
  }
  return results.map((r) => ({ ...r, permissions: buildPermissions(r.permissions) }));
}

export function createRole(payload: CreateRolePayload): Promise<Role> {
  return jsonRequest<Role>(`/api/settings/roles/`, "POST", {
    ...payload,
    permissions: buildPermissions(payload.permissions),
  });
}

export function retrieveRole(id: number): Promise<Role> {
  return request<Role>(`/api/settings/roles/${id}/`);
}

export function updateRole(id: number, payload: UpdateRolePayload): Promise<Role> {
  return jsonRequest<Role>(`/api/settings/roles/${id}/`, "PATCH", {
    ...payload,
    ...(payload.permissions ? { permissions: buildPermissions(payload.permissions) } : {}),
  });
}

export function deleteRole(id: number): Promise<void> {
  return request<void>(`/api/settings/roles/${id}/`, { method: "DELETE" });
}

// ═══════════════════════════════════════════════════════════════════════
// User Management (admin-only, backend: /api/admin/)
// ═══════════════════════════════════════════════════════════════════════

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
  role: string;
}

export interface AdminUserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}

export interface CreateUserPayload {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  password: string;
  is_active?: boolean;
  role_id?: number | null;
}

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  is_active?: boolean;
  role_id?: number | null;
}

export interface AdminUserPageResponse extends AdminUserListResponse {
  total_users: number;
  active_users: number;
  inactive_users: number;
}

export async function listAdminUsersPage(params?: {
  search?: string;
  is_active?: string;
  page?: number;
  page_size?: number;
}): Promise<AdminUserPageResponse> {
  const qs = new URLSearchParams();

  if (params?.search?.trim()) qs.append("search", params.search.trim());
  if (params?.is_active) qs.append("is_active", params.is_active);
  if (params?.page) qs.append("page", String(params.page));
  if (params?.page_size) qs.append("page_size", String(params.page_size));

  const query = qs.toString();
  return request<AdminUserPageResponse>(
    `/api/users/admin/${query ? `?${query}` : ""}`
  );
}

let adminUsersCache: AdminUser[] | null = null;
let adminUsersRequest: Promise<AdminUser[]> | null = null;

/**
 * Loads users for assignment without the old sequential pagination cost.
 * The first page uses the backend maximum (50), then any remaining pages
 * are requested in parallel. Results are cached for the current app session.
 */
export function listAdminUsersForAssignment(forceRefresh = false): Promise<AdminUser[]> {
  if (!forceRefresh && adminUsersCache) {
    return Promise.resolve(adminUsersCache);
  }

  if (!forceRefresh && adminUsersRequest) {
    return adminUsersRequest;
  }

  adminUsersRequest = (async () => {
    const first = await listAdminUsersPage({ page: 1, page_size: 50 });
    let results = [...first.results];

    if (first.next) {
      const pageNumbers: number[] = [];
      const totalPages = Math.ceil(first.count / 50);

      for (let page = 2; page <= totalPages; page += 1) {
        pageNumbers.push(page);
      }

      const pages = await Promise.all(
        pageNumbers.map((page) => listAdminUsersPage({ page, page_size: 50 }))
      );

      for (const page of pages) {
        results = results.concat(page.results);
      }
    }

    adminUsersCache = results;
    return results;
  })().finally(() => {
    adminUsersRequest = null;
  });

  return adminUsersRequest;
}

export async function listAdminUsers(params?: { search?: string; is_active?: string }): Promise<AdminUser[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.append("search", params.search);
  if (params?.is_active) qs.append("is_active", params.is_active);
  const query = qs.toString();
  const first = await request<AdminUserListResponse>(`/api/users/admin/${query ? `?${query}` : ""}`);
  let results = first.results;
  let url: string | null = first.next;
  while (url) {
    const page: AdminUserListResponse = await request<AdminUserListResponse>(
      url.replace(`${API_URL}`, "")
    );
    results = [...results, ...page.results];
    url = page.next;
  }
  return results;
}

export function createAdminUser(payload: CreateUserPayload): Promise<AdminUser> {
  return jsonRequest<AdminUser>(`/api/users/admin/`, "POST", payload);
}

export function updateAdminUser(id: number, payload: UpdateUserPayload): Promise<AdminUser> {
  return jsonRequest<AdminUser>(`/api/users/admin/${id}/`, "PATCH", payload);
}

export function deleteAdminUser(id: number): Promise<void> {
  return request<void>(`/api/users/admin/${id}/`, { method: "DELETE" });
}

export function retrieveAdminUser(id: number): Promise<AdminUser> {
  return request<AdminUser>(`/api/users/admin/${id}/`);
}
