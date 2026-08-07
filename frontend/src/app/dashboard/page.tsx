"use client";

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
import { Users, Handshake, DollarSign, Ticket } from "lucide-react";

const stats = [
  {
    label: "Total Customers",
    value: "2,491",
    change: "+12%",
    up: true,
    color: "#4f46e5",
    icon: <Users size={18} />,
  },
  {
    label: "Active Deals",
    value: "148",
    change: "+5%",
    up: true,
    color: "#0891b2",
    icon: <Handshake size={18} />,
  },
  {
    label: "Revenue (MTD)",
    value: "$84,200",
    change: "+8.3%",
    up: true,
    color: "#16a34a",
    icon: <DollarSign size={18} />,
  },
  {
    label: "Open Tickets",
    value: "23",
    change: "-4%",
    up: false,
    color: "#d97706",
    icon: <Ticket size={18} />,
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Page Header */}
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
            Here's what's happening today.
          </p>
        </div>

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
          <RevenueChart />
          <LeadsDonutChart />
        </div>

        {/* Pipeline + Activity */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "24px",
          }}
        >
          <DealsPipeline />
          <ActivityFeed />
        </div>

        {/* Recent Customers */}
        <RecentCustomers />

        {/* Recent Leads */}
        <RecentLeads />

        {/* Top Performers */}
        <TopPerformers />
<SalesPipeline />
      </div>
    </DashboardLayout>
    
  );
}