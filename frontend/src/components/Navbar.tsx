"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  // Generate initials from name
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0) || ""}`.toUpperCase()
    : "?";

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "";

  // Generate a consistent avatar color based on name
  const avatarColors = [
    ["#4f46e5", "#7c3aed"],
    ["#0891b2", "#0e7490"],
    ["#059669", "#047857"],
    ["#d97706", "#b45309"],
    ["#dc2626", "#b91c1c"],
    ["#7c3aed", "#6d28d9"],
  ];
const colorIndex = user
  ? (
      (user.firstName?.charCodeAt(0) || 0) +
      (user.lastName?.charCodeAt(0) || 0)
    ) % avatarColors.length
  : 0;
  const [c1, c2] = avatarColors[colorIndex];

  return (
    <header style={{
      background: "#ffffff",
      borderBottom: "1px solid #e2e8f0",
      padding: "0 1.5rem",
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
      fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
    }}>
      {/* Left — Logo */}
      <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 10px rgba(79,70,229,0.3)",
          flexShrink: 0,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "#0f172a", letterSpacing: "-0.02em" }}>
          CRM System
        </span>
      </Link>

      {/* Nav links — center */}
      <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
        {[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Customers", href: "/customers" },
          { label: "Deals", href: "/deals" },
          { label: "Reports", href: "/reports" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: "0.4rem 0.875rem",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#475569",
              textDecoration: "none",
              transition: "background 0.15s ease, color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#f1f5f9";
              (e.currentTarget as HTMLAnchorElement).style.color = "#0f172a";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
              (e.currentTarget as HTMLAnchorElement).style.color = "#475569";
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Right — User profile */}
      <div style={{ position: "relative" }} ref={dropRef}>
        {user ? (
          /* ── Logged-in user button ── */
          <button
            onClick={() => setDropOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.375rem 0.75rem 0.375rem 0.375rem",
              borderRadius: "9999px",
              border: "1.5px solid #e2e8f0",
              background: dropOpen ? "#f8fafc" : "#ffffff",
              cursor: "pointer",
              transition: "border-color 0.15s ease, background 0.15s ease",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#c7d2fe";
              (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc";
            }}
            onMouseLeave={(e) => {
              if (!dropOpen) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
                (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
              }
            }}
            aria-haspopup="true"
            aria-expanded={dropOpen}
          >
            {/* Avatar */}
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: "0.75rem",
              flexShrink: 0, userSelect: "none",
            }}>
              {initials}
            </div>
            {/* Name */}
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {fullName}
            </span>
            {/* Chevron */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: "transform 0.2s ease", transform: dropOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        ) : (
          /* ── Guest buttons ── */
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Link href="/login" style={{
              padding: "0.5rem 1rem", borderRadius: "0.5rem", fontSize: "0.875rem",
              fontWeight: 600, color: "#4f46e5", textDecoration: "none",
              border: "1.5px solid #c7d2fe", background: "#fff",
              transition: "background 0.15s ease",
            }}>Sign in</Link>
            <Link href="/register" style={{
              padding: "0.5rem 1rem", borderRadius: "0.5rem", fontSize: "0.875rem",
              fontWeight: 600, color: "#fff", textDecoration: "none",
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              boxShadow: "0 2px 8px rgba(79,70,229,0.35)",
            }}>Get started</Link>
          </div>
        )}

        {/* ── Dropdown menu ── */}
        {dropOpen && user && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "0.875rem",
            boxShadow: "0 10px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
            minWidth: "220px",
            overflow: "hidden",
            animation: "dropIn 0.18s cubic-bezier(0.16,1,0.3,1)",
            zIndex: 200,
          }}>
            {/* User info header */}
            <div style={{ padding: "1rem 1rem 0.75rem", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: "0.875rem",
                  flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {fullName}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div style={{ padding: "0.5rem" }}>
              {[
                { icon: "👤", label: "My Profile", href: "/profile" },
                { icon: "⚙️", label: "Settings", href: "/settings" },
                { icon: "🔔", label: "Notifications", href: "/notifications" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDropOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.625rem",
                    padding: "0.5rem 0.625rem", borderRadius: "0.5rem",
                    textDecoration: "none", color: "#374151",
                    fontSize: "0.875rem", fontWeight: 500,
                    transition: "background 0.12s ease",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#f8fafc")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")}
                >
                  <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Logout */}
            <div style={{ padding: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "0.625rem",
                  padding: "0.5rem 0.625rem", borderRadius: "0.5rem",
                  background: "none", border: "none", cursor: "pointer",
                  color: "#ef4444", fontSize: "0.875rem", fontWeight: 600,
                  fontFamily: "inherit", textAlign: "left",
                  transition: "background 0.12s ease",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#fef2f2")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </header>
  );
}
