import { apiRequest } from "@/lib/api";

// ---------- Backend response shapes ----------

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

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// ---------- Profile ----------

export function getProfile(): Promise<ApiProfile> {
  return apiRequest<ApiProfile>(`/api/profile/`);
}

export function updateProfile(payload: UpdateProfilePayload): Promise<ApiProfile> {
  return apiRequest<ApiProfile>(`/api/profile/`, { method: "PATCH", body: payload });
}

export function changePassword(payload: ChangePasswordPayload): Promise<{ detail?: string }> {
  return apiRequest<{ detail?: string }>(`/api/profile/change-password/`, {
    method: "POST",
    body: payload,
  });
}