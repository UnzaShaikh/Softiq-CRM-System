"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import DealsPipeline from "@/components/dashboard/DealsPipeline";
import SalesPipeline from "@/components/dashboard/SalesPipeline";
import LeadsDonutChart from "@/components/dashboard/LeadsDonutChart";
import RecentCustomers from "@/components/dashboard/RecentCustomers";
import RecentLeads from "@/components/dashboard/RecentLeads";
import TopPerformers from "@/components/dashboard/TopPerformers";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { STAGES } from "@/components/dashboard/data";
import {
  salesOverviewToChart,
  leadSourcesToDonut,
  dealsPipelineToWidget,
  dealsPipelineToBoardDeals,
  activitiesToFeed,
  recentCustomersToWidget,
  recentLeadsToWidget,
  topPerformersToWidget,
  formatCurrency,
} from "@/lib/dashboard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { getAccessToken } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const { data, loading, error, refresh } = useDashboardData();

  useEffect(() => {
    if (error && !getAccessToken()) {
      router.push("/login");
    }
  }, [error, router]);

  const stats = data
    ? [
        {
          label: "Total Customers",
          value: data.summary.total_customers.toLocaleString(),
          change: "—",
          up: true,
          color: "#4f46e5",
          icon: "👥",
        },
        {
          label: "Active Customers",
          value: String(data.summary.active_customers),
          change: "—",
          up: true,
          color: "#16a34a",
          icon: "✅",
        },
        {
          label: "Active Deals",
          value: String(data.summary.total_deals),
          change: "—",
          up: true,
          color: "#0891b2",
          icon: "🤝",
        },
        {
          label: "Revenue",
          value: formatCurrency(data.summary.total_revenue),
          change: "—",
          up: true,
          color: "#d97706",
          icon: "💰",
        },
      ]
    : [];

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "2rem",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              Dashboard
            </h1>

            <p
              style={{
                marginTop: 6,
                color: "#64748b",
              }}
            >
              Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 8,
              border: "1px solid #e2e8f0", background: "#fff",
              color: "#475569", fontWeight: 600, fontSize: "0.8125rem",
              cursor: loading ? "default" : "pointer", fontFamily: "inherit",
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={loading ? { animation: "spin 1s linear infinite" } : undefined}>
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <polyline points="21 3 21 9 15 9" />
            </svg>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {loading && !data ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#64748b", fontSize: "0.95rem" }}>
            Loading dashboard…
          </div>
        ) : error && !data ? (
          <div style={{
            background: "#fff", borderRadius: "1rem", border: "1px solid #fecaca",
            padding: "40px", textAlign: "center",
          }}>
            <p style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 700, color: "#dc2626" }}>Failed to load dashboard</p>
            <p style={{ margin: "0 0 20px", fontSize: "0.875rem", color: "#64748b" }}>{error}</p>
            <button
              onClick={refresh}
              style={{
                padding: "8px 18px", borderRadius: 8, border: "none",
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                color: "#fff", fontWeight: 600, fontSize: "0.8125rem",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Try again
            </button>
          </div>
        ) : data ? (
          <>
            {/* KPI Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
                gap: "20px",
              }}
            >
              {stats.map((item) => (
                <StatCard key={item.label} {...item} />
              ))}
            </div>

            {/* Revenue + Donut */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "24px",
              }}
            >
              <RevenueChart overview={salesOverviewToChart(data.salesOverview)} />
              <LeadsDonutChart sources={leadSourcesToDonut(data.leadSources)} />
            </div>

            {/* Pipeline + Activity */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "24px",
              }}
            >
              <DealsPipeline {...dealsPipelineToWidget(data.dealsPipeline)} />
              <ActivityFeed activities={activitiesToFeed(data.activities)} />
            </div>

            {/* Recent Customers */}
            <RecentCustomers customers={recentCustomersToWidget(data.recentCustomers)} />

            {/* Recent Leads */}
            <RecentLeads leads={recentLeadsToWidget(data.recentLeads)} />

            {/* Top Performers */}
            <TopPerformers performers={topPerformersToWidget(data.topPerformers)} />

            <SalesPipeline stages={STAGES} deals={dealsPipelineToBoardDeals(data.dealsPipeline)} />
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}