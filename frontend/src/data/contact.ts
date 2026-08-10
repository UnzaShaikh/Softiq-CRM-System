export type ContactStatus = "Active" | "Inactive" | "Lead";

export interface Contact {
  id: number;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  jobTitle: string;
  status: ContactStatus;
  lastInteraction: string;
}

export interface ApiContact {
  id: number;
  full_name: string;
  company: string;
  email: string;
  phone: string;
  job_title: string;
  status: "active" | "inactive" | "lead";
  last_interaction: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export const STATUS_FROM_API: Record<ApiContact["status"], ContactStatus> = {
  active: "Active",
  inactive: "Inactive",
  lead: "Lead",
};

export const STATUS_TO_API: Record<ContactStatus, ApiContact["status"]> = {
  Active: "active",
  Inactive: "inactive",
  Lead: "lead",
};

export function toContact(api: ApiContact): Contact {
  return {
    id: api.id,
    fullName: api.full_name,
    company: api.company,
    email: api.email,
    phone: api.phone,
    jobTitle: api.job_title,
    status: STATUS_FROM_API[api.status],
    lastInteraction: api.last_interaction || "—",
  };
}

export interface ContactFormValues {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  jobTitle: string;
  status: ContactStatus;
}

export function toFormValues(api: ApiContact): ContactFormValues {
  return {
    fullName: api.full_name,
    company: api.company,
    email: api.email,
    phone: api.phone,
    jobTitle: api.job_title,
    status: STATUS_FROM_API[api.status],
  };
}

export function toApiPayload(form: ContactFormValues): Partial<ApiContact> {
  return {
    full_name: form.fullName,
    company: form.company,
    email: form.email,
    phone: form.phone,
    job_title: form.jobTitle,
    status: STATUS_TO_API[form.status],
  };
}

export interface ApiContactList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiContact[];
}
