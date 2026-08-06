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
  summary: DashboardSummary;
  salesOverview: SalesOverview;
  leadSources: LeadSourceItem[];
  dealsPipeline: PipelineStageApi[];
  activities: ActivityApi[];
  recentCustomers: RecentCustomerApi[];
  recentLeads: RecentLeadApi[];
  topPerformers: TopPerformerApi[];
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const [
          summary,
          salesOverview,
          leadSources,
          dealsPipeline,
          activities,
          recentCustomers,
          recentLeads,
          topPerformers,
        ] = await Promise.all([
          fetchDashboardSummary(),
          fetchSalesOverview(),
          fetchLeadSources(),
          fetchDealsPipeline(),
          fetchRecentActivities(),
          fetchRecentCustomers(),
          fetchRecentLeads(),
          fetchTopPerformers(),
        ]);
        if (cancelled) return;
        setData({
          summary,
          salesOverview,
          leadSources,
          dealsPipeline,
          activities,
          recentCustomers,
          recentLeads,
          topPerformers,
        });
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // Refresh after any CRM mutation elsewhere (customers/leads/deals CRUD)
  useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1);
    window.addEventListener(DATA_CHANGED_EVENT, handler);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, handler);
  }, []);

  function refresh() {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  }

  return { data, loading, error, refresh };
}
