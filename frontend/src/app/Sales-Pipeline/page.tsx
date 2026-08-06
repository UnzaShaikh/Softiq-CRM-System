"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import SalesPipelineBoard from "@/components/dashboard/SalesPipelineBoard";
import { DEALS } from "@/components/dashboard/data";

const dealValues = DEALS.map((deal) =>
  Number(deal.value.replace(/[$,]/g, ""))
);

const totalPipeline = dealValues.reduce((sum, value) => sum + value, 0);

const openDeals = DEALS.filter(
  (deal) =>
    deal.stage !== "closed_won" &&
    deal.stage !== "closed_lost"
).length;

// Example weighted percentages
const weights: Record<string, number> = {
  lead: 0.1,
  qualified: 0.3,
  proposal: 0.6,
  negotiation: 0.8,
  closed_won: 1,
  closed_lost: 0,
};

const weightedValue = DEALS.reduce((sum, deal) => {
  const value = Number(deal.value.replace(/[$,]/g, ""));
  return sum + value * (weights[deal.stage] ?? 0);
}, 0);

const avgDealSize =
  DEALS.length > 0 ? totalPipeline / DEALS.length : 0;

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const stats = [
  {
    label: "Total Pipeline",
    value: formatCurrency(totalPipeline),
    change: "",
    up: true,
    color: "#4f46e5",
    icon: "💼",
  },
  {
    label: "Weighted Value",
    value: formatCurrency(weightedValue),
    change: "",
    up: true,
    color: "#16a34a",
    icon: "📈",
  },
  {
    label: "Open Deals",
    value: openDeals.toString(),
    change: "",
    up: true,
    color: "#0891b2",
    icon: "🤝",
  },
  {
    label: "Avg. Deal Size",
    value: formatCurrency(avgDealSize),
    change: "",
    up: true,
    color: "#d97706",
    icon: "💰",
  },
];

export default function SalesPipelinePage() {
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
            Sales Pipeline
          </h1>

          <p
            style={{
              marginTop: 6,
              color: "#64748b",
            }}
          >
            Track every deal from lead to close.
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

        {/* Full Kanban board */}
        <SalesPipelineBoard />
      </div>
    </DashboardLayout>
  );
}
