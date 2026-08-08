"use client";

import { useState } from "react";
import { Activity } from "@/data/activities";
import { ActivityStatusBadge, ActivityTypeBadge, ActivityPriorityBadge } from "./ActivityStatusBadge";

interface ActivityTableProps {
  activities: Activity[];
  onView: (activity: Activity) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
}

type SortKey = "title" | "type" | "status" | "priority" | "date" | "assignedTo";
type SortDir = "asc" | "desc";

export default function ActivityTable({ activities, onView, onEdit, onDelete }: ActivityTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sorted = [...activities].sort((a, b) => {
    let vA: string = String(a[sortKey] ?? "").toLowerCase();
    let vB: string = String(b[sortKey] ?? "").toLowerCase();
    if (vA < vB) return sortDir === "asc" ? -1 : 1;
    if (vA > vB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  function SortIcon({ col }: { col: SortKey }) {
    const active = sortKey === col;
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={active ? "#4f46e5" : "#94a3b8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        {active && sortDir === "asc" ? <polyline points="18 15 12 9 6 15" /> : active && sortDir === "desc" ? <polyline points="6 9 12 15 18 9" /> : <><polyline points="18 15 12 9 6 15" opacity="0.4" /><polyline points="6 9 12 15 18 9" opacity="0.4" /></>}
      </svg>
    );
  }

  const thStyle: React.CSSProperties = { padding: "11px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap", userSelect: "none" };
  const tdStyle: React.CSSProperties = { padding: "14px 16px", fontSize: "0.875rem", color: "#374151", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" };

  if (activities.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state-title">No activities found.</p>
        <p className="empty-state-sub">Try adjusting your search or filter.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "inherit" }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => handleSort("title")}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Activity <SortIcon col="title" /></span></th>
            <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => handleSort("type")}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Type <SortIcon col="type" /></span></th>
            <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => handleSort("status")}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Status <SortIcon col="status" /></span></th>
            <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => handleSort("priority")}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Priority <SortIcon col="priority" /></span></th>
            <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => handleSort("date")}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Date & Time <SortIcon col="date" /></span></th>
            <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => handleSort("assignedTo")}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Assigned To <SortIcon col="assignedTo" /></span></th>
            <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((activity, idx) => {
            const isLast = idx === sorted.length - 1;
            const rowTd: React.CSSProperties = { ...tdStyle, borderBottom: isLast ? "none" : "1px solid #f1f5f9" };
            return (
              <tr key={activity.id} onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#fafafa")} onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")} style={{ transition: "background 0.12s ease" }}>
                <td style={rowTd}>
                  <p style={{ margin: 0, fontWeight: 600, color: "#0f172a", fontSize: "0.875rem" }}>{activity.title}</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{activity.relatedTo} · {activity.relatedType}</p>
                </td>
                <td style={rowTd}><ActivityTypeBadge type={activity.type} /></td>
                <td style={rowTd}><ActivityStatusBadge status={activity.status} /></td>
                <td style={rowTd}><ActivityPriorityBadge priority={activity.priority} /></td>
                <td style={rowTd}>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>{new Date(activity.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{activity.time} · {activity.duration} min</p>
                </td>
                <td style={rowTd}>
                  <span style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>{activity.assignedTo}</span>
                </td>
                <td style={{ ...rowTd, textAlign: "center" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    {[
                      { title: "View", color: "#4f46e5", hoverBg: "#eef2ff", hoverBorder: "#a5b4fc", action: () => onView(activity), icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> },
                      { title: "Edit", color: "#0891b2", hoverBg: "#ecfeff", hoverBorder: "#a5f3fc", action: () => onEdit(activity), icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg> },
                      { title: "Delete", color: "#ef4444", hoverBg: "#fef2f2", hoverBorder: "#fca5a5", action: () => onDelete(activity), icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg> },
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
