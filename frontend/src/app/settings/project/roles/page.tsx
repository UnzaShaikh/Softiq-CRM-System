"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SettingsNav from "@/components/project-settings/SettingsNav";
import {
  HiShieldCheck, HiUserGroup, HiEye, HiSave, HiX, HiDotsVertical, HiPlus,
} from "react-icons/hi";
import {
  MdDashboard, MdPeople, MdContacts, MdLeaderboard,
  MdTrendingUp, MdHandshake, MdCalendarToday, MdBusiness,
  MdBarChart, MdSettings,
} from "react-icons/md";

// ── Types ─────────────────────────────────────────────────────────────
type PermType = "view" | "create" | "edit" | "delete";
interface ModulePerms { view: boolean; create: boolean; edit: boolean; delete: boolean; }
interface RolePermissions { [module: string]: ModulePerms; }
interface Role {
  id: string; name: string; description: string; accessLevel: string;
  color: string; bgColor: string; icon: React.ReactNode;
  usersAssigned: number; createdOn: string; lastUpdated: string;
  permissions: RolePermissions;
}

// ── CRM Modules ───────────────────────────────────────────────────────
const CRM_MODULES = [
  { key: "dashboard",     label: "Dashboard",     icon: <MdDashboard size={15} /> },
  { key: "customers",     label: "Customers",     icon: <MdPeople size={15} /> },
  { key: "contacts",      label: "Contacts",      icon: <MdContacts size={15} /> },
  { key: "leads",         label: "Leads",         icon: <MdLeaderboard size={15} /> },
  { key: "opportunities", label: "Opportunities", icon: <MdTrendingUp size={15} /> },
  { key: "deals",         label: "Deals",         icon: <MdHandshake size={15} /> },
  { key: "activities",    label: "Activities",    icon: <MdCalendarToday size={15} /> },
  { key: "companies",     label: "Companies",     icon: <MdBusiness size={15} /> },
  { key: "reports",       label: "Reports",       icon: <MdBarChart size={15} /> },
  { key: "settings",      label: "Settings",      icon: <MdSettings size={15} /> },
];

function allPerms(v: boolean, c: boolean, e: boolean, d: boolean): RolePermissions {
  const p: RolePermissions = {};
  CRM_MODULES.forEach(m => { p[m.key] = { view: v, create: c, edit: e, delete: d }; });
  return p;
}

const DEFAULT_ROLES: Role[] = [
  {
    id: "administrator", name: "Administrator", description: "Full system access",
    accessLevel: "Full system access", color: "#4f46e5", bgColor: "#eef2ff",
    icon: <HiShieldCheck size={18} />, usersAssigned: 2,
    createdOn: "01 Jan 2025, 09:00 AM", lastUpdated: "18 May 2025, 10:30 AM",
    permissions: allPerms(true, true, true, true),
  },
  {
    id: "manager", name: "Manager", description: "Manage team and data",
    accessLevel: "Manage team and data", color: "#0891b2", bgColor: "#ecfeff",
    icon: <HiUserGroup size={18} />, usersAssigned: 5,
    createdOn: "01 Jan 2025, 09:00 AM", lastUpdated: "18 May 2025, 10:30 AM",
    permissions: (() => {
      const p = allPerms(true, true, true, false);
      p["settings"] = { view: false, create: false, edit: false, delete: false };
      return p;
    })(),
  },
  {
    id: "sales_rep", name: "Sales Representative", description: "Manage leads and deals",
    accessLevel: "Manage leads, opportunities, and deals", color: "#16a34a", bgColor: "#f0fdf4",
    icon: <MdTrendingUp size={18} />, usersAssigned: 8,
    createdOn: "01 Jan 2025, 09:00 AM", lastUpdated: "18 May 2025, 10:30 AM",
    permissions: (() => {
      const p = allPerms(false, false, false, false);
      ["leads","opportunities","deals","customers","contacts","activities"].forEach(m => {
        p[m] = { view: true, create: true, edit: true, delete: false };
      });
      p["dashboard"] = { view: true, create: false, edit: false, delete: false };
      p["reports"]   = { view: true, create: false, edit: false, delete: false };
      return p;
    })(),
  },
  {
    id: "viewer", name: "Viewer", description: "View only access",
    accessLevel: "View-only access", color: "#d97706", bgColor: "#fefce8",
    icon: <HiEye size={18} />, usersAssigned: 3,
    createdOn: "01 Jan 2025, 09:00 AM", lastUpdated: "18 May 2025, 10:30 AM",
    permissions: (() => {
      const p = allPerms(true, false, false, false);
      p["settings"] = { view: false, create: false, edit: false, delete: false };
      return p;
    })(),
  },
];

// ── Helpers ───────────────────────────────────────────────────────────
function countAccess(perms: RolePermissions) {
  return Object.values(perms).filter(p => p.view || p.create || p.edit || p.delete).length;
}
function countPermissions(perms: RolePermissions) {
  return Object.values(perms).reduce((acc, p) =>
    acc + [p.view, p.create, p.edit, p.delete].filter(Boolean).length, 0);
}

// ── Purple Checkbox (exactly like reference) ──────────────────────────
function PermCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: 18, height: 18, borderRadius: "4px", border: "none", cursor: "pointer", padding: 0,
      background: checked ? "#4f46e5" : "#e2e8f0",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "background 0.15s", flexShrink: 0,
    }}>
      {checked && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState("administrator");
  const [permissions, setPermissions] = useState<Record<string, RolePermissions>>(
    Object.fromEntries(DEFAULT_ROLES.map(r => [r.id, JSON.parse(JSON.stringify(r.permissions))]))
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");
  const [activeTab, setActiveTab] = useState<"roles" | "matrix">("roles");

  // Add Role Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [roleNameError, setRoleNameError] = useState("");

  const selectedRole = roles.find(r => r.id === selectedRoleId)!;
  const selectedPerms = permissions[selectedRoleId];

  function togglePerm(module: string, perm: PermType) {
    setPermissions(prev => ({
      ...prev,
      [selectedRoleId]: {
        ...prev[selectedRoleId],
        [module]: { ...prev[selectedRoleId][module], [perm]: !prev[selectedRoleId][module][perm] },
      },
    }));
    setHasChanges(true);
  }

  async function handleSave() {
    setSaving(true); setSaveSuccess(""); setSaveError("");
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false); setHasChanges(false);
    setSaveSuccess("Roles & Permissions saved successfully.");
    setTimeout(() => setSaveSuccess(""), 4000);
  }

  function handleAddRole() {
    const trimmed = newRoleName.trim();
    if (!trimmed) { setRoleNameError("Role name is required."); return; }
    if (trimmed.length > 50) { setRoleNameError("Max 50 characters."); return; }
    if (roles.some(r => r.name.toLowerCase() === trimmed.toLowerCase())) {
      setRoleNameError("Role name already exists."); return;
    }
    const id = trimmed.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    const newRole: Role = {
      id, name: trimmed, description: newRoleDesc.trim() || "Custom role",
      accessLevel: newRoleDesc.trim() || "Custom role",
      color: "#7c3aed", bgColor: "#f5f3ff",
      icon: <HiUserGroup size={18} />, usersAssigned: 0,
      createdOn: new Date().toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      lastUpdated: new Date().toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      permissions: allPerms(false, false, false, false),
    };
    setRoles(prev => [...prev, newRole]);
    setPermissions(prev => ({ ...prev, [id]: allPerms(false, false, false, false) }));
    setSelectedRoleId(id);
    setShowAddModal(false); setNewRoleName(""); setNewRoleDesc(""); setRoleNameError("");
  }

  const PERM_COLS: { key: PermType; label: string }[] = [
    { key: "view", label: "View" }, { key: "create", label: "Create" },
    { key: "edit", label: "Edit" }, { key: "delete", label: "Delete" },
  ];

  const thS: React.CSSProperties = {
    padding: "9px 12px", textAlign: "left", fontSize: "0.7rem", fontWeight: 600,
    color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em",
    background: "#f8fafc", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap",
  };
  const tdS: React.CSSProperties = {
    padding: "9px 12px", fontSize: "0.8rem", color: "#374151",
    borderBottom: "1px solid #f1f5f9", verticalAlign: "middle",
  };

  return (
    <DashboardLayout>
      <div style={{ minWidth: 0, overflowX: "hidden" }}>

        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="page-title">Project Settings</h1>
            <p className="page-subtitle">Manage your CRM project details, preferences and configurations.</p>
          </div>
          <button onClick={handleSave} disabled={saving || !hasChanges} className="btn-add"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", opacity: !hasChanges ? 0.6 : 1, cursor: !hasChanges ? "not-allowed" : "pointer" }}>
            {saving
              ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Saving...</>
              : <><HiSave size={15} /> Save Changes</>}
          </button>
        </div>

        {/* Banners */}
        {saveSuccess && <div className="msg-success" style={{ marginBottom: "16px" }}>✅ {saveSuccess}</div>}
        {saveError   && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", fontSize: "0.8125rem", color: "#dc2626", fontWeight: 500 }}>❌ {saveError}</div>}
        {hasChanges && !saveSuccess && (
          <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", fontSize: "0.8125rem", color: "#b45309", fontWeight: 500 }}>
            ⚠️ You have unsaved changes. Click &quot;Save Changes&quot; to apply them.
          </div>
        )}

        {/* 3-col layout: Nav | Content | Overview */}
        <div style={{ display: "grid", gridTemplateColumns: "200px minmax(0,1fr) 185px", gap: "14px", alignItems: "start" }}>

          {/* ── Left: Settings Nav ── */}
          <SettingsNav />

          {/* ── Middle: Roles & Permissions card ── */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", minWidth: 0 }}>

            {/* Card Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <h2 style={{ margin: "0 0 2px", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Roles &amp; Permissions</h2>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>Create and manage user roles and control module access.</p>
            </div>

            {/* Tabs */}
            <div style={{ padding: "0 20px", borderBottom: "1px solid #f1f5f9", display: "flex" }}>
              {(["roles", "matrix"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: "11px 14px", border: "none", background: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: "0.875rem",
                  fontWeight: activeTab === tab ? 600 : 500,
                  color: activeTab === tab ? "#4f46e5" : "#64748b",
                  borderBottom: activeTab === tab ? "2px solid #4f46e5" : "2px solid transparent",
                  marginBottom: "-1px", transition: "all 0.15s",
                }}>
                  {tab === "roles" ? "Roles" : "Permissions Matrix"}
                </button>
              ))}
            </div>

            {/* ── ROLES TAB ── */}
            {activeTab === "roles" && (
              <div style={{ display: "grid", gridTemplateColumns: "185px minmax(0,1fr)", gap: "0" }}>

                {/* Roles List column */}
                <div style={{ borderRight: "1px solid #f1f5f9", padding: "14px 12px" }}>

                  {/* Roles header + Add button */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div>
                      <p style={{ margin: "0 0 1px", fontSize: "0.8rem", fontWeight: 700, color: "#0f172a" }}>Roles</p>
                      <p style={{ margin: 0, fontSize: "0.68rem", color: "#94a3b8" }}>Manage roles for your team.</p>
                    </div>
                    <button
                      onClick={() => setShowAddModal(true)}
                      style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        padding: "5px 8px", border: "1.5px solid #c7d2fe", borderRadius: "7px",
                        background: "#f5f3ff", color: "#4f46e5", fontWeight: 600, fontSize: "0.7rem",
                        cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#ede9fe")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#f5f3ff")}
                    >
                      <HiPlus size={11} /> Add New Role
                    </button>
                  </div>

                  {/* Role Cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {roles.map(role => {
                      const isSelected = role.id === selectedRoleId;
                      return (
                        <div key={role.id} onClick={() => setSelectedRoleId(role.id)} style={{
                          display: "flex", alignItems: "center", gap: "8px",
                          padding: "10px 10px", borderRadius: "10px", cursor: "pointer",
                          border: isSelected ? `1.5px solid ${role.color}` : "1.5px solid #e2e8f0",
                          background: isSelected ? role.bgColor : "#fff",
                          transition: "all 0.15s",
                          boxShadow: isSelected ? `0 0 0 1px ${role.color}22` : "none",
                        }}
                          onMouseEnter={e => { if (!isSelected) { (e.currentTarget as HTMLDivElement).style.background = "#f8fafc"; (e.currentTarget as HTMLDivElement).style.borderColor = "#c7d2fe"; } }}
                          onMouseLeave={e => { if (!isSelected) { (e.currentTarget as HTMLDivElement).style.background = "#fff"; (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0"; } }}
                        >
                          {/* Circular avatar */}
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${role.color}20`, display: "flex", alignItems: "center", justifyContent: "center", color: role.color, flexShrink: 0 }}>
                            {role.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{role.name}</p>
                            <p style={{ margin: 0, fontSize: "0.67rem", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{role.description}</p>
                          </div>
                          <button onClick={e => e.stopPropagation()} style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", padding: "2px", flexShrink: 0 }}>
                            <HiDotsVertical size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Permissions column */}
                <div style={{ padding: "14px 14px", minWidth: 0, overflow: "hidden" }}>
                  <div style={{ marginBottom: "12px" }}>
                    <h3 style={{ margin: "0 0 2px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>
                      Permissions for {selectedRole.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>
                      Set what actions this role can perform for each module.
                    </p>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "inherit", tableLayout: "fixed", minWidth: "320px" }}>
                      <thead>
                        <tr>
                          <th style={{ ...thS, width: "36%" }}>Module</th>
                          {PERM_COLS.map(p => (
                            <th key={p.key} style={{ ...thS, textAlign: "center", width: "16%" }}>{p.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {CRM_MODULES.map((mod, idx) => {
                          const isLast = idx === CRM_MODULES.length - 1;
                          const cell = { ...tdS, borderBottom: isLast ? "none" : "1px solid #f1f5f9" };
                          return (
                            <tr key={mod.key}
                              onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#fafafa"}
                              onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                              style={{ transition: "background 0.1s" }}
                            >
                              <td style={cell}>
                                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                  <span style={{ color: "#94a3b8" }}>{mod.icon}</span>
                                  <span style={{ fontWeight: 500, fontSize: "0.8rem" }}>{mod.label}</span>
                                </div>
                              </td>
                              {PERM_COLS.map(p => (
                                <td key={p.key} style={{ ...cell, textAlign: "center" }}>
                                  <div style={{ display: "flex", justifyContent: "center" }}>
                                    <PermCheckbox
                                      checked={selectedPerms[mod.key][p.key]}
                                      onChange={() => togglePerm(mod.key, p.key)}
                                    />
                                  </div>
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Info note */}
                  <div style={{ marginTop: "12px", padding: "8px 12px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", display: "flex", alignItems: "center", gap: "7px" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span style={{ fontSize: "0.72rem", color: "#0369a1" }}>Changes to permissions will be applied when you save.</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── PERMISSIONS MATRIX TAB ── */}
            {activeTab === "matrix" && (
              <div style={{ padding: "16px 20px", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "inherit" }}>
                  <thead>
                    <tr>
                      <th style={{ ...thS, minWidth: "120px" }}>Module</th>
                      {roles.map(role => (
                        <th key={role.id} style={{ ...thS, textAlign: "center", minWidth: "100px" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                            <span style={{ color: role.color }}>{role.icon}</span>
                            <span style={{ fontSize: "0.68rem" }}>{role.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CRM_MODULES.map((mod, idx) => {
                      const isLast = idx === CRM_MODULES.length - 1;
                      const cell = { ...tdS, borderBottom: isLast ? "none" : "1px solid #f1f5f9" };
                      return (
                        <tr key={mod.key}
                          onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#fafafa"}
                          onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                        >
                          <td style={cell}>
                            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <span style={{ color: "#94a3b8" }}>{mod.icon}</span>
                              <span style={{ fontWeight: 500 }}>{mod.label}</span>
                            </div>
                          </td>
                          {roles.map(role => {
                            const p = permissions[role.id][mod.key];
                            const hasAny = p.view || p.create || p.edit || p.delete;
                            return (
                              <td key={role.id} style={{ ...cell, textAlign: "center" }}>
                                {hasAny ? (
                                  <div style={{ display: "flex", gap: "2px", justifyContent: "center", flexWrap: "wrap" }}>
                                    {p.view   && <span style={{ padding: "2px 5px", borderRadius: "4px", background: "#eef2ff", color: "#4f46e5", fontSize: "0.62rem", fontWeight: 600 }}>V</span>}
                                    {p.create && <span style={{ padding: "2px 5px", borderRadius: "4px", background: "#f0fdf4", color: "#16a34a", fontSize: "0.62rem", fontWeight: 600 }}>C</span>}
                                    {p.edit   && <span style={{ padding: "2px 5px", borderRadius: "4px", background: "#fff7ed", color: "#d97706", fontSize: "0.62rem", fontWeight: 600 }}>E</span>}
                                    {p.delete && <span style={{ padding: "2px 5px", borderRadius: "4px", background: "#fef2f2", color: "#dc2626", fontSize: "0.62rem", fontWeight: 600 }}>D</span>}
                                  </div>
                                ) : (
                                  <span style={{ color: "#cbd5e1", fontSize: "0.72rem" }}>—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Right: Role Overview ── */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", position: "sticky", top: "20px" }}>
            <h3 style={{ margin: "0 0 2px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Role Overview</h3>
            <p style={{ margin: "0 0 16px", fontSize: "0.72rem", color: "#94a3b8" }}>Summary of the selected role.</p>

            {/* Role icon + name */}
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div style={{ width: 60, height: 60, borderRadius: "16px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", boxShadow: "0 2px 8px rgba(79,70,229,0.15)" }}>
                <HiShieldCheck size={30} color="#4f46e5" />
              </div>
              <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{selectedRole.name}</p>
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "9999px", background: selectedRole.bgColor, color: selectedRole.color, fontSize: "0.7rem", fontWeight: 600 }}>
                {selectedRole.accessLevel}
              </span>
            </div>

            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "11px" }}>
              {[
                { icon: <MdSettings size={14} />,      label: "Modules",             value: `${CRM_MODULES.length}` },
                { icon: <HiShieldCheck size={14} />,   label: "Permissions",         value: `${countPermissions(selectedPerms)} / ${CRM_MODULES.length * 4}` },
                { icon: <HiUserGroup size={14} />,     label: "Users Assigned",      value: `${selectedRole.usersAssigned}` },
                { icon: <HiEye size={14} />,           label: "Modules with Access", value: `${countAccess(selectedPerms)} / ${CRM_MODULES.length}` },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "7px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ margin: "0 0 1px", fontSize: "0.65rem", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: "0.825rem", fontWeight: 700, color: "#0f172a" }}>{item.value}</p>
                  </div>
                </div>
              ))}

              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { emoji: "📅", label: "Created On",   value: selectedRole.createdOn },
                  { emoji: "🕐", label: "Last Updated", value: selectedRole.lastUpdated },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "0.75rem", marginTop: "2px" }}>{item.emoji}</span>
                    <div>
                      <p style={{ margin: "0 0 1px", fontSize: "0.65rem", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#374151", fontWeight: 500 }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Role Modal ── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowAddModal(false); setNewRoleName(""); setNewRoleDesc(""); setRoleNameError(""); } }}>
          <div className="modal-box" style={{ maxWidth: "400px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div>
                <h2 style={{ margin: "0 0 2px", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Add New Role</h2>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>Create a custom role for your team.</p>
              </div>
              <button onClick={() => { setShowAddModal(false); setNewRoleName(""); setNewRoleDesc(""); setRoleNameError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}>
                <HiX size={17} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Role Name <span style={{ color: "var(--error)" }}>*</span></label>
                <input value={newRoleName} onChange={e => { setNewRoleName(e.target.value); setRoleNameError(""); }}
                  placeholder="e.g. Support Agent" maxLength={50}
                  onKeyDown={e => { if (e.key === "Enter") handleAddRole(); }}
                  style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${roleNameError ? "#fca5a5" : "#e2e8f0"}`, borderRadius: "8px", background: "#fff", color: "#0f172a", fontSize: "0.875rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                {roleNameError && <p className="form-error">{roleNameError}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Role Description</label>
                <textarea value={newRoleDesc} onChange={e => setNewRoleDesc(e.target.value)}
                  placeholder="Describe the responsibilities..." rows={3} maxLength={200}
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#0f172a", fontSize: "0.875rem", fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: "18px" }}>
              <button className="btn-secondary" onClick={() => { setShowAddModal(false); setNewRoleName(""); setNewRoleDesc(""); setRoleNameError(""); }}>Cancel</button>
              <button className="btn-add" onClick={handleAddRole} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <HiPlus size={14} /> Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}
