"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import { listAdminUsers, listRoles } from "@/lib/projectSettingsApi";
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  UserPlus,
  RefreshCw,
} from "lucide-react";

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function AdminPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [inactiveUsers, setInactiveUsers] = useState(0);
  const [totalRoles, setTotalRoles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const [allUsers, activeResult, roles] = await Promise.all([
        listAdminUsers(),
        listAdminUsers({ is_active: "true" }),
        listRoles(),
      ]);
      setTotalUsers(allUsers.length);
      setActiveUsers(activeResult.length);
      setInactiveUsers(allUsers.length - activeResult.length);
      setTotalRoles(roles.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  const STAT_CARDS = [
    { label: "Total Users", value: totalUsers, change: "Registered users", icon: <Users size={18} />, color: "#4f46e5" },
    { label: "Active Users", value: activeUsers, change: "Currently active", icon: <UserCheck size={18} />, color: "#15803d" },
    { label: "Inactive Users", value: inactiveUsers, change: "Disabled accounts", icon: <UserX size={18} />, color: "#64748b" },
    { label: "Total Roles", value: totalRoles, change: "Configured roles", icon: <ShieldCheck size={18} />, color: "#7c3aed" },
  ];

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Panel</h1>
            <p className="page-subtitle">Manage users, roles and system permissions.</p>
          </div>
          <button type="button" className="btn-secondary" onClick={fetchData} disabled={loading}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="msg-error" style={{ marginBottom: 0 }}>
            <span>{error}</span>
            <button type="button" onClick={fetchData} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: 600, textDecoration: "underline", fontFamily: "inherit", fontSize: "0.8125rem" }}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <ThemeLoader label="Loading admin data..." minHeight={300} />
        ) : (
          <>
            {/* Statistics */}
            <div className="dashboard-stats-grid">
              {STAT_CARDS.map((card) => (
                <div
                  key={card.label}
                  className="stat-card-dashboard"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    className="stat-card-dashboard-icon"
                    style={{ background: hexToRgba(card.color, 0.1), color: card.color }}
                  >
                    {card.icon}
                  </div>
                  <div className="stat-card-dashboard-content">
                    <p className="stat-card-dashboard-label">{card.label}</p>
                    <p className="stat-card-dashboard-value">{card.value}</p>
                    <div className="stat-card-dashboard-change">
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{card.change}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Administration */}
            <div>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>Administration</h2>
                <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#64748b" }}>Manage users and access control.</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 20, width: "100%", marginBottom: 24 }}>
                {/* User Management */}
                <div className="form-card" style={{ width: "100%", maxWidth: "none", margin: 0 }}>
                  <div className="form-card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="stat-card-dashboard-icon" style={{ width: 38, height: 38, background: "#eef2ff", color: "#4f46e5" }}>
                        <Users size={18} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>User Management</h3>
                        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>Manage CRM users</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "1rem 1.5rem" }}>
                    <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.5, color: "#64748b" }}>
                      View, create and manage user accounts and account status.
                    </p>
                    <Link href="/admin/users" className="btn-secondary" style={{ marginTop: 16, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      Manage Users <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>

                {/* Role Management */}
                <div className="form-card" style={{ width: "100%", maxWidth: "none", margin: 0 }}>
                  <div className="form-card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="stat-card-dashboard-icon" style={{ width: 38, height: 38, background: "#f5f3ff", color: "#7c3aed" }}>
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Role Management</h3>
                        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>Manage user roles</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "1rem 1.5rem" }}>
                    <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.5, color: "#64748b" }}>
                      Create and manage roles and access levels for CRM users.
                    </p>
                    <Link href="/admin/roles" className="btn-secondary" style={{ marginTop: 16, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      Manage Roles <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>

                {/* Permission Management */}
                <div className="form-card" style={{ width: "100%", maxWidth: "none", margin: 0 }}>
                  <div className="form-card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="stat-card-dashboard-icon" style={{ width: 38, height: 38, background: "#ecfeff", color: "#0891b2" }}>
                        <KeyRound size={18} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Permission Management</h3>
                        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>Control system access</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "1rem 1.5rem" }}>
                    <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.5, color: "#64748b" }}>
                      Control what users and roles can view, create, update and delete.
                    </p>
                    <Link href="/admin/permissions" className="btn-secondary" style={{ marginTop: 16, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      Manage Permissions <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions + System Activity */}
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 24, width: "100%", alignItems: "stretch" }}>
              {/* Quick Actions */}
              <div className="form-card" style={{ width: "100%", maxWidth: "none", margin: 0 }}>
                <div className="form-card-header">
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Quick Actions</h3>
                  <p style={{ margin: "3px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>Frequently used administration actions.</p>
                </div>
                <div style={{ padding: "0.5rem 0 0.75rem" }}>
                  <Link href="/admin/users" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 1.5rem", textDecoration: "none", color: "#475569", fontSize: "0.875rem", fontWeight: 500 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <UserPlus size={16} color="#64748b" /> Manage Users
                    </span>
                    <ArrowRight size={15} color="#94a3b8" />
                  </Link>
                  <Link href="/admin/roles" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 1.5rem", textDecoration: "none", color: "#475569", fontSize: "0.875rem", fontWeight: 500 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <ShieldCheck size={16} color="#64748b" /> Manage Roles
                    </span>
                    <ArrowRight size={15} color="#94a3b8" />
                  </Link>
                  <Link href="/admin/permissions" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 1.5rem", textDecoration: "none", color: "#475569", fontSize: "0.875rem", fontWeight: 500 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <KeyRound size={16} color="#64748b" /> Manage Permissions
                    </span>
                    <ArrowRight size={15} color="#94a3b8" />
                  </Link>
                </div>
              </div>

              {/* System Activity */}
              <div className="form-card" style={{ width: "100%", maxWidth: "none", margin: 0 }}>
                <div className="form-card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <ShieldCheck size={18} color="#4f46e5" />
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>System Overview</h3>
                      <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>Current system status.</p>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "0.5rem 0 0.75rem" }}>
                  <div style={{ padding: "11px 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
                    <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500, color: "#475569" }}>User management</p>
                    <p style={{ margin: "3px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>{activeUsers} active / {inactiveUsers} inactive accounts.</p>
                  </div>
                  <div style={{ padding: "11px 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
                    <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500, color: "#475569" }}>Role-based access control</p>
                    <p style={{ margin: "3px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>{totalRoles} roles configured.</p>
                  </div>
                  <div style={{ padding: "11px 1.5rem" }}>
                    <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500, color: "#475569" }}>Admin panel</p>
                    <p style={{ margin: "3px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>System administration is ready.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
