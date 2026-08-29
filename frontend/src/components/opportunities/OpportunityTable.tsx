"use client";

import { useState } from "react";
import { Opportunity } from "@/data/opportunities";
import { usePermission } from "@/hooks/usePermissions";
import { OpportunityStageBadge } from "./OpportunityStageBadge";

interface OpportunityTableProps {
  opportunities: Opportunity[];
  onView: (opp: Opportunity) => void;
  onEdit: (opp: Opportunity) => void;
  onDelete: (opp: Opportunity) => void;
}

type SortKey = "name" | "customerName" | "company" | "dealValue" | "stage" | "probability" | "expectedCloseDate";
type SortDir = "asc" | "desc";

const AVATAR_COLORS: [string, string][] = [
  ["#4f46e5", "#7c3aed"], ["#0891b2", "#0e7490"], ["#059669", "#047857"],
  ["#d97706", "#b45309"], ["#dc2626", "#b91c1c"], ["#7c3aed", "#6d28d9"],
];

function getAvatarColor(name: string): [string, string] {
  const idx = ((name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function SortIcon({ active, sortDir }: { active: boolean; sortDir: SortDir }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={active ? "#4f46e5" : "#94a3b8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {active && sortDir === "asc" ? <polyline points="18 15 12 9 6 15" /> : active && sortDir === "desc" ? <polyline points="6 9 12 15 18 9" /> : <><polyline points="18 15 12 9 6 15" opacity="0.4" /><polyline points="6 9 12 15 18 9" opacity="0.4" /></>}
    </svg>
  );
}

export default function OpportunityTable({ opportunities, onView, onEdit, onDelete }: OpportunityTableProps) {
  const canEdit = usePermission("opportunities", "edit");
  const canDelete = usePermission("opportunities", "delete");
  const [sortKey, setSortKey] = useState<SortKey>("expectedCloseDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sorted = [...opportunities].sort((a, b) => {
    let vA: string | number = a[sortKey] ?? "";
    let vB: string | number = b[sortKey] ?? "";
    if (typeof vA === "string") vA = vA.toLowerCase();
    if (typeof vB === "string") vB = vB.toLowerCase();
    if (vA < vB) return sortDir === "asc" ? -1 : 1;
    if (vA > vB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const thStyle: React.CSSProperties = { padding: "11px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap", userSelect: "none" };
  const tdStyle: React.CSSProperties = { padding: "14px 16px", fontSize: "0.875rem", color: "#374151", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" };

  if (opportunities.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
        <svg style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem", color: "#64748b" }}>No opportunities found</p>
        <p style={{ margin: "4px 0 0", fontSize: "0.8125rem" }}>Try adjusting your search or filter.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif" }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => handleSort("name")}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Opportunity <SortIcon active={sortKey === "name"} sortDir={sortDir} /></span></th>
            <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => handleSort("customerName")}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Customer <SortIcon active={sortKey === "customerName"} sortDir={sortDir} /></span></th>
            <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => handleSort("dealValue")}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Value <SortIcon active={sortKey === "dealValue"} sortDir={sortDir} /></span></th>
            <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => handleSort("stage")}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Stage <SortIcon active={sortKey === "stage"} sortDir={sortDir} /></span></th>
            <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => handleSort("probability")}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Probability <SortIcon active={sortKey === "probability"} sortDir={sortDir} /></span></th>
            <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => handleSort("expectedCloseDate")}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Close Date <SortIcon active={sortKey === "expectedCloseDate"} sortDir={sortDir} /></span></th>
            <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((opp, idx) => {
            const [c1, c2] = getAvatarColor(opp.name);
            const isLast = idx === sorted.length - 1;
            const rowTd: React.CSSProperties = { ...tdStyle, borderBottom: isLast ? "none" : "1px solid #f1f5f9" };
            return (
              <tr key={opp.id} onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#fafafa")} onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")} style={{ transition: "background 0.12s ease" }}>
                <td style={rowTd}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.75rem", flexShrink: 0 }}>{opp.avatar}</div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: "#0f172a", fontSize: "0.875rem" }}>{opp.name}</p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{opp.id}</p>
                    </div>
                  </div>
                </td>
                <td style={rowTd}>
                  <span style={{ color: "#374151", fontWeight: 500 }}>{opp.customerName}</span><br />
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{opp.company}</span>
                </td>
                <td style={rowTd}>
                  <span style={{ fontWeight: 700, color: "#059669", fontSize: "0.9rem" }}>${opp.dealValue.toLocaleString()}</span>
                </td>
                <td style={rowTd}><OpportunityStageBadge stage={opp.stage} /></td>
                <td style={rowTd}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ flex: 1, height: "6px", borderRadius: "9999px", background: "#e2e8f0", overflow: "hidden" }}>
                      <div style={{ width: `${opp.probability}%`, height: "100%", background: opp.probability >= 70 ? "#22c55e" : opp.probability >= 40 ? "#f59e0b" : "#3b82f6", transition: "width 0.3s ease" }} />
                    </div>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569", minWidth: "35px" }}>{opp.probability}%</span>
                  </div>
                </td>
                <td style={rowTd}>
                  <span style={{ color: "#475569", fontSize: "0.8125rem" }}>{new Date(opp.expectedCloseDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                </td>
                <td style={{ ...rowTd, textAlign: "center" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    {[
                      { title: "View", color: "#4f46e5", hoverBg: "#eef2ff", hoverBorder: "#a5b4fc", action: () => onView(opp), icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> },
                      ...(canEdit ? [{ title: "Edit", color: "#0891b2", hoverBg: "#ecfeff", hoverBorder: "#a5f3fc", action: () => onEdit(opp), icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg> }] : []),
                      ...(canDelete ? [{ title: "Delete", color: "#ef4444", hoverBg: "#fef2f2", hoverBorder: "#fca5a5", action: () => onDelete(opp), icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg> }] : []),
                  ].map((btn) => (
                      <button key={btn.title} onClick={btn.action} title={btn.title} style={{ width: 30, height: 30, borderRadius: "7px", border: "1.5px solid #e2e8f0", background: "#fff", color: btn.color, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.12s ease", padding: 0 }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = btn.hoverBg; (e.currentTarget as HTMLButtonElement).style.borderColor = btn.hoverBorder; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; }}
                      >{btn.icon}</button>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
