"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import { listRoles, updateRole, type Role, type RolePermissions, type PermissionAction } from "@/lib/projectSettingsApi";
import { HiArrowLeft, HiSave } from "react-icons/hi";
import {
  MdDashboard, MdPeople, MdContacts, MdLeaderboard,
  MdTrendingUp, MdHandshake, MdCalendarToday, MdBusiness,
  MdBarChart, MdSettings, MdStickyNote2, MdFollowTheSigns,
  MdTaskAlt, MdMail,
} from "react-icons/md";

const CRM_MODULES = [
  { key: "dashboard", label: "Dashboard", icon: <MdDashboard size={15} /> },
  { key: "customers", label: "Customers", icon: <MdPeople size={15} /> },
  { key: "contacts", label: "Contacts", icon: <MdContacts size={15} /> },
  { key: "leads", label: "Leads", icon: <MdLeaderboard size={15} /> },
  { key: "opportunities", label: "Opportunities", icon: <MdTrendingUp size={15} /> },
  { key: "deals", label: "Sales Pipeline", icon: <MdHandshake size={15} /> },
  { key: "activities", label: "Activities", icon: <MdCalendarToday size={15} /> },
  { key: "companies", label: "Companies", icon: <MdBusiness size={15} /> },
  { key: "notes", label: "Notes", icon: <MdStickyNote2 size={15} /> },
  { key: "followups", label: "Follow-ups", icon: <MdFollowTheSigns size={15} /> },
  { key: "tasks", label: "Tasks", icon: <MdTaskAlt size={15} /> },
  { key: "email_templates", label: "Email Templates", icon: <MdMail size={15} /> },
  { key: "reports", label: "Reports", icon: <MdBarChart size={15} /> },
  { key: "settings", label: "Settings", icon: <MdSettings size={15} /> },
];

const PERM_TYPES: { key: PermissionAction; label: string; color: string; bg: string }[] = [
  { key: "view", label: "View", color: "#4f46e5", bg: "#eef2ff" },
  { key: "create", label: "Create", color: "#16a34a", bg: "#f0fdf4" },
  { key: "edit", label: "Edit", color: "#d97706", bg: "#fff7ed" },
  { key: "delete", label: "Delete", color: "#dc2626", bg: "#fef2f2" },
];

function PermCheckbox({ checked, color, onChange }: { checked: boolean; color: string; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: 18, height: 18, borderRadius: "4px", border: `1.5px solid ${checked ? color : "#e2e8f0"}`,
      cursor: "pointer", padding: 0,
      background: checked ? color : "transparent",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.15s", flexShrink: 0,
    }}>
      {checked && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

export default function AdminPermissionsPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Record<number, RolePermissions>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirtyIds, setDirtyIds] = useState<Set<number>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listRoles();
      setRoles(data);
      const permMap: Record<number, RolePermissions> = {};
      data.forEach(r => { permMap[r.id] = JSON.parse(JSON.stringify(r.permissions)); });
      setPermissions(permMap);
      setDirtyIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load permissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function togglePerm(roleId: number, module: string, perm: PermissionAction) {
    setPermissions(prev => {
      const cur = prev[roleId]?.[module] ?? {};
      return {
        ...prev,
        [roleId]: {
          ...prev[roleId],
          [module]: { view: cur.view ?? false, create: cur.create ?? false, edit: cur.edit ?? false, delete: cur.delete ?? false, [perm]: !(cur[perm] ?? false) },
        },
      };
    });
    setDirtyIds(prev => new Set(prev).add(roleId));
  }

  async function handleSave() {
    if (saving || dirtyIds.size === 0) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      await Promise.all(
        Array.from(dirtyIds).map(id =>
          updateRole(id, { permissions: permissions[id] })
        )
      );
      setDirtyIds(new Set());
      setSuccess("Permissions saved successfully.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save permissions.");
    } finally {
      setSaving(false);
    }
  }

  const thS: React.CSSProperties = {
    padding: "10px 14px", textAlign: "left", fontSize: "0.7rem", fontWeight: 600,
    color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em",
    background: "#f8fafc", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap",
  };
  const tdS: React.CSSProperties = {
    padding: "10px 14px", fontSize: "0.8rem", color: "#374151",
    borderBottom: "1px solid #f1f5f9", verticalAlign: "middle",
  };

  return (
    <DashboardLayout>
      <div style={{ minWidth: 0, overflowX: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: "0.8125rem", color: "#94a3b8" }}>
          <button type="button" onClick={() => router.push("/admin")} style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontWeight: 500, fontSize: "0.8125rem", fontFamily: "inherit", padding: 0 }}>Admin Panel</button>
          <span style={{ color: "#cbd5e1" }}>&rsaquo;</span>
          <span style={{ color: "#374151" }}>Permissions</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <button type="button" className="btn-secondary" onClick={() => router.push("/admin")} style={{ marginBottom: "12px" }}>
              <HiArrowLeft size={15} /> Administration
            </button>
            <h1 className="page-title">Permissions Editor</h1>
            <p className="page-subtitle">Edit permissions for all roles in one place.</p>
          </div>
          <button onClick={handleSave} disabled={saving || dirtyIds.size === 0} className="btn-add"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", opacity: dirtyIds.size === 0 ? 0.6 : 1, cursor: dirtyIds.size === 0 ? "not-allowed" : "pointer" }}>
            {saving ? "Saving..." : <><HiSave size={15} /> Save Changes</>}
          </button>
        </div>

        {error && <div className="msg-error" style={{ marginBottom: "16px" }}>{error}</div>}
        {success && <div className="msg-success" style={{ marginBottom: "16px" }}>{success}</div>}

        {dirtyIds.size > 0 && !success && (
          <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", fontSize: "0.8125rem", color: "#b45309", fontWeight: 500 }}>
            You have unsaved permission changes. Click &quot;Save Changes&quot; to apply.
          </div>
        )}

        {loading ? (
          <ThemeLoader label="Loading permissions..." minHeight={300} />
        ) : (
          <div className="company-table-card">
            <div className="contacts-table-toolbar">
              <div>
                <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Permissions Matrix</h2>
                <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#94a3b8" }}>{roles.length} roles &middot; Toggle permissions by clicking checkboxes</p>
              </div>
            </div>

            <div className="contacts-table-wrapper">
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>Module</th>
                    {roles.map(role => (
                      <th key={role.id} style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{role.name}</span>
                          {role.is_system && <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 400 }}>(system)</span>}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CRM_MODULES.map((mod) => (
                    <tr key={mod.key}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ color: "#94a3b8" }}>{mod.icon}</span>
                          <span style={{ fontWeight: 500 }}>{mod.label}</span>
                        </div>
                      </td>
                      {roles.map(role => {
                        const p = permissions[role.id]?.[mod.key] ?? { view: false, create: false, edit: false, delete: false };
                        return (
                          <td key={role.id} style={{ textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                              {PERM_TYPES.map(perm => (
                                <PermCheckbox
                                  key={perm.key}
                                  checked={p[perm.key]}
                                  color={perm.color}
                                  onChange={() => togglePerm(role.id, mod.key, perm.key)}
                                />
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{ marginTop: "16px", padding: "14px 18px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>Legend:</span>
          {PERM_TYPES.map(p => (
            <span key={p.key} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.75rem", color: "#64748b" }}>
              <span style={{ width: 14, height: 14, borderRadius: "3px", background: p.color, display: "inline-block" }} />
              {p.label}
            </span>
          ))}
          <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.75rem", color: "#64748b" }}>
            <span style={{ width: 14, height: 14, borderRadius: "3px", background: "#e2e8f0", display: "inline-block" }} />
            No access
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
