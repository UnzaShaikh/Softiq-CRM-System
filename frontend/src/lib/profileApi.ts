import { apiRequest } from "@/lib/api";

// ---------- Profile ----------
export interface ApiProfile {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  department: string;
  location: string;
  timezone: string;
  language: string;
  date_format: string;
  about: string;
  updated_at: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  role?: string;
  department?: string;
  location?: string;
  timezone?: string;
  language?: string;
  date_format?: string;
  about?: string;
}

export function getProfile(): Promise<ApiProfile> {
  return apiRequest<ApiProfile>(`/api/profile/`);
}

export function updateProfile(payload: UpdateProfilePayload): Promise<ApiProfile> {
  return apiRequest<ApiProfile>(`/api/profile/`, { method: "PATCH", body: payload });
}

// ---------- Change Password ----------
export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export function changePassword(payload: ChangePasswordPayload): Promise<{ detail?: string }> {
  return apiRequest<{ detail?: string }>(`/api/profile/change-password/`, {
    method: "POST",
    body: payload,
  });
}

// ---------- Preferences ----------
export interface ApiPreferences {
  timezone: string;
  date_format: string;
  time_format: "12h" | "24h";
  currency: string;
  theme: "light" | "dark" | "system";
  items_per_page: number;
  compact_sidebar: boolean;
  sound_notifications: boolean;
  updated_at: string;
}

export interface UpdatePreferencesPayload {
  timezone?: string;
  date_format?: string;
  time_format?: "12h" | "24h";
  currency?: string;
  theme?: "light" | "dark" | "system";
  items_per_page?: number;
  compact_sidebar?: boolean;
  sound_notifications?: boolean;
}

export function getPreferences(): Promise<ApiPreferences> {
  return apiRequest<ApiPreferences>(`/api/profile/preferences/`);
}

export function updatePreferences(payload: UpdatePreferencesPayload): Promise<ApiPreferences> {
  return apiRequest<ApiPreferences>(`/api/profile/preferences/`, {
    method: "PATCH",
    body: payload,
  });
}

// ---------- Notification Settings ----------
export interface ApiNotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  new_lead: boolean;
  deal_updates: boolean;
  task_reminders: boolean;
  weekly_report: boolean;
  system_alerts: boolean;
  updated_at: string;
}

export interface UpdateNotificationSettingsPayload {
  email_notifications?: boolean;
  push_notifications?: boolean;
  sms_notifications?: boolean;
  new_lead?: boolean;
  deal_updates?: boolean;
  task_reminders?: boolean;
  weekly_report?: boolean;
  system_alerts?: boolean;
}

export function getNotificationSettings(): Promise<ApiNotificationSettings> {
  return apiRequest<ApiNotificationSettings>(`/api/profile/notification-settings/`);
}

export function updateNotificationSettings(
  payload: UpdateNotificationSettingsPayload
): Promise<ApiNotificationSettings> {
  return apiRequest<ApiNotificationSettings>(`/api/profile/notification-settings/`, {
    method: "PATCH",
    body: payload,
  });
}

// ---------- Activity Log ----------
export interface ActivityLogItem {
  id: number;
  type: string;         // "Login", "Update", "Security", etc.
  activity: string;     // Display name
  details: string;
  ip: string;           // IP address field name from backend
  date: string;         // ISO datetime
  time?: string;        // optional if backend provides separate
}

export interface ActivityLogResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ActivityLogItem[];
}

export interface ActivityLogFilters {
  search?: string;
  activity_type?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

export function getActivityLog(filters: ActivityLogFilters = {}): Promise<ActivityLogResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.activity_type && filters.activity_type !== "All Activities") {
    params.append("activity_type", filters.activity_type);
  }
  if (filters.start_date) params.append("start_date", filters.start_date);
  if (filters.end_date) params.append("end_date", filters.end_date);
  if (filters.page) params.append("page", String(filters.page));
  if (filters.page_size) params.append("page_size", String(filters.page_size));

  const url = `/api/profile/activity-log/${params.toString() ? `?${params}` : ""}`;
  return apiRequest<ActivityLogResponse>(url);
}

export function getActivityLogSummary(): Promise<{
  total_activities: number;
  updates: number;
  logins: number;
  security_events: number;
}> {
  return apiRequest(`/api/profile/activity-log/summary/`);
}

// Export – opens a URL that downloads the file
export function getActivityLogExportUrl(filters: ActivityLogFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.activity_type && filters.activity_type !== "All Activities") {
    params.append("activity_type", filters.activity_type);
  }
  if (filters.start_date) params.append("start_date", filters.start_date);
  if (filters.end_date) params.append("end_date", filters.end_date);
  return `/api/profile/activity-log/export/${params.toString() ? `?${params}` : ""}`;
}