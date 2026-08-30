export type OpportunityStage =
  | "Prospecting"
  | "Qualification"
  | "Proposal"
  | "Negotiation"
  | "Closed Won"
  | "Closed Lost";

export type OpportunityStatus =
  | "Active"
  | "On Hold"
  | "Inactive"
  | "Closed Won"
  | "Closed Lost";

/**
 * Opportunity object returned by the backend API.
 */
export interface ApiOpportunity {
  id: number;
  name: string;
  customer: number;
  customer_name: string;
  company: string;
  value: string;
  stage:
    | "prospecting"
    | "qualification"
    | "proposal"
    | "negotiation"
    | "closed_won"
    | "closed_lost";
  status:
    | "active"
    | "on_hold"
    | "inactive"
    | "closed_won"
    | "closed_lost";
  probability: number;
  expected_close_date: string | null;
  notes: string;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Paginated opportunity response returned by the backend.
 */
export interface ApiOpportunityList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiOpportunity[];
}

/**
 * API stage -> frontend stage.
 */
export const STAGE_FROM_API: Record<
  ApiOpportunity["stage"],
  OpportunityStage
> = {
  prospecting: "Prospecting",
  qualification: "Qualification",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

/**
 * Frontend stage -> API stage.
 */
export const STAGE_TO_API: Record<
  OpportunityStage,
  ApiOpportunity["stage"]
> = {
  Prospecting: "prospecting",
  Qualification: "qualification",
  Proposal: "proposal",
  Negotiation: "negotiation",
  "Closed Won": "closed_won",
  "Closed Lost": "closed_lost",
};

/**
 * API status -> frontend status.
 */
export const STATUS_FROM_API: Record<
  ApiOpportunity["status"],
  OpportunityStatus
> = {
  active: "Active",
  on_hold: "On Hold",
  inactive: "Inactive",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

/**
 * Frontend status -> API status.
 */
export const STATUS_TO_API: Record<
  OpportunityStatus,
  ApiOpportunity["status"]
> = {
  Active: "active",
  "On Hold": "on_hold",
  Inactive: "inactive",
  "Closed Won": "closed_won",
  "Closed Lost": "closed_lost",
};

/**
 * Frontend opportunity model used by the UI.
 */
export interface Opportunity {
  id: string;
  name: string;
  customerName: string;
  company: string;
  dealValue: number;
  stage: OpportunityStage;
  probability: number;
  expectedCloseDate: string;
  status: OpportunityStatus;
  assignedTo: string;
  createdDate: string;
  notes: string;
  avatar: string;
}

/**
 * Convert a backend API opportunity into the frontend model.
 */
export function toOpportunity(api: ApiOpportunity): Opportunity {
  const initials =
    api.customer_name
      ?.split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return {
    id: String(api.id),
    name: api.name,
    customerName: api.customer_name,
    company: api.company,
    dealValue: Number(api.value),
    stage: STAGE_FROM_API[api.stage],
    probability: api.probability,
    expectedCloseDate: api.expected_close_date ?? "",
    status: STATUS_FROM_API[api.status],
    assignedTo: "—",
    createdDate: api.created_at ? api.created_at.slice(0, 10) : "",
    notes: api.notes,
    avatar: initials,
  };
}

/**
 * Form values used when creating/editing an opportunity.
 */
export interface OpportunityFormValues {
  name: string;
  customer: string;
  value: string;
  stage: OpportunityStage | "";
  status: OpportunityStatus | "";
  probability: string;
  expected_close_date: string;
  notes: string;
}

/**
 * Convert a backend opportunity into form values.
 *
 * This preserves the backend customer ID, which is required
 * when submitting the opportunity form.
 */
export function toFormValues(
  api: ApiOpportunity
): OpportunityFormValues {
  return {
    name: api.name,
    customer: String(api.customer),
    value: api.value,
    stage: STAGE_FROM_API[api.stage],
    status: STATUS_FROM_API[api.status],
    probability: String(api.probability),
    expected_close_date: api.expected_close_date ?? "",
    notes: api.notes,
  };
}

/**
 * Convert a frontend Opportunity object into form values.
 *
 * This function is kept for compatibility with the edit page.
 *
 * NOTE:
 * The frontend Opportunity model currently stores customerName
 * rather than the backend customer ID. Therefore this function
 * uses customerName as the customer value.
 *
 * Prefer toFormValues(ApiOpportunity) whenever the original
 * backend object is available.
 */
export function toFormValuesFromOpportunity(
  opportunity: Opportunity
): OpportunityFormValues {
  return {
    name: opportunity.name,
    customer: opportunity.customerName,
    value: String(opportunity.dealValue),
    stage: opportunity.stage,
    status: opportunity.status,
    probability: String(opportunity.probability),
    expected_close_date: opportunity.expectedCloseDate,
    notes: opportunity.notes,
  };
}