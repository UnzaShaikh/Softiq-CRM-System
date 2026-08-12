"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ProfileNav } from "../page";
import Pagination from "@/components/customers/Pagination";
import {
  HiClipboardList, HiPencil, HiLockClosed, HiLogin, HiShieldExclamation,
  HiMail, HiTrash, HiCog, HiDownload, HiDotsVertical,
} from "react-icons/hi";
import { FiDownload } from "react-icons/fi";

const ACTIVITIES = [
  { id: 1, type: "Login", icon: <HiLogin size={15} />, iconBg: "#dcfce7", iconColor: "#16a34a", activity: "User Login", details: "Logged in successfully", ip: "192.168.1.45", date: "May 30, 2024", time: "11:45 AM" },
  { id: 2, type: "Update", icon: <HiPencil size={15} />, iconBg: "#eef2ff", iconColor: "#4f46e5", activity: "Profile Updated", details: "Updated profile information", ip: "192.168.1.45", date: "May 29, 2024", time: "03:22 PM" },
  { id: 3, type: "Security", icon: <HiLockClosed size={15} />, iconBg: "#ecfeff", iconColor: "#0891b2", activity: "Password Changed", details: "Password was changed successfully", ip: "192.168.1.45", date: "May 28, 2024", time: "09:15 AM" },
  { id: 4, type: "Update", icon: <HiCog size={15} />, iconBg: "#fef3c7", iconColor: "#b45309", activity: "Preferences Updated", details: "Updated application preferences", ip: "192.168.1.45", date: "May 27, 2024", time: "04:10 PM" },
  { id: 5, type: "Update", icon: <HiMail size={15} />, iconBg: "#eef2ff", iconColor: "#4f46e5", activity: "Email Template Created", details: "Created new email template: Follow up", ip: "192.168.1.45", date: "May 26, 2024", time: "02:47 PM" },
  { id: 6, type: "Update", icon: <HiTrash size={15} />, iconBg: "#fef2f2", iconColor: "#ef4444", activity: "Note Deleted", details: "Deleted note: Meeting Notes", ip: "192.168.1.45", date: "May 25, 2024", time: "01:30 PM" },
  { id: 7, type: "Security", icon: <HiShieldExclamation size={15} />, iconBg: "#fef2f2", iconColor: "#ef4444", activity: "Failed Login Attempt", details: "Failed login attempt", ip: "192.168.1.90", date: "May 25, 2024", time: "11:05 AM" },
  { id: 8, type: "Login", icon: <HiLogin size={15} />, iconBg: "#dcfce7", iconColor: "#16a34a", activity: "User Login", details: "Logged in successfully", ip: "192.168.1.45", date: "May 24, 2024", time: "09:30 AM" },
  { id: 9, type: "Update", icon: <HiPencil size={15} />, iconBg: "#eef2ff", iconColor: "#4f46e5", activity: "Customer Updated", details: "Updated customer: Ahmed Ali", ip: "192.168.1.45", date: "May 23, 2024", time: "02:15 PM" },
  { id: 10, type: "Security", icon: <HiLockClosed size={15} />, iconBg: "#ecfeff", iconColor: "#0891b2", activity: "2FA Enabled", details: "Two-factor authentication enabled", ip: "192.168.1.45", date: "May 22, 2024", time: "10:00 AM" },
];

const ITEMS_PER_PAGE = 7;

const SUMMARY_CARDS = [
  { label: "Total Activities", value: 124, icon: <HiClipboardList size={20} />, color: "#4f46e5", bg: "#eef2ff" },
  { label: "Updates Made", value: 68, icon: <HiPencil size={20} />, color: "#16a34a", bg: "#dcfce7" },
  { label: "Logins", value: 42, icon: <HiLogin size={20} />, color: "#d97706", bg: "#fef3c7" },
  { label: "Security Events", value: 14, icon: <HiShieldExclamation size={20} />, color: "#ef4444", bg: "#fef2f2" },
];

export default function ActivityLogPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Activities");
  const [dateFrom, setDateFrom] = useState("2024-05-01");
  const [dateTo, setDateTo] = useState("2024-05-30");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ACTIVITIES.filter(a => {
      const matchSearch = !q || a.activity.toLowerCase().includes(q) || a.details.toLowerCase().includes(q);
      const matchType = typeFilter === "All Activities" || a.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [search, typeFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filtered, currentPage]);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 className="page-title">Activity Log</h1>
          <p className="page-subtitle">Track your account activity and changes</p>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", fontSize: "0.8125rem", color: "#94a3b8" }}>
            <a href="/settings" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}>My Profile</a>
            <span>›</span><span>Activity Log</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "20px", alignItems: "start" }}>

          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <ProfileNav active="activity" />

            {/* Activity Summary */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Activity Summary</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {SUMMARY_CARDS.map(card => (
                  <div key={card.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "8px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color, flexShrink: 0 }}>
                      {card.icon}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500 }}>{card.label}</p>
                      <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: card.color, lineHeight: 1.2 }}>{card.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Activity table */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>

            {/* Toolbar */}
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              {/* Date range */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "0.8125rem", color: "#374151", cursor: "pointer" }}>
                <HiClipboardList size={14} color="#4f46e5" />
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: "0.8125rem", fontFamily: "inherit", color: "#374151", background: "transparent" }} />
                <span>-</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: "0.8125rem", fontFamily: "inherit", color: "#374151", background: "transparent" }} />
              </div>

              {/* Type filter */}
              <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                style={{ padding: "7px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "0.8125rem", fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
                <option>All Activities</option>
                <option value="Login">Login</option>
                <option value="Update">Update</option>
                <option value="Security">Security</option>
              </select>

              {/* Search */}
              <div style={{ flex: 1, position: "relative", minWidth: "180px" }}>
                <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input type="text" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Search activities..."
                  style={{ width: "100%", padding: "7px 10px 7px 30px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", fontSize: "0.8125rem", fontFamily: "inherit", outline: "none" }} />
              </div>

              {/* Export */}
              <button style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "0.8125rem", fontFamily: "inherit", cursor: "pointer", fontWeight: 500 }}>
                <FiDownload size={13} /> Export
              </button>
            </div>

            {/* Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "inherit" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["ACTIVITY", "DETAILS", "IP ADDRESS", "DATE & TIME", ""].map((h, i) => (
                    <th key={i} style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>No activities found.</td></tr>
                ) : paginated.map((a, idx) => (
                  <tr key={a.id} style={{ borderBottom: idx === paginated.length - 1 ? "none" : "1px solid #f1f5f9", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#fafafa"}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: 30, height: 30, borderRadius: "8px", background: a.iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: a.iconColor, flexShrink: 0 }}>
                          {a.icon}
                        </div>
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>{a.activity}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.8125rem", color: "#64748b" }}>{a.details}</td>
                    <td style={{ padding: "12px 16px", fontSize: "0.8125rem", color: "#64748b", fontFamily: "monospace" }}>{a.ip}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>{a.date}</p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{a.time}</p>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ position: "relative" }}>
                        <button onClick={() => setOpenMenu(openMenu === a.id ? null : a.id)}
                          style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", borderRadius: "6px" }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#f1f5f9"}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "none"}>
                          <HiDotsVertical size={16} />
                        </button>
                        {openMenu === a.id && (
                          <div style={{ position: "absolute", right: 0, top: "100%", marginTop: "4px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 100, minWidth: "130px" }}>
                            <button onClick={() => setOpenMenu(null)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", border: "none", background: "transparent", cursor: "pointer", fontSize: "0.875rem", color: "#374151", fontFamily: "inherit" }}
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

            {/* Pagination */}
            {filtered.length > 0 && (
              <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b" }}>
                  Showing <strong>1 to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</strong> of <strong>{filtered.length}</strong> activities
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
