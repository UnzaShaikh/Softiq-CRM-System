"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ProfileNav } from "../page";
import Pagination from "@/components/customers/Pagination";
import {
  HiClipboardList, HiPencil, HiLockClosed, HiLogin, HiShieldExclamation,
  HiMail, HiTrash, HiCog, HiDownload, HiDotsVertical,
} from "react-icons/hi";
import { FiDownload } from "react-icons/fi";
import { apiRequest } from "@/lib/api"; // needed for API calls

// ---------- API types ----------
interface Activity {
  id: number;
  type: string;          // "Login", "Update", "Security", etc.
  activity: string;      // display name
  details: string;
  ip: string;
  date: string;          // ISO date string or formatted
  time: string;          // time string
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
}

interface ActivityLogResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Activity[];
}

interface SummaryData {
  total_activities: number;
  updates: number;
  logins: number;
  security_events: number;
}

// ---------- Helpers ----------
function getIconAndColors(type: string) {
  const map: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
    Login: {
      icon: <HiLogin size={15} />,
      bg: "#dcfce7",
      color: "#16a34a",
    },
    Update: {
      icon: <HiPencil size={15} />,
      bg: "#eef2ff",
      color: "#4f46e5",
    },
    Security: {
      icon: <HiLockClosed size={15} />,
      bg: "#ecfeff",
      color: "#0891b2",
    },
    // fallback
    default: {
      icon: <HiClipboardList size={15} />,
      bg: "#f1f5f9",
      color: "#64748b",
    },
  };
  return map[type] || map.default;
}

// Format date like "May 30, 2024"
function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// ---------- Page Component ----------
export default function ActivityLogPage() {
  // ---------- State ----------
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Activities");
  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] // 30 days ago
  );
  const [dateTo, setDateTo] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  // Summary stats
  const [summary, setSummary] = useState<SummaryData>({
    total_activities: 0,
    updates: 0,
    logins: 0,
    security_events: 0,
  });

  const ITEMS_PER_PAGE = 7;
  const abortControllerRef = useRef<AbortController | null>(null);

  // ---------- Fetch activities ----------
  const fetchActivities = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (typeFilter !== "All Activities") params.append("activity_type", typeFilter);
    if (dateFrom) params.append("start_date", dateFrom);
    if (dateTo) params.append("end_date", dateTo);
    params.append("page", String(currentPage));
    params.append("page_size", String(ITEMS_PER_PAGE));

    try {
      const data = await apiRequest<ActivityLogResponse>(
        `/api/profile/activity-log/?${params.toString()}`,
        { signal }
      );

      // Map API fields to UI fields (add icon, formatted date/time)
      const mapped = data.results.map((item) => {
        const { icon, bg, color } = getIconAndColors(item.type);
        return {
          ...item,
          icon,
          iconBg: bg,
          iconColor: color,
          date: formatDate(item.date),
          time: formatTime(item.time),
        };
      });

      setActivities(mapped);
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
        `/api/profile/activity-log/summary/`,
        { signal }
      );
      setSummary(data);
    } catch (err) {
      // Ignore errors – summary is non‑critical
    }
  }, []);

  // ---------- Fetch on dependency change ----------
  useEffect(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetchActivities(controller.signal);
    fetchSummary(controller.signal);

    return () => {
      controller.abort();
    };
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

  // ---------- Export ----------
  const handleExport = () => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (typeFilter !== "All Activities") params.append("activity_type", typeFilter);
    if (dateFrom) params.append("start_date", dateFrom);
    if (dateTo) params.append("end_date", dateTo);
    // For export we don't need pagination – get all records
    const url = `/api/profile/activity-log/export/?${params.toString()}`;
    window.open(url, "_blank");
  };

  // ---------- Compute pagination ----------
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // ---------- Summary cards (use real data) ----------
  const SUMMARY_CARDS = [
    {
      label: "Total Activities",
      value: summary.total_activities,
      icon: <HiClipboardList size={20} />,
      color: "#4f46e5",
      bg: "#eef2ff",
    },
    {
      label: "Updates Made",
      value: summary.updates,
      icon: <HiPencil size={20} />,
      color: "#16a34a",
      bg: "#dcfce7",
    },
    {
      label: "Logins",
      value: summary.logins,
      icon: <HiLogin size={20} />,
      color: "#d97706",
      bg: "#fef3c7",
    },
    {
      label: "Security Events",
      value: summary.security_events,
      icon: <HiShieldExclamation size={20} />,
      color: "#ef4444",
      bg: "#fef2f2",
    },
  ];

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

            {/* Toolbar */}
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              {/* Date range */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "0.8125rem", color: "#374151", cursor: "pointer" }}>
                <HiClipboardList size={14} color="#4f46e5" />
                <input type="date" value={dateFrom} onChange={handleDateFromChange}
                  style={{ border: "none", outline: "none", fontSize: "0.8125rem", fontFamily: "inherit", color: "#374151", background: "transparent" }} />
                <span>-</span>
                <input type="date" value={dateTo} onChange={handleDateToChange}
                  style={{ border: "none", outline: "none", fontSize: "0.8125rem", fontFamily: "inherit", color: "#374151", background: "transparent" }} />
              </div>

              {/* Type filter */}
              <select value={typeFilter} onChange={handleTypeChange}
                style={{ padding: "7px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "0.8125rem", fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
                <option>All Activities</option>
                <option value="Login">Login</option>
                <option value="Update">Update</option>
                <option value="Security">Security</option>
              </select>

              {/* Search */}
              <div style={{ flex: 1, position: "relative", minWidth: "180px" }}>
                <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input type="text" value={search} onChange={handleSearchChange}
                  placeholder="Search activities..."
                  style={{ width: "100%", padding: "7px 10px 7px 30px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", fontSize: "0.8125rem", fontFamily: "inherit", outline: "none" }} />
              </div>

              {/* Export */}
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
                {loading && (
                  <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>Loading activities…</td></tr>
                )}
                {!loading && error && (
                  <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#ef4444", fontSize: "0.875rem" }}>Error: {error}</td></tr>
                )}
                {!loading && !error && activities.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>No activities found.</td></tr>
                )}
                {!loading && !error && activities.map((a, idx) => (
                  <tr key={a.id} style={{ borderBottom: idx === activities.length - 1 ? "none" : "1px solid #f1f5f9", transition: "background 0.1s" }}
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
                ))}
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}