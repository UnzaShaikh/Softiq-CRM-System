"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

type User = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  date_joined: string;
};

type ApiResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
};

type StatusFilter = "all" | "active" | "inactive";

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [nextPage, setNextPage] =
    useState<string | null>(null);

  const [previousPage, setPreviousPage] =
    useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async (
    url = "/api/users/admin/"
  ) => {
    try {
      setLoading(true);
      setError("");

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://127.0.0.1:8000";

      const response = await fetch(
        `${baseUrl}${url}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}`
        );
      }

      const data: ApiResponse =
        await response.json();

      setUsers(data.results || []);
      setNextPage(data.next);
      setPreviousPage(data.previous);
    } catch (err) {
      console.error(
        "Failed to load users:",
        err
      );

      setUsers([]);
      setNextPage(null);
      setPreviousPage(null);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return users.filter((user) => {
      const fullName =
        `${user.first_name || ""} ${
          user.last_name || ""
        }`.trim();

      const matchesSearch =
        !query ||
        user.username
          .toLowerCase()
          .includes(query) ||
        user.email
          .toLowerCase()
          .includes(query) ||
        fullName
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          user.is_active) ||
        (statusFilter === "inactive" &&
          !user.is_active);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [users, search, statusFilter]);

  const getUserName = (user: User) => {
    const fullName =
      `${user.first_name || ""} ${
        user.last_name || ""
      }`.trim();

    return fullName || user.username;
  };

  const getInitials = (user: User) => {
    const name = getUserName(user);

    return name
      .split(" ")
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("");
  };

  const formatDate = (date: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const handleNext = () => {
    if (!nextPage) return;

    setCurrentPage(
      (page) => page + 1
    );

    fetchUsers(nextPage);
  };

  const handlePrevious = () => {
    if (!previousPage) return;

    setCurrentPage((page) =>
      Math.max(1, page - 1)
    );

    fetchUsers(previousPage);
  };

  return (
    <DashboardLayout>
      <div className="page-wrapper">

        {/* =========================================
            PAGE HEADER
        ========================================= */}
        <div className="page-header">
          <div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                router.push("/admin")
              }
              style={{
                marginBottom: "12px",
              }}
            >
              <ArrowLeft size={15} />
              Administration
            </button>

            <h1 className="page-title">
              User Management
            </h1>

            <p className="page-subtitle">
              Manage CRM users, account status
              and access.
            </p>
          </div>

          <button
            type="button"
            className="add-company-btn"
            onClick={() =>
              console.log("Add user")
            }
          >
            <Plus size={16} />
            Add User
          </button>
        </div>

        {/* =========================================
            ERROR
        ========================================= */}
        {error && (
          <div
            className="msg-error"
            style={{
              marginBottom: 0,
            }}
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              aria-label="Close error"
              style={{
                border: 0,
                background: "transparent",
                cursor: "pointer",
                color: "inherit",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =========================================
            USERS TABLE
        ========================================= */}
        <div className="company-table-card">

          {/* Toolbar */}
          <div className="contacts-table-toolbar">

            <div className="contacts-search-wrap">
              <Search
                className="contacts-search-icon"
                size={17}
              />

              <input
                type="text"
                className="contacts-search-input"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search users..."
              />

              {search && (
                <button
                  type="button"
                  className="input-action"
                  onClick={() =>
                    setSearch("")
                  }
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="contacts-toolbar-right">

              <span className="contacts-results-count">
                {filteredUsers.length}{" "}
                {filteredUsers.length === 1
                  ? "user"
                  : "users"}
              </span>

              <div className="contacts-filter-tabs">

                <button
                  type="button"
                  className={`contacts-filter-tab ${
                    statusFilter === "all"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setStatusFilter("all")
                  }
                >
                  All
                </button>

                <button
                  type="button"
                  className={`contacts-filter-tab ${
                    statusFilter === "active"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setStatusFilter("active")
                  }
                >
                  Active
                </button>

                <button
                  type="button"
                  className={`contacts-filter-tab ${
                    statusFilter === "inactive"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setStatusFilter("inactive")
                  }
                >
                  Inactive
                </button>

              </div>
            </div>
          </div>

          {/* Table */}
          <div className="contacts-table-wrapper">
            <table className="contacts-table">

              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Joined</th>
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

                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        height: "180px",
                        color:
                          "var(--muted)",
                      }}
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        height: "220px",
                        color:
                          "var(--muted)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection:
                            "column",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          gap: "6px",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: 600,
                            color:
                              "#64748b",
                          }}
                        >
                          No users found
                        </p>

                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            color:
                              "#94a3b8",
                          }}
                        >
                          Try changing your
                          search or filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(
                    (user) => (
                      <tr key={user.id}>

                        {/* User */}
                        <td>
                          <div className="contacts-name-cell">

                            <div className="contacts-avatar">
                              {getInitials(user)}
                            </div>

                            <div>
                              <p className="contacts-name">
                                {getUserName(
                                  user
                                )}
                              </p>

                              <p className="contacts-job-title">
                                @{user.username}
                              </p>
                            </div>

                          </div>
                        </td>

                        {/* Email */}
                        <td>
                          <span className="contacts-email">
                            {user.email ||
                              "—"}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`contacts-status ${
                              user.is_active
                                ? "contacts-status-active"
                                : "contacts-status-inactive"
                            }`}
                          >
                            <span className="contacts-status-dot" />

                            {user.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        {/* Joined */}
                        <td>
                          <span className="contacts-cell-primary">
                            {formatDate(
                              user.date_joined
                            )}
                          </span>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="contacts-actions">

                            <button
                              type="button"
                              className="contacts-action-button contacts-action-view"
                              title="View User"
                              onClick={() =>
                                console.log(
                                  "View user",
                                  user.id
                                )
                              }
                            >
                              <Eye
                                size={14}
                              />
                            </button>

                            <button
                              type="button"
                              className="contacts-action-button contacts-action-edit"
                              title="Edit User"
                              onClick={() =>
                                console.log(
                                  "Edit user",
                                  user.id
                                )
                              }
                            >
                              <Pencil
                                size={14}
                              />
                            </button>

                            <button
                              type="button"
                              className="contacts-action-button contacts-action-delete"
                              title={
                                user.is_active
                                  ? "Deactivate User"
                                  : "Activate User"
                              }
                              onClick={() =>
                                console.log(
                                  user.is_active
                                    ? "Deactivate user"
                                    : "Activate user",
                                  user.id
                                )
                              }
                            >
                              {user.is_active ? (
                                <UserX
                                  size={14}
                                />
                              ) : (
                                <UserCheck
                                  size={14}
                                />
                              )}
                            </button>

                          </div>
                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading &&
            users.length > 0 &&
            (nextPage ||
              previousPage) && (
              <div className="company-pagination">

                <span
                  style={{
                    color:
                      "var(--muted)",
                    fontSize: "13px",
                  }}
                >
                  Page {currentPage}
                </span>

                <div className="pagination-pages">

                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={!previousPage}
                    onClick={
                      handlePrevious
                    }
                  >
                    <ChevronLeft
                      size={16}
                    />
                  </button>

                  <button
                    type="button"
                    className="pagination-page active"
                  >
                    {currentPage}
                  </button>

                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={!nextPage}
                    onClick={handleNext}
                  >
                    <ChevronRight
                      size={16}
                    />
                  </button>

                </div>
              </div>
            )}

        </div>
      </div>
    </DashboardLayout>
  );
}