"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import DealsPipeline from "@/components/dashboard/DealsPipeline";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import RecentCustomers from "@/components/dashboard/RecentCustomers";
import RecentLeads from "@/components/dashboard/RecentLeads";
import LeadsDonutChart from "@/components/dashboard/LeadsDonutChart";
import TopPerformers from "@/components/dashboard/TopPerformers";

// ── KPI card definitions (6 cards per spec) ──────────────────────────────────
const KPI_STATS = [
  {
    label: "Total Customers",
    value: "2,491",
    change: "+12%",
    up: true,
    color: "#4f46e5",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Total Leads",
    value: "864",
    change: "+19%",
    up: true,
    color: "#0891b2",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    label: "Opportunities",
    value: "148",
    change: "+5%",
    up: true,
    color: "#7c3aed",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    label: "Revenue (MTD)",
    value: "$84,200",
    change: "+8.3%",
    up: true,
    color: "#16a34a",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: "Tasks Due",
    value: "23",
    change: "+3",
    up: false,
    color: "#d97706",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: "Active Deals",
    value: "57",
    change: "+7%",
    up: true,
    color: "#dc2626",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>

      {/* ── Welcome section ───────────────────────────────────────────────── */}
      <div style={{ marginBottom: "1.75rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 500 }}>
            Monday, August 3, 2026
          </p>
          <h1 style={{ margin: "4px 0 0", fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
            Welcome back, Khaanzadi 👋
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.9375rem" }}>
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8,
            border: "1.5px solid #e2e8f0", background: "#fff",
            fontSize: "0.8125rem", fontWeight: 600, color: "#374151",
            cursor: "pointer", fontFamily: "inherit",
            transition: "border-color 0.15s, background 0.15s",
          }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#c7d2fe";
              (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
              (e.currentTarget as HTMLButtonElement).style.background = "#fff";
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Report
          </button>
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8,
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            color: "#fff", fontWeight: 600, fontSize: "0.8125rem",
            border: "none", cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 2px 8px rgba(79,70,229,0.35)",
            transition: "opacity 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(79,70,229,0.45)";
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.92";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(79,70,229,0.35)";
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Customer
          </button>
        </div>
      </div>

      {/* ── 6 KPI Cards ───────────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem",
      }}>
        {KPI_STATS.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            change={s.change}
            up={s.up}
            color={s.color}
            icon={s.icon}
          />
        ))}
      </div>

      {/* ── Sales Overview (line chart) + Leads by Source (donut) ─────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
        gap: "1.5rem",
        marginBottom: "1.5rem",
      }}>
        <RevenueChart />
        <LeadsDonutChart />
      </div>

      {/* ── Sales Pipeline + Upcoming Activities ──────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
        gap: "1.5rem",
        marginBottom: "1.5rem",
      }}>
        <DealsPipeline />
        <ActivityFeed />
      </div>

      {/* ── Top Performing Users (full width) ────────────────────────────── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <TopPerformers />
      </div>

      {/* ── Recent Leads (full width) ─────────────────────────────────────── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <RecentLeads />
      </div>

      {/* ── Recent Customers (full width) ─────────────────────────────────── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <RecentCustomers />
      </div>

      <div style={{ height: "1rem" }} />
    </DashboardLayout>
  );
}
