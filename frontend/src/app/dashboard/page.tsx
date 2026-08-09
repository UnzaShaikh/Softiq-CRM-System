"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import DealsPipeline from "@/components/dashboard/DealsPipeline";
import LeadsDonutChart from "@/components/dashboard/LeadsDonutChart";
import RecentCustomers from "@/components/dashboard/RecentCustomers";
import RecentLeads from "@/components/dashboard/RecentLeads";
import TopPerformers from "@/components/dashboard/TopPerformers";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { useDashboardData } from "@/hooks/useDashboardData";
import {
  dealsPipelineToWidget,
  leadSourcesToDonut,
  activitiesToFeed,
  recentCustomersToWidget,
  recentLeadsToWidget,
  topPerformersToWidget,
  salesOverviewToChart,
} from "@/lib/dashboard";
import { Users, Handshake, DollarSign, UserCheck } from "lucide-react";
import ThemeLoader from "@/components/ui/ThemeLoader";

export default function DashboardPage() {
  const { data, loading, error, refresh } = useDashboardData();

  if (loading && !data) {
    return (
      <DashboardLayout>
        <ThemeLoader label="Loading dashboard..." />
      </DashboardLayout>
    );
  }

  if (error && !data) {
    return (
      <DashboardLayout>
        <div className="not-found-state">
          <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>⚠️</p>
          <h2>Dashboard unavailable</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={refresh}>Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      label: "Total Customers",
      value: loading ? "..." : String(data?.summary?.total_customers ?? 0),
      change: "+12%",
      up: true,
      color: "#4f46e5",
      icon: <Users size={18} />,
    },
    {
      label: "Active Customers",
      value: loading ? "..." : String(data?.summary?.active_customers ?? 0),
      change: "+5%",
      up: true,
      color: "#0891b2",
      icon: <UserCheck size={18} />,
    },
    {
      label: "Revenue (MTD)",
      value: loading ? "..." : `$${Number(data?.summary?.total_revenue ?? 0).toLocaleString()}`,
      change: "+8.3%",
      up: true,
      color: "#16a34a",
      icon: <DollarSign size={18} />,
    },
    {
      label: "Total Deals",
      value: loading ? "..." : String(data?.summary?.total_deals ?? 0),
      change: "+4%",
      up: true,
      color: "#d97706",
      icon: <Handshake size={18} />,
    },
  ];

  const pipeline = dealsPipelineToWidget(data?.dealsPipeline ?? []);
  const donutSources = leadSourcesToDonut(data?.leadSources ?? []);
  const feedActivities = activitiesToFeed(data?.activities ?? []);
  const widgetCustomers = recentCustomersToWidget(data?.recentCustomers ?? []);
  const widgetLeads = recentLeadsToWidget(data?.recentLeads ?? []);
  const widgetPerformers = topPerformersToWidget(data?.topPerformers ?? []);
  const salesOverview = salesOverviewToChart(
    data?.salesOverview ?? { months: [], revenue: [], deals_closed: [] }
  );

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Page Header */}
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 700, color: "#0f172a" }}>
            Dashboard
          </h1>
          <p style={{ marginTop: 6, color: "#64748b" }}>
            Here&apos;s what&apos;s happening today.
          </p>
        </div>

        {error && data && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", padding: "0.875rem 1rem", borderRadius: "0.625rem", background: "#fef2f2", border: "1px solid rgba(239,68,68,0.25)", color: "#b91c1c", fontSize: "0.875rem" }}>
            <span>Failed to refresh dashboard data: {error}</span>
            <button
              onClick={refresh}
              style={{ padding: "0.375rem 0.875rem", borderRadius: "0.5rem", border: "1px solid rgba(239,68,68,0.3)", background: "#ffffff", color: "#b91c1c", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}
          className="dashboard-stats-grid"
        >
          {stats.map((item) => (
            <StatCard key={item.label} {...item} />
          ))}
        </div>

        {/* Revenue + Donut */}
        <div className="dashboard-chart-grid">
          <RevenueChart overview={salesOverview} />
          <LeadsDonutChart sources={donutSources} />
        </div>

        {/* Pipeline + Activity */}
        <div className="dashboard-chart-grid">
          <DealsPipeline stages={pipeline.stages} deals={pipeline.deals} />
          <ActivityFeed activities={feedActivities} />
        </div>

        {/* Recent Customers */}
        <RecentCustomers customers={widgetCustomers} />

        {/* Recent Leads */}
        <RecentLeads leads={widgetLeads} />

        {/* Top Performers */}
        <TopPerformers performers={widgetPerformers} />

        

      </div>
    </DashboardLayout>
  );
}
