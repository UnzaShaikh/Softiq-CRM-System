export type LeadStatus = "New" | "Contacted" | "Qualified" | "Lost";
export type LeadSource = "Website" | "Referral" | "Social Media" | "Email" | "Other";

export interface ApiLead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  source: "website" | "referral" | "social" | "email" | "other";
  status: "new" | "contacted" | "qualified" | "lost";
  score: number;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  source: LeadSource;
  score: number;
  createdDate: string;
  avatar: string;
}

export const STATUS_FROM_API: Record<ApiLead["status"], LeadStatus> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  lost: "Lost",
};

export const STATUS_TO_API: Record<LeadStatus, ApiLead["status"]> = {
  New: "new",
  Contacted: "contacted",
  Qualified: "qualified",
  Lost: "lost",
};

export const SOURCE_FROM_API: Record<ApiLead["source"], LeadSource> = {
  website: "Website",
  referral: "Referral",
  social: "Social Media",
  email: "Email",
  other: "Other",
};

export const SOURCE_TO_API: Record<LeadSource, ApiLead["source"]> = {
  Website: "website",
  Referral: "referral",
  "Social Media": "social",
  Email: "email",
  Other: "other",
};

export function toLead(api: ApiLead): Lead {
  const first = api.first_name || "Unnamed";
  const last = api.last_name || "";
  const initials = `${first.charAt(0)}${last.charAt(0) || ""}`.toUpperCase() || "?";

  return {
    id: String(api.id),
    name: `${first} ${last}`.trim(),
    email: api.email,
    phone: api.phone,
    company: api.company,
    status: STATUS_FROM_API[api.status],
    source: SOURCE_FROM_API[api.source],
    score: api.score,
    createdDate: api.created_at.slice(0, 10),
    avatar: initials,
  };
}

export interface LeadFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
}

export function toFormValues(api: ApiLead): LeadFormValues {
  return {
    first_name: api.first_name,
    last_name: api.last_name,
    email: api.email,
    phone: api.phone,
    company: api.company,
    source: SOURCE_FROM_API[api.source],
    status: STATUS_FROM_API[api.status],
    score: api.score,
  };
}

export interface ApiLeadList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiLead[];
}
