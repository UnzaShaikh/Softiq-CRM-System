"use client";

import { useState } from "react";
import type { DashboardLead } from "@/lib/dashboard";

type FilterStatus = "All" | "New" | "Contacted" | "Qualified" | "Lost";

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  New:       { color: "#4f46e5", bg: "#eef2ff" },
  Contacted: { color: "#0891b2", bg: "#ecfeff" },
  Qualified: { color: "#16a34a", bg: "#f0fdf4" },
  Lost:      { color: "#dc2626", bg: "#fef2f2" },
};

const SOURCE_ICON: Record<string, string> = {
  Website:     "🔍",
  Referral:    "🤝",
  "Social Media": "📱",
  Email:       "📧",
  Other:       "🎯",
};

const AVATAR_COLORS: [string, string][] = [
  ["#4f46e5", "#7c3aed"],
  ["#0891b2", "#0e7490"],
  ["#059669", "#047857"],
  ["#d97706", "#b45309"],
  ["#dc2626", "#b91c1c"],
  ["#ec4899", "#db2777"],
];

function ScoreDot({ score }: { score: number }) {
  const color = score >= 85 ? "#16a34a" : score >= 65 ? "#d97706" : "#dc2626";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", position: "relative", flexShrink: 0 }}>
        <svg width="28" height="28" viewBox="0 0 28 28" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="14" cy="14" r="11" fill="none" stroke="#f1f5f9" strokeWidth="3" />
          <circle
            cx="14" cy="14" r="11"
            fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${(score / 100) * 69.1} 69.1`}
            strokeLinecap="round"
          />
        </svg>
        <span style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.55rem", fontWeight: 800, color,
        }}>
          {score}
        </span>
      </div>
    </div>
  );
}

interface RecentLeadsProps {
  leads: DashboardLead[];
}

export default function RecentLeads({ leads }: RecentLeadsProps) {
  const [filter, setFilter] = useState<FilterStatus>("All");

  const filtered = filter === "All" ? leads : leads.filter((l) => l.status === filter);

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: "1rem",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "1.25rem 1.5rem",
        borderBottom: "1px solid #f1f5f9",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Recent Leads</h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.8125rem", color: "#64748b" }}>
            {filtered.length} leads · sorted by latest
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Filter */}
          <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
            {(["All", "New", "Contacted", "Qualified", "Lost"] as FilterStatus[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "4px 10px", borderRadius: 6, border: "none",
                  background: filter === f ? "#fff" : "transparent",
                  color: filter === f ? "#4f46e5" : "#64748b",
                  fontWeight: filter === f ? 700 : 500, fontSize: "0.78rem",
                  cursor: "pointer", boxShadow: filter === f ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  fontFamily: "inherit", transition: "all 0.15s",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {leads.length === 0 ? (
        <div style={{ padding: "2.5rem 1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
          No leads yet — add leads to see them here.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 580 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Lead", "Company", "Source", "Status", "Score", "Added"].map((col) => (
                  <th key={col} style={{
                    padding: "10px 16px", textAlign: "left",
                    fontSize: "0.75rem", fontWeight: 700,
                    color: "#64748b", textTransform: "uppercase",
                    letterSpacing: "0.05em", whiteSpace: "nowrap",
                    borderBottom: "1px solid #f1f5f9",
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => {
                const st = STATUS_STYLE[lead.status] ?? STATUS_STYLE.New;
                const palette = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const [c1, c2] = palette;
                return (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.12s", cursor: "pointer" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                  >
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                          background: `linear-gradient(135deg, ${c1}, ${c2})`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontWeight: 700, fontSize: "0.68rem", userSelect: "none",
                        }}>
                          {lead.avatar}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>{lead.name}</p>
                          <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>{lead.company}</span>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>
                        {SOURCE_ICON[lead.source] ?? "🔍"} {lead.source}
                      </span>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 9999,
                        fontSize: "0.75rem", fontWeight: 700,
                        color: st.color, background: st.bg,
                      }}>
                        {lead.status}
                      </span>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <ScoreDot score={lead.score} />
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{lead.createdAt}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: "11px 16px",
        borderTop: "1px solid #f1f5f9",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
          Showing {filtered.length} of {leads.length} leads
        </span>
      </div>
    </div>
  );
}
