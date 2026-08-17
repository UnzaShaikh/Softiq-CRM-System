"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SettingsNav from "@/components/project-settings/SettingsNav";
import Pagination from "@/components/customers/Pagination";
import Link from "next/link";
import {
  HiChevronRight, HiClipboardList, HiPencil, HiLogin,
  HiLockClosed, HiShieldExclamation, HiCog, HiTrash,
  HiDownload, HiDotsVertical, HiUserAdd, HiMail,
} from "react-icons/hi";
import { FiDownload } from "react-icons/fi";

const ALL_LOGS = [
  { id: 1,  type: "Login",    icon: <HiLogin size={14} />,           bg: "#dcfce7", color: "#16a34a", user: "Test User",    action: "User Login",              details: "Logged in from Chrome on Windows",    ip: "192.168.1.45", date: "Aug 15, 2026", time: "11:45 AM" },
  { id: 2,  type: "Update",   icon: <HiPencil size={14} />,          bg: "#eef2ff", color: "#4f46e5", user: "Sara Khan",    action: "Customer Updated",          details: "Updated customer: Ahmed Ali",          ip: "192.168.1.22", date: "Aug 15, 2026", time: "10:20 AM" },
  { id: 3,  type: "Security", icon: <HiLockClosed size={14} />,      bg: "#ecfeff", color: "#0891b2", user: "Test User",    action: "Password Changed",          details: "Password updated successfully",        ip: "192.168.1.45", date: "Aug 14, 2026", time: "09:15 AM" },
  { id: 4,  type: "Update",   icon: <HiCog size={14} />,             bg: "#fef3c7", color: "#b45309", user: "Test User",    action: "Settings Updated",          details: "Updated project general settings",     ip: "192.168.1.45", date: "Aug 14, 2026", time: "08:30 AM" },
  { id: 5,  type: "Create",   icon: <HiUserAdd size={14} />,         bg: "#dcfce7", color: "#16a34a", user: "Abdullah",     action: "User Created",              details: "Created new user: Unza Ahmad",         ip: "192.168.1.30", date: "Aug 13, 2026", time: "03:15 PM" },
  { id: 6,  type: "Delete",   icon: <HiTrash size={14} />,           bg: "#fef2f2", color: "#ef4444", user: "Sara Khan",    action: "Lead Deleted",              details: "Deleted lead: ABC Corporation",        ip: "192.168.1.22", date: "Aug 13, 2026", time: "02:10 PM" },
  { id: 7,  type: "Security", icon: <HiShieldExclamation size={14} />, bg: "#fef2f2", color: "#ef4444", user: "Unknown",  action: "Failed Login Attempt",      details: "3 failed login attempts",              ip: "203.0.113.42", date: "Aug 13, 2026", time: "01:05 PM" },
  { id: 8,  type: "Create",   icon: <HiMail size={14} />,            bg: "#eef2ff", color: "#4f46e5", user: "Junaid",      action: "Email Template Created",    details: "Created: Welcome Email Template",      ip: "192.168.1.55", date: "Aug 12, 2026", time: "11:30 AM" },
  { id: 9,  type: "Login",    icon: <HiLogin size={14} />,           bg: "#dcfce7", color: "#16a34a", user: "Enzela",      action: "User Login",                details: "Logged in from Safari on iPhone",      ip: "192.168.3.55", date: "Aug 12, 2026", time: "09:00 AM" },
  { id: 10, type: "Update",   icon: <HiPencil size={14} />,          bg: "#eef2ff", color: "#4f46e5", user: "Test User",    action: "Company Info Updated",      details: "Updated company information",          ip: "192.168.1.45", date: "Aug 11, 2026", time: "04:45 PM" },
  { id: 11, type: "Delete",   icon: <HiTrash size={14} />,           bg: "#fef2f2", color: "#ef4444", user: "Abdullah",    action: "Task Deleted",              details: "Deleted task: Fix Export Issue",       ip: "192.168.1.30", date: "Aug 11, 2026", time: "03:20 PM" },
  { id: 12, type: "Create",   icon: <HiUserAdd size={14} />,         bg: "#dcfce7", color: "#16a34a", user: "Test User",    action: "Deal Created",              details: "Created new deal: Beta Ltd Contract",  ip: "192.168.1.45", date: "Aug 10, 2026", time: "02:00 PM" },
];

const ITEMS_PER_PAGE = 8;
const ALL_TYPES = ["All", "Login", "Create", "Update", "Delete", "Security"];

const SUMMARY = [
  { label: "Total Events",    value: ALL_LOGS.length, icon: <HiClipboardList size={18} />, color: "#4f46e5", bg: "#eef2ff" },
  { label: "Updates",         value: ALL_LOGS.filter(l => l.type === "Update").length,   icon: <HiPencil size={18} />,    color: "#15803d", bg: "#dcfce7" },
  { label: "Logins",          value: ALL_LOGS.filter(l => l.type === "Login").length,    icon: <HiLogin size={18} />,     color: "#d97706", bg: "#fef3c7" },
  { label: "Security Events", value: ALL_LOGS.filter(l => l.type === "Security").length, icon: <HiShieldExclamation size={18} />, color: "#dc2626", bg: "#fef2f2" },
];

export default function ProjectActivityLogPage() {
  const [search,      setSearch]      = useState("");
  const [typeFilter,  setTypeFilter]  = useState("All");
  const [dateFrom,    setDateFrom]    = useState("");
  const [dateTo,      setDateTo]      = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu,    setOpenMenu]    = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ALL_LOGS.filter(l => {
      const matchSearch = !q || l.action.toLowerCase().includes(q) || l.user.toLowerCase().includes(q) || l.details.toLowerCase().includes(q);
      const matchType   = typeFilter === "All" || l.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [search, typeFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = useMemo(() => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filtered, currentPage]);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: "0.8125rem", color: "#94a3b8" }}>
          <Link href="/settings/project" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}>Project Settings</Link>
          <HiChevronRight size={14} />
          <span style={{ color: "#374151" }}>Activity Log</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Activity Log</h1>
            <p className="page-subtitle">Track all system-wide activity, changes, and security events.</p>
          </div>
          <button className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <FiDownload size={14} /> Export Log
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SettingsNav />

            {/* Summary */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Activity Summary</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {SUMMARY.map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>{s.icon}</div>
                    <div>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{s.label}</p>
                      <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: s.color }}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Log Table */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>

            {/* Toolbar */}
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, background: "#fff" }}>
                <HiClipboardList size={14} color="#4f46e5" />
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: "0.8rem", fontFamily: "inherit", color: "#374151", background: "transparent" }} />
                <span style={{ color: "#94a3b8" }}>—</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: "0.8rem", fontFamily: "inherit", color: "#374151", background: "transparent" }} />
              </div>
              <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                style={{ padding: "7px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#374151", fontSize: "0.8125rem", fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
                {ALL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <div style={{ flex: 1, position: "relative", minWidth: 160 }}>
                <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input type="text" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Search activity…"
                  style={{ width: "100%", padding: "7px 10px 7px 30px", border: "1.5px solid #e2e8f0", borderRadius: 8, background: "#f8fafc", fontSize: "0.8125rem", fontFamily: "inherit", outline: "none" }} />
              </div>
              <button className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 38 }}>
                <FiDownload size={13} /> Export
              </button>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["User", "Action", "Details", "IP Address", "Date & Time", ""].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>No activity found.</td></tr>
                ) : paginated.map((log, idx) => (
                  <tr key={log.id}
                    style={{ borderBottom: idx === paginated.length - 1 ? "none" : "1px solid #f1f5f9", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#fafafa"}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.65rem", flexShrink: 0 }}>
                          {log.user.substring(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#0f172a" }}>{log.user}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: log.bg, display: "flex", alignItems: "center", justifyContent: "center", color: log.color, flexShrink: 0 }}>{log.icon}</div>
                        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#0f172a" }}>{log.action}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.8rem", color: "#64748b", maxWidth: 200 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{log.details}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.8rem", color: "#64748b", fontFamily: "monospace" }}>{log.ip}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ margin: 0, fontSize: "0.8125rem", color: "#374151", fontWeight: 500 }}>{log.date}</p>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{log.time}</p>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ position: "relative" }}>
                        <button onClick={() => setOpenMenu(openMenu === log.id ? null : log.id)}
                          style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", borderRadius: 6 }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#f1f5f9"}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "none"}>
                          <HiDotsVertical size={16} />
                        </button>
                        {openMenu === log.id && (
                          <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 100, minWidth: 120 }}>
                            <button onClick={() => setOpenMenu(null)}
                              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", border: "none", background: "transparent", cursor: "pointer", fontSize: "0.875rem", color: "#374151", fontFamily: "inherit" }}
                              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"}
                              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}>
                              <HiDownload size={14} color="#4f46e5" /> Export
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length > 0 && (
              <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b" }}>
                  Showing <strong>{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}</strong>–<strong>{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</strong> of <strong>{filtered.length}</strong> entries
                </p>
                <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
