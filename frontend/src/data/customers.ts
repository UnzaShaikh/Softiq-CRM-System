export type CustomerStatus = "Active" | "Inactive" | "Lead";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  location: string;
  joinedDate: string;
  totalDeals: number;
  totalRevenue: number;
  avatar: string; // initials
}

export interface ApiCustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  status: "lead" | "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export const STATUS_FROM_API: Record<ApiCustomer["status"], CustomerStatus> = {
  lead: "Lead",
  active: "Active",
  inactive: "Inactive",
};

export const STATUS_TO_API: Record<CustomerStatus, ApiCustomer["status"]> = {
  Lead: "lead",
  Active: "active",
  Inactive: "inactive",
};

export function toCustomer(api: ApiCustomer): Customer {
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
    location: "—",
    joinedDate: api.created_at.slice(0, 10),
    totalDeals: 0,
    totalRevenue: 0,
    avatar: initials,
  };
}

export interface CustomerFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
}

export function toFormValues(api: ApiCustomer): CustomerFormValues {
  return {
    first_name: api.first_name,
    last_name: api.last_name,
    email: api.email,
    phone: api.phone,
    company: api.company,
    status: STATUS_FROM_API[api.status],
  };
}

export interface ApiCustomerList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiCustomer[];
}
