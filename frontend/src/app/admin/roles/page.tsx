"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import {
  listRoles, deleteRole, listAdminUsers, updateAdminUser,
  type Role, type AdminUser,
} from "@/lib/projectSettingsApi";
import {
  HiPlus, HiTrash, HiX, HiPencil, HiArrowLeft,
  HiShieldCheck, HiUserGroup, HiEye, HiSearch, HiDotsVertical,
} from "react-icons/hi";
import { MdTrendingUp } from "react-icons/md";

function roleIcon(name: string): React.ReactNode {
  if (/admin/i.test(name)) return <HiShieldCheck size={18} />;
  if (/manager/i.test(name)) return <HiUserGroup size={18} />;
  if (/(sales|\brep\b)/i.test(name)) return <MdTrendingUp size={18} />;
  if (/view/i.test(name)) return <HiEye size={18} />;
  return <HiUserGroup size={18} />;
}

function countPermissions(perms: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>) {
  return Object.values(perms).reduce((acc, p) =>
    acc + [p.view, p.create, p.edit, p.delete].filter(Boolean).length, 0);
}

export default function AdminRolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [assignModal, setAssignModal] = useState<Role | null>(null);
  const [assignUserId, setAssignUserId] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [r, u] = await Promise.all([listRoles(), listAdminUsers()]);
      setRoles(r);
      setUsers(u);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDelete() {
    if (!deletingRole) return;
    setDeleting(true);
    try {
      await deleteRole(deletingRole.id);
      setRoles(prev => prev.filter(r => r.id !== deletingRole.id));
      setShowDeleteModal(false);
      setSuccess(`"${deletingRole.name}" deleted.`);
      setDeletingRole(null);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete role.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleAssignUser() {
    if (!assignModal || !assignUserId) return;
    setAssigning(true);
    try {
      await updateAdminUser(assignUserId, { role_id: assignModal.id });
      setAssignModal(null);
      setAssignUserId(null);
      const u = await listAdminUsers();
      setUsers(u);
      setSuccess("User assigned to role.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign user.");
    } finally {
      setAssigning(false);
    }
  }

  function getAssignedUsers(roleId: number): AdminUser[] {
    return users.filter(u => u.role && Number(u.role) === roleId);
  }

  const filteredRoles = roles.filter(r => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return r.name.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q);
  });

  return (
    <DashboardLayout>
      <div style={{ minWidth: 0, overflowX: "hidden" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: "0.8125rem", color: "#94a3b8" }}>
          <button type="button" onClick={() => router.push("/admin")} style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontWeight: 500, fontSize: "0.8125rem", fontFamily: "inherit", padding: 0 }}>
            Admin Panel
          </button>
          <span style={{ color: "#cbd5e1" }}>&rsaquo;</span>
          <span style={{ color: "#374151" }}>Roles &amp; Permissions</span>
        </div>

        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <button type="button" className="btn-secondary" onClick={() => router.push("/admin")} style={{ marginBottom: "12px" }}>
              <HiArrowLeft size={15} /> Administration
            </button>
            <h1 className="page-title">Roles &amp; Permissions</h1>
            <p className="page-subtitle">Manage user roles, assign users, and control access.</p>
          </div>
          <Link href="/admin/roles/new" className="add-company-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
            <HiPlus size={16} /> Add Role
          </Link>
        </div>

        {/* Banners */}
        {error && (
          <div className="msg-error" style={{ marginBottom: 0 }}>
            <span>{error}</span>
            <button type="button" onClick={fetchData} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: 600, textDecoration: "underline", fontFamily: "inherit", fontSize: "0.8125rem" }}>
              Retry
            </button>
          </div>
        )}
        {success && <div className="msg-success" style={{ marginBottom: "16px" }}>{success}</div>}

        {/* Roles Table Card */}
        <div className="company-table-card">
          <div className="contacts-table-toolbar">
            <div className="contacts-search-wrap">
              <HiSearch className="contacts-search-icon" size={17} />
              <input type="text" className="contacts-search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search roles..." />
              {search && (
                <button type="button" className="input-action" onClick={() => setSearch("")} aria-label="Clear search">
                  <HiX size={15} />
                </button>
              )}
            </div>
            <div className="contacts-toolbar-right">
              <span className="contacts-results-count">{filteredRoles.length} {filteredRoles.length === 1 ? "role" : "roles"}</span>
            </div>
          </div>

          {loading ? (
            <ThemeLoader label="Loading roles..." minHeight={260} />
          ) : (
            <div className="contacts-table-wrapper">
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Description</th>
                    <th>Users</th>
                    <th>Permissions</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", height: "220px", color: "var(--muted)" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                          <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#64748b" }}>No roles found</p>
                          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>Try changing your search or create a new role.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRoles.map((role) => {
                      const assigned = getAssignedUsers(role.id);
                      const permCount = countPermissions(role.permissions);
                      return (
                        <tr key={role.id}>
                          <td>
                            <div className="contacts-name-cell">
                              <div className="contacts-avatar" style={{ background: `${role.color}20`, color: role.color }}>
                                {roleIcon(role.name)}
                              </div>
                              <div>
                                <p className="contacts-name">
                                  {role.name}
                                  {role.is_system && <span style={{ marginLeft: "6px", fontSize: "0.65rem", color: "#94a3b8", fontWeight: 400 }}>(system)</span>}
                                </p>
                                <p className="contacts-job-title">{role.access_level || "Custom"}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="contacts-email">{role.description || "\u2014"}</span>
                          </td>
                          <td>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                              {assigned.length === 0 ? (
                                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>No users</span>
                              ) : (
                                assigned.slice(0, 3).map(u => (
                                  <span key={u.id} style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 8px", borderRadius: "9999px", background: role.bg_color || "#f1f5f9", color: role.color || "#64748b", fontSize: "0.68rem", fontWeight: 600 }}>
                                    {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : u.username}
                                  </span>
                                ))
                              )}
                              {assigned.length > 3 && (
                                <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 500 }}>+{assigned.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="contacts-cell-primary">{permCount} permissions</span>
                          </td>
                          <td>
                            <div className="contacts-actions">
                              <Link href={`/admin/roles/${role.id}`} className="contacts-action-button contacts-action-edit" title="Edit Role" style={{ textDecoration: "none" }}>
                                <HiPencil size={14} />
                              </Link>
                              <button type="button" className="contacts-action-button contacts-action-view" title="Assign User" onClick={() => { setAssignModal(role); setOpenMenuId(null); }}>
                                <HiUserGroup size={14} />
                              </button>
                              {!role.is_system && (
                                <button type="button" className="contacts-action-button contacts-action-delete" title="Delete Role" onClick={() => { setDeletingRole(role); setShowDeleteModal(true); }}>
                                  <HiTrash size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && deletingRole && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowDeleteModal(false); setDeletingRole(null); } }}>
          <div className="modal-box" style={{ maxWidth: "400px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Delete Role</h2>
              <button onClick={() => { setShowDeleteModal(false); setDeletingRole(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}><HiX size={17} /></button>
            </div>
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#991b1b", fontWeight: 500 }}>
                Are you sure you want to delete <strong>&quot;{deletingRole.name}&quot;</strong>?
              </p>
              <p style={{ margin: "8px 0 0", fontSize: "0.8125rem", color: "#b91c1c" }}>This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => { setShowDeleteModal(false); setDeletingRole(null); }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "8px", background: "#dc2626", color: "#fff", border: "none", fontWeight: 600, fontSize: "0.875rem", cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.7 : 1, fontFamily: "inherit" }}>
                {deleting ? "Deleting..." : <><HiTrash size={14} /> Delete Role</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      {assignModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setAssignModal(null); setAssignUserId(null); } }}>
          <div className="modal-box" style={{ maxWidth: "400px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div>
                <h2 style={{ margin: "0 0 2px", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Assign User to Role</h2>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>Assign a user to <strong>{assignModal.name}</strong>.</p>
              </div>
              <button onClick={() => { setAssignModal(null); setAssignUserId(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}><HiX size={17} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Select User</label>
                <select value={assignUserId ?? ""} onChange={e => setAssignUserId(e.target.value ? Number(e.target.value) : null)} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#0f172a", fontSize: "0.875rem", fontFamily: "inherit", outline: "none", cursor: "pointer", boxSizing: "border-box" }}>
                  <option value="">Select a user...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : u.username} (@{u.username})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: "18px" }}>
              <button className="btn-secondary" onClick={() => { setAssignModal(null); setAssignUserId(null); }}>Cancel</button>
              <button className="btn-add" onClick={handleAssignUser} disabled={assigning || !assignUserId} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                {assigning ? "Assigning..." : "Assign User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
