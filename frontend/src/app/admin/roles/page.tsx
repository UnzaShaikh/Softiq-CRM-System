"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import {
  listRoles,
  deleteRole,
  listAdminUsersForAssignment,
  updateAdminUser,
  type Role,
  type AdminUser,
} from "@/lib/projectSettingsApi";
import {
  getCachedRoles,
  setCachedRoles,
} from "@/data/rolesCache";
import {
  HiPlus,
  HiTrash,
  HiX,
  HiPencil,
  HiArrowLeft,
  HiShieldCheck,
  HiUserGroup,
  HiEye,
  HiSearch,
} from "react-icons/hi";
import { MdTrendingUp } from "react-icons/md";

function roleIcon(name: string): React.ReactNode {
  if (/admin/i.test(name)) {
    return <HiShieldCheck size={18} />;
  }

  if (/manager/i.test(name)) {
    return <HiUserGroup size={18} />;
  }

  if (/(sales|\brep\b)/i.test(name)) {
    return <MdTrendingUp size={18} />;
  }

  if (/view/i.test(name)) {
    return <HiEye size={18} />;
  }

  return <HiUserGroup size={18} />;
}

function countPermissions(
  perms: Record<
    string,
    {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    }
  >
) {
  return Object.values(perms).reduce(
    (acc, p) =>
      acc +
      [p.view, p.create, p.edit, p.delete].filter(Boolean).length,
    0
  );
}

export default function AdminRolesPage() {
  const router = useRouter();

  const [roles, setRoles] = useState<Role[]>([]);

  /*
   * Users for role assignment are prefetched in the background.
   * This keeps the Roles page fast while making the Assign User
   * modal open immediately when the administrator clicks it.
   */
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [backgroundRefreshing, setBackgroundRefreshing] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRole, setDeletingRole] =
    useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [assignModal, setAssignModal] =
    useState<Role | null>(null);
  const [assignUserId, setAssignUserId] =
    useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);

  /*
   * ------------------------------------------------------------
   * Load roles
   * ------------------------------------------------------------
   *
   * Cache-first strategy:
   *
   * 1. If cached roles exist, show them immediately.
   * 2. Refresh them silently in the background.
   * 3. If no cache exists, show the loader until the API responds.
   */
  const refreshRoles = useCallback(
    async (background = false) => {
      if (background) {
        setBackgroundRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const data = await listRoles();

        setRoles(data);
        setCachedRoles(data);
      } catch (err) {
        /*
         * Do not replace already-visible cached data with an
         * error state during background refresh.
         */
        if (!background) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load roles."
          );
        }
      } finally {
        if (background) {
          setBackgroundRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const cached = getCachedRoles();

    // Prefetch assignment users without blocking the roles UI.
    void listAdminUsersForAssignment().then(setUsers).catch(() => {
      // Assignment will retry through openAssignModal if prefetch fails.
    });

    if (cached && cached.length > 0) {
      /*
       * Render cached data immediately.
       */
      setRoles(cached);
      setLoading(false);

      /*
       * Refresh in background without blocking the UI.
       */
      void refreshRoles(true);

      return;
    }

    /*
     * No cache — first load from API.
     */
    void refreshRoles(false);
  }, [refreshRoles]);

  /*
   * ------------------------------------------------------------
   * Open Assign User modal
   * ------------------------------------------------------------
   *
   * Users are fetched only when the administrator actually
   * needs the assignment functionality.
   */
  async function openAssignModal(role: Role) {
    setAssignModal(role);
    setAssignUserId(null);
    setError("");

    // Prefetch normally means users are already available.
    if (users.length > 0) {
      return;
    }

    setUsersLoading(true);

    try {
      // Reuses the in-flight/cache request instead of starting another
      // sequential pagination cycle.
      const data = await listAdminUsersForAssignment();
      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load users."
      );
    } finally {
      setUsersLoading(false);
    }
  }

  /*
   * ------------------------------------------------------------
   * Delete role
   * ------------------------------------------------------------
   */
  async function handleDelete() {
    if (!deletingRole) return;

    setDeleting(true);
    setError("");

    try {
      await deleteRole(deletingRole.id);

      const updatedRoles = roles.filter(
        (role) => role.id !== deletingRole.id
      );

      setRoles(updatedRoles);
      setCachedRoles(updatedRoles);

      setShowDeleteModal(false);

      setSuccess(`"${deletingRole.name}" deleted.`);

      setDeletingRole(null);

      setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete role."
      );
    } finally {
      setDeleting(false);
    }
  }

  /*
   * ------------------------------------------------------------
   * Assign user
   * ------------------------------------------------------------
   */
  async function handleAssignUser() {
  if (!assignModal || !assignUserId) return;

  setAssigning(true);
  setError("");

  try {
    const updatedUser = await updateAdminUser(assignUserId, {
      role_id: assignModal.id,
    });

    // Update the existing user locally instead of
    // fetching the entire users list again.
    setUsers((prev) =>
      prev.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );

    setAssignModal(null);
    setAssignUserId(null);

    setSuccess("User assigned to role.");
    setTimeout(() => setSuccess(""), 4000);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to assign user."
    );
  } finally {
    setAssigning(false);
  }
}

  /*
   * ------------------------------------------------------------
   * Search
   * ------------------------------------------------------------
   */
  const filteredRoles = roles.filter((role) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      role.name.toLowerCase().includes(query) ||
      (role.description || "")
        .toLowerCase()
        .includes(query)
    );
  });

  return (
    <DashboardLayout>
      <div
        style={{
          minWidth: 0,
          overflowX: "hidden",
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 16,
            fontSize: "0.8125rem",
            color: "#94a3b8",
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/admin")}
            style={{
              background: "none",
              border: "none",
              color: "#4f46e5",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.8125rem",
              fontFamily: "inherit",
              padding: 0,
            }}
          >
            Admin Panel
          </button>

          <span style={{ color: "#cbd5e1" }}>
            &rsaquo;
          </span>

          <span style={{ color: "#374151" }}>
            Roles &amp; Permissions
          </span>
        </div>

        {/* Page Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => router.push("/admin")}
              style={{
                marginBottom: "12px",
              }}
            >
              <HiArrowLeft size={15} />
              Administration
            </button>

            <h1 className="page-title">
              Roles &amp; Permissions
            </h1>

            <p className="page-subtitle">
              Manage user roles, assign users, and control access.
            </p>
          </div>

          <Link
            href="/admin/roles/new"
            className="add-company-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
            }}
          >
            <HiPlus size={16} />
            Add Role
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div
            className="msg-error"
            style={{
              marginBottom: "16px",
            }}
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() => {
                setError("");
                void refreshRoles(false);
              }}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                fontWeight: 600,
                textDecoration: "underline",
                fontFamily: "inherit",
                fontSize: "0.8125rem",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Success */}
        {success && (
          <div
            className="msg-success"
            style={{
              marginBottom: "16px",
            }}
          >
            {success}
          </div>
        )}

        {/* Roles Table Card */}
        <div className="company-table-card">
          {/* Toolbar */}
          <div
            className="contacts-table-toolbar"
            style={{
              alignItems: "center",
            }}
          >
            <div
              className="contacts-search-wrap"
              style={{
                position: "relative",
                flex: "1 1 0",
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                display: "block",
              }}
            >
              <HiSearch
                size={18}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "476px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search roles..."
                aria-label="Search roles"
                style={{
                  width: "100%",
                  height: "54px",
                  boxSizing: "border-box",
                  display: "block",
                  padding: "0 44px 0 44px",
                  border: "1px solid #dbe3ee",
                  borderRadius: "10px",
                  background: "#ffffff",
                  color: "#0f172a",
                  fontSize: "0.875rem",
                  fontFamily: "inherit",
                  lineHeight: 1.5,
                  outline: "none",
                  boxShadow: "none",
                  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#a5b4fc";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(99, 102, 241, 0.10)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#dbe3ee";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  title="Clear search"
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "30px",
                    height: "30px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    border: "none",
                    borderRadius: "7px",
                    background: "transparent",
                    color: "#94a3b8",
                    cursor: "pointer",
                    zIndex: 2,
                  }}
                >
                  <HiX size={15} />
                </button>
              )}
            </div>

            <div className="contacts-toolbar-right">
              <span className="contacts-results-count">
                {filteredRoles.length}{" "}
                {filteredRoles.length === 1
                  ? "role"
                  : "roles"}
              </span>

              {backgroundRefreshing && (
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "#94a3b8",
                  }}
                >
                  Updating...
                </span>
              )}
            </div>
          </div>

          {/* Initial Loading */}
          {loading ? (
            <ThemeLoader
              label="Loading roles..."
              minHeight={260}
            />
          ) : (
            <div className="contacts-table-wrapper">
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Description</th>
                    <th>Users</th>
                    <th>Permissions</th>
                    <th
                      style={{
                        textAlign: "right",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRoles.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          textAlign: "center",
                          height: "220px",
                          color: "var(--muted)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#64748b",
                            }}
                          >
                            No roles found
                          </p>

                          <p
                            style={{
                              margin: 0,
                              fontSize: "13px",
                              color: "#94a3b8",
                            }}
                          >
                            Try changing your search or create
                            a new role.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRoles.map((role) => {
                      const permCount =
                        countPermissions(
                          role.permissions
                        );

                      return (
                        <tr key={role.id}>
                          {/* Role */}
                          <td>
                            <div className="contacts-name-cell">
                              <div
                                className="contacts-avatar"
                                style={{
                                  background: `${role.color}20`,
                                  color: role.color,
                                }}
                              >
                                {roleIcon(role.name)}
                              </div>

                              <div>
                                <p className="contacts-name">
                                  {role.name}

                                  {role.is_system && (
                                    <span
                                      style={{
                                        marginLeft: "6px",
                                        fontSize: "0.65rem",
                                        color: "#94a3b8",
                                        fontWeight: 400,
                                      }}
                                    >
                                      (system)
                                    </span>
                                  )}
                                </p>

                                <p className="contacts-job-title">
                                  {role.access_level ||
                                    "Custom"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Description */}
                          <td>
                            <span className="contacts-email">
                              {role.description || "\u2014"}
                            </span>
                          </td>

                          {/* Users */}
                          <td>
                            {role.users_assigned > 0 ? (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "4px 9px",
                                  borderRadius: "9999px",
                                  background:
                                    role.bg_color ||
                                    "#f1f5f9",
                                  color:
                                    role.color ||
                                    "#64748b",
                                  fontSize: "0.72rem",
                                  fontWeight: 600,
                                }}
                              >
                                <HiUserGroup size={12} />
                                {role.users_assigned}{" "}
                                {role.users_assigned === 1
                                  ? "user"
                                  : "users"}
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#94a3b8",
                                }}
                              >
                                No users
                              </span>
                            )}
                          </td>

                          {/* Permissions */}
                          <td>
                            <span className="contacts-cell-primary">
                              {permCount} permissions
                            </span>
                          </td>

                          {/* Actions */}
                          <td>
                            <div className="contacts-actions">
                              {/* Edit */}
                              <Link
                                href={`/admin/roles/${role.id}`}
                                className="contacts-action-button contacts-action-edit"
                                title="Edit Role"
                                style={{
                                  textDecoration: "none",
                                }}
                              >
                                <HiPencil size={14} />
                              </Link>

                              {/* Assign User */}
                              <button
                                type="button"
                                className="contacts-action-button contacts-action-view"
                                title="Assign User"
                                onClick={() =>
                                  void openAssignModal(role)
                                }
                              >
                                <HiUserGroup size={14} />
                              </button>

                              {/* Delete */}
                              {!role.is_system && (
                                <button
                                  type="button"
                                  className="contacts-action-button contacts-action-delete"
                                  title="Delete Role"
                                  onClick={() => {
                                    setDeletingRole(role);
                                    setShowDeleteModal(true);
                                    setError("");
                                  }}
                                >
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

      {/* ============================================================
          Delete Modal
          ============================================================ */}
      {showDeleteModal && deletingRole && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false);
              setDeletingRole(null);
            }
          }}
        >
          <div
            className="modal-box"
            style={{
              maxWidth: "400px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "18px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Delete Role
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingRole(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "4px",
                }}
              >
                <HiX size={17} />
              </button>
            </div>

            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                borderRadius: "10px",
                padding: "14px",
                marginBottom: "16px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "0.875rem",
                  color: "#991b1b",
                  fontWeight: 500,
                }}
              >
                Are you sure you want to delete{" "}
                <strong>
                  &quot;{deletingRole.name}&quot;
                </strong>
                ?
              </p>

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "0.8125rem",
                  color: "#b91c1c",
                }}
              >
                This action cannot be undone.
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingRole(null);
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 18px",
                  borderRadius: "8px",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: deleting
                    ? "not-allowed"
                    : "pointer",
                  opacity: deleting ? 0.7 : 1,
                  fontFamily: "inherit",
                }}
              >
                {deleting ? (
                  "Deleting..."
                ) : (
                  <>
                    <HiTrash size={14} />
                    Delete Role
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          Assign User Modal
          ============================================================ */}
      {assignModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setAssignModal(null);
              setAssignUserId(null);
            }
          }}
        >
          <div
            className="modal-box"
            style={{
              maxWidth: "400px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "18px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: "0 0 2px",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Assign User to Role
                </h2>

                <p
                  style={{
                    margin: 0,
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                  }}
                >
                  Assign a user to{" "}
                  <strong>{assignModal.name}</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAssignModal(null);
                  setAssignUserId(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "4px",
                }}
              >
                <HiX size={17} />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div className="form-group">
                <label className="form-label">
                  Select User
                </label>

                {usersLoading ? (
                  <div
                    style={{
                      width: "100%",
                      padding: "11px 12px",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "8px",
                      color: "#94a3b8",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  >
                    Loading users...
                  </div>
                ) : (
                  <select
                    value={assignUserId ?? ""}
                    onChange={(e) =>
                      setAssignUserId(
                        e.target.value
                          ? Number(e.target.value)
                          : null
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border:
                        "1.5px solid #e2e8f0",
                      borderRadius: "8px",
                      background: "#fff",
                      color: "#0f172a",
                      fontSize: "0.875rem",
                      fontFamily: "inherit",
                      outline: "none",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">
                      Select a user...
                    </option>

                    {users.map((user) => (
                      <option
                        key={user.id}
                        value={user.id}
                      >
                        {user.first_name ||
                        user.last_name
                          ? `${user.first_name} ${user.last_name}`.trim()
                          : user.username}{" "}
                        (@{user.username})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div
              className="modal-actions"
              style={{
                marginTop: "18px",
              }}
            >
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setAssignModal(null);
                  setAssignUserId(null);
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn-add"
                onClick={handleAssignUser}
                disabled={
                  assigning ||
                  usersLoading ||
                  !assignUserId
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {assigning
                  ? "Assigning..."
                  : "Assign User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}