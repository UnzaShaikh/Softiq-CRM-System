"use client";

import { useState } from "react";

interface Customer {
  name: string;
  email: string;
  company: string;
  status: "Active" | "Prospect" | "Churned";
  revenue: string;
  joined: string;
  avatar: string;
}

const CUSTOMERS: Customer[] = [
  { name: "Sarah Chen",      email: "s.chen@acmecorp.com",      company: "Acme Corp",       status: "Active",   revenue: "$24,000", joined: "Jan 2024",  avatar: "SC" },
  { name: "Marcus Rivera",   email: "m.rivera@techflow.io",     company: "TechFlow Inc",    status: "Active",   revenue: "$18,500", joined: "Mar 2024",  avatar: "MR" },
  { name: "Priya Nair",      email: "priya@cloudbase.co",       company: "CloudBase Ltd",   status: "Prospect", revenue: "$41,000", joined: "May 2024",  avatar: "PN" },
  { name: "James O'Brien",   email: "j.obrien@retailplus.com",  company: "Retail Plus",     status: "Active",   revenue: "$9,200",  joined: "Feb 2024",  avatar: "JO" },
  { name: "Elena Vasquez",   email: "elena@healthsync.io",      company: "HealthSync",      status: "Active",   revenue: "$67,000", joined: "Nov 2023",  avatar: "EV" },
  { name: "Kwame Asante",    email: "k.asante@logicore.net",    company: "LogiCore",        status: "Churned",  revenue: "$33,400", joined: "Aug 2023",  avatar: "KA" },
  { name: "Aisha Patel",     email: "aisha.p@finwave.co",       company: "FinWave",         status: "Prospect", revenue: "$12,800", joined: "Jun 2024",  avatar: "AP" },
  { name: "Tom Lindqvist",   email: "tom@nordicops.se",         company: "NordicOps",       status: "Active",   revenue: "$55,000", joined: "Dec 2023",  avatar: "TL" },
];

const STATUS_STYLE: Record<Customer["status"], { color: string; bg: string }> = {
  Active:   { color: "#16a34a", bg: "#f0fdf4" },
  Prospect: { color: "#d97706", bg: "#fffbeb" },
  Churned:  { color: "#dc2626", bg: "#fef2f2" },
};

const AVATAR_COLORS: Record<string, [string, string]> = {
  SC: ["#4f46e5", "#7c3aed"],
  MR: ["#0891b2", "#0e7490"],
  PN: ["#059669", "#047857"],
  JO: ["#d97706", "#b45309"],
  EV: ["#dc2626", "#b91c1c"],
  KA: ["#7c3aed", "#6d28d9"],
  AP: ["#ec4899", "#db2777"],
  TL: ["#0ea5e9", "#0284c7"],
};

const COLS = ["Customer", "Company", "Status", "Revenue", "Joined", ""];

export default function RecentCustomers() {
  const [filter, setFilter] = useState<"All" | Customer["status"]>("All");

  const filtered = filter === "All" ? CUSTOMERS : CUSTOMERS.filter((c) => c.status === filter);

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
            {filtered.length} of {CUSTOMERS.length} customers shown
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Filter pills */}
          <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
            {(["All", "Active", "Prospect", "Churned"] as const).map((f) => (
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

          <button style={{
            padding: "7px 14px", borderRadius: 7, fontSize: "0.8125rem",
            fontWeight: 600, color: "#fff",
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            border: "none", cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Customer
          </button>
        </div>
      </div>

      {/* Table */}
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
              const st = STATUS_STYLE[c.status];
              const [col1, col2] = AVATAR_COLORS[c.avatar] ?? ["#4f46e5", "#7c3aed"];
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

      {/* Footer */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid #f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
          Showing {filtered.length} of {CUSTOMERS.length} entries
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {["←", "1", "2", "3", "→"].map((p, i) => (
            <button key={i} style={{
              width: 30, height: 30, borderRadius: 6, border: "1px solid",
              borderColor: p === "1" ? "#4f46e5" : "#e2e8f0",
              background: p === "1" ? "#4f46e5" : "#fff",
              color: p === "1" ? "#fff" : "#64748b",
              fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "inherit",
            }}>
              {p}
            </button>
          ))}
        </div>
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
