"use client";

import type { ApiLead, Lead } from "@/data/leads";

export type LeadListCacheState = {
  leads: Lead[];
  apiLeads: ApiLead[];
  totalCount: number;
  search: string;
  statusFilter: "All" | Lead["status"];
  currentPage: number;
};

export type LeadStats = {
  total: number;
  new: number;
  qualified: number;
  contacted: number;
};

type LeadCacheStore = {
  list: LeadListCacheState | null;
  byId: Record<string, Lead>;
  apiById: Record<string, ApiLead>;
  stats: LeadStats | null;
};

const store: LeadCacheStore = {
  list: null,
  byId: {},
  apiById: {},
  stats: null,
};

/* =========================================================
   LIST CACHE
========================================================= */

export function getCachedLeadsList(): LeadListCacheState | null {
  return store.list;
}

export function setCachedLeadsList(
  value: LeadListCacheState
): void {
  store.list = value;

  for (const lead of value.leads) {
    store.byId[String(lead.id)] = lead;
  }

  for (const lead of value.apiLeads) {
    store.apiById[String(lead.id)] = lead;
  }
}

/* =========================================================
   INDIVIDUAL LEAD CACHE
========================================================= */

export function getCachedLead(
  id: number | string
): Lead | null {
  return store.byId[String(id)] ?? null;
}

export function getCachedApiLead(
  id: number | string
): ApiLead | null {
  return store.apiById[String(id)] ?? null;
}

export function setCachedLead(
  apiLead: ApiLead,
  lead: Lead
): void {
  const key = String(apiLead.id);

  store.apiById[key] = apiLead;
  store.byId[key] = lead;

  if (store.list) {
    store.list = {
      ...store.list,

      leads: store.list.leads.map((item) =>
        String(item.id) === key ? lead : item
      ),

      apiLeads: store.list.apiLeads.map((item) =>
        String(item.id) === key ? apiLead : item
      ),
    };
  }
}

export function removeCachedLead(
  id: number | string
): void {
  const key = String(id);

  delete store.byId[key];
  delete store.apiById[key];

  if (store.list) {
    store.list = {
      ...store.list,

      leads: store.list.leads.filter(
        (lead) => String(lead.id) !== key
      ),

      apiLeads: store.list.apiLeads.filter(
        (lead) => String(lead.id) !== key
      ),

      totalCount: Math.max(0, store.list.totalCount - 1),
    };
  }
}

/* =========================================================
   STATS CACHE
========================================================= */

export function getCachedLeadStats(): LeadStats | null {
  return store.stats;
}

export function setCachedLeadStats(
  stats: LeadStats
): void {
  store.stats = stats;
}