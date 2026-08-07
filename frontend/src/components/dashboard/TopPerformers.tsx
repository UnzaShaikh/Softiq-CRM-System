"use client";

import type { DashboardPerformer } from "@/lib/dashboard";

const AVATAR_COLORS: [string, string][] = [
  ["#dc2626", "#b91c1c"],
  ["#4f46e5", "#7c3aed"],
  ["#7c3aed", "#6d28d9"],
  ["#0891b2", "#0e7490"],
  ["#0ea5e9", "#0284c7"],
];

const RANK_STYLE: Record<number, { color: string; bg: string; label: string }> = {
  1: { color: "#b45309", bg: "#fffbeb", label: "🥇" },
  2: { color: "#475569", bg: "#f1f5f9", label: "🥈" },
  3: { color: "#92400e", bg: "#fef3c7", label: "🥉" },
};

interface TopPerformersProps {
  performers: DashboardPerformer[];
}

export default function TopPerformers({ performers }: TopPerformersProps) {
  const maxRevenue = Math.max(...performers.map((p) => parseFloat(p.revenue.replace(/[$,]/g, ""))), 0);

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
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Top Performing Users</h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.8125rem", color: "#64748b" }}>This month&apos;s leaderboard</p>
        </div>
        <button style={{
          padding: "5px 12px", borderRadius: 7, fontSize: "0.8rem",
          fontWeight: 600, color: "#4f46e5", background: "#eef2ff",
          border: "none", cursor: "pointer", fontFamily: "inherit",
        }}>
          Full Report
        </button>
      </div>

      {/* List */}
      {performers.length === 0 ? (
        <div style={{ padding: "2rem 1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
          No closed deals yet — the leaderboard will fill up here.
        </div>
      ) : (
        <div style={{ padding: "0.5rem 0" }}>
          {performers.map((p) => {
            const palette = AVATAR_COLORS[(p.rank - 1) % AVATAR_COLORS.length];
            const [c1, c2] = palette;
            const revenueNum = parseFloat(p.revenue.replace(/[$,]/g, ""));
            const barPct = maxRevenue > 0 ? (revenueNum / maxRevenue) * 100 : 0;
            const rankStyle = RANK_STYLE[p.rank];

            return (
              <div
                key={p.rank}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 1.5rem",
                  transition: "background 0.12s", cursor: "pointer",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#f8fafc")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
              >
                {/* Rank badge */}
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: rankStyle ? rankStyle.bg : "#f1f5f9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: rankStyle ? "1rem" : "0.75rem",
                  fontWeight: 700,
                  color: rankStyle ? rankStyle.color : "#64748b",
                }}>
                  {rankStyle ? rankStyle.label : p.rank}
                </div>

                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: `linear-gradient(135deg, ${c1}, ${c2})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: "0.72rem", userSelect: "none",
                }}>
                  {p.avatar}
                </div>

                {/* Name + bar */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>{p.name}</span>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8", marginLeft: 6 }}>{p.role}</span>
                    </div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#16a34a", background: "rgba(22,163,74,0.08)", padding: "1px 6px", borderRadius: 9999 }}>
                      {p.growth}
                    </span>
                  </div>
                  {/* Revenue progress bar */}
                  <div style={{ height: 5, background: "#f1f5f9", borderRadius: 9999, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${barPct}%`,
                      background: `linear-gradient(90deg, ${c1}, ${c2})`,
                      borderRadius: 9999,
                      transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
                    }} />
                  </div>
                </div>

                {/* Stats */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>{p.revenue}</p>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{p.deals} deals</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
