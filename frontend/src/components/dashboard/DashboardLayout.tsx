"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Settings, LogOut, ChevronDown, User } from "lucide-react";

/* ── Palette (matches reference: deep navy sidebar + violet accent) ── */
const SIDEBAR_BG = "#1e1b4b"; // deep indigo/navy
const SIDEBAR_BG_SOFT = "#211d55";
const ACCENT_FROM = "#7c5cff";
const ACCENT_TO = "#5b3df0";

/* ── User Dropdown Component ── */
interface UserDropdownProps {
  initials: string;
  c1: string;
  c2: string;
  firstName: string;
  email: string;
  onLogout: () => void;
  onSettings: () => void;
}

function UserDropdown({
  initials,
  c1,
  c2,
  firstName,
  email,
  onLogout,
  onSettings,
}: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "5px 10px 5px 6px",
          borderRadius: "9999px",
          border: `1.5px solid ${open ? "#a5b4fc" : "#e2e8f0"}`,
          background: "#fff",
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: open ? "0 0 0 3px rgba(91,61,240,0.08)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#a5b4fc";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(91,61,240,0.08)";
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            flexShrink: 0,
            background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.7rem",
            userSelect: "none",
          }}
        >
          {initials}
        </div>

        <span
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "#0f172a",
            whiteSpace: "nowrap",
          }}
        >
          Hi, {firstName}
        </span>

        <ChevronDown
          size={14}
          color="#94a3b8"
          style={{
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            minWidth: "220px",
            zIndex: 100,
            overflow: "hidden",
            animation: "slideUp 0.15s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.8rem",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>

            <div style={{ overflow: "hidden" }}>
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "#0f172a",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {firstName}
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: "0.75rem",
                  color: "#94a3b8",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {email}
              </p>
            </div>
          </div>

          <div style={{ padding: "6px" }}>
            <button
              onClick={() => {
                setOpen(false);
                onSettings();
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#374151",
                transition: "background 0.12s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Settings size={16} color="#64748b" />
              Settings
            </button>

            <button
              onClick={() => { setOpen(false); onSettings(); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem", fontWeight: 500, color: "#374151", transition: "background 0.12s ease", textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
            >
              <User size={16} color="#64748b" />
              My Profile
            </button>

            <div
              style={{
                height: "1px",
                background: "#f1f5f9",
                margin: "4px 0",
              }}
            />

            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#ef4444",
                transition: "background 0.12s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fef2f2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <LogOut size={16} color="#ef4444" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Customers",
    href: "/customers",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Contacts",
    href: "/contacts",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="M6 17c0-1.7 1.3-3 3-3s3 1.3 3 3" />
        <line x1="14" y1="9" x2="18" y2="9" />
        <line x1="14" y1="13" x2="18" y2="13" />
      </svg>
    ),
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  {
    label: "Leads",
    href: "/leads",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "Deals",
    href: "/deals",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12V8H6a2 2 0 1 1 2-2h12v4" />
        <path d="M4 6v14a2 2 0 0 0 2 2h14v-4" />
        <path d="M18 12a2 2 0 0 1 0 4h-2v-4z" />
      </svg>
    ),
    badge: 12,
  },
  {
    label: "Activities",
    href: "/activities",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Sales Pipeline",
    href: "/Sales-Pipeline",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M6 12h12" />
        <path d="M10 18h4" />
      </svg>
    ),
  },
  {
    label: "Companies",
    href: "/company",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V5l7-3v19" />
        <path d="M19 21V9l-7-3" />
        <path d="M9 9h1" />
        <path d="M9 13h1" />
        <path d="M9 17h1" />
        <path d="M15 13h1" />
        <path d="M15 17h1" />
      </svg>
    ),
  },
  {
    label: "Notes",
    href: "/notes",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    label: "Follow-ups",
    href: "/followups",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="10" x2="15" y2="10" />
        <line x1="12" y1="7" x2="12" y2="13" />
      </svg>
    ),
  },
  {
    label: "Email Templates",
    href: "/email-templates",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
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
    label: "Project Settings",
    href: "/project-settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
    ),
    badge: 3,
  },
];

const BOTTOM_ITEMS: {
  label: string;
  href: string;
  icon: React.ReactNode;
}[] = [
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

  // Mobile par sidebar hamesha full-width (CSS se forced) hoti hai, is liye
  // collapsed (icon-only) content wahan mismatch/broken lagega — mobile
  // breakpoint par collapsed ko hamesha false rakhte hain.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");

    function syncCollapsed(e: MediaQueryList | MediaQueryListEvent) {
      if (e.matches) setCollapsed(false);
    }

    syncCollapsed(mq);
    mq.addEventListener("change", syncCollapsed);

    return () => mq.removeEventListener("change", syncCollapsed);
  }, []);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ""}`.toUpperCase()
    : "?";

  const avatarColors: [string, string][] = [
    [ACCENT_FROM, ACCENT_TO],
    ["#0891b2", "#0e7490"],
    ["#059669", "#047857"],
    ["#d97706", "#b45309"],
  ];

  const ci = user
    ? (user.firstName.charCodeAt(0) + (user.lastName?.charCodeAt(0) || 0)) %
      avatarColors.length
    : 0;

  const [c1, c2] = avatarColors[ci];

  const sidebarW = collapsed ? 76 : 250;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f7f7fb",
        fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isMobileOpen ? "active" : ""}`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar ${collapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        }`}
        style={{
          width: sidebarW,
          minWidth: sidebarW,
          background: SIDEBAR_BG,
          borderRight: "none",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          transition:
            "width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1), left 0.25s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 50,
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: collapsed ? "26px 0 20px" : "28px 24px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            flexShrink: 0,
            position: "relative",
          }}
        >
          {!collapsed && (
            <Link
              href="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${ACCENT_FROM} 0%, ${ACCENT_TO} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(91,61,240,0.4)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>

              <div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    color: "#ffffff",
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                    whiteSpace: "nowrap",
                  }}
                >
                  Softiq Tech
                </p>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: "0.65rem",
                    color: "rgba(255,255,255,0.45)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  Customer Management
                </p>
              </div>
            </Link>
          )}

          {collapsed && (
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${ACCENT_FROM} 0%, ${ACCENT_TO} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(91,61,240,0.4)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
            </Link>
          )}

          {!collapsed && (
            <button
              className="sidebar-collapse-btn"
              onClick={() => setCollapsed(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                color: "rgba(255,255,255,0.5)",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                transition: "color 0.15s, background 0.15s",
              }}
              title="Collapse sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

        </div>

        {collapsed && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "0 0 14px",
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setCollapsed(false)}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "50%",
                width: 26,
                height: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(255,255,255,0.7)",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.16)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              }}
              title="Expand sidebar"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}

        {/* Main Nav */}
        <nav
          style={{
            flex: 1,
            padding: collapsed ? "8px 10px" : "8px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {!collapsed && (
            <p
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "6px 8px 10px",
              }}
            >
              Main Menu
            </p>
          )}

          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: collapsed ? 0 : 12,
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "11px 0" : "10px 12px",
                  borderRadius: 12,
                  textDecoration: "none",
                  color: active ? "#ffffff" : "rgba(255,255,255,0.6)",
                  background: active
                    ? `linear-gradient(135deg, ${ACCENT_FROM} 0%, ${ACCENT_TO} 100%)`
                    : "transparent",
                  boxShadow: active
                    ? "0 8px 20px -6px rgba(91,61,240,0.55)"
                    : "none",
                  fontWeight: active ? 700 : 500,
                  fontSize: "0.875rem",
                  transition: "background 0.15s ease, color 0.15s ease",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = SIDEBAR_BG_SOFT;
                    e.currentTarget.style.color = "#ffffff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                  }
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    opacity: active ? 1 : 0.8,
                  }}
                >
                  {item.icon}
                </span>

                {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}

                {!collapsed && item.badge && (
                  <span
                    style={{
                      background: active ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)",
                      color: "#fff",
                      borderRadius: 9999,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "1px 7px",
                      lineHeight: "1.6",
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                {collapsed && item.badge && (
                  <span
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 8,
                      background: ACCENT_FROM,
                      color: "#fff",
                      borderRadius: 9999,
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      padding: "0px 4px",
                      lineHeight: "1.6",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Nav (extra links, if any) */}
        {BOTTOM_ITEMS.length > 0 && (
          <div
            style={{
              padding: collapsed ? "10px" : "10px 16px 0",
            }}
          >
            {BOTTOM_ITEMS.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: collapsed ? 0 : 12,
                    justifyContent: collapsed ? "center" : "flex-start",
                    padding: collapsed ? "10px 0" : "10px 12px",
                    borderRadius: 12,
                    textDecoration: "none",
                    color: active ? "#ffffff" : "rgba(255,255,255,0.6)",
                    background: active ? SIDEBAR_BG_SOFT : "transparent",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    transition: "background 0.15s ease, color 0.15s ease",
                  }}
                >
                  <span style={{ flexShrink: 0, opacity: active ? 1 : 0.8 }}>
                    {item.icon}
                  </span>

                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        )}

      </aside>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Top bar */}
        <header
          className="dashboard-header"
          style={{
            height: 64,
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 30,
            flexShrink: 0,
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
            <svg
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                pointerEvents: "none",
              }}
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
              type="text"
              placeholder="Search customers, deals…"
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                background: "#f8fafc",
                color: "#0f172a",
                fontSize: "0.875rem",
                fontFamily: "inherit",
                outline: "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = ACCENT_TO;
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(91,61,240,0.12)";
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
            <button
              style={{
                position: "relative",
                background: "none",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748b",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#c7d2fe";
                e.currentTarget.style.background = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.background = "none";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>

              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#ef4444",
                  border: "2px solid #fff",
                }}
              />
            </button>

            <UserDropdown
              initials={initials}
              c1={c1}
              c2={c2}
              firstName={user?.firstName ?? "User"}
              email={user?.email ?? ""}
              onLogout={handleLogout}
              onSettings={() => router.push("/settings")}
            />
          </div>
        </header>

        {/* Page content */}
        <main
          className="dashboard-main"
          style={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
