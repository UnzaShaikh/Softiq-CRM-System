import type { Opportunity } from "@/data/opportunities";

export const OPPORTUNITY_CACHE_KEY = "__crm_opportunities_cache__";

export type OpportunityCacheState = {
  opportunities: Opportunity[];
  totalCount: number;
  search: string;
  stageFilter: "All" | Opportunity["stage"];
  statusFilter: "All" | Opportunity["status"];
  currentPage: number;
};

type OpportunityCacheStore = {
  list: OpportunityCacheState | null;
  byId: Record<string, Opportunity>;
};

const store: OpportunityCacheStore = {
  list: null,
  byId: {},
};

export function getCachedOpportunityList(): OpportunityCacheState | null {
  return store.list;
}

export function setCachedOpportunityList(
  value: OpportunityCacheState
): void {
  store.list = value;

  for (const opportunity of value.opportunities) {
    store.byId[String(opportunity.id)] = opportunity;
  }
}

export function getCachedOpportunity(
  id: number | string
): Opportunity | null {
  return store.byId[String(id)] ?? null;
}

export function setCachedOpportunity(
  opportunity: Opportunity
): void {
  store.byId[String(opportunity.id)] = opportunity;

  if (!store.list) return;

  const exists = store.list.opportunities.some(
    (item) => String(item.id) === String(opportunity.id)
  );

  if (exists) {
    store.list = {
      ...store.list,
      opportunities: store.list.opportunities.map((item) =>
        String(item.id) === String(opportunity.id)
          ? opportunity
          : item
      ),
    };
  }
}

export function removeCachedOpportunity(
  id: number | string
): void {
  delete store.byId[String(id)];

  if (store.list) {
    store.list = {
      ...store.list,
      opportunities: store.list.opportunities.filter(
        (opportunity) =>
          String(opportunity.id) !== String(id)
      ),
      totalCount: Math.max(
        0,
        store.list.totalCount - 1
      ),
    };
  }
}
