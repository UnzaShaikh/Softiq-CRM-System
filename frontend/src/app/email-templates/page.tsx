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

import {
  EmailTemplate,
  TemplateCategory,
  ALL_CATEGORIES,
  CATEGORY_COLORS,
} from "@/data/emailTemplates";

import {
  CATEGORY_LABELS,
  TYPE_LABELS,
  STATUS_LABELS,
  listEmailTemplates,
  deleteEmailTemplate,
  type ApiEmailTemplateListItem,
} from "@/lib/emailTemplatesApi";

import {
  getCachedEmailTemplatesList,
  setCachedEmailTemplatesList,
  removeCachedEmailTemplateFromList,
} from "@/data/emailTemplatesCache";

import {
  HiChevronDown,
  HiEye,
  HiMail,
  HiPencil,
  HiPlus,
  HiSearch,
  HiTrash,
} from "react-icons/hi";

import { Trash2 } from "lucide-react";

import { usePermission } from "@/hooks/usePermissions";

const ITEMS_PER_PAGE = 5;

type CategoryFilter = "All Categories" | TemplateCategory;

/* ============================================================
   TEMPLATE ICON
============================================================ */

function TemplateIcon({
  category,
}: {
  category: TemplateCategory;
}) {
  const style =
    CATEGORY_COLORS[category] ??
    CATEGORY_COLORS["General"];

  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: style.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: style.color,
        flexShrink: 0,
      }}
    >
      <HiMail size={18} />
    </div>
  );
}

/* ============================================================
   API -> UI MAPPING
============================================================ */

function mapTemplate(
  template: ApiEmailTemplateListItem
): EmailTemplate {
  const category =
    CATEGORY_LABELS[template.category] ??
    "General";

  const type =
    TYPE_LABELS[template.template_type] ??
    "Public";

  const status =
    STATUS_LABELS[template.status] ??
    "Active";

  return {
    id: String(template.id),
    name: template.name,
    subject: template.subject,
    content: "",
    category: category as TemplateCategory,
    type,
    status,
    description: "",
    createdBy: "",
    createdAt: template.updated_at,
    updatedAt: template.updated_at,
    variables: [],
    language: "",
  };
}

/* ============================================================
   DATE FORMATTER
============================================================ */

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      date: "—",
      time: "",
    };
  }

  return {
    date: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),

    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

/* ============================================================
   PAGE
============================================================ */

export default function EmailTemplatesPage() {
  const router = useRouter();

  const [templates, setTemplates] =
    useState<EmailTemplate[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>(
      "All Categories"
    );

  const [currentPage, setCurrentPage] =
    useState(1);

  const [deleteModal, setDeleteModal] =
    useState<EmailTemplate | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const [toastMsg, setToastMsg] =
    useState<string | null>(null);

  const canCreate = usePermission(
    "email_templates",
    "create"
  );

  const canDelete = usePermission(
    "email_templates",
    "delete"
  );

  const canEdit = usePermission(
    "email_templates",
    "edit"
  );

  /* ==========================================================
     LOAD TEMPLATES
     
     IMPORTANT:
     This function intentionally has NO dependency on:
       - currentPage
       - search
       - categoryFilter
     
     Pagination/filtering is client-side.
     Changing page must NOT call the API again.
  ========================================================== */

  const fetchTemplates = useCallback(
    async (showRefresh = false) => {
      const cached =
        getCachedEmailTemplatesList();

      if (cached) {
        setTemplates(cached.templates);
        setSearch(cached.search);
        setCategoryFilter(
          cached.categoryFilter as CategoryFilter
        );
        setCurrentPage(
          Math.max(1, cached.currentPage || 1)
        );
        setLoading(false);
      } else {
        setLoading(true);
      }

      if (showRefresh) {
        setRefreshing(true);
      }

      setLoadError("");

      try {
        const data =
          await listEmailTemplates();

        const mapped =
          data.map(mapTemplate);

        setTemplates(mapped);

        setCachedEmailTemplatesList({
          templates: mapped,
          search:
            cached?.search ?? "",
          categoryFilter:
            cached?.categoryFilter ??
            "All Categories",
          currentPage:
            cached?.currentPage ?? 1,
          cachedAt:
            cached?.cachedAt ??
            Date.now(),
        });

        setLoadError("");
      } catch (error) {
        console.error(
          "Failed to load email templates:",
          error
        );

        if (!cached) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Failed to load templates."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* ==========================================================
     INITIAL LOAD ONLY
  ========================================================== */

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  /* ==========================================================
     FILTERING
  ========================================================== */

  const filtered = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return templates.filter(
      (template) => {
        const matchesSearch =
          !query ||
          template.name
            .toLowerCase()
            .includes(query) ||
          template.subject
            .toLowerCase()
            .includes(query);

        const matchesCategory =
          categoryFilter ===
            "All Categories" ||
          template.category ===
            categoryFilter;

        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );
  }, [
    templates,
    search,
    categoryFilter,
  ]);

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filtered.length /
        ITEMS_PER_PAGE
    )
  );

  /*
   * If search/filter reduces the number of pages,
   * automatically move back to the last valid page.
   */
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const paginatedTemplates =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

      const end =
        start + ITEMS_PER_PAGE;

      return filtered.slice(
        start,
        end
      );
    }, [
      filtered,
      currentPage,
    ]);

  /* ==========================================================
     CACHE UI STATE
     
     This only stores local UI state.
     It does NOT trigger API requests.
  ========================================================== */

  useEffect(() => {
    if (templates.length === 0) {
      return;
    }

    const existing =
      getCachedEmailTemplatesList();

    setCachedEmailTemplatesList({
      templates,
      search,
      categoryFilter,
      currentPage,
      cachedAt:
        existing?.cachedAt ??
        Date.now(),
    });
  }, [
    templates,
    search,
    categoryFilter,
    currentPage,
  ]);

  /* ==========================================================
     SEARCH
  ========================================================== */

  function handleSearch(
    value: string
  ) {
    setSearch(value);
    setCurrentPage(1);
  }

  /* ==========================================================
     CATEGORY
  ========================================================== */

  function handleCategoryChange(
    value: CategoryFilter
  ) {
    setCategoryFilter(value);
    setCurrentPage(1);
  }

  /* ==========================================================
     TOAST
  ========================================================== */

  function showToast(
    message: string
  ) {
    setToastMsg(message);

    window.setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  }

  /* ==========================================================
     DELETE
  ========================================================== */

  async function confirmDelete() {
    if (
      !deleteModal ||
      deleting
    ) {
      return;
    }

    const deletedTemplate =
      deleteModal;

    setDeleting(true);

    /*
     * Optimistic UI update.
     */
    setTemplates(
      (previous) =>
        previous.filter(
          (template) =>
            String(template.id) !==
            String(
              deletedTemplate.id
            )
        )
    );

    removeCachedEmailTemplateFromList(
      deletedTemplate.id
    );

    try {
      await deleteEmailTemplate(
        deletedTemplate.id
      );

      showToast(
        `"${deletedTemplate.name}" deleted successfully.`
      );
    } catch (error) {
      /*
       * Rollback if API deletion fails.
       */
      setTemplates(
        (previous) => [
          deletedTemplate,
          ...previous,
        ]
      );

      showToast(
        error instanceof Error
          ? error.message
          : "Failed to delete template."
      );
    } finally {
      setDeleting(false);
      setDeleteModal(null);
    }
  }

  /* ============================================================
     PAGINATION HELPERS
  ============================================================ */

  const startItem =
    filtered.length === 0
      ? 0
      : (currentPage - 1) *
          ITEMS_PER_PAGE +
        1;

  const endItem =
    Math.min(
      currentPage *
        ITEMS_PER_PAGE,
      filtered.length
    );

  function goToPage(page: number) {
    const safePage = Math.min(
      Math.max(page, 1),
      totalPages
    );

    if (
      safePage === currentPage
    ) {
      return;
    }

    /*
     * IMPORTANT:
     * Only changes local page state.
     * NO API request is made here.
     */
    setCurrentPage(safePage);
  }

  /* ============================================================
     PAGE NUMBERS
  ============================================================ */

  function getPageNumbers(): (
    number | "..."
  )[] {
    if (totalPages <= 7) {
      return Array.from(
        {
          length: totalPages,
        },
        (_, index) =>
          index + 1
      );
    }

    if (currentPage <= 4) {
      return [
        1,
        2,
        3,
        4,
        5,
        "...",
        totalPages,
      ];
    }

    if (
      currentPage >=
      totalPages - 3
    ) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <DashboardLayout>
      <div className="page-wrapper">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="page-header">
          <div>
            <h1 className="page-title">
              Email Templates
            </h1>

            <p className="page-subtitle">
              Create and manage email
              templates for consistent
              communication.
            </p>
          </div>

          {canCreate && (
            <button
              type="button"
              className="btn-add"
              onClick={() =>
                router.push(
                  "/email-templates/new"
                )
              }
            >
              <HiPlus size={16} />
              Add Template
            </button>
          )}
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {loadError && (
          <div
            style={{
              background: "#fef2f2",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "#fca5a5",
              borderRadius: 8,
              padding:
                "10px 16px",
              marginBottom: 16,
              fontSize:
                "0.8125rem",
              color: "#b91c1c",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: 12,
            }}
          >
            <span>
              ❌ {loadError}
            </span>

            <button
              type="button"
              onClick={() =>
                fetchTemplates(true)
              }
              style={{
                background: "none",
                border: "none",
                color: "#4f46e5",
                cursor: "pointer",
                fontWeight: 600,
                textDecoration:
                  "underline",
                fontFamily:
                  "inherit",
                fontSize:
                  "0.8125rem",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading ? (
          <ThemeLoader
            label="Loading templates..."
            minHeight={240}
          />
        ) : (
          <div
            style={{
              background: "#fff",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "#e2e8f0",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow:
                "0 1px 4px rgba(0,0,0,0.05)",
              position: "relative",
            }}
          >

            {/* =================================================
                REFRESH INDICATOR
            ================================================= */}

            {refreshing && (
              <div
                style={{
                  position:
                    "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background:
                    "linear-gradient(90deg,#4f46e5,#7c3aed,#4f46e5)",
                  backgroundSize:
                    "200% 100%",
                  animation:
                    "email-template-refresh 1.2s linear infinite",
                  zIndex: 5,
                }}
              />
            )}

            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div
              style={{
                padding:
                  "16px 20px",
                borderBottomWidth: 1,
                borderBottomStyle:
                  "solid",
                borderBottomColor:
                  "#f1f5f9",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >

              {/* Search */}

              <div
                style={{
                  flex: 1,
                  minWidth: 260,
                  position: "relative",
                }}
              >
                <HiSearch
                  size={15}
                  style={{
                    position:
                      "absolute",
                    left: 12,
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    color:
                      "#94a3b8",
                    pointerEvents:
                      "none",
                  }}
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    handleSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search templates by name or subject..."
                  style={{
                    width: "100%",
                    padding:
                      "8px 12px 8px 36px",
                    borderWidth: 1.5,
                    borderStyle:
                      "solid",
                    borderColor:
                      "#e2e8f0",
                    borderRadius: 8,
                    background:
                      "#f8fafc",
                    color:
                      "#0f172a",
                    fontSize:
                      "0.875rem",
                    fontFamily:
                      "inherit",
                    outline: "none",
                  }}
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor =
                      "#4f46e5";

                    event.currentTarget.style.background =
                      "#fff";
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor =
                      "#e2e8f0";

                    event.currentTarget.style.background =
                      "#f8fafc";
                  }}
                />
              </div>

              {/* Results */}

              <span
                style={{
                  fontSize:
                    "0.875rem",
                  color: "#64748b",
                  fontWeight: 500,
                  whiteSpace:
                    "nowrap",
                }}
              >
                {filtered.length}{" "}
                {filtered.length === 1
                  ? "result"
                  : "results"}
              </span>

              {/* Category */}

              <div
                style={{
                  position:
                    "relative",
                }}
              >
                <select
                  value={
                    categoryFilter
                  }
                  onChange={(event) =>
                    handleCategoryChange(
                      event.target
                        .value as CategoryFilter
                    )
                  }
                  style={{
                    padding:
                      "8px 36px 8px 14px",
                    borderWidth: 1.5,
                    borderStyle:
                      "solid",
                    borderColor:
                      "#e2e8f0",
                    borderRadius: 8,
                    background: "#fff",
                    color:
                      "#374151",
                    fontSize:
                      "0.875rem",
                    fontFamily:
                      "inherit",
                    outline: "none",
                    cursor:
                      "pointer",
                    appearance:
                      "none",
                    WebkitAppearance:
                      "none",
                    fontWeight: 500,
                  }}
                >
                  <option value="All Categories">
                    All Categories
                  </option>

                  {ALL_CATEGORIES.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>

                <HiChevronDown
                  size={14}
                  style={{
                    position:
                      "absolute",
                    right: 11,
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    color:
                      "#64748b",
                    pointerEvents:
                      "none",
                  }}
                />
              </div>
            </div>

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {filtered.length === 0 ? (
              <div className="empty-state">

                <HiMail
                  size={40}
                  color="#cbd5e1"
                  style={{
                    margin:
                      "0 auto 12px",
                    display: "block",
                  }}
                />

                <p className="empty-state-title">
                  {templates.length ===
                  0
                    ? "No templates yet"
                    : "No templates found"}
                </p>

                <p className="empty-state-sub">
                  {templates.length ===
                  0
                    ? "Create your first email template to get started."
                    : "Try adjusting your search or category filter."}
                </p>

                {templates.length ===
                  0 &&
                  canCreate && (
                    <button
                      type="button"
                      className="btn-add"
                      style={{
                        marginTop: 12,
                      }}
                      onClick={() =>
                        router.push(
                          "/email-templates/new"
                        )
                      }
                    >
                      <HiPlus
                        size={16}
                      />
                      Add Template
                    </button>
                  )}
              </div>
            ) : (
              <>
                {/* =============================================
                    TABLE
                ============================================= */}

                <div
                  style={{
                    width: "100%",
                    overflowX:
                      "auto",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      minWidth: 760,
                      borderCollapse:
                        "collapse",
                      fontFamily:
                        "inherit",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background:
                            "#f8fafc",
                        }}
                      >
                        {[
                          {
                            label:
                              "TEMPLATE NAME",
                            width:
                              "35%",
                          },
                          {
                            label:
                              "SUBJECT",
                            width:
                              "30%",
                          },
                          {
                            label:
                              "LAST UPDATED",
                            width:
                              "20%",
                          },
                          {
                            label:
                              "ACTIONS",
                            width:
                              "15%",
                          },
                        ].map(
                          (
                            column
                          ) => (
                            <th
                              key={
                                column.label
                              }
                              style={{
                                padding:
                                  "12px 20px",
                                textAlign:
                                  "left",
                                fontSize:
                                  "0.72rem",
                                fontWeight:
                                  700,
                                color:
                                  "#94a3b8",
                                letterSpacing:
                                  "0.06em",
                                borderBottomWidth:
                                  1,
                                borderBottomStyle:
                                  "solid",
                                borderBottomColor:
                                  "#e2e8f0",
                                width:
                                  column.width,
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {
                                column.label
                              }
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedTemplates.map(
                        (
                          template,
                          index
                        ) => {
                          const isLast =
                            index ===
                            paginatedTemplates.length -
                              1;

                          const date =
                            formatDate(
                              template.updatedAt
                            );

                          const categoryStyle =
                            CATEGORY_COLORS[
                              template.category
                            ] ??
                            CATEGORY_COLORS[
                              "General"
                            ];

                          return (
                            <tr
                              key={
                                template.id
                              }
                              style={{
                                transition:
                                  "background 0.1s",
                                borderBottomWidth:
                                  isLast
                                    ? 0
                                    : 1,
                                borderBottomStyle:
                                  isLast
                                    ? "none"
                                    : "solid",
                                borderBottomColor:
                                  "#f1f5f9",
                              }}
                              onMouseEnter={(
                                event
                              ) => {
                                event.currentTarget.style.background =
                                  "#fafafa";
                              }}
                              onMouseLeave={(
                                event
                              ) => {
                                event.currentTarget.style.background =
                                  "transparent";
                              }}
                            >

                              {/* =================================
                                  TEMPLATE NAME
                              ================================= */}

                              <td
                                style={{
                                  padding:
                                    "16px 20px",
                                  verticalAlign:
                                    "middle",
                                }}
                              >
                                <div
                                  style={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap: 12,
                                  }}
                                >
                                  <TemplateIcon
                                    category={
                                      template.category
                                    }
                                  />

                                  <div>
                                    <p
                                      style={{
                                        margin: 0,
                                        fontWeight:
                                          700,
                                        color:
                                          "#0f172a",
                                        fontSize:
                                          "0.9rem",
                                      }}
                                    >
                                      {
                                        template.name
                                      }
                                    </p>

                                    <span
                                      style={{
                                        display:
                                          "inline-flex",
                                        marginTop:
                                          4,
                                        fontSize:
                                          "0.72rem",
                                        padding:
                                          "2px 8px",
                                        borderRadius:
                                          9999,
                                        background:
                                          categoryStyle.bg,
                                        color:
                                          categoryStyle.color,
                                        fontWeight:
                                          500,
                                      }}
                                    >
                                      {
                                        template.category
                                      }
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* =================================
                                  SUBJECT
                              ================================= */}

                              <td
                                style={{
                                  padding:
                                    "16px 20px",
                                  verticalAlign:
                                    "middle",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize:
                                      "0.875rem",
                                    color:
                                      "#475569",
                                    lineHeight:
                                      1.5,
                                  }}
                                >
                                  {
                                    template.subject
                                  }
                                </span>
                              </td>

                              {/* =================================
                                  UPDATED
                              ================================= */}

                              <td
                                style={{
                                  padding:
                                    "16px 20px",
                                  verticalAlign:
                                    "middle",
                                }}
                              >
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize:
                                      "0.875rem",
                                    color:
                                      "#374151",
                                    fontWeight:
                                      500,
                                  }}
                                >
                                  {
                                    date.date
                                  }
                                </p>

                                <p
                                  style={{
                                    margin: 0,
                                    fontSize:
                                      "0.75rem",
                                    color:
                                      "#94a3b8",
                                  }}
                                >
                                  {
                                    date.time
                                  }
                                </p>
                              </td>

                              {/* =================================
                                  ACTIONS
                              ================================= */}

                              <td
                                style={{
                                  padding:
                                    "16px 20px",
                                  verticalAlign:
                                    "middle",
                                }}
                              >
                                <div
                                  style={{
                                    display:
                                      "inline-flex",
                                    gap: 6,
                                    alignItems:
                                      "center",
                                  }}
                                >

                                  {/* VIEW */}

                                  <button
                                    type="button"
                                    title="View"
                                    aria-label={`View ${template.name}`}
                                    onClick={() =>
                                      router.push(
                                        `/email-templates/${template.id}`
                                      )
                                    }
                                    style={{
                                      width: 34,
                                      height: 34,
                                      borderWidth: 1.5,
                                      borderStyle:
                                        "solid",
                                      borderColor:
                                        "#e2e8f0",
                                      borderRadius:
                                        7,
                                      background:
                                        "#fff",
                                      cursor:
                                        "pointer",
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                      color:
                                        "#4f46e5",
                                      padding: 0,
                                      transition:
                                        "all 0.12s ease",
                                    }}
                                    onMouseEnter={(
                                      event
                                    ) => {
                                      event.currentTarget.style.background =
                                        "#eef2ff";

                                      event.currentTarget.style.borderColor =
                                        "#a5b4fc";

                                      event.currentTarget.style.transform =
                                        "translateY(-1px)";
                                    }}
                                    onMouseLeave={(
                                      event
                                    ) => {
                                      event.currentTarget.style.background =
                                        "#fff";

                                      event.currentTarget.style.borderColor =
                                        "#e2e8f0";

                                      event.currentTarget.style.transform =
                                        "none";
                                    }}
                                  >
                                    <HiEye
                                      size={
                                        15
                                      }
                                    />
                                  </button>

                                  {/* EDIT */}

                                  {canEdit && (
                                  <button
                                    type="button"
                                    title="Edit"
                                    aria-label={`Edit ${template.name}`}
                                    onClick={() =>
                                      router.push(
                                        `/email-templates/${template.id}/edit`
                                      )
                                    }
                                    style={{
                                      width: 34,
                                      height: 34,
                                      borderWidth: 1.5,
                                      borderStyle:
                                        "solid",
                                      borderColor:
                                        "#e2e8f0",
                                      borderRadius:
                                        7,
                                      background:
                                        "#fff",
                                      cursor:
                                        "pointer",
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                      color:
                                        "#0891b2",
                                      padding: 0,
                                      transition:
                                        "all 0.12s ease",
                                    }}
                                    onMouseEnter={(
                                      event
                                    ) => {
                                      event.currentTarget.style.background =
                                        "#ecfeff";

                                      event.currentTarget.style.borderColor =
                                        "#a5f3fc";

                                      event.currentTarget.style.transform =
                                        "translateY(-1px)";
                                    }}
                                    onMouseLeave={(
                                      event
                                    ) => {
                                      event.currentTarget.style.background =
                                        "#fff";

                                      event.currentTarget.style.borderColor =
                                        "#e2e8f0";

                                      event.currentTarget.style.transform =
                                        "none";
                                    }}
                                  >
                                    <HiPencil
                                      size={
                                        14
                                      }
                                    />
                                  </button>

                                  )}

                                  {/* DELETE */}

                                  {canDelete && (
                                    <button
                                      type="button"
                                      title="Delete"
                                      aria-label={`Delete ${template.name}`}
                                      onClick={() =>
                                        setDeleteModal(
                                          template
                                        )
                                      }
                                      style={{
                                        width: 34,
                                        height: 34,
                                        borderWidth: 1.5,
                                        borderStyle:
                                          "solid",
                                        borderColor:
                                          "#e2e8f0",
                                        borderRadius:
                                          7,
                                        background:
                                          "#fff",
                                        cursor:
                                          "pointer",
                                        display:
                                          "flex",
                                        alignItems:
                                          "center",
                                        justifyContent:
                                          "center",
                                        color:
                                          "#ef4444",
                                        padding: 0,
                                        transition:
                                          "all 0.12s ease",
                                      }}
                                      onMouseEnter={(
                                        event
                                      ) => {
                                        event.currentTarget.style.background =
                                          "#fef2f2";

                                        event.currentTarget.style.borderColor =
                                          "#fca5a5";

                                        event.currentTarget.style.transform =
                                          "translateY(-1px)";
                                      }}
                                      onMouseLeave={(
                                        event
                                      ) => {
                                        event.currentTarget.style.background =
                                          "#fff";

                                        event.currentTarget.style.borderColor =
                                          "#e2e8f0";

                                        event.currentTarget.style.transform =
                                          "none";
                                      }}
                                    >
                                      <HiTrash
                                        size={
                                          14
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
                </div>

                {/* =================================================
                    PAGINATION
                   
                    This pagination is LOCAL.
                    Clicking page 2 does NOT call the API.
                ================================================= */}

                {totalPages > 1 && (
                  <div
                    style={{
                      padding:
                        "14px 20px",
                      borderTopWidth:
                        1,
                      borderTopStyle:
                        "solid",
                      borderTopColor:
                        "#f1f5f9",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "space-between",
                      gap: 16,
                      flexWrap:
                        "wrap",
                    }}
                  >
                    {/* LEFT INFO */}

                    <p
                      style={{
                        margin: 0,
                        fontSize:
                          "0.8125rem",
                        color:
                          "#64748b",
                      }}
                    >
                      Showing{" "}
                      <strong
                        style={{
                          color:
                            "#0f172a",
                        }}
                      >
                        {startItem}
                      </strong>{" "}
                      to{" "}
                      <strong
                        style={{
                          color:
                            "#0f172a",
                        }}
                      >
                        {endItem}
                      </strong>{" "}
                      of{" "}
                      <strong
                        style={{
                          color:
                            "#0f172a",
                        }}
                      >
                        {filtered.length}
                      </strong>{" "}
                      templates
                    </p>

                    {/* RIGHT PAGINATION */}

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: 4,
                      }}
                    >

                      {/* PREVIOUS */}

                      <button
                        type="button"
                        onClick={() =>
                          goToPage(
                            currentPage -
                              1
                          )
                        }
                        disabled={
                          currentPage ===
                          1
                        }
                        aria-label="Previous page"
                        title="Previous page"
                        style={{
                          width: 34,
                          height: 34,
                          padding: 0,
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          borderWidth:
                            1.5,
                          borderStyle:
                            "solid",
                          borderColor:
                            "#e2e8f0",
                          borderRadius:
                            7,
                          background:
                            "#fff",
                          color:
                            "#475569",
                          cursor:
                            currentPage ===
                            1
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            currentPage ===
                            1
                              ? 0.45
                              : 1,
                          fontFamily:
                            "inherit",
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>

                      {/* PAGE NUMBERS */}

                      {getPageNumbers().map(
                        (
                          page,
                          index
                        ) =>
                          page ===
                          "..." ? (
                            <span
                              key={`ellipsis-${index}`}
                              style={{
                                minWidth:
                                  20,
                                textAlign:
                                  "center",
                                color:
                                  "#94a3b8",
                                fontSize:
                                  "0.875rem",
                                userSelect:
                                  "none",
                              }}
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={page}
                              type="button"
                              onClick={() =>
                                goToPage(
                                  page
                                )
                              }
                              aria-label={`Go to page ${page}`}
                              aria-current={
                                page ===
                                currentPage
                                  ? "page"
                                  : undefined
                              }
                              style={{
                                minWidth:
                                  34,
                                height: 34,
                                padding:
                                  "0 8px",
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                borderWidth:
                                  1.5,
                                borderStyle:
                                  "solid",
                                borderColor:
                                  page ===
                                  currentPage
                                    ? "#4f46e5"
                                    : "#e2e8f0",
                                borderRadius:
                                  7,
                                background:
                                  page ===
                                  currentPage
                                    ? "#4f46e5"
                                    : "#fff",
                                color:
                                  page ===
                                  currentPage
                                    ? "#fff"
                                    : "#475569",
                                fontSize:
                                  "0.8125rem",
                                fontWeight:
                                  page ===
                                  currentPage
                                    ? 700
                                    : 500,
                                cursor:
                                  page ===
                                  currentPage
                                    ? "default"
                                    : "pointer",
                                fontFamily:
                                  "inherit",
                                boxShadow:
                                  page ===
                                  currentPage
                                    ? "0 2px 8px rgba(79,70,229,0.25)"
                                    : "none",
                              }}
                            >
                              {
                                page
                              }
                            </button>
                          )
                      )}

                      {/* NEXT */}

                      <button
                        type="button"
                        onClick={() =>
                          goToPage(
                            currentPage +
                              1
                          )
                        }
                        disabled={
                          currentPage ===
                          totalPages
                        }
                        aria-label="Next page"
                        title="Next page"
                        style={{
                          width: 34,
                          height: 34,
                          padding: 0,
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          borderWidth:
                            1.5,
                          borderStyle:
                            "solid",
                          borderColor:
                            "#e2e8f0",
                          borderRadius:
                            7,
                          background:
                            "#fff",
                          color:
                            "#475569",
                          cursor:
                            currentPage ===
                            totalPages
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            currentPage ===
                            totalPages
                              ? 0.45
                              : 1,
                          fontFamily:
                            "inherit",
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* =======================================================
            DELETE CONFIRMATION MODAL
        ======================================================= */}

        {deleteModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              zIndex: 1000,
              padding: 20,
            }}
            onClick={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                if (!deleting) {
                  setDeleteModal(
                    null
                  );
                }
              }
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding:
                  "32px 28px",
                maxWidth: 420,
                width: "100%",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.2)",
                textAlign:
                  "center",
                position:
                  "relative",
              }}
            >

              {/* CLOSE */}

              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setDeleteModal(
                    null
                  )
                }
                aria-label="Close"
                style={{
                  position:
                    "absolute",
                  top: 16,
                  right: 16,
                  border: "none",
                  background:
                    "transparent",
                  cursor:
                    deleting
                      ? "not-allowed"
                      : "pointer",
                  color:
                    "#94a3b8",
                  fontSize:
                    "1.25rem",
                  opacity:
                    deleting
                      ? 0.5
                      : 1,
                }}
              >
                ✕
              </button>

              {/* ICON */}

              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius:
                    "50%",
                  background:
                    "#fef2f2",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  margin:
                    "0 auto 16px",
                }}
              >
                <HiTrash
                  size={26}
                  color="#ef4444"
                />
              </div>

              {/* TITLE */}

              <h2
                style={{
                  margin:
                    "0 0 10px",
                  fontSize:
                    "1.2rem",
                  fontWeight: 700,
                  color:
                    "#0f172a",
                }}
              >
                Delete Email Template?
              </h2>

              {/* MESSAGE */}

              <p
                style={{
                  margin:
                    "0 0 24px",
                  color:
                    "#64748b",
                  fontSize:
                    "0.9rem",
                  lineHeight: 1.6,
                }}
              >
                Are you sure you
                want to delete{" "}
                <strong
                  style={{
                    color:
                      "#4f46e5",
                  }}
                >
                  &ldquo;
                  {
                    deleteModal.name
                  }
                  &rdquo;
                </strong>
                ? This action
                cannot be undone.
              </p>

              {/* BUTTONS */}

              <div
                style={{
                  display:
                    "flex",
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() =>
                    setDeleteModal(
                      null
                    )
                  }
                  style={{
                    flex: 1,
                    padding:
                      "11px 20px",
                    borderWidth:
                      1.5,
                    borderStyle:
                      "solid",
                    borderColor:
                      "#e2e8f0",
                    borderRadius: 8,
                    background:
                      "#fff",
                    color:
                      "#475569",
                    fontWeight: 600,
                    fontSize:
                      "0.9rem",
                    cursor:
                      deleting
                        ? "not-allowed"
                        : "pointer",
                    fontFamily:
                      "inherit",
                    opacity:
                      deleting
                        ? 0.6
                        : 1,
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    confirmDelete
                  }
                  disabled={
                    deleting
                  }
                  style={{
                    flex: 1,
                    padding:
                      "11px 20px",
                    border: "none",
                    borderRadius: 8,
                    background:
                      "#ef4444",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize:
                      "0.9rem",
                    cursor:
                      deleting
                        ? "wait"
                        : "pointer",
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    gap: 6,
                    opacity:
                      deleting
                        ? 0.7
                        : 1,
                    fontFamily:
                      "inherit",
                  }}
                >
                  <Trash2
                    size={15}
                  />

                  {deleting
                    ? "Deleting..."
                    : "Delete Template"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================
            TOAST
        ======================================================= */}

        {toastMsg && (
          <div
            className="toast"
            role="status"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                flexShrink: 0,
              }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>

            {toastMsg}
          </div>
        )}

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
      </div>
    </DashboardLayout>
  );
}