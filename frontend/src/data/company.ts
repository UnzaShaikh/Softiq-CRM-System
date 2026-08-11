export type CompanyStatus = "Active" | "Inactive";

export interface Company {
  id: number;
  name: string;
  industry: string;
  contacts: number;
  deals: number;
  status: CompanyStatus;
  createdOn: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  size: string;
  description?: string;
}

export interface ApiCompany {
  id: number;
  name: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  size: string;
  status: "active" | "inactive";
  description: string;
  contacts_count: number;
  deals_count: number;
  created_by: number | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export const STATUS_FROM_API: Record<ApiCompany["status"], CompanyStatus> = {
  active: "Active",
  inactive: "Inactive",
};

export const STATUS_TO_API: Record<CompanyStatus, ApiCompany["status"]> = {
  Active: "active",
  Inactive: "inactive",
};

export function toCompany(api: ApiCompany): Company {
  return {
    id: api.id,
    name: api.name,
    industry: api.industry,
    contacts: api.contacts_count,
    deals: api.deals_count,
    status: STATUS_FROM_API[api.status],
    createdOn: api.created_at ? api.created_at.slice(0, 10) : "",
    website: api.website,
    phone: api.phone,
    email: api.email,
    address: api.address,
    size: api.size,
    description: api.description || undefined,
  };
}

export interface CompanyFormValues {
  name: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  size: string;
  status: CompanyStatus;
  description: string;
}

export function toCompanyFormValues(api: ApiCompany): CompanyFormValues {
  return {
    name: api.name,
    industry: api.industry,
    website: api.website,
    phone: api.phone,
    email: api.email,
    address: api.address,
    size: api.size,
    status: STATUS_FROM_API[api.status],
    description: api.description || "",
  };
}

export function toCompanyApiPayload(
  form: CompanyFormValues
): Partial<ApiCompany> {
  return {
    name: form.name,
    industry: form.industry,
    website: form.website,
    phone: form.phone,
    email: form.email,
    address: form.address,
    size: form.size,
    status: STATUS_TO_API[form.status],
    description: form.description,
  };
}

export interface ApiCompanyList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiCompany[];
}

export interface ApiCompanyStats {
  total_companies: number;
  active_companies: number;
  new_this_month: number;
  total_contacts: number;
}

export interface ApiFilterOptions {
  industries: string[];
  sizes: string[];
  statuses: { value: string; label: string }[];
  total_records: number;
}

export function apiErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    try {
      const parsed = JSON.parse(err.message);
      if (parsed && typeof parsed === "object") {
        const firstValue = Object.values(parsed)[0];
        if (Array.isArray(firstValue)) return String(firstValue[0]);
        if (firstValue !== undefined && firstValue !== null) {
          return String(firstValue);
        }
      }
    } catch {
      // message is not JSON, fall through to raw message
    }
    return err.message;
  }
  return "Something went wrong.";
}
