"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import {
  listAdminUsers,
  deleteAdminUser,
  updateAdminUser,
  listRoles,
  type AdminUser,
  type Role,
} from "@/lib/projectSettingsApi";
import {
  HiPlus, HiTrash, HiX, HiSearch, HiCheckCircle, HiXCircle,
  HiPencil, HiArrowLeft,
} from "react-icons/hi";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function initials(u: AdminUser): string {
  const f = u.first_name?.[0] ?? "";
  const l = u.last_name?.[0] ?? "";
  return (f + l).toUpperCase() || (u.username[0]?.toUpperCase() ?? "?");
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [success, setSuccess] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [assignModalUser, setAssignModalUser] = useState<AdminUser | null>(null);
  const [assignRoleId, setAssignRoleId] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const params: { search?: string; is_active?: string } = {};
      if (search) params.search = search;
      if (filter === "active") params.is_active = "true";
      if (filter === "inactive") params.is_active = "false";
      const [userData, roleData] = await Promise.all([
        listAdminUsers(params),
        listRoles(),
      ]);
      setUsers(userData);
      setRoles(roleData);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

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

  async function toggleActive(user: AdminUser) {
    try {
      const updated = await updateAdminUser(user.id, { is_active: !user.is_active });
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to update user.");
    }
  }

  function openAssignRole(user: AdminUser) {
    setAssignModalUser(user);
    const currentRoleId = user.role ? Number(user.role) : null;
    setAssignRoleId(currentRoleId);
    setAssignModalUser(user);
  }

  async function handleAssignRole() {
    if (!assignModalUser) return;
    setAssigning(true);
    try {
      const updated = await updateAdminUser(assignModalUser.id, { role_id: assignRoleId });
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      setAssignModalUser(null);
      setSuccess(`Role assigned to "${updated.username}".`);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to assign role.");
    } finally {
      setAssigning(false);
    }
  }

  function getRoleName(roleId: string): string {
    if (!roleId) return "No Role";
    const role = roles.find(r => r.id === Number(roleId));
    return role?.name ?? `Role #${roleId}`;
  }

  function getRoleColor(roleId: string): string {
    if (!roleId) return "#94a3b8";
    const role = roles.find(r => r.id === Number(roleId));
    return role?.color ?? "#94a3b8";
  }

  function getRoleBgColor(roleId: string): string {
    if (!roleId) return "#f1f5f9";
    const role = roles.find(r => r.id === Number(roleId));
    return role?.bg_color ?? "#f1f5f9";
  }

  const activeCount = users.filter(u => u.is_active).length;
  const inactiveCount = users.length - activeCount;

  return (
    <DashboardLayout>
      <div style={{ minWidth: 0, overflowX: "hidden" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: "0.8125rem", color: "#94a3b8" }}>
          <button type="button" onClick={() => router.push("/admin")} style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontWeight: 500, fontSize: "0.8125rem", fontFamily: "inherit", padding: 0 }}>
            Admin Panel
          </button>
          <span style={{ color: "#cbd5e1" }}>&rsaquo;</span>
          <span style={{ color: "#374151" }}>User Management</span>
        </div>

        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <button type="button" className="btn-secondary" onClick={() => router.push("/admin")} style={{ marginBottom: "12px" }}>
              <HiArrowLeft size={15} /> Administration
            </button>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">Create, edit, and manage user accounts and role assignments.</p>
          </div>
          <Link href="/admin/users/new" className="add-company-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
            <HiPlus size={16} /> Add User
          </Link>
        </div>

        {/* Banners */}
        {loadError && (
          <div className="msg-error" style={{ marginBottom: 0 }}>
            <span>{loadError}</span>
            <button type="button" onClick={fetchUsers} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: 600, textDecoration: "underline", fontFamily: "inherit", fontSize: "0.8125rem" }}>
              Retry
            </button>
          </div>
        )}
        {success && <div className="msg-success" style={{ marginBottom: "16px" }}>{success}</div>}

        {/* Users Table Card */}
        <div className="company-table-card">
          <div className="contacts-table-toolbar">
            <div className="contacts-search-wrap">
              <HiSearch className="contacts-search-icon" size={17} />
              <input type="text" className="contacts-search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." />
              {search && (
                <button type="button" className="input-action" onClick={() => setSearch("")} aria-label="Clear search">
                  <HiX size={15} />
                </button>
              )}
            </div>
            <div className="contacts-toolbar-right">
              <span className="contacts-results-count">{users.length} {users.length === 1 ? "user" : "users"}</span>
              <div className="contacts-filter-tabs">
                <button type="button" className={`contacts-filter-tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
                <button type="button" className={`contacts-filter-tab ${filter === "active" ? "active" : ""}`} onClick={() => setFilter("active")}>Active ({activeCount})</button>
                <button type="button" className={`contacts-filter-tab ${filter === "inactive" ? "active" : ""}`} onClick={() => setFilter("inactive")}>Inactive ({inactiveCount})</button>
              </div>
            </div>
          </div>

          {loading ? (
            <ThemeLoader label="Loading users..." minHeight={260} />
          ) : (
            <div className="contacts-table-wrapper">
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", height: "220px", color: "var(--muted)" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                          <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#64748b" }}>No users found</p>
                          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>Try changing your search or filter.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="contacts-name-cell">
                            <div className="contacts-avatar" style={{ background: u.is_active ? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" : "#e2e8f0", color: u.is_active ? "#fff" : "#94a3b8" }}>
                              {initials(u)}
                            </div>
                            <div>
                              <p className="contacts-name">{u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : u.username}</p>
                              <p className="contacts-job-title">@{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td><span className="contacts-email">{u.email || "\u2014"}</span></td>
                        <td>
                          <button
                            onClick={() => openAssignRole(u)}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: "5px",
                              padding: "4px 10px", borderRadius: "9999px", border: "none",
                              cursor: "pointer", fontSize: "0.72rem", fontWeight: 600,
                              fontFamily: "inherit", background: getRoleBgColor(u.role), color: getRoleColor(u.role),
                            }}
                          >
                            {getRoleName(u.role)}
                          </button>
                        </td>
                        <td>
                          <button onClick={() => toggleActive(u)} className={`contacts-status ${u.is_active ? "contacts-status-active" : "contacts-status-inactive"}`} style={{ border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}>
                            <span className="contacts-status-dot" />
                            {u.is_active ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td><span className="contacts-cell-primary">{formatDate(u.date_joined)}</span></td>
                        <td>
                          <div className="contacts-actions">
                            <Link href={`/admin/users/${u.id}`} className="contacts-action-button contacts-action-edit" title="Edit User" style={{ textDecoration: "none" }}>
                              <HiPencil size={14} />
                            </Link>
                            <button type="button" className="contacts-action-button contacts-action-delete" title="Delete User" onClick={() => { setDeletingUser(u); setShowDeleteModal(true); }}>
                              <HiTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete User Confirmation */}
      {showDeleteModal && deletingUser && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowDeleteModal(false); setDeletingUser(null); } }}>
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

      {/* Assign Role Modal */}
      {assignModalUser && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setAssignModalUser(null); }}>
          <div className="modal-box" style={{ maxWidth: "400px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div>
                <h2 style={{ margin: "0 0 2px", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Assign Role</h2>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>Assign a role to {assignModalUser.username}.</p>
              </div>
              <button onClick={() => setAssignModalUser(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}><HiX size={17} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  value={assignRoleId ?? ""}
                  onChange={(e) => setAssignRoleId(e.target.value ? Number(e.target.value) : null)}
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#0f172a", fontSize: "0.875rem", fontFamily: "inherit", outline: "none", cursor: "pointer", boxSizing: "border-box" }}
                >
                  <option value="">No Role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: "18px" }}>
              <button className="btn-secondary" onClick={() => setAssignModalUser(null)}>Cancel</button>
              <button className="btn-add" onClick={handleAssignRole} disabled={assigning} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                {assigning ? "Saving..." : "Save Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
