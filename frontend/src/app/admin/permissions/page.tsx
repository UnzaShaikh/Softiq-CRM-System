"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import {
  listRoles,
  updateRole,
  type Role,
  type RolePermissions,
  type PermissionAction,
} from "@/lib/projectSettingsApi";
import { HiArrowLeft, HiSave } from "react-icons/hi";
import {
  MdDashboard,
  MdPeople,
  MdContacts,
  MdLeaderboard,
  MdTrendingUp,
  MdHandshake,
  MdCalendarToday,
  MdBusiness,
  MdBarChart,
  MdSettings,
  MdStickyNote2,
  MdFollowTheSigns,
  MdTaskAlt,
  MdMail,
} from "react-icons/md";

const CRM_MODULES = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <MdDashboard size={15} />,
  },
  {
    key: "customers",
    label: "Customers",
    icon: <MdPeople size={15} />,
  },
  {
    key: "contacts",
    label: "Contacts",
    icon: <MdContacts size={15} />,
  },
  {
    key: "leads",
    label: "Leads",
    icon: <MdLeaderboard size={15} />,
  },
  {
    key: "opportunities",
    label: "Opportunities",
    icon: <MdTrendingUp size={15} />,
  },
  {
    key: "deals",
    label: "Sales Pipeline",
    icon: <MdHandshake size={15} />,
  },
  {
    key: "activities",
    label: "Activities",
    icon: <MdCalendarToday size={15} />,
  },
  {
    key: "companies",
    label: "Companies",
    icon: <MdBusiness size={15} />,
  },
  {
    key: "notes",
    label: "Notes",
    icon: <MdStickyNote2 size={15} />,
  },
  {
    key: "followups",
    label: "Follow-ups",
    icon: <MdFollowTheSigns size={15} />,
  },
  {
    key: "tasks",
    label: "Tasks",
    icon: <MdTaskAlt size={15} />,
  },
  {
    key: "email_templates",
    label: "Email Templates",
    icon: <MdMail size={15} />,
  },
  {
    key: "reports",
    label: "Reports",
    icon: <MdBarChart size={15} />,
  },
  {
    key: "settings",
    label: "Settings",
    icon: <MdSettings size={15} />,
  },
];

const PERM_TYPES: {
  key: PermissionAction;
  label: string;
  color: string;
  bg: string;
}[] = [
  {
    key: "view",
    label: "View",
    color: "#4f46e5",
    bg: "#eef2ff",
  },
  {
    key: "create",
    label: "Create",
    color: "#16a34a",
    bg: "#f0fdf4",
  },
  {
    key: "edit",
    label: "Edit",
    color: "#d97706",
    bg: "#fff7ed",
  },
  {
    key: "delete",
    label: "Delete",
    color: "#dc2626",
    bg: "#fef2f2",
  },
];

const EMPTY_PERMISSIONS = {
  view: false,
  create: false,
  edit: false,
  delete: false,
};

function clonePermissions(
  permissions: RolePermissions | undefined
): RolePermissions {
  if (!permissions) {
    return {};
  }

  const cloned: RolePermissions = {};

  Object.entries(permissions).forEach(([module, values]) => {
    cloned[module] = {
      view: values?.view ?? false,
      create: values?.create ?? false,
      edit: values?.edit ?? false,
      delete: values?.delete ?? false,
    };
  });

  return cloned;
}

function PermCheckbox({
  checked,
  color,
  label,
  onChange,
}: {
  checked: boolean;
  color: string;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`${label} permission ${checked ? "enabled" : "disabled"}`}
      aria-pressed={checked}
      title={`${label}: ${checked ? "Enabled" : "Disabled"}`}
      onClick={onChange}
      style={{
        width: 18,
        height: 18,
        borderRadius: "4px",
        border: `1.5px solid ${checked ? color : "#e2e8f0"}`,
        cursor: "pointer",
        padding: 0,
        background: checked ? color : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
    >
      {checked && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

export default function AdminPermissionsPage() {
  const router = useRouter();

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<
    Record<number, RolePermissions>
  >({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirtyIds, setDirtyIds] = useState<Set<number>>(new Set());

  const mountedRef = useRef(true);
  const initialLoadRef = useRef(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (saving) return;

    const hasExistingData = roles.length > 0;

    if (hasExistingData) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await listRoles();

      if (!mountedRef.current) return;

      const permMap: Record<number, RolePermissions> = {};

      data.forEach((role) => {
        permMap[role.id] = clonePermissions(role.permissions);
      });

      setRoles(data);
      setPermissions(permMap);
      setDirtyIds(new Set());
    } catch (err) {
      if (!mountedRef.current) return;

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load permissions."
      );
    } finally {
      if (!mountedRef.current) return;

      setLoading(false);
      setRefreshing(false);
    }
  }, [roles.length, saving]);

  useEffect(() => {
    if (initialLoadRef.current) return;

    initialLoadRef.current = true;
    fetchData();
  }, [fetchData]);

  function togglePerm(
    roleId: number,
    module: string,
    perm: PermissionAction
  ) {
    if (saving) return;

    setPermissions((prev) => {
      const currentRolePermissions = prev[roleId] ?? {};
      const currentModulePermissions =
        currentRolePermissions[module] ?? EMPTY_PERMISSIONS;

      const updatedModulePermissions = {
        view: currentModulePermissions.view ?? false,
        create: currentModulePermissions.create ?? false,
        edit: currentModulePermissions.edit ?? false,
        delete: currentModulePermissions.delete ?? false,
      };

      updatedModulePermissions[perm] =
        !updatedModulePermissions[perm];

      return {
        ...prev,
        [roleId]: {
          ...currentRolePermissions,
          [module]: updatedModulePermissions,
        },
      };
    });

    setDirtyIds((prev) => {
      if (prev.has(roleId)) {
        return prev;
      }

      const next = new Set(prev);
      next.add(roleId);
      return next;
    });

    setSuccess("");
  }

  async function handleSave() {
    if (saving || dirtyIds.size === 0) return;

    setSaving(true);
    setError("");
    setSuccess("");

    const idsToSave = Array.from(dirtyIds);

    try {
      await Promise.all(
        idsToSave.map((id) =>
          updateRole(id, {
            permissions: permissions[id],
          })
        )
      );

      if (!mountedRef.current) return;

      setDirtyIds(new Set());
      setSuccess("Permissions saved successfully.");

      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }

      successTimerRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setSuccess("");
        }
      }, 4000);
    } catch (err) {
      if (!mountedRef.current) return;

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save permissions."
      );
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }

  const thS: React.CSSProperties = {
    padding: "10px 14px",
    textAlign: "left",
    fontSize: "0.7rem",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  };

  const tdS: React.CSSProperties = {
    padding: "10px 14px",
    fontSize: "0.8rem",
    color: "#374151",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle",
  };

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

          <span style={{ color: "#cbd5e1" }}>&rsaquo;</span>

          <span style={{ color: "#374151" }}>
            Permissions
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
              Permissions Editor
            </h1>

            <p className="page-subtitle">
              Edit permissions for all roles in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={
              saving || dirtyIds.size === 0
            }
            className="btn-add"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              opacity:
                dirtyIds.size === 0 ? 0.6 : 1,
              cursor:
                dirtyIds.size === 0
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {saving ? (
              "Saving..."
            ) : (
              <>
                <HiSave size={15} />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            className="msg-error"
            style={{
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <span>{error}</span>

            {roles.length === 0 && (
              <button
                type="button"
                onClick={fetchData}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "#dc2626",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Retry
              </button>
            )}
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

        {/* Unsaved Changes */}
        {dirtyIds.size > 0 && !success && (
          <div
            style={{
              background: "#fef3c7",
              border: "1px solid #fde68a",
              borderRadius: "8px",
              padding: "10px 16px",
              marginBottom: "16px",
              fontSize: "0.8125rem",
              color: "#b45309",
              fontWeight: 500,
            }}
          >
            You have unsaved permission changes. Click
            &quot;Save Changes&quot; to apply.
          </div>
        )}

        {/* Initial Loading */}
        {loading && roles.length === 0 ? (
          <ThemeLoader
            label="Loading permissions..."
            minHeight={300}
          />
        ) : (
          <>
            {/* Permissions Matrix */}
            <div
              className="company-table-card"
              style={{
                position: "relative",
              }}
            >
              {/* Refreshing Overlay */}
              {refreshing && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    overflow: "hidden",
                    borderRadius: "10px 10px 0 0",
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      width: "35%",
                      height: "100%",
                      background: "#4f46e5",
                      animation:
                        "permissionsLoading 1.2s ease-in-out infinite",
                    }}
                  />
                </div>
              )}

              <div className="contacts-table-toolbar">
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Permissions Matrix
                  </h2>

                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "0.78rem",
                      color: "#94a3b8",
                    }}
                  >
                    {roles.length} roles &middot; Toggle
                    permissions by clicking checkboxes
                  </p>
                </div>
              </div>

              <div className="contacts-table-wrapper">
                <table className="contacts-table">
                  <thead>
                    <tr>
                      <th style={thS}>Module</th>

                      {roles.map((role) => (
                        <th
                          key={role.id}
                          style={{
                            ...thS,
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "2px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                              }}
                            >
                              {role.name}
                            </span>

                            {role.is_system && (
                              <span
                                style={{
                                  fontSize: "0.6rem",
                                  color: "#94a3b8",
                                  fontWeight: 400,
                                }}
                              >
                                (system)
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {CRM_MODULES.map((mod) => (
                      <tr key={mod.key}>
                        <td style={tdS}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                color: "#94a3b8",
                              }}
                            >
                              {mod.icon}
                            </span>

                            <span
                              style={{
                                fontWeight: 500,
                              }}
                            >
                              {mod.label}
                            </span>
                          </div>
                        </td>

                        {roles.map((role) => {
                          const p =
                            permissions[role.id]?.[
                              mod.key
                            ] ?? EMPTY_PERMISSIONS;

                          return (
                            <td
                              key={role.id}
                              style={{
                                ...tdS,
                                textAlign: "center",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  gap: "4px",
                                  justifyContent:
                                    "center",
                                }}
                              >
                                {PERM_TYPES.map(
                                  (perm) => (
                                    <PermCheckbox
                                      key={perm.key}
                                      checked={
                                        Boolean(
                                          p[perm.key]
                                        )
                                      }
                                      color={perm.color}
                                      label={`${role.name} ${mod.label} ${perm.label}`}
                                      onChange={() =>
                                        togglePerm(
                                          role.id,
                                          mod.key,
                                          perm.key
                                        )
                                      }
                                    />
                                  )
                                )}
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

            {/* Legend */}
            <div
              style={{
                marginTop: "16px",
                padding: "14px 18px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#64748b",
                }}
              >
                Legend:
              </span>

              {PERM_TYPES.map((permission) => (
                <span
                  key={permission.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "0.75rem",
                    color: "#64748b",
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "3px",
                      background: permission.color,
                      display: "inline-block",
                    }}
                  />

                  {permission.label}
                </span>
              ))}

              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "0.75rem",
                  color: "#64748b",
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "3px",
                    background: "#e2e8f0",
                    display: "inline-block",
                  }}
                />

                No access
              </span>
            </div>
          </>
        )}


      </div>
    </DashboardLayout>
  );
}