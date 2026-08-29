"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  useParams,
} from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";

import {
  Followup,
  TYPE_COLORS,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from "@/data/followups";

import {
  getFollowUp,
  mapFollowUp,
  deleteFollowUp,
  relatedKey,
} from "@/lib/followupsApi";

import {
  getCachedFollowup,
  updateCachedFollowup,
  removeCachedFollowup,
} from "@/data/followupCache";

import {
  ArrowLeft,
  Phone,
  Mail,
  Users,
  CheckSquare,
  Calendar,
  Clock,
  Building2,
  Tag,
  User,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";

export default function ViewFollowupPage() {
  const router = useRouter();

  const params =
    useParams();

  const id =
    params?.id as string;

  const [followup, setFollowup] =
    useState<Followup | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [notFound, setNotFound] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const [deleteModal, setDeleteModal] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [deleteSuccess, setDeleteSuccess] =
    useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    const cached =
      getCachedFollowup(id);

    /*
     * CACHE FIRST
     */
    if (cached) {
      setFollowup(cached);
      setLoading(false);
      setNotFound(false);
    } else {
      setLoading(true);
    }

    async function load() {
      try {
        const data =
          await getFollowUp(
            id
          );

        if (cancelled) {
          return;
        }

        const mapped =
          mapFollowUp(
            data
          );

        mapped.relatedKey =
          relatedKey(data);

        mapped.companyId =
          data.company
            ? String(
                data.company
              )
            : "";

        updateCachedFollowup(
          mapped
        );

        setFollowup(
          mapped
        );

        setNotFound(false);
        setLoadError("");
        setLoading(false);
      } catch (error) {
        if (cancelled) {
          return;
        }

        /*
         * Cached data is still usable.
         */
        if (cached) {
          setLoading(false);
          return;
        }

        if (
          error instanceof Error &&
          /not found|404/i.test(
            error.message
          )
        ) {
          setNotFound(true);
        } else {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Failed to load follow-up."
          );
        }

        setLoading(false);
      }
    }

    /*
     * Backend refresh is silent
     * when cache already exists.
     */
    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDelete() {
    if (
      !followup ||
      deleting
    ) {
      return;
    }

    setDeleting(true);

    try {
      await deleteFollowUp(
        followup.id
      );

      removeCachedFollowup(
        followup.id
      );

      setDeleteModal(false);
      setDeleteSuccess(true);

      /*
       * No artificial delay.
       */
      router.push(
        "/followups"
      );
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to delete follow-up."
      );

      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <ThemeLoader
          label="Loading follow-up..."
        />
      </DashboardLayout>
    );
  }

  if (notFound) {
    return (
      <DashboardLayout>
        <div className="not-found-state">
          <p
            style={{
              fontSize:
                "3rem",
              margin:
                "0 0 12px",
            }}
          >
            🔍
          </p>

          <h2>
            Follow-up Not Found
          </h2>

          <button
            className="btn-add"
            onClick={() =>
              router.push(
                "/followups"
              )
            }
          >
            Back to Follow-ups
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (
    loadError &&
    !followup
  ) {
    return (
      <DashboardLayout>
        <div className="not-found-state">
          <p
            style={{
              fontSize:
                "3rem",
              margin:
                "0 0 12px",
            }}
          >
            ⚠️
          </p>

          <h2>
            Something went wrong
          </h2>

          <p
            style={{
              color:
                "#64748b",
            }}
          >
            {loadError}
          </p>

          <button
            className="btn-add"
            onClick={() =>
              router.push(
                "/followups"
              )
            }
          >
            Back to Follow-ups
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!followup) {
    return null;
  }

  const f =
    followup;

  const typeStyle =
    TYPE_COLORS[f.type];

  const statusStyle =
    STATUS_COLORS[f.status];

  const priorityStyle =
    PRIORITY_COLORS[
      f.priority
    ];

  const typeIcons: Record<
    string,
    React.ReactNode
  > = {
    Call:
      <Phone size={18} />,

    Email:
      <Mail size={18} />,

    Meeting:
      <Users size={18} />,

    Task:
      <CheckSquare
        size={18}
      />,

    "Follow-up":
      <Calendar
        size={18}
      />,
  };

  return (
    <DashboardLayout>
      <div
        style={{
          maxWidth:
            "900px",
          margin:
            "0 auto",
        }}
      >
        <div
          style={{
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            marginBottom:
              "24px",
            flexWrap:
              "wrap",
            gap:
              "12px",
          }}
        >
          <button
            className="back-btn"
            onClick={() =>
              router.push(
                "/followups"
              )
            }
          >
            <ArrowLeft
              size={16}
            />

            Back to Follow-ups
          </button>

          <div
            style={{
              display:
                "flex",
              gap:
                "8px",
            }}
          >
            <button
              onClick={() =>
                router.push(
                  `/followups/${id}/edit`
                )
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
              <Pencil
                size={14}
              />

              Edit
            </button>

            <button
              onClick={() =>
                setDeleteModal(
                  true
                )
              }
              className="btn-danger"
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap:
                  "6px",
              }}
            >
              <Trash2
                size={14}
              />

              Delete
            </button>
          </div>
        </div>

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "1fr 300px",
            gap:
              "20px",
          }}
        >
          <div
            style={{
              display:
                "flex",
              flexDirection:
                "column",
              gap:
                "16px",
            }}
          >
            <div
              style={{
                background:
                  "#fff",
                border:
                  "1px solid #e2e8f0",
                borderRadius:
                  "14px",
                padding:
                  "24px",
                boxShadow:
                  "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "flex-start",
                  gap:
                    "16px",
                }}
              >
                <div
                  style={{
                    width:
                      52,
                    height:
                      52,
                    borderRadius:
                      "12px",
                    background:
                      typeStyle.bg,
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    color:
                      typeStyle.color,
                    flexShrink:
                      0,
                  }}
                >
                  {
                    typeIcons[
                      f.type
                    ]
                  }
                </div>

                <div
                  style={{
                    flex:
                      1,
                    minWidth:
                      0,
                  }}
                >
                  <h1
                    style={{
                      margin:
                        "0 0 8px",
                      fontSize:
                        "1.4rem",
                      fontWeight:
                        700,
                      color:
                        "#0f172a",
                    }}
                  >
                    {
                      f.subject
                    }
                  </h1>

                  <div
                    style={{
                      display:
                        "flex",
                      gap:
                        "8px",
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <span
                      style={{
                        padding:
                          "3px 10px",
                        borderRadius:
                          "6px",
                        fontSize:
                          "0.78rem",
                        fontWeight:
                          600,
                        background:
                          typeStyle.bg,
                        color:
                          typeStyle.color,
                      }}
                    >
                      {
                        f.type
                      }
                    </span>

                    <span
                      style={{
                        padding:
                          "3px 10px",
                        borderRadius:
                          "9999px",
                        fontSize:
                          "0.78rem",
                        fontWeight:
                          600,
                        background:
                          statusStyle.bg,
                        color:
                          statusStyle.color,
                        border:
                          `1px solid ${statusStyle.border}`,
                      }}
                    >
                      <span
                        style={{
                          display:
                            "inline-block",
                          width:
                            6,
                          height:
                            6,
                          borderRadius:
                            "50%",
                          background:
                            statusStyle.dot,
                          marginRight:
                            5,
                        }}
                      />

                      {
                        f.status
                      }
                    </span>

                    <span
                      style={{
                        padding:
                          "3px 10px",
                        borderRadius:
                          "9999px",
                        fontSize:
                          "0.78rem",
                        fontWeight:
                          600,
                        background:
                          priorityStyle.bg,
                        color:
                          priorityStyle.color,
                        border:
                          `1px solid ${priorityStyle.border}`,
                      }}
                    >
                      {
                        f.priority
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {f.notes && (
              <div
                style={{
                  background:
                    "#fff",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius:
                    "12px",
                  padding:
                    "20px",
                  boxShadow:
                    "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <h3
                  style={{
                    margin:
                      "0 0 12px",
                    fontSize:
                      "0.9rem",
                    fontWeight:
                      700,
                    color:
                      "#0f172a",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "6px",
                  }}
                >
                  <FileText
                    size={15}
                    color="#4f46e5"
                  />

                  Notes
                </h3>

                <p
                  style={{
                    margin:
                      0,
                    color:
                      "#475569",
                    fontSize:
                      "0.9rem",
                    lineHeight:
                      1.7,
                    whiteSpace:
                      "pre-wrap",
                  }}
                >
                  {
                    f.notes
                  }
                </p>
              </div>
            )}
          </div>

          <div
            style={{
              display:
                "flex",
              flexDirection:
                "column",
              gap:
                "16px",
            }}
          >
            <div
              style={{
                background:
                  "#fff",
                border:
                  "1px solid #e2e8f0",
                borderRadius:
                  "12px",
                padding:
                  "20px",
                boxShadow:
                  "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 16px",
                  fontSize:
                    "0.875rem",
                  fontWeight:
                    700,
                  color:
                    "#0f172a",
                }}
              >
                Details
              </h3>

              {[
                {
                  label:
                    "Related To",
                  value:
                    f.relatedTo,
                  icon:
                    <User
                      size={14}
                      color="#94a3b8"
                    />,
                },

                {
                  label:
                    "Company",
                  value:
                    f.company,
                  icon:
                    <Building2
                      size={14}
                      color="#94a3b8"
                    />,
                },

                {
                  label:
                    "Type",
                  value:
                    f.type,
                  icon:
                    <Tag
                      size={14}
                      color="#94a3b8"
                    />,
                },

                {
                  label:
                    "Due Date",
                  value:
                    f.dueDate
                      ? new Date(
                          f.dueDate
                        ).toLocaleDateString(
                          "en-US",
                          {
                            month:
                              "long",
                            day:
                              "numeric",
                            year:
                              "numeric",
                          }
                        )
                      : "—",
                  icon:
                    <Calendar
                      size={14}
                      color="#94a3b8"
                    />,
                },

                {
                  label:
                    "Due Time",
                  value:
                    f.dueTime,
                  icon:
                    <Clock
                      size={14}
                      color="#94a3b8"
                    />,
                },

                {
                  label:
                    "Assigned To",
                  value:
                    f.assignedTo,
                  icon:
                    <User
                      size={14}
                      color="#94a3b8"
                    />,
                },

                {
                  label:
                    "Follow-up ID",
                  value:
                    f.code ??
                    f.id,
                  icon:
                    <Tag
                      size={14}
                      color="#94a3b8"
                    />,
                },
              ].map(row => (
                <div
                  key={
                    row.label
                  }
                  style={{
                    marginBottom:
                      "14px",
                  }}
                >
                  <p
                    style={{
                      margin:
                        "0 0 4px",
                      fontSize:
                        "0.72rem",
                      color:
                        "#94a3b8",
                      fontWeight:
                        500,
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.05em",
                    }}
                  >
                    {
                      row.label
                    }
                  </p>

                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap:
                        "6px",
                    }}
                  >
                    {
                      row.icon
                    }

                    <span
                      style={{
                        fontSize:
                          "0.875rem",
                        color:
                          "#374151",
                        fontWeight:
                          500,
                      }}
                    >
                      {
                        row.value ||
                        "—"
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
                false
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
                  f.subject
                }
              </strong>
              ? This cannot be undone.
            </p>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() =>
                  setDeleteModal(
                    false
                  )
                }
                disabled={
                  deleting
                }
              >
                Cancel
              </button>

              <button
                className="btn-danger"
                onClick={
                  handleDelete
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

      {deleteSuccess && (
        <div className="toast">
          <CheckSquare
            size={16}
          />

          Follow-up deleted
          successfully.
        </div>
      )}
    </DashboardLayout>
  );
}