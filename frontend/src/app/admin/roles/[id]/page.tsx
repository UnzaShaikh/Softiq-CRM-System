"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import FormField from "@/components/customers/FormField";
import { retrieveRole, updateRole, deleteRole, type Role, type RolePermissions, type PermissionAction } from "@/lib/projectSettingsApi";
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

const PERM_COLS: { key: PermissionAction; label: string; color: string }[] = [
  { key: "view", label: "View", color: "#4f46e5" },
  { key: "create", label: "Create", color: "#16a34a" },
  { key: "edit", label: "Edit", color: "#d97706" },
  { key: "delete", label: "Delete", color: "#dc2626" },
];

const ACCESS_LEVELS = [
  { label: "Full System Access", value: "full" },
  { label: "Manage Team and Data", value: "team" },
  { label: "Sales Access", value: "sales" },
  { label: "View Only", value: "view" },
  { label: "Custom Access", value: "custom" },
];

function PermCheckbox({ checked, color, onChange }: { checked: boolean; color: string; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} style={{
      width: 18, height: 18, borderRadius: "4px",
      border: `1.5px solid ${checked ? color : "#e2e8f0"}`,
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

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = Number(params.id);

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({ name: "", description: "", access_level: "custom" });
  const [permissions, setPermissions] = useState<RolePermissions>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await retrieveRole(roleId);
      setRole(r);
      setForm({ name: r.name, description: r.description || "", access_level: r.access_level });
      setPermissions(JSON.parse(JSON.stringify(r.permissions)));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to load role.");
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  }

  function togglePerm(module: string, perm: PermissionAction) {
    setPermissions(prev => {
      const cur = prev[module] ?? {};
      return {
        ...prev,
        [module]: { view: cur.view ?? false, create: cur.create ?? false, edit: cur.edit ?? false, delete: cur.delete ?? false, [perm]: !(cur[perm] ?? false) },
      };
    });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Role name is required";
    else if (form.name.trim().length > 50) e.name = "Max 50 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setSaving(true);
    try {
      await updateRole(roleId, {
        name: form.name.trim(),
        description: form.description.trim(),
        access_level: form.access_level,
        permissions,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to update role.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteRole(roleId);
      router.push("/admin/roles");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to delete role.");
      setDeleting(false);
    }
  }

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
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Page Header */}
        <div>
          <button className="back-btn" onClick={() => router.push("/admin/roles")} style={{ marginBottom: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Roles
          </button>
          <h1 className="page-title">Edit Role</h1>
          <p className="page-subtitle">Update role details and module permissions.</p>
        </div>

        {success && (
          <div className="msg-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            Role updated successfully!
          </div>
        )}
        {submitError && (
          <div className="msg-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            {submitError}
          </div>
        )}

        {loading ? (
          <ThemeLoader label="Loading role..." minHeight={300} />
        ) : role ? (
          <form onSubmit={handleSubmit} noValidate>
            {/* Role Details Card */}
            <div className="company-form-card">
              <div className="form-section">
                <div className="form-section-header">
                  <h2>Role Information</h2>
                  <p>Update role details below.</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <FormField label="Role Name" name="name" value={form.name} onChange={handleChange} error={errors.name} required />
                  <FormField label="Description" name="description" type="textarea" value={form.description} onChange={handleChange} error={errors.description} placeholder="Describe the responsibilities..." />
                  <FormField label="Access Level" name="access_level" type="select" value={form.access_level} onChange={handleChange} options={ACCESS_LEVELS} />
                </div>
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button type="button" className="btn-danger" onClick={() => setShowDeleteModal(true)} disabled={saving || deleting}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  Delete Role
                </button>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" className="btn-secondary" onClick={() => router.push("/admin/roles")} disabled={saving}>Cancel</button>
                  <button type="submit" className="btn-add" disabled={saving || success}>
                    {saving ? (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Saving...</>
                    ) : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>

            {/* Permissions Card */}
            <div className="company-form-card" style={{ marginTop: "20px" }}>
              <div className="form-section">
                <div className="form-section-header">
                  <h2>Module Permissions</h2>
                  <p>Control what this role can do for each CRM module.</p>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "inherit", tableLayout: "fixed", minWidth: "400px" }}>
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
                          <tr key={mod.key}>
                            <td style={cell}>
                              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                <span style={{ color: "#94a3b8" }}>{mod.icon}</span>
                                <span style={{ fontWeight: 500, fontSize: "0.8rem" }}>{mod.label}</span>
                              </div>
                            </td>
                            {PERM_COLS.map(p => (
                              <td key={p.key} style={{ ...cell, textAlign: "center" }}>
                                <div style={{ display: "flex", justifyContent: "center" }}>
                                  <PermCheckbox checked={permissions[mod.key]?.[p.key] ?? false} color={p.color} onChange={() => togglePerm(mod.key, p.key)} />
                                </div>
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: "14px", padding: "10px 14px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span style={{ fontSize: "0.8rem", color: "#0369a1" }}>Permission changes are applied when you save.</span>
                </div>
              </div>
            </div>
          </form>
        ) : null}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div className="modal-box" style={{ maxWidth: "400px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Delete Role</h2>
              <button onClick={() => setShowDeleteModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="msg-error" style={{ marginBottom: "16px" }}>
              <p style={{ margin: 0, fontWeight: 500 }}>Are you sure you want to delete <strong>&quot;{role?.name}&quot;</strong>?</p>
              <p style={{ margin: "6px 0 0", fontSize: "0.8125rem" }}>This action cannot be undone.</p>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
