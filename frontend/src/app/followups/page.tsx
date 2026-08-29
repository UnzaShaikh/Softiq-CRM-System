"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import SearchBar from "@/components/customers/SearchBar";
import Pagination from "@/components/customers/Pagination";

import {
  Followup,
  FollowupType,
  FollowupStatus,
  FollowupPriority,
  TYPE_COLORS,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from "@/data/followups";

import {
  listFollowUps,
  mapFollowUp,
  deleteFollowUp,
  getFollowUpStatistics,
  getFollowUpReminders,
  exportFollowUpsCsv,
} from "@/lib/followupsApi";

import {
  getCachedFollowupsList,
  setCachedFollowupsList,
  removeCachedFollowup,
} from "@/data/followupCache";

import {
  Phone,
  Mail,
  Users,
  CheckSquare,
  Calendar,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Download,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import {
  usePermission,
} from "@/hooks/usePermissions";

const ITEMS_PER_PAGE = 7;

const ALL_TYPES: FollowupType[] = [
  "Call",
  "Email",
  "Meeting",
  "Task",
  "Follow-up",
];

const ALL_STATUSES: FollowupStatus[] = [
  "Upcoming",
  "Completed",
  "Overdue",
  "Cancelled",
];

const ALL_PRIORITIES: FollowupPriority[] = [
  "High",
  "Medium",
  "Low",
];

function TypeIcon({
  type,
}: {
  type: FollowupType;
}) {
  const style =
    TYPE_COLORS[type];

  const icons: Record<
    FollowupType,
    React.ReactNode
  > = {
    Call: <Phone size={12} />,
    Email: <Mail size={12} />,
    Meeting: <Users size={12} />,
    Task: <CheckSquare size={12} />,
    "Follow-up": <Calendar size={12} />,
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "3px 9px",
        borderRadius: "6px",
        fontSize: "0.75rem",
        fontWeight: 600,
        background: style.bg,
        color: style.color,
      }}
    >
      {icons[type]}
      {type}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: FollowupStatus;
}) {
  const style =
    STATUS_COLORS[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 9px",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: style.dot,
          flexShrink: 0,
        }}
      />

      {status}
    </span>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: FollowupPriority;
}) {
  const style =
    PRIORITY_COLORS[priority];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      {priority}
    </span>
  );
}

export default function FollowupsPage() {
  const router = useRouter();

  const canCreate =
    usePermission(
      "followups",
      "create"
    );

  const canDelete =
    usePermission(
      "followups",
      "delete"
    );

  const [followups, setFollowups] =
    useState<Followup[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState<
      "All" | FollowupType
    >("All");

  const [statusFilter, setStatusFilter] =
    useState<
      "All" | FollowupStatus
    >("All");

  const [priorityFilter, setPriorityFilter] =
    useState<
      "All" | FollowupPriority
    >("All");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [deleteModal, setDeleteModal] =
    useState<Followup | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const [toastMsg, setToastMsg] =
    useState<string | null>(null);

  const [exporting, setExporting] =
    useState(false);

  const [stats, setStats] =
    useState({
      total: 0,
      upcoming: 0,
      completed: 0,
      overdue: 0,
    });

  const [reminders, setReminders] =
    useState<Followup[]>([]);

  const showToast = useCallback(
    (message: string) => {
      setToastMsg(message);

      window.setTimeout(() => {
        setToastMsg(null);
      }, 3000);
    },
    []
  );

  const refreshFromBackend =
    useCallback(async () => {
      try {
        const [
          list,
          statistics,
          reminderData,
        ] = await Promise.all([
          listFollowUps(),
          getFollowUpStatistics(),
          getFollowUpReminders(5),
        ]);

        const mapped =
          list.map(mapFollowUp);

        const mappedReminders =
          reminderData.map(mapFollowUp);

        setFollowups(mapped);

        setStats({
          total:
            statistics.total_followups,
          upcoming:
            statistics.upcoming,
          completed:
            statistics.completed,
          overdue:
            statistics.overdue,
        });

        setReminders(
          mappedReminders
        );

        setCachedFollowupsList(
          mapped
        );
      } catch (error) {
        if (!getCachedFollowupsList()) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Failed to load follow-ups."
          );
        }
      }
    }, []);

  const loadInitialData =
    useCallback(async () => {
      const cached =
        getCachedFollowupsList();

      /*
       * CACHE FIRST
       */
      if (
        cached &&
        cached.length > 0
      ) {
        setFollowups(cached);
        setLoading(false);

        /*
         * Backend refresh happens silently.
         */
        await refreshFromBackend();

        return;
      }

      /*
       * No cache = genuine first load.
       */
      setLoading(true);
      setLoadError("");

      try {
        await refreshFromBackend();
      } catch {
        // refreshFromBackend handles the error.
      } finally {
        setLoading(false);
      }
    }, [refreshFromBackend]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (cancelled) {
        return;
      }

      await loadInitialData();
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [loadInitialData]);

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return followups.filter(
        followup => {
          const matchesSearch =
            !query ||
            followup.subject
              .toLowerCase()
              .includes(query) ||
            followup.relatedTo
              .toLowerCase()
              .includes(query) ||
            followup.company
              .toLowerCase()
              .includes(query) ||
            followup.code
              ?.toLowerCase()
              .includes(query);

          const matchesType =
            typeFilter === "All" ||
            followup.type ===
              typeFilter;

          const matchesStatus =
            statusFilter === "All" ||
            followup.status ===
              statusFilter;

          const matchesPriority =
            priorityFilter === "All" ||
            followup.priority ===
              priorityFilter;

          const matchesFrom =
            !dateFrom ||
            followup.dueDate >=
              dateFrom;

          const matchesTo =
            !dateTo ||
            followup.dueDate <=
              dateTo;

          return (
            matchesSearch &&
            matchesType &&
            matchesStatus &&
            matchesPriority &&
            matchesFrom &&
            matchesTo
          );
        }
      );
    }, [
      followups,
      search,
      typeFilter,
      statusFilter,
      priorityFilter,
      dateFrom,
      dateTo,
    ]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filtered.length /
          ITEMS_PER_PAGE
      )
    );

  const paginated =
    useMemo(
      () =>
        filtered.slice(
          (currentPage - 1) *
            ITEMS_PER_PAGE,
          currentPage *
            ITEMS_PER_PAGE
        ),
      [
        filtered,
        currentPage,
      ]
    );

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  async function confirmDelete() {
    if (
      !deleteModal ||
      deleting
    ) {
      return;
    }

    setDeleting(true);

    const deletingId =
      deleteModal.id;

    try {
      await deleteFollowUp(
        deletingId
      );

      removeCachedFollowup(
        deletingId
      );

      setFollowups(prev =>
        prev.filter(
          item =>
            String(item.id) !==
            String(deletingId)
        )
      );

      setStats(prev => ({
        ...prev,
        total:
          Math.max(
            0,
            prev.total - 1
          ),
      }));

      showToast(
        `"${deleteModal.subject}" deleted successfully.`
      );

      setDeleteModal(null);

      /*
       * Silent backend refresh.
       * Never turn the page spinner back on.
       */
      try {
        await refreshFromBackend();
      } catch {
        // UI is already updated.
      }
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to delete follow-up."
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleExport() {
    if (exporting) {
      return;
    }

    setExporting(true);

    try {
      await exportFollowUpsCsv();

      showToast(
        "Follow-ups exported successfully."
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Export failed."
      );
    } finally {
      setExporting(false);
    }
  }

  const total =
    stats.total ||
    followups.length;

  const thStyle: React.CSSProperties = {
    padding: "10px 14px",
    textAlign: "left",
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    background: "#f8fafc",
    borderBottom:
      "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = {
    padding: "12px 14px",
    fontSize: "0.8125rem",
    color: "#374151",
    borderBottom:
      "1px solid #f1f5f9",
    verticalAlign: "middle",
  };

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              Follow-ups
            </h1>

            <p className="page-subtitle">
              Manage and track all
              your follow-ups in one
              place.
            </p>
          </div>

          {canCreate && (
            <button
              className="btn-add"
              onClick={() =>
                router.push(
                  "/followups/new"
                )
              }
            >
              <Plus size={16} />
              Create Follow-up
            </button>
          )}
        </div>

        {loading && (
          <ThemeLoader
            label="Loading follow-ups..."
            minHeight={240}
          />
        )}

        {loadError &&
          !loading && (
            <div
              style={{
                background:
                  "#fef2f2",
                border:
                  "1px solid #fca5a5",
                borderRadius: "8px",
                padding:
                  "10px 16px",
                marginBottom:
                  "16px",
                fontSize:
                  "0.8125rem",
                color: "#b91c1c",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
              }}
            >
              <span>
                ❌ {loadError}
              </span>

              <button
                onClick={
                  loadInitialData
                }
                style={{
                  background:
                    "none",
                  border: "none",
                  color: "#4f46e5",
                  cursor:
                    "pointer",
                  fontWeight: 600,
                  textDecoration:
                    "underline",
                  fontFamily:
                    "inherit",
                }}
              >
                Retry
              </button>
            </div>
          )}

        {!loading && (
          <>
            <div className="stats-grid-4">
              {[
                {
                  label:
                    "Total Follow-ups",
                  value: total,
                  icon:
                    <Calendar
                      size={18}
                    />,
                  color:
                    "#4f46e5",
                  sub:
                    "All follow-ups",
                },
                {
                  label:
                    "Upcoming",
                  value:
                    stats.upcoming,
                  icon:
                    <Clock
                      size={18}
                    />,
                  color:
                    "#d97706",
                  sub:
                    "Next 7 days",
                },
                {
                  label:
                    "Completed",
                  value:
                    stats.completed,
                  icon:
                    <CheckCircle
                      size={18}
                    />,
                  color:
                    "#16a34a",
                  sub:
                    "This month",
                },
                {
                  label:
                    "Overdue",
                  value:
                    stats.overdue,
                  icon:
                    <AlertCircle
                      size={18}
                    />,
                  color:
                    "#dc2626",
                  sub:
                    "Requires attention",
                },
              ].map(card => (
                <div
                  key={card.label}
                  className="stat-card-dashboard"
                >
                  <div
                    className="stat-card-dashboard-icon"
                    style={{
                      background:
                        `${card.color}18`,
                      color:
                        card.color,
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
                      <span className="stat-card-dashboard-since">
                        {card.sub}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="panels-grid-2">
              <div
                style={{
                  background:
                    "#fff",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius:
                    "14px",
                  overflow:
                    "hidden",
                  boxShadow:
                    "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    padding:
                      "14px 20px",
                    borderBottom:
                      "1px solid #f1f5f9",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "space-between",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize:
                        "0.95rem",
                      fontWeight: 700,
                      color:
                        "#0f172a",
                    }}
                  >
                    Upcoming Reminders
                  </h3>

                  <span
                    style={{
                      fontSize:
                        "0.75rem",
                      color:
                        "#94a3b8",
                    }}
                  >
                    {reminders.length} upcoming
                  </span>
                </div>

                <div className="reminders-inner-grid">
                  {reminders.map(
                    reminder => {
                      const style =
                        TYPE_COLORS[
                          reminder.type
                        ];

                      return (
                        <div
                          key={
                            reminder.id
                          }
                          style={{
                            display:
                              "flex",
                            gap:
                              "10px",
                            alignItems:
                              "flex-start",
                            padding:
                              "10px",
                            background:
                              "#f8fafc",
                            border:
                              "1px solid #f1f5f9",
                            borderRadius:
                              "10px",
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius:
                                "8px",
                              background:
                                style.bg,
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              color:
                                style.color,
                              flexShrink:
                                0,
                            }}
                          >
                            {reminder.type ===
                            "Call" ? (
                              <Phone
                                size={
                                  14
                                }
                              />
                            ) : reminder.type ===
                              "Email" ? (
                              <Mail
                                size={
                                  14
                                }
                              />
                            ) : reminder.type ===
                              "Meeting" ? (
                              <Users
                                size={
                                  14
                                }
                              />
                            ) : (
                              <Calendar
                                size={
                                  14
                                }
                              />
                            )}
                          </div>

                          <div
                            style={{
                              minWidth:
                                0,
                              flex: 1,
                            }}
                          >
                            <p
                              style={{
                                margin:
                                  0,
                                fontSize:
                                  "0.8rem",
                                fontWeight:
                                  600,
                                color:
                                  "#0f172a",
                                overflow:
                                  "hidden",
                                textOverflow:
                                  "ellipsis",
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {
                                reminder.subject
                              }
                            </p>

                            <p
                              style={{
                                margin:
                                  0,
                                fontSize:
                                  "0.72rem",
                                color:
                                  "#64748b",
                              }}
                            >
                              {
                                reminder.relatedTo
                              }
                              {" · "}
                              {
                                reminder.company
                              }
                            </p>

                            <p
                              style={{
                                margin:
                                  "2px 0 0",
                                fontSize:
                                  "0.7rem",
                                color:
                                  "#94a3b8",
                              }}
                            >
                              {
                                reminder.dueDate
                              }
                              {" · "}
                              {
                                reminder.dueTime
                              }
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              <div
                style={{
                  background:
                    "#fff",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius:
                    "14px",
                  overflow:
                    "hidden",
                  boxShadow:
                    "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    padding:
                      "14px 20px",
                    borderBottom:
                      "1px solid #f1f5f9",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize:
                        "0.95rem",
                      fontWeight: 700,
                      color:
                        "#0f172a",
                    }}
                  >
                    Follow-up Insights
                  </h3>
                </div>

                <div
                  style={{
                    padding:
                      "20px",
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap:
                      "14px",
                  }}
                >
                  {[
                    [
                      "Upcoming",
                      stats.upcoming,
                      "#3b82f6",
                    ],
                    [
                      "Completed",
                      stats.completed,
                      "#22c55e",
                    ],
                    [
                      "Overdue",
                      stats.overdue,
                      "#ef4444",
                    ],
                  ].map(
                    ([label, value, color]) => (
                      <div
                        key={
                          String(
                            label
                          )
                        }
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "center",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap:
                              "8px",
                          }}
                        >
                          <span
                            style={{
                              width:
                                10,
                              height:
                                10,
                              borderRadius:
                                "50%",
                              background:
                                String(
                                  color
                                ),
                            }}
                          />

                          <span>
                            {
                              label
                            }
                          </span>
                        </div>

                        <strong>
                          {
                            value
                          }
                        </strong>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop:
                  "20px",
                background:
                  "#fff",
                border:
                  "1px solid #e2e8f0",
                borderRadius:
                  "14px",
                overflow:
                  "hidden",
                boxShadow:
                  "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  padding:
                    "14px 16px",
                  borderBottom:
                    "1px solid #f1f5f9",
                  display:
                    "flex",
                  flexWrap:
                    "wrap",
                  gap:
                    "10px",
                  alignItems:
                    "center",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    minWidth:
                      "200px",
                  }}
                >
                  <SearchBar
                    value={
                      search
                    }
                    onChange={
                      value => {
                        setSearch(
                          value
                        );
                        setCurrentPage(
                          1
                        );
                      }
                    }
                    placeholder="Search follow-ups..."
                    resultCount={
                      filtered.length
                    }
                  />
                </div>

                <select
                  value={
                    typeFilter
                  }
                  onChange={e => {
                    setTypeFilter(
                      e.target
                        .value as
                        | "All"
                        | FollowupType
                    );
                    setCurrentPage(
                      1
                    );
                  }}
                  className="form-input"
                  style={{
                    width:
                      "auto",
                    minWidth:
                      "130px",
                  }}
                >
                  <option value="All">
                    All Types
                  </option>

                  {ALL_TYPES.map(
                    type => (
                      <option
                        key={
                          type
                        }
                        value={
                          type
                        }
                      >
                        {type}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={
                    statusFilter
                  }
                  onChange={e => {
                    setStatusFilter(
                      e.target
                        .value as
                        | "All"
                        | FollowupStatus
                    );
                    setCurrentPage(
                      1
                    );
                  }}
                  className="form-input"
                  style={{
                    width:
                      "auto",
                    minWidth:
                      "130px",
                  }}
                >
                  <option value="All">
                    All Status
                  </option>

                  {ALL_STATUSES.map(
                    status => (
                      <option
                        key={
                          status
                        }
                        value={
                          status
                        }
                      >
                        {status}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={
                    priorityFilter
                  }
                  onChange={e => {
                    setPriorityFilter(
                      e.target
                        .value as
                        | "All"
                        | FollowupPriority
                    );
                    setCurrentPage(
                      1
                    );
                  }}
                  className="form-input"
                  style={{
                    width:
                      "auto",
                    minWidth:
                      "130px",
                  }}
                >
                  <option value="All">
                    All Priority
                  </option>

                  {ALL_PRIORITIES.map(
                    priority => (
                      <option
                        key={
                          priority
                        }
                        value={
                          priority
                        }
                      >
                        {priority}
                      </option>
                    )
                  )}
                </select>

                <input
                  type="date"
                  value={
                    dateFrom
                  }
                  onChange={e => {
                    setDateFrom(
                      e.target
                        .value
                    );
                    setCurrentPage(
                      1
                    );
                  }}
                  className="form-input"
                  style={{
                    width:
                      "auto",
                  }}
                />

                <input
                  type="date"
                  value={
                    dateTo
                  }
                  onChange={e => {
                    setDateTo(
                      e.target
                        .value
                    );
                    setCurrentPage(
                      1
                    );
                  }}
                  className="form-input"
                  style={{
                    width:
                      "auto",
                  }}
                />

                <button
                  onClick={
                    handleExport
                  }
                  disabled={
                    exporting
                  }
                  className="btn-secondary"
                  style={{
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    gap:
                      "6px",
                  }}
                >
                  <Download
                    size={14}
                  />

                  {exporting
                    ? "Exporting..."
                    : "Export"}
                </button>
              </div>

              <div className="table-scroll-wrapper">
                {filtered.length ===
                0 ? (
                  <div className="empty-state">
                    <p className="empty-state-title">
                      {followups.length ===
                      0
                        ? "No follow-ups yet."
                        : "No matching follow-ups."}
                    </p>

                    <p className="empty-state-sub">
                      {followups.length ===
                      0
                        ? "Create your first follow-up to get started."
                        : "Try adjusting your search or filters."}
                    </p>
                  </div>
                ) : (
                  <table
                    style={{
                      width:
                        "100%",
                      borderCollapse:
                        "collapse",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={thStyle}>
                          Subject
                        </th>

                        <th style={thStyle}>
                          Related To
                        </th>

                        <th style={thStyle}>
                          Type
                        </th>

                        <th style={thStyle}>
                          Due Date
                        </th>

                        <th style={thStyle}>
                          Priority
                        </th>

                        <th style={thStyle}>
                          Status
                        </th>

                        <th style={thStyle}>
                          Assigned To
                        </th>

                        <th
                          style={{
                            ...thStyle,
                            textAlign:
                              "center",
                          }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginated.map(
                        (followup, index) => {
                          const isLast =
                            index ===
                            paginated.length -
                              1;

                          const rowTd = {
                            ...tdStyle,
                            borderBottom:
                              isLast
                                ? "none"
                                : "1px solid #f1f5f9",
                          };

                          return (
                            <tr
                              key={
                                followup.id
                              }
                            >
                              <td
                                style={
                                  rowTd
                                }
                              >
                                <p
                                  style={{
                                    margin:
                                      0,
                                    fontWeight:
                                      600,
                                    color:
                                      "#0f172a",
                                  }}
                                >
                                  {
                                    followup.subject
                                  }
                                </p>

                                <p
                                  style={{
                                    margin:
                                      "2px 0 0",
                                    fontSize:
                                      "0.72rem",
                                    color:
                                      "#94a3b8",
                                  }}
                                >
                                  {
                                    followup.code
                                  }
                                </p>
                              </td>

                              <td
                                style={
                                  rowTd
                                }
                              >
                                <p
                                  style={{
                                    margin:
                                      0,
                                    fontWeight:
                                      500,
                                  }}
                                >
                                  {
                                    followup.relatedTo
                                  }
                                </p>

                                <p
                                  style={{
                                    margin:
                                      0,
                                    fontSize:
                                      "0.72rem",
                                    color:
                                      "#94a3b8",
                                  }}
                                >
                                  {
                                    followup.company
                                  }
                                </p>
                              </td>

                              <td
                                style={
                                  rowTd
                                }
                              >
                                <TypeIcon
                                  type={
                                    followup.type
                                  }
                                />
                              </td>

                              <td
                                style={
                                  rowTd
                                }
                              >
                                <p
                                  style={{
                                    margin:
                                      0,
                                  }}
                                >
                                  {new Date(
                                    followup.dueDate
                                  ).toLocaleDateString(
                                    "en-US",
                                    {
                                      month:
                                        "short",
                                      day:
                                        "numeric",
                                      year:
                                        "numeric",
                                    }
                                  )}
                                </p>

                                <p
                                  style={{
                                    margin:
                                      0,
                                    fontSize:
                                      "0.72rem",
                                    color:
                                      "#94a3b8",
                                  }}
                                >
                                  {
                                    followup.dueTime
                                  }
                                </p>
                              </td>

                              <td
                                style={
                                  rowTd
                                }
                              >
                                <PriorityBadge
                                  priority={
                                    followup.priority
                                  }
                                />
                              </td>

                              <td
                                style={
                                  rowTd
                                }
                              >
                                <StatusBadge
                                  status={
                                    followup.status
                                  }
                                />
                              </td>

                              <td
                                style={
                                  rowTd
                                }
                              >
                                <div
                                  style={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap:
                                      "7px",
                                  }}
                                >
                                  <div
                                    style={{
                                      width:
                                        26,
                                      height:
                                        26,
                                      borderRadius:
                                        "50%",
                                      background:
                                        "#4f46e5",
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                      color:
                                        "#fff",
                                      fontSize:
                                        "0.65rem",
                                      fontWeight:
                                        700,
                                    }}
                                  >
                                    {
                                      followup.assignedInitials
                                    }
                                  </div>

                                  <span>
                                    {
                                      followup.assignedTo
                                    }
                                  </span>
                                </div>
                              </td>

                              <td
                                style={{
                                  ...rowTd,
                                  textAlign:
                                    "center",
                                }}
                              >
                                <div
                                  style={{
                                    display:
                                      "inline-flex",
                                    gap:
                                      "4px",
                                  }}
                                >
                                  <button
                                    title="View"
                                    onClick={() =>
                                      router.push(
                                        `/followups/${followup.id}`
                                      )
                                    }
                                    style={{
                                      width:
                                        28,
                                      height:
                                        28,
                                      border:
                                        "1.5px solid #e2e8f0",
                                      borderRadius:
                                        "6px",
                                      background:
                                        "#fff",
                                      color:
                                        "#4f46e5",
                                      cursor:
                                        "pointer",
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                    }}
                                  >
                                    <Eye
                                      size={
                                        13
                                      }
                                    />
                                  </button>

                                  <button
                                    title="Edit"
                                    onClick={() =>
                                      router.push(
                                        `/followups/${followup.id}/edit`
                                      )
                                    }
                                    style={{
                                      width:
                                        28,
                                      height:
                                        28,
                                      border:
                                        "1.5px solid #e2e8f0",
                                      borderRadius:
                                        "6px",
                                      background:
                                        "#fff",
                                      color:
                                        "#0891b2",
                                      cursor:
                                        "pointer",
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                    }}
                                  >
                                    <Pencil
                                      size={
                                        13
                                      }
                                    />
                                  </button>

                                  {canDelete && (
                                    <button
                                      title="Delete"
                                      onClick={() =>
                                        setDeleteModal(
                                          followup
                                        )
                                      }
                                      style={{
                                        width:
                                          28,
                                        height:
                                          28,
                                        border:
                                          "1.5px solid #e2e8f0",
                                        borderRadius:
                                          "6px",
                                        background:
                                          "#fff",
                                        color:
                                          "#ef4444",
                                        cursor:
                                          "pointer",
                                        display:
                                          "flex",
                                        alignItems:
                                          "center",
                                        justifyContent:
                                          "center",
                                      }}
                                    >
                                      <Trash2
                                        size={
                                          13
                                        }
                                      />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {filtered.length >
                0 && (
                <div
                  style={{
                    padding:
                      "10px 16px",
                    borderTop:
                      "1px solid #f1f5f9",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "space-between",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize:
                        "0.8rem",
                      color:
                        "#64748b",
                    }}
                  >
                    Showing{" "}
                    <strong>
                      {(currentPage -
                        1) *
                        ITEMS_PER_PAGE +
                        1}
                    </strong>{" "}
                    to{" "}
                    <strong>
                      {Math.min(
                        currentPage *
                          ITEMS_PER_PAGE,
                        filtered.length
                      )}
                    </strong>{" "}
                    of{" "}
                    <strong>
                      {
                        filtered.length
                      }
                    </strong>{" "}
                    entries
                  </p>

                  <Pagination
                    currentPage={
                      currentPage
                    }
                    totalPages={
                      totalPages
                    }
                    totalItems={
                      filtered.length
                    }
                    itemsPerPage={
                      ITEMS_PER_PAGE
                    }
                    onPageChange={
                      setCurrentPage
                    }
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {deleteModal && (
        <div
          className="modal-overlay"
          onClick={event => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setDeleteModal(
                null
              );
            }
          }}
        >
          <div className="modal-box">
            <div className="modal-icon">
              <Trash2
                size={24}
                color="#ef4444"
              />
            </div>

            <h2 className="modal-title">
              Delete Follow-up
            </h2>

            <p className="modal-text">
              Are you sure you want
              to delete{" "}
              <strong>
                {
                  deleteModal.subject
                }
              </strong>
              ? This cannot be undone.
            </p>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() =>
                  setDeleteModal(
                    null
                  )
                }
              >
                Cancel
              </button>

              <button
                className="btn-danger"
                onClick={
                  confirmDelete
                }
                disabled={
                  deleting
                }
              >
                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="toast">
          <CheckCircle
            size={16}
          />

          {toastMsg}
        </div>
      )}
    </DashboardLayout>
  );
}