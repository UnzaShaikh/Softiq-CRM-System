"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Customers",
    href: "/customers",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    label: "Leads",
    href: "/leads",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    label: "Deals",
    href: "/deals",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    badge: 12,
  },
  {
    label: "Sales Pipeline",
    href: "/Sales-Pipeline",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
      </svg>
    ),
  },
  {
    label: "Reports",
    href: "/reports",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    badge: 5,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    badge: 3,
  },
];

const BOTTOM_ITEMS = [
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Route change hone par mobile sidebar apne aap band ho jaye
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ""}`.toUpperCase()
    : "?";

  const avatarColors: [string, string][] = [
    ["#4f46e5", "#7c3aed"],
    ["#0891b2", "#0e7490"],
    ["#059669", "#047857"],
    ["#d97706", "#b45309"],
  ];
  const ci = user
    ? (user.firstName.charCodeAt(0) + (user.lastName?.charCodeAt(0) || 0)) %
      avatarColors.length
    : 0;
  const [c1, c2] = avatarColors[ci];

  const sidebarW = collapsed ? 72 : 240;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif" }}>

      {/* ── Mobile overlay (sidebar band karne ke liye click) ── */}
      <div
        className={`sidebar-overlay ${isMobileOpen ? "active" : ""}`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside
        className={`dashboard-sidebar ${collapsed ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`}
        style={{
          width: sidebarW,
          minWidth: sidebarW,
        }}
      >

        {/* Logo */}
        <div style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "0 18px" : "0 20px",
          borderBottom: "1px solid #f1f5f9",
          justifyContent: collapsed ? "center" : "space-between",
          flexShrink: 0,
        }}>
          {!collapsed && (
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, boxShadow: "0 4px 10px rgba(79,70,229,0.3)",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem", color: "#0f172a", lineHeight: 1.2, letterSpacing: "-0.02em" }}>Softiq CRM</p>
                <p style={{ margin: 0, fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500 }}>Business Suite</p>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 10px rgba(79,70,229,0.3)",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
            </Link>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 4, color: "#94a3b8", borderRadius: 6,
                display: "flex", alignItems: "center", transition: "color 0.15s, background 0.15s",
              }}
              title="Collapse sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              style={{
                position: "absolute", right: -12, top: 20,
                background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: "50%", width: 24, height: 24,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                color: "#64748b", transition: "color 0.15s",
              }}
              title="Expand sidebar"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>

        {/* Main Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {!collapsed && (
            <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 10px 8px" }}>
              Main Menu
            </p>
          )}
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: collapsed ? 0 : 10,
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "10px 0" : "9px 10px",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: active ? "#4f46e5" : "#475569",
                  background: active ? "#eef2ff" : "transparent",
                  fontWeight: active ? 600 : 500,
                  fontSize: "0.875rem",
                  transition: "background 0.15s ease, color 0.15s ease",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#f8fafc";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#0f172a";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#475569";
                  }
                }}
              >
                <span style={{ flexShrink: 0, opacity: active ? 1 : 0.75 }}>{item.icon}</span>
                {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span style={{
                    background: active ? "#4f46e5" : "#e2e8f0",
                    color: active ? "#fff" : "#64748b",
                    borderRadius: 9999, fontSize: "0.7rem", fontWeight: 700,
                    padding: "1px 7px", lineHeight: "1.6",
                  }}>
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge && (
                  <span style={{
                    position: "absolute", top: 4, right: 8,
                    background: "#4f46e5", color: "#fff",
                    borderRadius: 9999, fontSize: "0.6rem", fontWeight: 700,
                    padding: "0px 4px", lineHeight: "1.6",
                  }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Nav */}
        <div style={{ padding: "10px 10px", borderTop: "1px solid #f1f5f9" }}>
          {BOTTOM_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                style={{
                  display: "flex", alignItems: "center",
                  gap: collapsed ? 0 : 10,
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "10px 0" : "9px 10px",
                  borderRadius: 8, textDecoration: "none",
                  color: active ? "#4f46e5" : "#475569",
                  background: active ? "#eef2ff" : "transparent",
                  fontWeight: 500, fontSize: "0.875rem",
                  transition: "background 0.15s ease, color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#f8fafc";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#0f172a";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#475569";
                  }
                }}
              >
                <span style={{ flexShrink: 0, opacity: active ? 1 : 0.75 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* User avatar row */}
          <div style={{
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "8px 0" : "8px 10px",
            borderRadius: 10,
            background: "#f8fafc",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: "0.75rem", userSelect: "none",
            }}>
              {initials}
            </div>
            {!collapsed && (
              <div style={{ flex: 1, overflow: "hidden" }}>
                <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user ? `${user.firstName} ${user.lastName}`.trim() : "Guest"}
                </p>
                <p style={{ margin: 0, fontSize: "0.7rem", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.email ?? ""}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                title="Sign out"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#94a3b8", padding: 4, borderRadius: 6,
                  display: "flex", alignItems: "center",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#ef4444")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#94a3b8")}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <header
          className="dashboard-header"
          style={{
            height: 64,
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 30,
            flexShrink: 0,
            gap: 12,
          }}
        >
          {/* Hamburger — sirf mobile pe dikhega */}
          <button
            className="mobile-menu-button"
            onClick={() => setIsMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: 340, flex: 1 }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search customers, deals…"
              style={{
                width: "100%", padding: "8px 12px 8px 36px",
                border: "1.5px solid #e2e8f0", borderRadius: 8,
                background: "#f8fafc", color: "#0f172a", fontSize: "0.875rem",
                fontFamily: "inherit", outline: "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#4f46e5";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.12)";
                e.currentTarget.style.background = "#fff";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "#f8fafc";
              }}
            />
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Notification bell */}
            <button style={{
              position: "relative", background: "none", border: "1.5px solid #e2e8f0",
              borderRadius: 8, width: 38, height: 38, display: "flex",
              alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#64748b",
              transition: "border-color 0.15s, background 0.15s",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#c7d2fe";
                (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
                (e.currentTarget as HTMLButtonElement).style.background = "none";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span style={{
                position: "absolute", top: 6, right: 6,
                width: 8, height: 8, borderRadius: "50%",
                background: "#ef4444", border: "2px solid #fff",
              }} />
            </button>

            {/* Add new */}
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 8,
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color: "#fff", fontWeight: 600, fontSize: "0.8125rem",
              border: "none", cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 2px 8px rgba(79,70,229,0.35)",
              transition: "opacity 0.15s, box-shadow 0.15s",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(79,70,229,0.45)";
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.92";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(79,70,229,0.35)";
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Record
            </button>
          </div>
        </header>

        {/* Page content */}
        <main
          className="dashboard-main"
          style={{
            flex: 1,
            padding: "28px 28px",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}