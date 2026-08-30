"use client";

import {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  useRouter,
  useParams,
} from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";

import {
  EmailTemplate,
  CATEGORY_COLORS,
} from "@/data/emailTemplates";

import {
  getEmailTemplate,
  mapEmailTemplateDetail,
  duplicateEmailTemplate,
  getEmailTemplateActivity,
  previewEmailTemplate,
  type TemplateActivityItem,
  type TemplatePreview,
} from "@/lib/emailTemplatesApi";

import {
  getCachedEmailTemplate,
  setCachedEmailTemplate,
  upsertCachedEmailTemplate,
} from "@/data/emailTemplatesCache";

import { usePermission } from "@/hooks/usePermissions";

import {
  HiArrowLeft,
  HiPencil,
  HiDuplicate,
  HiMail,
  HiEye,
  HiDocumentText,
  HiCog,
  HiClipboardCopy,
  HiClock,
} from "react-icons/hi";

type TabType =
  | "overview"
  | "preview"
  | "details"
  | "activity";

export default function ViewEmailTemplatePage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id as string;

  const canEdit = usePermission(
    "email_templates",
    "edit"
  );

  const canCreate = usePermission(
    "email_templates",
    "create"
  );

  const [template, setTemplate] =
    useState<EmailTemplate | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [notFound, setNotFound] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const [activeTab, setActiveTab] =
    useState<TabType>(
      "overview"
    );

  const [copied, setCopied] =
    useState(false);

  const [duplicating, setDuplicating] =
    useState(false);

  const [preview, setPreview] =
    useState<TemplatePreview | null>(
      null
    );

  const [previewLoading, setPreviewLoading] =
    useState(false);

  const [previewError, setPreviewError] =
    useState("");

  const [activity, setActivity] =
    useState<TemplateActivityItem[]>(
      []
    );

  const [activityLoading, setActivityLoading] =
    useState(false);

  /* =========================================================
     LOAD TEMPLATE — CACHE FIRST
  ========================================================= */

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    const cached =
      getCachedEmailTemplate(id);

    if (cached) {
      setTemplate(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    async function load() {
      try {
        if (cached) {
          setRefreshing(true);
        }

        const result =
          await getEmailTemplate(
            id
          );

        if (cancelled) {
          return;
        }

        const mapped =
          mapEmailTemplateDetail(
            result
          );

        setTemplate(mapped);

        setCachedEmailTemplate(
          mapped
        );

        setNotFound(false);
        setLoadError("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (
          error instanceof Error &&
          /not found|404/i.test(
            error.message
          )
        ) {
          setNotFound(true);
        } else if (!cached) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Failed to load template."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* =========================================================
     PREVIEW
  ========================================================= */

  useEffect(() => {
    if (
      activeTab !== "preview" ||
      !id ||
      preview ||
      previewLoading
    ) {
      return;
    }

    setPreviewLoading(true);
    setPreviewError("");

    previewEmailTemplate(id)
      .then(setPreview)
      .catch(error => {
        setPreviewError(
          error instanceof Error
            ? error.message
            : "Failed to render preview."
        );
      })
      .finally(() =>
        setPreviewLoading(false)
      );
  }, [
    activeTab,
    id,
    preview,
    previewLoading,
  ]);

  /* =========================================================
     ACTIVITY
  ========================================================= */

  const loadActivity =
    useCallback(() => {
      if (
        !id ||
        activityLoading
      ) {
        return;
      }

      setActivityLoading(true);

      getEmailTemplateActivity(
        id
      )
        .then(setActivity)
        .catch(() =>
          setActivity([])
        )
        .finally(() =>
          setActivityLoading(
            false
          )
        );
    }, [
      id,
      activityLoading,
    ]);

  useEffect(() => {
    if (
      activeTab === "activity"
    ) {
      loadActivity();
    }
  }, [
    activeTab,
    loadActivity,
  ]);

  /* =========================================================
     COPY
  ========================================================= */

  function handleCopy() {
    if (!template) {
      return;
    }

    navigator.clipboard
      .writeText(
        template.content
      )
      .catch(() => {});

    setCopied(true);

    window.setTimeout(
      () => setCopied(false),
      2000
    );
  }

  /* =========================================================
     DUPLICATE
  ========================================================= */

  async function handleDuplicate() {
    if (duplicating) {
      return;
    }

    setDuplicating(true);

    try {
      const copy =
        await duplicateEmailTemplate(
          id
        );

      const mapped =
        mapEmailTemplateDetail(
          copy
        );

      upsertCachedEmailTemplate(
        mapped
      );

      router.push(
        `/email-templates/${copy.id}`
      );
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to duplicate template."
      );

      setDuplicating(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <ThemeLoader
          label="Loading template..."
        />
      </DashboardLayout>
    );
  }

  if (
    notFound ||
    (loadError &&
      !template)
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
            📧
          </p>

          <h2>
            {notFound
              ? "Template Not Found"
              : "Something went wrong"}
          </h2>

          {loadError &&
            !notFound && (
              <p>
                {
                  loadError
                }
              </p>
            )}

          <button
            className="save-company-btn"
            onClick={() =>
              router.push(
                "/email-templates"
              )
            }
          >
            Back to Templates
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!template) {
    return null;
  }

  const t = template;

  const catStyle =
    CATEGORY_COLORS[
      t.category
    ];

  const TABS: {
    key: TabType;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "overview",
      label: "Overview",
      icon: (
        <HiMail
          size={15}
        />
      ),
    },
    {
      key: "preview",
      label: "Preview",
      icon: (
        <HiEye
          size={15}
        />
      ),
    },
    {
      key: "details",
      label: "Details",
      icon: (
        <HiDocumentText
          size={15}
        />
      ),
    },
    {
      key: "activity",
      label: "Activity",
      icon: (
        <HiClock
          size={15}
        />
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div
        style={{
          maxWidth:
            "1100px",
          margin:
            "0 auto",
        }}
      >
        {refreshing && (
          <div
            style={{
              height: "2px",
              width: "100%",
              background:
                "linear-gradient(90deg,#4f46e5,#7c3aed,#4f46e5)",
              backgroundSize:
                "200% 100%",
              animation:
                "email-template-refresh 1.2s linear infinite",
              marginBottom:
                "10px",
            }}
          />
        )}

        <button
          className="back-btn"
          onClick={() =>
            router.push(
              "/email-templates"
            )
          }
        >
          <HiArrowLeft
            size={16}
          />
          Back to Email Templates
        </button>

        <div
          style={{
            display:
              "flex",
            alignItems:
              "flex-start",
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
          <div>
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "10px",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize:
                    "1.75rem",
                  fontWeight:
                    700,
                  color:
                    "#0f172a",
                }}
              >
                {
                  t.name
                }
              </h1>

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
                    t.status ===
                    "Active"
                      ? "#dcfce7"
                      : "#f1f5f9",
                  color:
                    t.status ===
                    "Active"
                      ? "#16a34a"
                      : "#64748b",
                }}
              >
                {
                  t.status
                }
              </span>
            </div>

            <p
              style={{
                margin:
                  "5px 0 0",
                color:
                  "#64748b",
                fontSize:
                  "0.9rem",
              }}
            >
              {
                t.description ||
                "Email template"
              }
            </p>
          </div>

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
            {canEdit && (
                          <button
              type="button"
              onClick={() =>
                router.push(
                  `/email-templates/${id}/edit`
                )
              }
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap:
                  "6px",
                padding:
                  "8px 16px",
                border:
                  "1.5px solid #e2e8f0",
                borderRadius:
                  "8px",
                background:
                  "#fff",
                color:
                  "#374151",
                fontWeight:
                  600,
                cursor:
                  "pointer",
              }}
            >
              <HiPencil
                size={14}
              />
              Edit Template
            </button>
            )}

            {canCreate && (
                          <button
              type="button"
              onClick={
                handleDuplicate
              }
              disabled={
                duplicating
              }
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap:
                  "6px",
                padding:
                  "8px 16px",
                border:
                  "1.5px solid #e2e8f0",
                borderRadius:
                  "8px",
                background:
                  "#fff",
                color:
                  "#374151",
                fontWeight:
                  600,
                cursor:
                  duplicating
                    ? "wait"
                    : "pointer",
              }}
            >
              <HiDuplicate
                size={14}
              />
              {duplicating
                ? "Duplicating..."
                : "Duplicate"}
            </button>
            )}
          </div>
        </div>

        {loadError && (
          <div
            className="msg-error"
            style={{
              marginBottom:
                "16px",
            }}
          >
            ❌ {loadError}
          </div>
        )}

        <div
          style={{
            display:
              "flex",
            gap:
              0,
            borderBottom:
              "2px solid #e2e8f0",
            marginBottom:
              "20px",
            overflowX:
              "auto",
          }}
        >
          {TABS.map(tab => (
            <button
              key={
                tab.key
              }
              type="button"
              onClick={() =>
                setActiveTab(
                  tab.key
                )
              }
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap:
                  "6px",
                padding:
                  "10px 20px",
                border:
                  "none",
                background:
                  "none",
                cursor:
                  "pointer",
                fontFamily:
                  "inherit",
                fontSize:
                  "0.875rem",
                fontWeight:
                  activeTab ===
                  tab.key
                    ? 700
                    : 500,
                color:
                  activeTab ===
                  tab.key
                    ? "#4f46e5"
                    : "#64748b",
                borderBottom:
                  activeTab ===
                  tab.key
                    ? "2px solid #4f46e5"
                    : "2px solid transparent",
                marginBottom:
                  "-2px",
                whiteSpace:
                  "nowrap",
              }}
            >
              {
                tab.icon
              }
              {
                tab.label
              }
            </button>
          ))}
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
          <div>
            {activeTab ===
              "overview" && (
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
                    overflow:
                      "hidden",
                  }}
                >
                  <div
                    style={{
                      padding:
                        "14px 18px",
                      borderBottom:
                        "1px solid #f1f5f9",
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
                      <HiDocumentText
                        size={16}
                        color="#4f46e5"
                      />

                      <h3
                        style={{
                          margin: 0,
                          fontSize:
                            "0.9rem",
                          fontWeight:
                            700,
                        }}
                      >
                        Email Content
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleCopy
                      }
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap:
                          "6px",
                        padding:
                          "5px 12px",
                        border:
                          "1.5px solid #e2e8f0",
                        borderRadius:
                          "6px",
                        background:
                          "#fff",
                        cursor:
                          "pointer",
                      }}
                    >
                      <HiClipboardCopy
                        size={13}
                      />
                      {copied
                        ? "Copied!"
                        : "Copy Content"}
                    </button>
                  </div>

                  <div
                    style={{
                      padding:
                        "20px",
                      background:
                        "#fafafa",
                    }}
                  >
                    <div
                      style={{
                        background:
                          "#fff",
                        border:
                          "1px solid #e2e8f0",
                        borderRadius:
                          "8px",
                        padding:
                          "20px",
                        fontSize:
                          "0.9rem",
                        lineHeight:
                          2,
                        color:
                          "#374151",
                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {t.content
                        .split(
                          /({{[^}]+}})/
                        )
                        .map(
                          (
                            part,
                            index
                          ) =>
                            part.startsWith(
                              "{{"
                            ) &&
                            part.endsWith(
                              "}}"
                            ) ? (
                              <span
                                key={
                                  index
                                }
                                style={{
                                  background:
                                    "#eef2ff",
                                  color:
                                    "#4f46e5",
                                  padding:
                                    "1px 6px",
                                  borderRadius:
                                    "4px",
                                  fontWeight:
                                    600,
                                }}
                              >
                                {
                                  part
                                }
                              </span>
                            ) : (
                              part
                            )
                        )}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background:
                      "#fff",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius:
                      "12px",
                    padding:
                      "16px 18px",
                  }}
                >
                  <h3
                    style={{
                      margin:
                        "0 0 12px",
                      fontSize:
                        "0.875rem",
                      fontWeight:
                        700,
                    }}
                  >
                    Variables Used
                  </h3>

                  <div
                    style={{
                      display:
                        "flex",
                      flexWrap:
                        "wrap",
                      gap:
                        "8px",
                    }}
                  >
                    {t.variables.length >
                    0 ? (
                      t.variables.map(
                        variable => (
                          <span
                            key={
                              variable
                            }
                            style={{
                              padding:
                                "4px 12px",
                              borderRadius:
                                "6px",
                              background:
                                "#eef2ff",
                              color:
                                "#4f46e5",
                              fontSize:
                                "0.8rem",
                              fontWeight:
                                600,
                            }}
                          >
                            {
                              variable
                            }
                          </span>
                        )
                      )
                    ) : (
                      <span
                        style={{
                          color:
                            "#94a3b8",
                          fontSize:
                            "0.8rem",
                        }}
                      >
                        No variables used.
                      </span>
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
                      "12px",
                    padding:
                      "16px 18px",
                  }}
                >
                  <h3
                    style={{
                      margin:
                        "0 0 8px",
                      fontSize:
                        "0.875rem",
                      fontWeight:
                        700,
                    }}
                  >
                    Subject
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color:
                        "#475569",
                      fontSize:
                        "0.9rem",
                    }}
                  >
                    {
                      t.subject
                    }
                  </p>
                </div>

                <div
                  style={{
                    background:
                      "#fff",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius:
                      "12px",
                    padding:
                      "16px 18px",
                  }}
                >
                  <h3
                    style={{
                      margin:
                        "0 0 8px",
                      fontSize:
                        "0.875rem",
                      fontWeight:
                        700,
                    }}
                  >
                    Description
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color:
                        "#475569",
                      fontSize:
                        "0.9rem",
                      lineHeight:
                        1.7,
                    }}
                  >
                    {
                      t.description ||
                      "No description provided."
                    }
                  </p>
                </div>
              </div>
            )}

            {activeTab ===
              "preview" && (
              <div
                style={{
                  background:
                    "#fff",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius:
                    "12px",
                  padding:
                    "24px",
                }}
              >
                <h3
                  style={{
                    margin:
                      "0 0 16px",
                    fontSize:
                      "0.9rem",
                    fontWeight:
                      700,
                  }}
                >
                  Email Preview
                </h3>

                {previewLoading ? (
                  <ThemeLoader
                    label="Rendering preview..."
                    minHeight={
                      160
                    }
                    size={
                      36
                    }
                  />
                ) : previewError &&
                  !preview ? (
                  <div>
                    <div className="msg-error">
                      {
                        previewError
                      }
                    </div>

                    <div
                      style={{
                        border:
                          "1px solid #e2e8f0",
                        borderRadius:
                          "8px",
                        padding:
                          "24px",
                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {
                        t.content
                      }
                    </div>
                  </div>
                ) : preview ? (
                  <div
                    style={{
                      border:
                        "1px solid #e2e8f0",
                      borderRadius:
                        "8px",
                      overflow:
                        "hidden",
                    }}
                  >
                    <div
                      style={{
                        background:
                          "#f8fafc",
                        padding:
                          "12px 16px",
                        borderBottom:
                          "1px solid #e2e8f0",
                      }}
                    >
                      Subject:{" "}
                      <strong>
                        {
                          preview.subject
                        }
                      </strong>
                    </div>

                    <div
                      style={{
                        padding:
                          "24px",
                        whiteSpace:
                          "pre-wrap",
                        lineHeight:
                          2,
                      }}
                    >
                      {
                        preview.rendered_content
                      }
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {activeTab ===
              "details" && (
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
                }}
              >
                <h3
                  style={{
                    margin:
                      "0 0 16px",
                    fontSize:
                      "0.9rem",
                    fontWeight:
                      700,
                  }}
                >
                  Template Details
                </h3>

                {[
                  {
                    label:
                      "Template ID",
                    value:
                      t.id,
                  },
                  {
                    label:
                      "Category",
                    value:
                      t.category,
                  },
                  {
                    label:
                      "Template Type",
                    value:
                      t.type,
                  },
                  {
                    label:
                      "Status",
                    value:
                      t.status,
                  },
                  {
                    label:
                      "Language",
                    value:
                      t.language,
                  },
                  {
                    label:
                      "Created By",
                    value:
                      t.createdBy,
                  },
                  {
                    label:
                      "Created At",
                    value:
                      new Date(
                        t.createdAt
                      ).toLocaleString(),
                  },
                  {
                    label:
                      "Last Updated",
                    value:
                      new Date(
                        t.updatedAt
                      ).toLocaleString(),
                  },
                ].map(row => (
                  <div
                    key={
                      row.label
                    }
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      gap:
                        "20px",
                      padding:
                        "10px 0",
                      borderBottom:
                        "1px solid #f1f5f9",
                    }}
                  >
                    <span
                      style={{
                        color:
                          "#64748b",
                        fontSize:
                          "0.875rem",
                      }}
                    >
                      {
                        row.label
                      }
                    </span>

                    <span
                      style={{
                        color:
                          "#0f172a",
                        fontSize:
                          "0.875rem",
                        fontWeight:
                          600,
                        textAlign:
                          "right",
                      }}
                    >
                      {
                        row.value
                      }
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab ===
              "activity" && (
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
                }}
              >
                <h3
                  style={{
                    margin:
                      "0 0 16px",
                    fontSize:
                      "0.9rem",
                    fontWeight:
                      700,
                  }}
                >
                  Activity
                </h3>

                {activityLoading ? (
                  <ThemeLoader
                    label="Loading activity..."
                    minHeight={
                      120
                    }
                    size={
                      32
                    }
                  />
                ) : activity.length ===
                  0 ? (
                  <p
                    style={{
                      color:
                        "#94a3b8",
                      fontSize:
                        "0.875rem",
                    }}
                  >
                    No activity recorded
                    yet.
                  </p>
                ) : (
                  activity.map(
                    item => (
                      <div
                        key={
                          item.id
                        }
                        style={{
                          display:
                            "flex",
                          gap:
                            "10px",
                          marginBottom:
                            "14px",
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius:
                              "50%",
                            background:
                              "#cbd5e1",
                            marginTop:
                              "5px",
                            flexShrink:
                              0,
                          }}
                        />

                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontWeight:
                                600,
                              fontSize:
                                "0.875rem",
                            }}
                          >
                            {
                              item.action_display
                            }
                          </p>

                          {item.detail && (
                            <p
                              style={{
                                margin:
                                  "2px 0",
                                color:
                                  "#64748b",
                                fontSize:
                                  "0.78rem",
                              }}
                            >
                              {
                                item.detail
                              }
                            </p>
                          )}

                          <p
                            style={{
                              margin: 0,
                              color:
                                "#94a3b8",
                              fontSize:
                                "0.78rem",
                            }}
                          >
                            by{" "}
                            {item.user_name ||
                              "System"}{" "}
                            ·{" "}
                            {new Date(
                              item.timestamp
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            )}
          </div>

          {/* ===================================================
              SIDEBAR
          =================================================== */}

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
                  "18px",
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
                  marginBottom:
                    "14px",
                }}
              >
                <HiDocumentText
                  size={15}
                  color="#4f46e5"
                />

                <h3
                  style={{
                    margin: 0,
                    fontSize:
                      "0.875rem",
                    fontWeight:
                      700,
                  }}
                >
                  Template Information
                </h3>
              </div>

              {[
                {
                  label:
                    "Template ID",
                  value:
                    t.id,
                },
                {
                  label:
                    "Category",
                  value: (
                    <span
                      style={{
                        padding:
                          "2px 8px",
                        borderRadius:
                          "9999px",
                        background:
                          catStyle.bg,
                        color:
                          catStyle.color,
                        fontSize:
                          "0.78rem",
                        fontWeight:
                          600,
                      }}
                    >
                      {
                        t.category
                      }
                    </span>
                  ),
                },
                {
                  label:
                    "Template Type",
                  value:
                    t.type,
                },
                {
                  label:
                    "Status",
                  value:
                    t.status,
                },
                {
                  label:
                    "Created By",
                  value:
                    t.createdBy,
                },
              ].map(row => (
                <div
                  key={
                    row.label
                  }
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <p
                    style={{
                      margin:
                        "0 0 3px",
                      fontSize:
                        "0.72rem",
                      color:
                        "#94a3b8",
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
                      fontSize:
                        "0.875rem",
                      color:
                        "#0f172a",
                      fontWeight:
                        500,
                    }}
                  >
                    {
                      row.value
                    }
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background:
                  "#fff",
                border:
                  "1px solid #e2e8f0",
                borderRadius:
                  "12px",
                padding:
                  "18px",
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
                  marginBottom:
                    "14px",
                }}
              >
                <HiCog
                  size={15}
                  color="#4f46e5"
                />

                <h3
                  style={{
                    margin: 0,
                    fontSize:
                      "0.875rem",
                    fontWeight:
                      700,
                  }}
                >
                  Template Settings
                </h3>
              </div>

              {[
                {
                  label:
                    "Subject",
                  value:
                    t.subject,
                },
                {
                  label:
                    "Language",
                  value:
                    t.language,
                },
                {
                  label:
                    "Status",
                  value:
                    t.status,
                },
              ].map(row => (
                <div
                  key={
                    row.label
                  }
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <p
                    style={{
                      margin:
                        "0 0 3px",
                      fontSize:
                        "0.72rem",
                      color:
                        "#94a3b8",
                      textTransform:
                        "uppercase",
                    }}
                  >
                    {
                      row.label
                    }
                  </p>

                  <p
                    style={{
                      margin: 0,
                      fontSize:
                        "0.875rem",
                      color:
                        "#374151",
                    }}
                  >
                    {
                      row.value
                    }
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes email-template-refresh {
          from {
            background-position: 200% 0;
          }
          to {
            background-position: -200% 0;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}