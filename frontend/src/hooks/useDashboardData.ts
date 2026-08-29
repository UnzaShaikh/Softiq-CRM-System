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

/*
 * Other CRM modules can dispatch this event after creating,
 * updating or deleting data.
 *
 * Dashboard listens to it and refreshes its data silently.
 */
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

const CACHE_KEY = "crm_dashboard_cache_v1";

// Keeps the latest dashboard data in memory while the user navigates
// between CRM pages. Unlike localStorage, this can be read synchronously
// during a client-side route change without causing an SSR hydration mismatch.
let dashboardMemoryCache: DashboardData | null = null;

const EMPTY_DATA: DashboardData = {
  summary: null,
  salesOverview: null,
  leadSources: [],
  dealsPipeline: [],
  activities: [],
  recentCustomers: [],
  recentLeads: [],
  topPerformers: [],
};

/* -------------------------------------------------------------------------- */
/* Cache helpers                                                              */
/* -------------------------------------------------------------------------- */

function getCachedData(): DashboardData {
  if (typeof window === "undefined") {
    return EMPTY_DATA;
  }

  try {
    const cached = window.localStorage.getItem(CACHE_KEY);

    if (!cached) {
      return EMPTY_DATA;
    }

    const parsed = JSON.parse(cached);

    return {
      summary: parsed?.summary ?? null,

      salesOverview:
        parsed?.salesOverview ?? null,

      leadSources: Array.isArray(parsed?.leadSources)
        ? parsed.leadSources
        : [],

      dealsPipeline: Array.isArray(parsed?.dealsPipeline)
        ? parsed.dealsPipeline
        : [],

      activities: Array.isArray(parsed?.activities)
        ? parsed.activities
        : [],

      recentCustomers: Array.isArray(parsed?.recentCustomers)
        ? parsed.recentCustomers
        : [],

      recentLeads: Array.isArray(parsed?.recentLeads)
        ? parsed.recentLeads
        : [],

      topPerformers: Array.isArray(parsed?.topPerformers)
        ? parsed.topPerformers
        : [],
    };
  } catch (error) {
    console.warn("Failed to read dashboard cache:", error);

    return EMPTY_DATA;
  }
}

function hasDashboardData(data: DashboardData): boolean {
  return (
    data.summary !== null ||
    data.salesOverview !== null ||
    data.leadSources.length > 0 ||
    data.dealsPipeline.length > 0 ||
    data.activities.length > 0 ||
    data.recentCustomers.length > 0 ||
    data.recentLeads.length > 0 ||
    data.topPerformers.length > 0
  );
}

function saveCachedData(data: DashboardData) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify(data)
    );
  } catch (error) {
    console.warn("Failed to save dashboard cache:", error);
  }
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useDashboardData() {
  /*
   * IMPORTANT:
   *
   * Do NOT call getCachedData() here.
   *
   * The initial state must be identical on the server and client.
   *
   * Otherwise:
   *
   * Server -> Skeleton
   * Client -> Cached dashboard
   *
   * which causes the hydration error shown in your screenshot.
   */
  /*
   * On the very first SSR render this is EMPTY_DATA.
   *
   * After the Dashboard has been visited once in the browser,
   * dashboardMemoryCache is available synchronously on subsequent
   * client-side navigations. That prevents the loading spinner from
   * flashing when the user returns to Dashboard.
   *
   * We deliberately do NOT read localStorage here because that would
   * make the server HTML different from the client HTML.
   */
  const [data, setData] = useState<DashboardData>(
    () => dashboardMemoryCache ?? EMPTY_DATA
  );

  const [loading, setLoading] = useState(
    () => dashboardMemoryCache === null
  );

  const [error, setError] = useState<string | null>(null);

  /*
   * Indicates that the component has mounted in the browser.
   */
  const [hydrated, setHydrated] = useState(false);

  /*
   * Changing this value triggers a background refresh.
   */
  const [refreshKey, setRefreshKey] = useState(0);

  /* ------------------------------------------------------------------------ */
  /* Restore cached dashboard AFTER hydration                                */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    /*
     * localStorage is only accessed after hydration.
     *
     * If we already have an in-memory cache, keep using it because
     * it is the fastest possible source when returning to Dashboard.
     */
    const cached = getCachedData();

    if (hasDashboardData(cached)) {
      dashboardMemoryCache = cached;
      setData(cached);
      setLoading(false);
    } else if (dashboardMemoryCache) {
      setData(dashboardMemoryCache);
      setLoading(false);
    }

    setHydrated(true);
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Fetch dashboard data                                                     */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    /*
     * Do not make API requests until the browser has hydrated.
     */
    if (!hydrated) {
      return;
    }

    let cancelled = false;

    /*
     * Update only the portion of the dashboard that has arrived.
     *
     * Existing data remains visible while the API request is running.
     */
    function updateData(patch: Partial<DashboardData>) {
      if (cancelled) {
        return;
      }

      setData((previous) => {
        const updated: DashboardData = {
          ...previous,
          ...patch,
        };

        // Keep the latest data available synchronously for SPA navigation.
        dashboardMemoryCache = updated;

        /*
         * Save every successful update into localStorage.
         *
         * This means the next visit can immediately display
         * the newest available dashboard data.
         */
        saveCachedData(updated);

        return updated;
      });
    }

    async function loadDashboard() {
      /*
       * The important part:
       *
       * We DO NOT clear the existing dashboard data.
       *
       * If cached data exists, it stays visible while the API
       * refresh happens in the background.
       */
      try {
        setError(null);

        const results = await Promise.allSettled([
          fetchDashboardSummary().then((result) => {
            updateData({
              summary: result,
            });
          }),

          fetchSalesOverview().then((result) => {
            updateData({
              salesOverview: result,
            });
          }),

          fetchLeadSources().then((result) => {
            updateData({
              leadSources: result,
            });
          }),

          fetchDealsPipeline().then((result) => {
            updateData({
              dealsPipeline: result,
            });
          }),

          fetchRecentActivities().then((result) => {
            updateData({
              activities: result,
            });
          }),

          fetchRecentCustomers().then((result) => {
            updateData({
              recentCustomers: result,
            });
          }),

          fetchRecentLeads().then((result) => {
            updateData({
              recentLeads: result,
            });
          }),

          fetchTopPerformers().then((result) => {
            updateData({
              topPerformers: result,
            });
          }),
        ]);

        if (cancelled) {
          return;
        }

        /*
         * Check whether any individual dashboard request failed.
         *
         * Promise.allSettled allows the other dashboard sections
         * to continue rendering normally.
         */
        const failedRequests = results.filter(
          (result) => result.status === "rejected"
        );

        if (failedRequests.length > 0) {
          console.warn(
            `${failedRequests.length} dashboard request(s) failed.`
          );

          setError(
            "Some dashboard data could not be refreshed."
          );
        }

        /*
         * IMPORTANT:
         *
         * We do not need to set loading=true here.
         *
         * Cached data is already visible.
         */
        setLoading(false);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load dashboard:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard data."
        );

        setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [hydrated, refreshKey]);

  /* ------------------------------------------------------------------------ */
  /* Listen for CRM data changes                                              */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    function handleDataChanged() {
      /*
       * Trigger a silent background refresh.
       *
       * Existing dashboard data stays visible.
       */
      setRefreshKey((current) => current + 1);
    }

    window.addEventListener(
      DATA_CHANGED_EVENT,
      handleDataChanged
    );

    return () => {
      window.removeEventListener(
        DATA_CHANGED_EVENT,
        handleDataChanged
      );
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Manual refresh                                                           */
  /* ------------------------------------------------------------------------ */

  function refresh() {
    /*
     * DO NOT clear data here.
     *
     * The previous implementation did something like:
     *
     * setData(EMPTY_DATA);
     * setLoading(true);
     *
     * which caused the entire dashboard to flash skeletons.
     *
     * We simply start another background request.
     */
    setRefreshKey((current) => current + 1);
  }

  return {
    data,
    loading,
    error,
    refresh,
  };
}