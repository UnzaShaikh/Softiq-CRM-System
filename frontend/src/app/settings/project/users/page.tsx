"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import SettingsNav from "@/components/project-settings/SettingsNav";
import Link from "next/link";
import {
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  type AdminUser,
} from "@/lib/projectSettingsApi";
import {
  HiPlus, HiPencil, HiTrash, HiX, HiSearch, HiCheckCircle, HiXCircle,
} from "react-icons/hi";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function initials(u: AdminUser): string {
  const f = u.first_name?.[0] ?? "";
  const l = u.last_name?.[0] ?? "";
  return (f + l).toUpperCase() || (u.username[0]?.toUpperCase() ?? "?");
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  // Form state
  const [form, setForm] = useState({ username: "", email: "", first_name: "", last_name: "", password: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const params: { search?: string; is_active?: string } = {};
      if (search) params.search = search;
      if (filter === "active") params.is_active = "true";
      if (filter === "inactive") params.is_active = "false";
      const data = await listAdminUsers(params);
      setUsers(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Close menus on outside click
  useEffect(() => {
    const handler = () => {};
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // ── Create ──
  function openCreate() {
    setForm({ username: "", email: "", first_name: "", last_name: "", password: "" });
    setFormError("");
    setShowCreateModal(true);
  }

  async function handleCreate() {
    if (!form.username.trim()) { setFormError("Username is required."); return; }
    if (!form.email.trim()) { setFormError("Email is required."); return; }
    if (!form.password || form.password.length < 8) { setFormError("Password must be at least 8 characters."); return; }
    setSaving(true); setFormError("");
    try {
      const created = await createAdminUser({
        username: form.username.trim(),
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        password: form.password,
      });
      setUsers(prev => [created, ...prev]);
      setShowCreateModal(false);
      setSuccess(`User "${created.username}" created.`);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setSaving(false);
    }
  }

  // ── Edit ──
  function openEdit(user: AdminUser) {
    setEditingUser(user);
    setForm({ username: user.username, email: user.email, first_name: user.first_name ?? "", last_name: user.last_name ?? "", password: "" });
    setFormError("");
    setShowEditModal(true);
  }

  async function handleEdit() {
    if (!editingUser) return;
    if (!form.username.trim()) { setFormError("Username is required."); return; }
    if (!form.email.trim()) { setFormError("Email is required."); return; }
    setSaving(true); setFormError("");
    try {
      const payload: Record<string, unknown> = {
        username: form.username.trim(),
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
      };
      if (form.password) payload.password = form.password;
      const updated = await updateAdminUser(editingUser.id, payload);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      setShowEditModal(false);
      setEditingUser(null);
      setSuccess(`User "${updated.username}" updated.`);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update user.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ──
  function confirmDelete(user: AdminUser) {
    setDeletingUser(user);
    setShowDeleteModal(true);
  }

  async function handleDelete() {
    if (!deletingUser) return;
    setDeleting(true);
    try {
      await deleteAdminUser(deletingUser.id);
      setUsers(prev => prev.filter(u => u.id !== deletingUser.id));
      setShowDeleteModal(false);
      setSuccess(`User "${deletingUser.username}" deleted.`);
      setDeletingUser(null);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  }

  // ── Toggle active ──
  async function toggleActive(user: AdminUser) {
    try {
      const updated = await updateAdminUser(user.id, { is_active: !user.is_active });
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to update user.");
    }
  }

  const activeCount = users.filter(u => u.is_active).length;
  const inactiveCount = users.length - activeCount;

  return (
    <DashboardLayout>
      <div style={{ minWidth: 0, overflowX: "hidden" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: "0.8125rem", color: "#94a3b8" }}>
          <Link href="/settings/project" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}>Project Settings</Link>
          <span style={{ color: "#cbd5e1" }}>›</span>
          <span style={{ color: "#374151" }}>User Management</span>
        </div>

        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">Create, edit, and manage user accounts.</p>
          </div>
          <button onClick={openCreate} className="btn-add" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <HiPlus size={15} /> Add User
          </button>
        </div>

        {/* Banners */}
        {loadError && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", fontSize: "0.8125rem", color: "#b91c1c" }}>
            ❌ {loadError}{" "}
            <button onClick={fetchUsers} style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontWeight: 600, textDecoration: "underline", fontFamily: "inherit", fontSize: "0.8125rem" }}>Retry</button>
          </div>
        )}
        {success && <div className="msg-success" style={{ marginBottom: "16px" }}>✅ {success}</div>}

        {/* 3-col layout */}
        <div style={{ display: "grid", gridTemplateColumns: "200px minmax(0,1fr)", gap: "14px", alignItems: "start" }}>

          <SettingsNav />

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", minWidth: 0 }}>

            {/* Card Header + Stats */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                  <h2 style={{ margin: "0 0 2px", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Users</h2>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>{users.length} total users</p>
                </div>
                <div style={{ display: "flex", gap: "16px", fontSize: "0.75rem" }}>
                  <span style={{ color: "#16a34a", fontWeight: 600 }}>{activeCount} active</span>
                  <span style={{ color: "#dc2626", fontWeight: 600 }}>{inactiveCount} inactive</span>
                </div>
              </div>

              {/* Search + Filter */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <HiSearch size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
                    style={{ width: "100%", padding: "8px 10px 8px 32px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", fontSize: "0.8125rem", fontFamily: "inherit", outline: "none" }} />
                </div>
                <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)}
                  style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "0.8125rem", fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <ThemeLoader label="Loading users..." minHeight={260} />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "inherit" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["USER", "EMAIL", "STATUS", "JOINED", ""].map((h, i) => (
                      <th key={i} style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>No users found.</td></tr>
                  ) : users.map((u, idx) => (
                    <tr key={u.id}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#fafafa"}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                      style={{ borderBottom: idx === users.length - 1 ? "none" : "1px solid #f1f5f9", transition: "background 0.1s" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: u.is_active ? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: u.is_active ? "#fff" : "#94a3b8", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0 }}>
                            {initials(u)}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>
                              {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : u.username}
                            </p>
                            <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "0.8125rem", color: "#64748b" }}>{u.email}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <button onClick={() => toggleActive(u)} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "9999px", border: "none", cursor: "pointer", fontSize: "0.72rem", fontWeight: 600, fontFamily: "inherit", background: u.is_active ? "#dcfce7" : "#fee2e2", color: u.is_active ? "#16a34a" : "#dc2626" }}>
                          {u.is_active ? <><HiCheckCircle size={12} /> Active</> : <><HiXCircle size={12} /> Inactive</>}
                        </button>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "0.8125rem", color: "#64748b" }}>{formatDate(u.date_joined)}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button onClick={() => openEdit(u)} style={{ width: 30, height: 30, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", borderRadius: "6px" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
                            onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                            <HiPencil size={14} />
                          </button>
                          <button onClick={() => confirmDelete(u)} style={{ width: 30, height: 30, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", borderRadius: "6px" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                            onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                            <HiTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ── Create User Modal ── */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
          <div className="modal-box" style={{ maxWidth: "440px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div>
                <h2 style={{ margin: "0 0 2px", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Add New User</h2>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>Create a new user account.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}><HiX size={17} /></button>
            </div>
            {formError && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "8px 12px", marginBottom: "14px", fontSize: "0.8125rem", color: "#b91c1c" }}>{formError}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="John"
                    style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "0.875rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Doe"
                    style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "0.875rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Username <span style={{ color: "#dc2626" }}>*</span></label>
                <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="johndoe"
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "0.875rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div className="form-group">
                <label className="form-label">Email <span style={{ color: "#dc2626" }}>*</span></label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com"
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "0.875rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div className="form-group">
                <label className="form-label">Password <span style={{ color: "#dc2626" }}>*</span></label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters"
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "0.875rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: "18px" }}>
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn-add" onClick={handleCreate} disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                {saving ? "Creating..." : <><HiPlus size={14} /> Create User</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowEditModal(false); setEditingUser(null); } }}>
          <div className="modal-box" style={{ maxWidth: "440px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div>
                <h2 style={{ margin: "0 0 2px", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Edit User</h2>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>Update user account details.</p>
              </div>
              <button onClick={() => { setShowEditModal(false); setEditingUser(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}><HiX size={17} /></button>
            </div>
            {formError && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "8px 12px", marginBottom: "14px", fontSize: "0.8125rem", color: "#b91c1c" }}>{formError}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "0.875rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "0.875rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Username <span style={{ color: "#dc2626" }}>*</span></label>
                <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "0.875rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div className="form-group">
                <label className="form-label">Email <span style={{ color: "#dc2626" }}>*</span></label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "0.875rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password <span style={{ color: "#94a3b8", fontWeight: 400 }}>(leave blank to keep current)</span></label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters"
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "0.875rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: "18px" }}>
              <button className="btn-secondary" onClick={() => { setShowEditModal(false); setEditingUser(null); }}>Cancel</button>
              <button className="btn-add" onClick={handleEdit} disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                {saving ? "Saving..." : <><HiPencil size={14} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete User Confirmation ── */}
      {showDeleteModal && deletingUser && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowDeleteModal(false); setDeletingUser(null); } }}>
          <div className="modal-box" style={{ maxWidth: "400px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Delete User</h2>
              <button onClick={() => { setShowDeleteModal(false); setDeletingUser(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}><HiX size={17} /></button>
            </div>
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#991b1b", fontWeight: 500 }}>
                Are you sure you want to delete <strong>&quot;{deletingUser.username}&quot;</strong>?
              </p>
              <p style={{ margin: "8px 0 0", fontSize: "0.8125rem", color: "#b91c1c" }}>
                This action cannot be undone. All their data will be permanently removed.
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => { setShowDeleteModal(false); setDeletingUser(null); }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "8px", background: "#dc2626", color: "#fff", border: "none", fontWeight: 600, fontSize: "0.875rem", cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.7 : 1, fontFamily: "inherit" }}>
                {deleting ? "Deleting..." : <><HiTrash size={14} /> Delete User</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
