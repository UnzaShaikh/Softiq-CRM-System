"use client";

import type { DashboardDeal, DashboardStage } from "@/lib/dashboard";

interface DealsPipelineProps {
  stages: DashboardStage[];
  deals: DashboardDeal[];
}

const AVATAR_PALETTE: [string, string][] = [
  ["#4f46e5", "#7c3aed"],
  ["#0891b2", "#0e7490"],
  ["#059669", "#047857"],
  ["#d97706", "#b45309"],
  ["#dc2626", "#b91c1c"],
  ["#7c3aed", "#6d28d9"],
];

function colorForAvatar(avatar: string, index: number): [string, string] {
  const palette = AVATAR_PALETTE[index % AVATAR_PALETTE.length];
  return [palette[0], palette[1]];
}

export default function DealsPipeline({ stages, deals }: DealsPipelineProps) {
  // Total pipeline value
  const totalValue = deals.reduce((sum, d) => sum + parseFloat(d.value.replace(/[$,]/g, "")), 0);

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: "1rem",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Deals Pipeline</h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.8125rem", color: "#64748b" }}>
            {deals.length} active deals · ${(totalValue / 1000).toFixed(1)}k total value
          </p>
        </div>
        <button style={{
          padding: "6px 14px", borderRadius: 7, fontSize: "0.8125rem",
          fontWeight: 600, color: "#4f46e5", background: "#eef2ff",
          border: "none", cursor: "pointer", fontFamily: "inherit",
          transition: "background 0.15s",
        }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#e0e7ff")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#eef2ff")}
        >
          View All
        </button>
      </div>

      {/* Stage progress bar */}
      <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", gap: 3, height: 8, borderRadius: 99, overflow: "hidden" }}>
          {stages.map((s) => (
            <div
              key={s.id}
              title={`${s.label}: ${s.count} deals`}
              style={{
                flex: s.count || 0.001,
                background: s.color,
                opacity: 0.85,
                transition: "flex 0.3s",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, gap: 4, flexWrap: "wrap" }}>
          {stages.map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                {s.label} <span style={{ fontWeight: 700, color: "#0f172a" }}>{s.count}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Deal rows */}
      {deals.length === 0 ? (
        <div style={{ padding: "2rem 1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
          No deals yet — create deals to build your pipeline.
        </div>
      ) : (
        <div style={{ padding: "0.5rem 0" }}>
          {deals.map((deal, i) => {
            const stage = stages.find((s) => s.id === deal.stage);
            const [c1, c2] = colorForAvatar(deal.avatar, i);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 1.5rem",
                  transition: "background 0.12s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#f8fafc")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
              >
                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: `linear-gradient(135deg, ${c1}, ${c2})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: "0.75rem", userSelect: "none",
                }}>
                  {deal.avatar}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {deal.name}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {deal.company}
                  </p>
                </div>

                {/* Stage badge */}
                <span style={{
                  padding: "3px 9px",
                  borderRadius: 9999,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: stage?.color ?? "#64748b",
                  background: stage?.bg ?? "#f1f5f9",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}>
                  {stage?.label ?? deal.stage}
                </span>

                {/* Days left */}
                {deal.daysLeft > 0 ? (
                  <span style={{
                    fontSize: "0.7rem", color: deal.daysLeft <= 5 ? "#dc2626" : "#64748b",
                    fontWeight: 600, flexShrink: 0, minWidth: 48, textAlign: "right",
                  }}>
                    {deal.daysLeft}d left
                  </span>
                ) : (
                  <span style={{
                    fontSize: "0.7rem", color: deal.stage === "closed_won" ? "#16a34a" : "#94a3b8",
                    fontWeight: 700, flexShrink: 0, minWidth: 48, textAlign: "right",
                  }}>
                    {deal.stage === "closed_won" ? "✓ Won" : "—"}
                  </span>
                )}

                {/* Value */}
                <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", flexShrink: 0, minWidth: 60, textAlign: "right" }}>
                  {deal.value}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
