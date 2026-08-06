"use client";

import { useState } from "react";
import type { DashboardCustomer } from "@/lib/dashboard";

type FilterStatus = "All" | "Active" | "Inactive" | "Lead";

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  Active:   { color: "#16a34a", bg: "#f0fdf4" },
  Inactive: { color: "#64748b", bg: "#f1f5f9" },
  Lead:     { color: "#d97706", bg: "#fffbeb" },
};

const AVATAR_COLORS: [string, string][] = [
  ["#4f46e5", "#7c3aed"],
  ["#0891b2", "#0e7490"],
  ["#059669", "#047857"],
  ["#d97706", "#b45309"],
  ["#dc2626", "#b91c1c"],
  ["#7c3aed", "#6d28d9"],
  ["#ec4899", "#db2777"],
  ["#0ea5e9", "#0284c7"],
];

const COLS = ["Customer", "Company", "Status", "Revenue", "Joined", ""];

interface RecentCustomersProps {
  customers: DashboardCustomer[];
}

export default function RecentCustomers({ customers }: RecentCustomersProps) {
  const [filter, setFilter] = useState<FilterStatus>("All");

  const filtered = filter === "All" ? customers : customers.filter((c) => c.status === filter);

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
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Recent Customers</h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.8125rem", color: "#64748b" }}>
            {filtered.length} of {customers.length} customers shown
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Filter pills */}
          <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
            {(["All", "Active", "Inactive", "Lead"] as FilterStatus[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "4px 12px", borderRadius: 6, border: "none",
                  background: filter === f ? "#fff" : "transparent",
                  color: filter === f ? "#4f46e5" : "#64748b",
                  fontWeight: filter === f ? 700 : 500,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  boxShadow: filter === f ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {customers.length === 0 ? (
        <div style={{ padding: "2.5rem 1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
          No customers yet — add customers to see them here.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {COLS.map((col) => (
                  <th key={col} style={{
                    padding: "10px 16px",
                    textAlign: col === "" ? "right" : "left",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                    borderBottom: "1px solid #f1f5f9",
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const st = STATUS_STYLE[c.status] ?? STATUS_STYLE.Active;
                const palette = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const [col1, col2] = palette;
                return (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.12s", cursor: "pointer" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                  >
                    {/* Customer */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                          background: `linear-gradient(135deg, ${col1}, ${col2})`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontWeight: 700, fontSize: "0.72rem", userSelect: "none",
                        }}>
                          {c.avatar}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>{c.name}</p>
                          <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{c.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>{c.company}</span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 9999,
                        fontSize: "0.75rem", fontWeight: 700,
                        color: st.color, background: st.bg,
                      }}>
                        {c.status}
                      </span>
                    </td>

                    {/* Revenue */}
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>{c.revenue}</span>
                    </td>

                    {/* Joined */}
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{c.joined}</span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                        <ActionBtn title="View" icon={
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                          </svg>
                        } />
                        <ActionBtn title="Edit" icon={
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        } />
                      </div>
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
        padding: "12px 16px",
        borderTop: "1px solid #f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
          Showing {filtered.length} of {customers.length} entries
        </span>
      </div>
    </div>
  );
}

function ActionBtn({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <button
      title={title}
      style={{
        background: "none", border: "1px solid #e2e8f0",
        borderRadius: 6, width: 28, height: 28,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "#64748b",
        transition: "border-color 0.15s, color 0.15s, background 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#c7d2fe";
        (e.currentTarget as HTMLButtonElement).style.color = "#4f46e5";
        (e.currentTarget as HTMLButtonElement).style.background = "#eef2ff";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
        (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
        (e.currentTarget as HTMLButtonElement).style.background = "none";
      }}
    >
      {icon}
    </button>
  );
}
