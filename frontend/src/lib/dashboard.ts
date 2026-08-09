import { apiRequest } from "@/lib/api";

// ---------------------------------------------------------------------------
// API response shapes (match backend/dashboard/views.py + serializers.py)
// ---------------------------------------------------------------------------

export interface DashboardSummary {
  total_customers: number;
  active_customers: number;
  total_deals: number;
  total_revenue: number | string;
  recent_customers: {
    id: number;
    name: string;
    email: string;
    created_at: string;
    phone: string;
  }[];
  recent_leads: {
    id: number;
    name: string;
    email: string;
    status: string;
    created_at: string;
    source: string | null;
  }[];
}

export interface SalesOverview {
  months: string[];
  revenue: number[];
  deals_closed: number[];
}

export interface LeadSourceItem {
  source: string;
  count: number;
  percentage: number;
}

export interface PipelineDealApi {
  name: string;
  value: number | string;
  customer: string;
  company: string;
  status: string;
  remaining_days: number | null;
  expected_close_date: string | null;
}

export interface PipelineStageApi {
  stage: string;
  count: number;
  total_value: number | string;
  deals: PipelineDealApi[];
}

export interface ActivityApi {
  type: string;
  customer: string;
  time: string;
}

export interface RecentCustomerApi {
  id: number;
  name: string;
  email: string;
  company: string;
  status: string;
  revenue: number | string;
  joined_date: string;
}

export interface RecentLeadApi {
  id: number;
  name: string;
  email: string;
  company: string;
  source: string;
  status: string;
  score: number;
  date_added: string;
}

export interface TopPerformerApi {
  name: string;
  role: string;
  revenue: number | string;
  closed_deals: number;
  performance_percentage: number;
}

// ---------------------------------------------------------------------------
// Widget prop shapes (consumed by dashboard components)
// ---------------------------------------------------------------------------

export interface DashboardDeal {
  name: string;
  company: string;
  value: string;
  stage: string;
  avatar: string;
  daysLeft: number;
}

export interface DashboardStage {
  id: string;
  label: string;
  color: string;
  bg: string;
  count: number;
  value: string;
}

export interface FeedActivity {
  type: "deal" | "customer" | "task" | "note" | "call";
  title: string;
  subtitle: string;
  time: string;
  avatar: string;
}

export interface DashboardCustomer {
  name: string;
  email: string;
  company: string;
  status: string;
  revenue: string;
  joined: string;
  avatar: string;
}

export interface DashboardLead {
  name: string;
  email: string;
  company: string;
  source: string;
  status: string;
  score: number;
  createdAt: string;
  avatar: string;
}

export interface DashboardPerformer {
  name: string;
  role: string;
  deals: number;
  revenue: string;
  growth: string;
  avatar: string;
  rank: number;
}

export interface DonutSource {
  label: string;
  value: number;
  color: string;
}

export interface BoardDeal {
  id: number;
  customer: string;
  company: string;
  value: string;
  stage: string;
  closeDate: string;
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>("/api/dashboard/");
}

export async function fetchSalesOverview(): Promise<SalesOverview> {
  return apiRequest<SalesOverview>("/api/dashboard/sales-overview/");
}

export async function fetchLeadSources(): Promise<LeadSourceItem[]> {
  return apiRequest<LeadSourceItem[]>("/api/dashboard/lead-sources/");
}

export async function fetchDealsPipeline(): Promise<PipelineStageApi[]> {
  return apiRequest<PipelineStageApi[]>("/api/dashboard/deals-pipeline/");
}

export async function fetchRecentActivities(): Promise<ActivityApi[]> {
  return apiRequest<ActivityApi[]>("/api/dashboard/recent-activities/");
}

export async function fetchRecentCustomers(): Promise<RecentCustomerApi[]> {
  return apiRequest<RecentCustomerApi[]>("/api/dashboard/recent-customers/");
}

export async function fetchRecentLeads(): Promise<RecentLeadApi[]> {
  return apiRequest<RecentLeadApi[]>("/api/dashboard/recent-leads/");
}

export async function fetchTopPerformers(): Promise<TopPerformerApi[]> {
  return apiRequest<TopPerformerApi[]>("/api/dashboard/top-performers/");
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function formatCurrency(value: number | string): string {
  const n = Number(value);
  if (Number.isNaN(n)) return "$0";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatCompactCurrency(value: number | string): string {
  const n = Number(value);
  if (Number.isNaN(n)) return "$0";
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function initialsOf(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return `${first}${last}`.toUpperCase();
}

// ---------------------------------------------------------------------------
// Mappers (API -> widget shapes)
// ---------------------------------------------------------------------------

export const PIPELINE_STAGE_META: Record<
  string,
  { id: string; label: string; color: string; bg: string }
> = {
  lead: { id: "lead", label: "Lead", color: "#6366f1", bg: "#eef2ff" },
  qualified: { id: "qualified", label: "Qualified", color: "#0891b2", bg: "#ecfeff" },
  proposal: { id: "proposal", label: "Proposal", color: "#d97706", bg: "#fffbeb" },
  negotiation: { id: "negotiation", label: "Negotiation", color: "#7c3aed", bg: "#f5f3ff" },
  closed_won: { id: "closed_won", label: "Closed Won", color: "#16a34a", bg: "#f0fdf4" },
  closed_lost: { id: "closed_lost", label: "Closed Lost", color: "#dc2626", bg: "#fef2f2" },
};

export function dealsPipelineToWidget(stages: PipelineStageApi[]): {
  stages: DashboardStage[];
  deals: DashboardDeal[];
} {
  const pipelineStages = stages.map((s) => {
    const meta = PIPELINE_STAGE_META[s.stage] ?? {
      id: s.stage,
      label: s.stage,
      color: "#6366f1",
      bg: "#eef2ff",
    };
    return {
      ...meta,
      count: s.count,
      value: formatCompactCurrency(s.total_value),
    };
  });

  const deals: DashboardDeal[] = [];
  for (const stage of stages) {
    for (const deal of stage.deals) {
      deals.push({
        name: deal.customer,
        company: deal.company || deal.name,
        value: formatCurrency(deal.value),
        stage: deal.status,
        avatar: initialsOf(deal.customer),
        daysLeft: deal.remaining_days ?? 0,
      });
    }
  }

  return { stages: pipelineStages, deals };
}

export function salesOverviewToChart(overview: SalesOverview): SalesOverview {
  return {
    months: overview.months,
    revenue: overview.revenue,
    deals_closed: overview.deals_closed,
  };
}

const DONUT_PALETTE = ["#4f46e5", "#0891b2", "#7c3aed", "#d97706", "#16a34a", "#dc2626", "#0ea5e9", "#059669"];

export function leadSourcesToDonut(sources: LeadSourceItem[]): DonutSource[] {
  return sources.map((s, i) => ({
    label: s.source,
    value: s.count,
    color: DONUT_PALETTE[i % DONUT_PALETTE.length],
  }));
}

export function activitiesToFeed(activities: ActivityApi[]): FeedActivity[] {
  return activities.map((a) => {
    const isDeal = /deal/i.test(a.type);
    return {
      type: isDeal ? "deal" : "customer",
      title: a.type,
      subtitle: a.customer,
      time: a.time,
      avatar: initialsOf(a.customer),
    };
  });
}

const CUSTOMER_STATUS_LABEL: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  lead: "Lead",
};

export function recentCustomersToWidget(customers: RecentCustomerApi[]): DashboardCustomer[] {
  return customers.map((c) => {
    const joined = c.joined_date ? c.joined_date.slice(0, 7) : "";
    const [year, month] = joined.split("-");
    const monthName = month
      ? new Date(Date.UTC(Number(year), Number(month) - 1, 1)).toLocaleString("en-US", { month: "short" })
      : "";
    return {
      name: c.name,
      email: c.email,
      company: c.company,
      status: CUSTOMER_STATUS_LABEL[c.status] ?? c.status,
      revenue: formatCurrency(c.revenue),
      joined: joined ? `${monthName} ${year}` : "—",
      avatar: initialsOf(c.name),
    };
  });
}

const LEAD_SOURCE_LABEL: Record<string, string> = {
  website: "Website",
  referral: "Referral",
  social: "Social Media",
  email: "Email",
  other: "Other",
  "N/A": "N/A",
};

export function recentLeadsToWidget(leads: RecentLeadApi[]): DashboardLead[] {
  return leads.map((l) => ({
    name: l.name,
    email: l.email,
    company: l.company,
    source: LEAD_SOURCE_LABEL[l.source] ?? l.source,
    status: l.status.charAt(0).toUpperCase() + l.status.slice(1),
    score: l.score,
    createdAt: l.date_added,
    avatar: initialsOf(l.name),
  }));
}

export function topPerformersToWidget(performers: TopPerformerApi[]): DashboardPerformer[] {
  return performers.map((p, i) => ({
    name: p.name,
    role: p.role,
    deals: p.closed_deals,
    revenue: formatCurrency(p.revenue),
    growth: `${p.performance_percentage}%`,
    avatar: initialsOf(p.name),
    rank: i + 1,
  }));
}

// ---------------------------------------------------------------------------
// Deals API (used by /Sales-Pipeline board)
// ---------------------------------------------------------------------------

export interface ApiDeal {
  id: number;
  name: string;
  customer: number;
  customer_name: string;
  value: string;
  stage: string;
  expected_close_date: string;
  probability: number;
  notes: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface ApiDealList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiDeal[];
}

export async function fetchDeals(): Promise<ApiDeal[]> {
  const data = await apiRequest<ApiDealList>("/api/deals/");
  return data.results;
}

export function dealsToBoardDeals(deals: ApiDeal[]): BoardDeal[] {
  return deals.map((d) => ({
    id: d.id,
    customer: d.customer_name,
    company: d.name,
    value: formatCurrency(Number(d.value)),
    stage: d.stage,
    closeDate: d.expected_close_date,
  }));
}

export function dealsPipelineToBoardDeals(stages: PipelineStageApi[]): BoardDeal[] {
  const deals: BoardDeal[] = [];
  let id = 0;
  for (const stage of stages) {
    for (const deal of stage.deals) {
      deals.push({
        id: ++id,
        customer: deal.customer,
        company: deal.company || deal.name,
        value: formatCurrency(deal.value),
        stage: deal.status,
        closeDate: deal.expected_close_date ?? `${deal.remaining_days ?? 0}d`,
      });
    }
  }
  return deals;
}

// ---------------------------------------------------------------------------
// Sales Pipeline API (used by /Sales-Pipeline)
// ---------------------------------------------------------------------------

export interface PipelineSummary {
  total_deals: number;
  total_pipeline_value: number | string;
  active_deals: number;
  closed_won: number;
  closed_lost: number;
}

export interface StageDistribution {
  stage: string;
  deal_count: number;
  total_value: number | string;
  percentage: number;
}

export interface PipelinePerformance {
  months: string[];
  deals_created: number[];
  deals_closed: number[];
  revenue_generated: number[];
}

export interface PipelineStageDeal {
  id: number;
  name: string;
  customer: string;
  company: string;
  value: number | string;
  stage: string;
  expected_close_date: string;
  probability: number;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") q.set(key, String(value));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function fetchPipelineSummary(
  startDate?: string,
  endDate?: string
): Promise<PipelineSummary> {
  return apiRequest<PipelineSummary>(
    `/api/pipeline/summary/${buildQuery({ start_date: startDate, end_date: endDate })}`
  );
}

export async function fetchPipelineStages(
  startDate?: string,
  endDate?: string
): Promise<StageDistribution[]> {
  return apiRequest<StageDistribution[]>(
    `/api/pipeline/stages/${buildQuery({ start_date: startDate, end_date: endDate })}`
  );
}

export async function fetchPipelinePerformance(
  year?: number
): Promise<PipelinePerformance> {
  return apiRequest<PipelinePerformance>(
    `/api/pipeline/performance/${buildQuery({ year })}`
  );
}

export async function fetchPipelineStageDeals(
  stage: string
): Promise<PipelineStageDeal[]> {
  return apiRequest<PipelineStageDeal[]>(`/api/pipeline/stages/${stage}/deals/`);
}

export const PIPELINE_STAGE_CONFIG: Record<
  string,
  { name: string; color: string; hex: string; stageBg: string }
> = {
  Lead: { name: "Lead", color: "bg-purple-500", hex: "#a855f7", stageBg: "bg-purple-100 text-purple-700" },
  Qualified: { name: "Qualified", color: "bg-blue-500", hex: "#3b82f6", stageBg: "bg-blue-100 text-blue-700" },
  Proposal: { name: "Proposal", color: "bg-sky-400", hex: "#38bdf8", stageBg: "bg-sky-100 text-sky-700" },
  Negotiation: { name: "Negotiation", color: "bg-amber-500", hex: "#f59e0b", stageBg: "bg-amber-100 text-amber-700" },
  "Closed Won": { name: "Closed Won", color: "bg-emerald-500", hex: "#10b981", stageBg: "bg-emerald-100 text-emerald-700" },
  "Closed Lost": { name: "Closed Lost", color: "bg-rose-500", hex: "#f43f5e", stageBg: "bg-rose-100 text-rose-700" },
};

export function pipelineStageConfig(
  label: string
): { name: string; color: string; hex: string; stageBg: string } {
  return (
    PIPELINE_STAGE_CONFIG[label] ?? {
      name: label,
      color: "bg-slate-500",
      hex: "#64748b",
      stageBg: "bg-slate-100 text-slate-700",
    }
  );
}
