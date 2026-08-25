"use client";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
    Users,
    UserCheck,
    UserX,
    ShieldCheck,
    KeyRound,
    Activity,
    ArrowRight,
    UserPlus,
} from "lucide-react";

const STAT_CARDS = [
    {
        label: "Total Users",
        value: "12",
        change: "Registered users",
        icon: <Users size={18} />,
        color: "#4f46e5",
    },
    {
        label: "Active Users",
        value: "10",
        change: "Currently active",
        icon: <UserCheck size={18} />,
        color: "#15803d",
    },
    {
        label: "Inactive Users",
        value: "2",
        change: "Disabled accounts",
        icon: <UserX size={18} />,
        color: "#64748b",
    },
    {
        label: "Total Roles",
        value: "4",
        change: "Configured roles",
        icon: <ShieldCheck size={18} />,
        color: "#7c3aed",
    },
];

function hexToRgba(hex: string, alpha: number) {
    const value = hex.replace("#", "");

    const r = parseInt(value.substring(0, 2), 16);
    const g = parseInt(value.substring(2, 4), 16);
    const b = parseInt(value.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function AdminPage() {
    return (
        <DashboardLayout>
            <div className="page-wrapper">
                {/* Page Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Admin Panel</h1>

                        <p className="page-subtitle">
                            Manage users, roles and system permissions.
                        </p>
                    </div>
                </div>

                {/* Statistics */}
                <div className="dashboard-stats-grid">
                    {STAT_CARDS.map((card) => (
                        <div
                            key={card.label}
                            className="stat-card-dashboard"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow =
                                    "0 6px 24px rgba(0,0,0,0.08)";
                                e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow =
                                    "0 1px 4px rgba(0,0,0,0.05)";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            <div
                                className="stat-card-dashboard-icon"
                                style={{
                                    background: hexToRgba(card.color, 0.1),
                                    color: card.color,
                                }}
                            >
                                {card.icon}
                            </div>

                            <div className="stat-card-dashboard-content">
                                <p className="stat-card-dashboard-label">
                                    {card.label}
                                </p>

                                <p className="stat-card-dashboard-value">
                                    {card.value}
                                </p>

                                <div className="stat-card-dashboard-change">
                                    <span
                                        style={{
                                            fontSize: "0.72rem",
                                            color: "#94a3b8",
                                        }}
                                    >
                                        {card.change}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Administration */}
                <div>
                    <div style={{ marginBottom: 16 }}>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: "1.125rem",
                                fontWeight: 700,
                                color: "#0f172a",
                            }}
                        >
                            Administration
                        </h2>

                        <p
                            style={{
                                margin: "4px 0 0",
                                fontSize: "0.875rem",
                                color: "#64748b",
                            }}
                        >
                            Manage users and access control.
                        </p>
                    </div>

                    {/* Management Cards */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(3, minmax(0, 1fr))",
                            gap: 20,
                            width: "100%",
                            marginBottom: 24,
                        }}
                    >
                        {/* User Management */}
                        <div
                            className="form-card"
                            style={{
                                width: "100%",
                                maxWidth: "none",
                                margin: 0,
                            }}
                        >
                            <div className="form-card-header">
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                    }}
                                >
                                    <div
                                        className="stat-card-dashboard-icon"
                                        style={{
                                            width: 38,
                                            height: 38,
                                            background: "#eef2ff",
                                            color: "#4f46e5",
                                        }}
                                    >
                                        <Users size={18} />
                                    </div>

                                    <div>
                                        <h3
                                            style={{
                                                margin: 0,
                                                fontSize: "1rem",
                                                fontWeight: 700,
                                                color: "#0f172a",
                                            }}
                                        >
                                            User Management
                                        </h3>

                                        <p
                                            style={{
                                                margin: "2px 0 0",
                                                fontSize: "0.75rem",
                                                color: "#94a3b8",
                                            }}
                                        >
                                            Manage CRM users
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: "1rem 1.5rem" }}>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "0.875rem",
                                        lineHeight: 1.5,
                                        color: "#64748b",
                                    }}
                                >
                                    View, create and manage user accounts and
                                    account status.
                                </p>

                                <Link
                                    href="/admin/users"
                                    className="btn-secondary"
                                    style={{
                                        marginTop: 16,
                                        textDecoration: "none",
                                    }}
                                >
                                    Manage Users
                                    <ArrowRight size={15} />
                                </Link>
                            </div>
                        </div>

                        {/* Role Management */}
                        <div
                            className="form-card"
                            style={{
                                width: "100%",
                                maxWidth: "none",
                                margin: 0,
                            }}
                        >
                            <div className="form-card-header">
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                    }}
                                >
                                    <div
                                        className="stat-card-dashboard-icon"
                                        style={{
                                            width: 38,
                                            height: 38,
                                            background: "#f5f3ff",
                                            color: "#7c3aed",
                                        }}
                                    >
                                        <ShieldCheck size={18} />
                                    </div>

                                    <div>
                                        <h3
                                            style={{
                                                margin: 0,
                                                fontSize: "1rem",
                                                fontWeight: 700,
                                                color: "#0f172a",
                                            }}
                                        >
                                            Role Management
                                        </h3>

                                        <p
                                            style={{
                                                margin: "2px 0 0",
                                                fontSize: "0.75rem",
                                                color: "#94a3b8",
                                            }}
                                        >
                                            Manage user roles
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: "1rem 1.5rem" }}>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "0.875rem",
                                        lineHeight: 1.5,
                                        color: "#64748b",
                                    }}
                                >
                                    Create and manage roles and access levels
                                    for CRM users.
                                </p>

                                <a
                                    href="/admin/roles"
                                    className="btn-secondary"
                                    style={{
                                        marginTop: 16,
                                        textDecoration: "none",
                                    }}
                                >
                                    Manage Roles
                                    <ArrowRight size={15} />
                                </a>
                            </div>
                        </div>

                        {/* Permission Management */}
                        <div
                            className="form-card"
                            style={{
                                width: "100%",
                                maxWidth: "none",
                                margin: 0,
                            }}
                        >
                            <div className="form-card-header">
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                    }}
                                >
                                    <div
                                        className="stat-card-dashboard-icon"
                                        style={{
                                            width: 38,
                                            height: 38,
                                            background: "#ecfeff",
                                            color: "#0891b2",
                                        }}
                                    >
                                        <KeyRound size={18} />
                                    </div>

                                    <div>
                                        <h3
                                            style={{
                                                margin: 0,
                                                fontSize: "1rem",
                                                fontWeight: 700,
                                                color: "#0f172a",
                                            }}
                                        >
                                            Permission Management
                                        </h3>

                                        <p
                                            style={{
                                                margin: "2px 0 0",
                                                fontSize: "0.75rem",
                                                color: "#94a3b8",
                                            }}
                                        >
                                            Control system access
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: "1rem 1.5rem" }}>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "0.875rem",
                                        lineHeight: 1.5,
                                        color: "#64748b",
                                    }}
                                >
                                    Control what users and roles can view,
                                    create, update and delete.
                                </p>

                                <a
                                    href="/admin/permissions"
                                    className="btn-secondary"
                                    style={{
                                        marginTop: 16,
                                        textDecoration: "none",
                                    }}
                                >
                                    Manage Permissions
                                    <ArrowRight size={15} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions + System Activity */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "minmax(0, 1fr) minmax(0, 1fr)",
                        gap: 24,
                        width: "100%",
                        alignItems: "stretch",
                    }}
                >
                    {/* Quick Actions */}
                    <div
                        className="form-card"
                        style={{
                            width: "100%",
                            maxWidth: "none",
                            margin: 0,
                        }}
                    >
                        <div className="form-card-header">
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: "1rem",
                                    fontWeight: 700,
                                    color: "#0f172a",
                                }}
                            >
                                Quick Actions
                            </h3>

                            <p
                                style={{
                                    margin: "3px 0 0",
                                    fontSize: "0.75rem",
                                    color: "#94a3b8",
                                }}
                            >
                                Frequently used administration actions.
                            </p>
                        </div>

                        <div
                            style={{
                                padding: "0.5rem 0 0.75rem",
                            }}
                        >
                            <a
                                href="/admin/users"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "11px 1.5rem",
                                    textDecoration: "none",
                                    color: "#475569",
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                }}
                            >
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 9,
                                    }}
                                >
                                    <UserPlus size={16} color="#64748b" />
                                    Manage Users
                                </span>

                                <ArrowRight size={15} color="#94a3b8" />
                            </a>

                            <Link
                                href="/admin/users"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "11px 1.5rem",
                                    textDecoration: "none",
                                    color: "#475569",
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                }}
                            >
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 9,
                                    }}
                                >
                                    <ShieldCheck size={16} color="#64748b" />
                                    Manage Roles
                                </span>

                                <ArrowRight size={15} color="#94a3b8" />
                            </Link>
                            <a
                                href="/admin/permissions"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "11px 1.5rem",
                                    textDecoration: "none",
                                    color: "#475569",
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                }}
                            >
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 9,
                                    }}
                                >
                                    <KeyRound size={16} color="#64748b" />
                                    Manage Permissions
                                </span>

                                <ArrowRight size={15} color="#94a3b8" />
                            </a>
                        </div>
                    </div>

                    {/* System Activity */}
                    <div
                        className="form-card"
                        style={{
                            width: "100%",
                            maxWidth: "none",
                            margin: 0,
                        }}
                    >
                        <div className="form-card-header">
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 9,
                                }}
                            >
                                <Activity size={18} color="#4f46e5" />

                                <div>
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: "1rem",
                                            fontWeight: 700,
                                            color: "#0f172a",
                                        }}
                                    >
                                        System Activity
                                    </h3>

                                    <p
                                        style={{
                                            margin: "2px 0 0",
                                            fontSize: "0.75rem",
                                            color: "#94a3b8",
                                        }}
                                    >
                                        Recent administrative activity.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                padding: "0.5rem 0 0.75rem",
                            }}
                        >
                            <div
                                style={{
                                    padding: "11px 1.5rem",
                                    borderBottom: "1px solid #f1f5f9",
                                }}
                            >
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        color: "#475569",
                                    }}
                                >
                                    Admin panel initialized
                                </p>

                                <p
                                    style={{
                                        margin: "3px 0 0",
                                        fontSize: "0.75rem",
                                        color: "#94a3b8",
                                    }}
                                >
                                    System administration is ready.
                                </p>
                            </div>

                            <div
                                style={{
                                    padding: "11px 1.5rem",
                                    borderBottom: "1px solid #f1f5f9",
                                }}
                            >
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        color: "#475569",
                                    }}
                                >
                                    User management
                                </p>

                                <p
                                    style={{
                                        margin: "3px 0 0",
                                        fontSize: "0.75rem",
                                        color: "#94a3b8",
                                    }}
                                >
                                    Manage CRM users and account status.
                                </p>
                            </div>

                            <div
                                style={{
                                    padding: "11px 1.5rem",
                                }}
                            >
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        color: "#475569",
                                    }}
                                >
                                    Role-based access control
                                </p>

                                <p
                                    style={{
                                        margin: "3px 0 0",
                                        fontSize: "0.75rem",
                                        color: "#94a3b8",
                                    }}
                                >
                                    Configure roles and permissions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}