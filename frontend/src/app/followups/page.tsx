"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SearchBar from "@/components/customers/SearchBar";
import Pagination from "@/components/customers/Pagination";
import followupsData, {
  Followup, FollowupType, FollowupStatus, FollowupPriority,
  TYPE_COLORS, STATUS_COLORS, PRIORITY_COLORS,
} from "@/data/followups";
import {
  Phone, Mail, Users, CheckSquare, Calendar,
  Eye, Pencil, Trash2, Plus, Download, TrendingUp, Clock, AlertCircle, CheckCircle,
} from "lucide-react";

const ITEMS_PER_PAGE = 7;
const ALL_TYPES: FollowupType[] = ["Call", "Email", "Meeting", "Task", "Follow-up"];
const ALL_STATUSES: FollowupStatus[] = ["Upcoming", "Completed", "Overdue", "Cancelled"];
const ALL_PRIORITIES: FollowupPriority[] = ["High", "Medium", "Low"];

function TypeIcon({ type }: { type: FollowupType }) {
  const style = TYPE_COLORS[type];
  const icons: Record<FollowupType, React.ReactNode> = {
    "Call":      <Phone size={12} />,
    "Email":     <Mail size={12} />,
    "Meeting":   <Users size={12} />,
    "Task":      <CheckSquare size={12} />,
    "Follow-up": <Calendar size={12} />,
  };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 9px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600, background: style.bg, color: style.color }}>
      {icons[type]}{type}
    </span>
  );
}

function StatusBadge({ status }: { status: FollowupStatus }) {
  const s = STATUS_COLORS[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 9px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: FollowupPriority }) {
  const s = PRIORITY_COLORS[priority];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {priority}
    </span>
  );
}

export default function FollowupsPage() {
  const router = useRouter();
  const [followups, setFollowups] = useState<Followup[]>(followupsData);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | FollowupType>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | FollowupStatus>("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | FollowupPriority>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<Followup | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return followups.filter(f => {
      const matchSearch = !q || f.subject.toLowerCase().includes(q) || f.relatedTo.toLowerCase().includes(q) || f.company.toLowerCase().includes(q);
      const matchType = typeFilter === "All" || f.type === typeFilter;
      const matchStatus = statusFilter === "All" || f.status === statusFilter;
      const matchPriority = priorityFilter === "All" || f.priority === priorityFilter;
      const matchDateFrom = !dateFrom || f.dueDate >= dateFrom;
      const matchDateTo = !dateTo || f.dueDate <= dateTo;
      return matchSearch && matchType && matchStatus && matchPriority && matchDateFrom && matchDateTo;
    });
  }, [followups, search, typeFilter, statusFilter, priorityFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filtered, currentPage]);

  function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); }
  function confirmDelete() {
    if (!deleteModal) return;
    setFollowups(prev => prev.filter(f => f.id !== deleteModal.id));
    showToast(`"${deleteModal.subject}" deleted successfully.`);
    setDeleteModal(null);
  }

  // Stats
  const total = followups.length;
  const upcoming = followups.filter(f => f.status === "Upcoming").length;
  const completed = followups.filter(f => f.status === "Completed").length;
  const overdue = followups.filter(f => f.status === "Overdue").length;
  const conversionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Upcoming reminders (next 5)
  const reminders = followups.filter(f => f.status === "Upcoming").sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);

  const thStyle: React.CSSProperties = { padding: "10px 14px", textAlign: "left", fontSize: "0.72rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" };
  const tdStyle: React.CSSProperties = { padding: "12px 14px", fontSize: "0.8125rem", color: "#374151", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" };

  return (
    <DashboardLayout>
      <div className="page-wrapper">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Follow-ups</h1>
            <p className="page-subtitle">Manage and track all your follow-ups in one place.</p>
          </div>
          <button className="btn-add" onClick={() => router.push("/followups/new")}>
            <Plus size={16} /> Create Follow-up
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px" }}>
          {[
            { label: "Total Follow-ups", value: total, icon: <Calendar size={20} />, color: "#4f46e5", bg: "#eef2ff", sub: "All follow-ups" },
            { label: "Upcoming", value: upcoming, icon: <Clock size={20} />, color: "#d97706", bg: "#fef3c7", sub: "Next 7 days" },
            { label: "Completed", value: completed, icon: <CheckCircle size={20} />, color: "#16a34a", bg: "#dcfce7", sub: "This month" },
            { label: "Overdue", value: overdue, icon: <AlertCircle size={20} />, color: "#dc2626", bg: "#fef2f2", sub: "Requires attention" },
            { label: "Conversion Rate", value: `${conversionRate}%`, icon: <TrendingUp size={20} />, color: "#0891b2", bg: "#ecfeff", sub: "From follow-ups" },
          ].map(card => (
            <div key={card.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ width: 38, height: 38, borderRadius: "10px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color }}>
                  {card.icon}
                </div>
              </div>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500 }}>{card.label}</p>
              <p style={{ margin: "4px 0 2px", fontSize: "1.75rem", fontWeight: 700, color: card.color, lineHeight: 1.1 }}>{card.value}</p>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Main content + Right sidebar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px" }}>

          {/* Table Card */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>

            {/* Filters toolbar */}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <SearchBar value={search} onChange={v => { setSearch(v); setCurrentPage(1); }} placeholder="Search follow-ups..." resultCount={filtered.length} />
              </div>

              {/* Type */}
              <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value as "All" | FollowupType); setCurrentPage(1); }}
                style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "0.8125rem", fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
                <option value="All">All Types</option>
                {ALL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              {/* Status */}
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as "All" | FollowupStatus); setCurrentPage(1); }}
                style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "0.8125rem", fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
                <option value="All">All Status</option>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Priority */}
              <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value as "All" | FollowupPriority); setCurrentPage(1); }}
                style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "0.8125rem", fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
                <option value="All">All Priority</option>
                {ALL_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              {/* Date Range */}
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
                style={{ padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "0.8rem", fontFamily: "inherit", outline: "none" }} />
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
                style={{ padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "0.8rem", fontFamily: "inherit", outline: "none" }} />

              {/* Export */}
              <button style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "0.8125rem", fontFamily: "inherit", cursor: "pointer", fontWeight: 500 }}>
                <Download size={14} /> Export
              </button>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-state-title">No follow-ups found.</p>
                  <p className="empty-state-sub">Try adjusting your search or filters.</p>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "inherit" }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Subject</th>
                      <th style={thStyle}>Related To</th>
                      <th style={thStyle}>Type</th>
                      <th style={thStyle}>Due Date</th>
                      <th style={thStyle}>Priority</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Assigned To</th>
                      <th style={{ ...thStyle, textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((f, idx) => {
                      const isLast = idx === paginated.length - 1;
                      const rowTd = { ...tdStyle, borderBottom: isLast ? "none" : "1px solid #f1f5f9" };
                      return (
                        <tr key={f.id} onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#fafafa"} onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"} style={{ transition: "background 0.1s" }}>
                          <td style={rowTd}>
                            <p style={{ margin: 0, fontWeight: 600, color: "#0f172a", fontSize: "0.8125rem" }}>{f.subject}</p>
                            <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{f.notes}</p>
                          </td>
                          <td style={rowTd}>
                            <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.8125rem" }}>{f.relatedTo}</p>
                            <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{f.company}</p>
                          </td>
                          <td style={rowTd}><TypeIcon type={f.type} /></td>
                          <td style={rowTd}>
                            <p style={{ margin: 0, fontSize: "0.8125rem", color: "#374151" }}>{new Date(f.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                            <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{f.dueTime}</p>
                          </td>
                          <td style={rowTd}><PriorityBadge priority={f.priority} /></td>
                          <td style={rowTd}><StatusBadge status={f.status} /></td>
                          <td style={rowTd}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.65rem" }}>
                                {f.assignedInitials}
                              </div>
                              <span style={{ fontSize: "0.8rem", color: "#374151" }}>{f.assignedTo}</span>
                            </div>
                          </td>
                          <td style={{ ...rowTd, textAlign: "center" }}>
                            <div style={{ display: "inline-flex", gap: "4px" }}>
                              {[
                                { icon: <Eye size={13} />, color: "#4f46e5", hoverBg: "#eef2ff", action: () => router.push(`/followups/${f.id}`) },
                                { icon: <Pencil size={13} />, color: "#0891b2", hoverBg: "#ecfeff", action: () => router.push(`/followups/${f.id}/edit`) },
                                { icon: <Trash2 size={13} />, color: "#ef4444", hoverBg: "#fef2f2", action: () => setDeleteModal(f) },
                              ].map((btn, i) => (
                                <button key={i} onClick={btn.action} style={{ width: 28, height: 28, border: "1.5px solid #e2e8f0", borderRadius: "6px", background: "#fff", color: btn.color, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, transition: "all 0.1s" }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = btn.hoverBg; }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
                                >{btn.icon}</button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div style={{ padding: "10px 16px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                  Showing <strong>{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}</strong> to <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</strong> of <strong>{filtered.length}</strong> entries
                </p>
                <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Upcoming Reminders */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
                <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Upcoming Reminders</h3>
              </div>
              <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {reminders.map(r => {
                  const typeStyle = TYPE_COLORS[r.type];
                  return (
                    <div key={r.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "8px", background: typeStyle.bg, display: "flex", alignItems: "center", justifyContent: "center", color: typeStyle.color, flexShrink: 0 }}>
                        {r.type === "Call" ? <Phone size={14} /> : r.type === "Email" ? <Mail size={14} /> : r.type === "Meeting" ? <Users size={14} /> : <Calendar size={14} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.subject}</p>
                        <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.relatedTo} · {r.company}</p>
                        <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{new Date(r.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {r.dueTime}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: "10px 16px", borderTop: "1px solid #f1f5f9" }}>
                <button onClick={() => setStatusFilter("Upcoming")} style={{ width: "100%", padding: "8px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#4f46e5", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}>
                  View All Reminders →
                </button>
              </div>
            </div>

            {/* Follow-up Insights */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
                <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Follow-up Insights</h3>
              </div>
              <div style={{ padding: "16px" }}>
                {/* Donut chart visual */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <div style={{ position: "relative", width: 100, height: 100 }}>
                    <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3.8" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3.8"
                        strokeDasharray={`${(completed / total) * 100} ${100 - (completed / total) * 100}`} strokeLinecap="round" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3.8"
                        strokeDasharray={`${(upcoming / total) * 100} ${100 - (upcoming / total) * 100}`}
                        strokeDashoffset={`-${(completed / total) * 100}`} strokeLinecap="round" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ef4444" strokeWidth="3.8"
                        strokeDasharray={`${(overdue / total) * 100} ${100 - (overdue / total) * 100}`}
                        strokeDashoffset={`-${((completed + upcoming) / total) * 100}`} strokeLinecap="round" />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>{total}</p>
                      <p style={{ margin: 0, fontSize: "0.6rem", color: "#94a3b8" }}>Total</p>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { label: "Upcoming", value: upcoming, pct: Math.round((upcoming / total) * 100), color: "#3b82f6" },
                    { label: "Completed", value: completed, pct: Math.round((completed / total) * 100), color: "#22c55e" },
                    { label: "Overdue", value: overdue, pct: Math.round((overdue / total) * 100), color: "#ef4444" },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                        <span style={{ fontSize: "0.78rem", color: "#374151" }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>{item.value} ({item.pct}%)</span>
                    </div>
                  ))}
                </div>

                <button style={{ width: "100%", marginTop: "14px", padding: "8px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#4f46e5", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}>
                  View Full Report →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteModal(null); }}>
          <div className="modal-box">
            <div className="modal-icon"><Trash2 size={24} color="#ef4444" /></div>
            <h2 className="modal-title">Delete Follow-up</h2>
            <p className="modal-text">Are you sure you want to delete <strong style={{ color: "var(--foreground)" }}>{deleteModal.subject}</strong>? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
          {toastMsg}
        </div>
      )}
    </DashboardLayout>
  );
}
