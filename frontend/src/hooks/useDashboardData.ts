"use client";

import { useEffect, useState } from "react";
import {
  fetchDashboardSummary,
  fetchSalesOverview,
  fetchLeadSources,
  fetchDealsPipeline,
  fetchRecentActivities,
  fetchRecentCustomers,
  fetchRecentLeads,
  fetchTopPerformers,
  DashboardSummary,
  SalesOverview,
  LeadSourceItem,
  PipelineStageApi,
  ActivityApi,
  RecentCustomerApi,
  RecentLeadApi,
  TopPerformerApi,
} from "@/lib/dashboard";

export const DATA_CHANGED_EVENT = "crm:data-changed";

export interface DashboardData {
  summary: DashboardSummary | null;
  salesOverview: SalesOverview | null;
  leadSources: LeadSourceItem[];
  dealsPipeline: PipelineStageApi[];
  activities: ActivityApi[];
  recentCustomers: RecentCustomerApi[];
  recentLeads: RecentLeadApi[];
  topPerformers: TopPerformerApi[];
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    summary: null,
    salesOverview: null,
    leadSources: [],
    dealsPipeline: [],
    activities: [],
    recentCustomers: [],
    recentLeads: [],
    topPerformers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    // Batch 1 — fast endpoints (resolve in ~1s)
    const batch1 = Promise.allSettled([
      fetchRecentLeads()
        .then((r) => { if (!cancelled) setData((d) => ({ ...d, recentLeads: r })); }),
      fetchTopPerformers()
        .then((r) => { if (!cancelled) setData((d) => ({ ...d, topPerformers: r })); }),
      fetchDealsPipeline()
        .then((r) => { if (!cancelled) setData((d) => ({ ...d, dealsPipeline: r })); }),
      fetchSalesOverview()
        .then((r) => { if (!cancelled) setData((d) => ({ ...d, salesOverview: r })); }),
    ]);

    // Batch 2 — heavier endpoints (fire after batch 1 settles)
    const batch2: Promise<PromiseSettledResult<void>[]> = batch1.then(() => {
      if (cancelled) return Promise.resolve([]);
      return Promise.allSettled([
        fetchDashboardSummary()
          .then((r) => { if (!cancelled) setData((d) => ({ ...d, summary: r })); }),
        fetchLeadSources()
          .then((r) => { if (!cancelled) setData((d) => ({ ...d, leadSources: r })); }),
        fetchRecentActivities()
          .then((r) => { if (!cancelled) setData((d) => ({ ...d, activities: r })); }),
        fetchRecentCustomers()
          .then((r) => { if (!cancelled) setData((d) => ({ ...d, recentCustomers: r })); }),
      ]);
    });

    batch2.then(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [refreshKey]);

  // Refresh after any CRM mutation elsewhere (customers/leads/deals CRUD)
  useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1);
    window.addEventListener(DATA_CHANGED_EVENT, handler);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, handler);
  }, []);

  function refresh() {
    setData({
      summary: null,
      salesOverview: null,
      leadSources: [],
      dealsPipeline: [],
      activities: [],
      recentCustomers: [],
      recentLeads: [],
      topPerformers: [],
    });
    setLoading(true);
    setRefreshKey((k) => k + 1);
  }

  return { data, loading, error, refresh };
}
