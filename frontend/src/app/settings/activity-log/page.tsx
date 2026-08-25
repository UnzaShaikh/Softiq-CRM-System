"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ProfileNav } from "../page";
import Pagination from "@/components/customers/Pagination";
import ThemeLoader from "@/components/ui/ThemeLoader";
import {
  HiClipboardList, HiPencil, HiLockClosed, HiLogin, HiShieldExclamation,
  HiDownload, HiDotsVertical,
} from "react-icons/hi";
import { FiDownload } from "react-icons/fi";
import { apiRequest } from "@/lib/api";

// ---------- API types (match backend ActivityLogSerializer fields) ----------
interface Activity {
  id: number;
  activity_type: string;
  activity_type_display: string;
  description: string;
  ip_address: string;
  timestamp: string;
}

interface ActivityLogResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Activity[];
}

interface ByTypeCount {
  activity_type: string;
  count: number;
}

interface SummaryData {
  total: number;
  last_7_days: number;
  last_30_days: number;
  by_type: ByTypeCount[];
}

// ---------- Helpers ----------
const ACTIVITY_ICONS: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
  login:                    { icon: <HiLogin size={15} />,              bg: "#dcfce7", color: "#16a34a" },
  logout:                   { icon: <HiLogin size={15} />,              bg: "#dcfce7", color: "#64748b" },
  profile_update:           { icon: <HiPencil size={15} />,             bg: "#eef2ff", color: "#4f46e5" },
  password_change:          { icon: <HiLockClosed size={15} />,         bg: "#ecfeff", color: "#0891b2" },
  preferences_update:       { icon: <HiPencil size={15} />,             bg: "#eef2ff", color: "#4f46e5" },
  notification_update:      { icon: <HiShieldExclamation size={15} />,  bg: "#fef3c7", color: "#d97706" },
  record_created:           { icon: <HiClipboardList size={15} />,      bg: "#dcfce7", color: "#16a34a" },
  record_updated:           { icon: <HiPencil size={15} />,             bg: "#eef2ff", color: "#4f46e5" },
  record_deleted:           { icon: <HiLockClosed size={15} />,         bg: "#fef2f2", color: "#ef4444" },
};
const DEFAULT_ICON = { icon: <HiClipboardList size={15} />, bg: "#f1f5f9", color: "#64748b" };

function getIconAndColors(activityType: string) {
  return ACTIVITY_ICONS[activityType] || DEFAULT_ICON;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function countType(byType: ByTypeCount[], key: string) {
  return byType.find((b) => b.activity_type === key)?.count ?? 0;
}

// ---------- Component ----------
export default function ActivityLogPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const [summary, setSummary] = useState<SummaryData>({ total: 0, last_7_days: 0, last_30_days: 0, by_type: [] });
  const ITEMS_PER_PAGE = 7;
  const abortControllerRef = useRef<AbortController | null>(null);

  // ---------- Fetch activities ----------
  const fetchActivities = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (typeFilter !== "all") params.append("activity_type", typeFilter);
    if (dateFrom) params.append("start_date", dateFrom);
    if (dateTo) params.append("end_date", dateTo);
    params.append("page", String(currentPage));
    params.append("page_size", String(ITEMS_PER_PAGE));

    try {
      const data = await apiRequest<ActivityLogResponse>(
        `/api/profile/activity/?${params.toString()}`,
        { signal }
      );
      setActivities(data.results);
      setTotalItems(data.count);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError(err.message || "Failed to load activity log.");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, dateFrom, dateTo, currentPage]);

  // ---------- Fetch summary ----------
  const fetchSummary = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await apiRequest<SummaryData>(
        `/api/profile/activity/summary/`,
        { signal }
      );
      setSummary(data);
    } catch { /* summary is non-critical */ }
  }, []);

  // ---------- Fetch on dependency change ----------
  useEffect(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    fetchActivities(controller.signal);
    fetchSummary(controller.signal);
    return () => controller.abort();
  }, [fetchActivities, fetchSummary]);

  // ---------- Handlers that reset page ----------
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
    setCurrentPage(1);
  };
  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFrom(e.target.value);
    setCurrentPage(1);
  };
  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateTo(e.target.value);
    setCurrentPage(1);
  };

  // ---------- Export (authenticated blob download) ----------
  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (typeFilter !== "all") params.append("activity_type", typeFilter);
      if (dateFrom) params.append("start_date", dateFrom);
      if (dateTo) params.append("end_date", dateTo);

      const { getAccessToken } = await import("@/lib/api");
      const token = getAccessToken();
      const res = await fetch(`/api/profile/activity/export/?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "activity_log.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Export failed");
    }
  };

  // ---------- Derived summary values ----------
  const updatesCount =
    countType(summary.by_type, "record_updated") +
    countType(summary.by_type, "profile_update") +
    countType(summary.by_type, "preferences_update") +
    countType(summary.by_type, "notification_update");
  const loginsCount = countType(summary.by_type, "login") + countType(summary.by_type, "logout");
  const securityCount = countType(summary.by_type, "password_change");

  const SUMMARY_CARDS = [
    { label: "Total Activities",  value: summary.total,       icon: <HiClipboardList size={20} />,  color: "#4f46e5", bg: "#eef2ff" },
    { label: "Updates Made",      value: updatesCount,        icon: <HiPencil size={20} />,         color: "#16a34a", bg: "#dcfce7" },
    { label: "Logins",            value: loginsCount,         icon: <HiLogin size={20} />,          color: "#d97706", bg: "#fef3c7" },
    { label: "Security Events",   value: securityCount,       icon: <HiShieldExclamation size={20} />, color: "#ef4444", bg: "#fef2f2" },
  ];

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // ---------- Render ----------
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
            {loading ? (
              <ThemeLoader label="Loading activity log..." minHeight={360} />
            ) : (
              <>
                {error && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "10px 16px", margin: "16px 18px 0", fontSize: "0.8125rem", color: "#b91c1c", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>⚠ {error}</span>
                    <button onClick={() => { setError(null); setLoading(true); fetchActivities(); }} style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontWeight: 600, textDecoration: "underline", fontFamily: "inherit", fontSize: "0.8125rem" }}>
                      Retry
                    </button>
                  </div>
                )}

                {/* Toolbar */}
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "0.8125rem", color: "#374151", cursor: "pointer" }}>
                    <HiClipboardList size={14} color="#4f46e5" />
                    <input type="date" value={dateFrom} onChange={handleDateFromChange}
                      style={{ border: "none", outline: "none", fontSize: "0.8125rem", fontFamily: "inherit", color: "#374151", background: "transparent" }} />
                    <span>-</span>
                    <input type="date" value={dateTo} onChange={handleDateToChange}
                      style={{ border: "none", outline: "none", fontSize: "0.8125rem", fontFamily: "inherit", color: "#374151", background: "transparent" }} />
                  </div>

                  <select value={typeFilter} onChange={handleTypeChange}
                    style={{ padding: "7px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "0.8125rem", fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
                    <option value="all">All Activities</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="profile_update">Profile Update</option>
                    <option value="password_change">Password Change</option>
                    <option value="record_created">Record Created</option>
                    <option value="record_updated">Record Updated</option>
                    <option value="record_deleted">Record Deleted</option>
                  </select>

                  <div style={{ flex: 1, position: "relative", minWidth: "180px" }}>
                    <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input type="text" value={search} onChange={handleSearchChange}
                      placeholder="Search activities..."
                      style={{ width: "100%", padding: "7px 10px 7px 30px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", fontSize: "0.8125rem", fontFamily: "inherit", outline: "none" }} />
                  </div>

                  <button onClick={handleExport} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "0.8125rem", fontFamily: "inherit", cursor: "pointer", fontWeight: 500 }}>
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
                    {activities.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>No activities found.</td></tr>
                    ) : activities.map((a, idx) => {
                      const { icon, bg, color } = getIconAndColors(a.activity_type);
                      return (
                        <tr key={a.id} style={{ borderBottom: idx === activities.length - 1 ? "none" : "1px solid #f1f5f9", transition: "background 0.1s" }}
                          onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#fafafa"}
                          onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{ width: 30, height: 30, borderRadius: "8px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
                                {icon}
                              </div>
                              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>{a.activity_type_display}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: "0.8125rem", color: "#64748b" }}>{a.description}</td>
                          <td style={{ padding: "12px 16px", fontSize: "0.8125rem", color: "#64748b", fontFamily: "monospace" }}>{a.ip_address}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <p style={{ margin: 0, fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>{formatDate(a.timestamp)}</p>
                            <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{formatTime(a.timestamp)}</p>
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
                                  <button onClick={() => { setOpenMenu(null); handleExport(); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", border: "none", background: "transparent", cursor: "pointer", fontSize: "0.875rem", color: "#374151", fontFamily: "inherit" }}
                                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"}
                                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}>
                                    <HiDownload size={14} color="#4f46e5" /> Export
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalItems > 0 && (
                  <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b" }}>
                      Showing <strong>{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</strong> of <strong>{totalItems}</strong> activities
                    </p>
                    <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
