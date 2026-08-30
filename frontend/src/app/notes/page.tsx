"use client";

import {
  useState,
  useEffect,
  useCallback,
} from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import SearchBar from "@/components/customers/SearchBar";
import Pagination from "@/components/customers/Pagination";

import {
  Note,
  NoteCategory,
  ALL_CATEGORIES,
  CATEGORY_COLORS,
  PRIORITY_COLORS,
} from "@/data/notes";

import {
  listNotes,
  deleteNote,
  mapApiNoteToUi,
  toggleLocalStar,
  ApiNoteCategory,
  listCategories,
} from "@/lib/notesApi";

import {
  getCachedNotesList,
  setCachedNotesList,
  removeNoteFromCache,
} from "@/data/notesCache";

import {
  FileText,
  Pin,
  Archive,
  Star,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Plus,
  Tag,
} from "lucide-react";

import { usePermission } from "@/hooks/usePermissions";

const ITEMS_PER_PAGE = 9;

function timeAgo(dateStr: string): string {
  const diff =
    Date.now() -
    new Date(dateStr).getTime();

  const mins = Math.floor(
    diff / 60000
  );

  const hours = Math.floor(
    diff / 3600000
  );

  const days = Math.floor(
    diff / 86400000
  );

  if (mins < 60) {
    return `${mins}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Date(
    dateStr
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function NoteCard({
  note,
  onView,
  onEdit,
  onDelete,
  onToggleStar,
}: {
  note: Note;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStar: () => void;
}) {
  const [menuOpen, setMenuOpen] =
    useState(false);
      const canEdit = usePermission("notes", "edit");
  const canDelete = usePermission("notes", "delete");

  const catStyle =
    CATEGORY_COLORS[note.category];

  const priStyle =
    PRIORITY_COLORS[note.priority];

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.04)",
        transition:
          "box-shadow 0.15s ease, transform 0.15s ease",
        cursor: "pointer",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 4px 16px rgba(0,0,0,0.08)";

        e.currentTarget.style.transform =
          "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          "0 1px 3px rgba(0,0,0,0.04)";

        e.currentTarget.style.transform =
          "translateY(0)";
      }}
      onClick={onView}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              background: catStyle.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileText
              size={16}
              color={catStyle.color}
            />
          </div>

          {note.isPinned && (
            <Pin
              size={14}
              color="#4f46e5"
            />
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          <button
            onClick={onToggleStar}
            style={{
              width: 28,
              height: 28,
              border: "none",
              background: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              color: note.isStarred
                ? "#f59e0b"
                : "#94a3b8",
            }}
            title="Star"
          >
            <Star
              size={14}
              fill={
                note.isStarred
                  ? "#f59e0b"
                  : "none"
              }
            />
          </button>

          <div
            style={{
              position: "relative",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(
                  (open) => !open
                );
              }}
              style={{
                width: 28,
                height: 28,
                border: "none",
                background: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                color: "#94a3b8",
              }}
            >
              <MoreHorizontal size={14} />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  marginTop: "4px",
                  background: "#fff",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: "10px",
                  boxShadow:
                    "0 8px 24px rgba(0,0,0,0.12)",
                  zIndex: 100,
                  minWidth: "140px",
                  overflow: "hidden",
                }}
              >
                {[
                  {
                    label: "View",
                    icon: <Eye size={14} />,
                    action: onView,
                    color: "#374151",
                  },
                  ...(canEdit
                    ? [{
                        label: "Edit",
                        icon: <Edit size={14} />,
                        action: onEdit,
                        color: "#374151",
                      }]
                    : []),
                  ...(canDelete
                    ? [{
                    label: "Delete",
                    icon: <Trash2 size={14} />,
                    action: onDelete,
                    color: "#ef4444",
                  }]
                    : []),
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      item.action();
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding:
                        "9px 14px",
                      border: "none",
                      background:
                        "transparent",
                      cursor: "pointer",
                      fontSize:
                        "0.875rem",
                      fontFamily:
                        "inherit",
                      color: item.color,
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3
          style={{
            margin: "0 0 6px",
            fontSize: "0.9375rem",
            fontWeight: 700,
            color: "#0f172a",
            lineHeight: 1.4,
          }}
        >
          {note.title}
        </h3>

        <p
          style={{
            margin: 0,
            fontSize: "0.8125rem",
            color: "#64748b",
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {note.content.split("\n")[0]}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            padding: "3px 10px",
            borderRadius: "6px",
            fontSize: "0.72rem",
            fontWeight: 600,
            background: catStyle.bg,
            color: catStyle.color,
          }}
        >
          {note.category}
        </span>

        <span
          style={{
            padding: "3px 10px",
            borderRadius: "9999px",
            fontSize: "0.72rem",
            fontWeight: 600,
            background: priStyle.bg,
            color: priStyle.color,
            border: `1px solid ${priStyle.border}`,
          }}
        >
          {note.priority}
        </span>
      </div>

      {note.tags.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flexWrap: "wrap",
          }}
        >
          {note.tags
            .slice(0, 3)
            .map((tag) => (
              <span
                key={tag.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  background: "#f1f5f9",
                  color: "#475569",
                }}
              >
                <Tag size={10} />
                {tag.label}
              </span>
            ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          paddingTop: "8px",
          borderTop:
            "1px solid #f1f5f9",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.6rem",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {note.authorInitials}
          </div>

          <span
            style={{
              fontSize: "0.75rem",
              color: "#94a3b8",
            }}
          >
            {timeAgo(note.updatedAt)}
          </span>
        </div>

        {note.relatedTo && (
          <span
            style={{
              fontSize: "0.72rem",
              color: "#4f46e5",
              fontWeight: 500,
            }}
          >
            {note.relatedTo}
          </span>
        )}
      </div>
    </div>
  );
}

export default function NotesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id;

  const [notes, setNotes] =
    useState<Note[]>([]);

  const [apiCategories, setApiCategories] =
    useState<ApiNoteCategory[]>([]);

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState<"All" | NoteCategory>("All");

  const [currentPage, setCurrentPage] =
    useState(1);

  const canCreate =
    usePermission(
      "notes",
      "create"
    );

  const canDelete =
    usePermission(
      "notes",
      "delete"
    );

  const canEdit =
    usePermission(
      "notes",
      "edit"
    );

  const [totalCount, setTotalCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [hydrated, setHydrated] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [deleteModal, setDeleteModal] =
    useState<Note | null>(null);

  const [deleteSuccess, setDeleteSuccess] =
    useState(false);

  /*
   * Restore cache AFTER hydration.
   *
   * This prevents:
   * server -> 0 notes
   * client -> cached notes
   *
   * hydration mismatch.
   */
  useEffect(() => {
    if (!userId) return;

    const cached =
      getCachedNotesList(userId);

    if (cached) {
      setNotes(cached.notes);
      setTotalCount(
        cached.totalCount
      );

      setSearch(cached.search);
      setCurrentPage(
        cached.currentPage
      );

      setLoading(false);
    }

    setHydrated(true);
  }, [userId]);

  /*
   * Fetch fresh Notes after hydration.
   *
   * Existing cached data remains visible.
   */
  const fetchNotes =
    useCallback(async () => {
      if (!hydrated || !userId) return;

      let cancelled = false;

      const cached =
        getCachedNotesList(userId);

      /*
       * Only show loader if there is
       * absolutely no cached data.
       */
      if (!cached) {
        setLoading(true);
      } else {
        setLoading(false);
      }

      setError(null);

      try {
        /*
         * Fetch categories and notes
         * simultaneously.
         */
        const [cats, res] =
          await Promise.all([
            listCategories(),

            listNotes({
              search:
                search || undefined,
              page: currentPage,
            }),
          ]);

        if (cancelled) return;

        setApiCategories(cats);

        const mappedNotes =
          res.results.map(
            (note) =>
              mapApiNoteToUi(
                note,
                cats
              )
          );

        setNotes(mappedNotes);
        setTotalCount(res.count);

        /*
         * Save latest list.
         */
        setCachedNotesList(userId, {
          notes: mappedNotes,
          totalCount: res.count,
          search,
          currentPage,
        });
      } catch (err) {
        if (cancelled) return;

        /*
         * If cache exists, keep showing
         * cached data.
         */
        if (!cached) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load notes."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }

      return () => {
        cancelled = true;
      };
    }, [
      hydrated,
      userId,
      search,
      currentPage,
    ]);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  const filtered =
    categoryFilter === "All"
      ? notes
      : notes.filter(
          (note) =>
            note.category ===
            categoryFilter
        );

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalCount /
        ITEMS_PER_PAGE
    )
  );

  const pinned =
    notes.filter(
      (note) => note.isPinned
    ).length;

  const archived =
    notes.filter(
      (note) => note.isArchived
    ).length;

  const categories =
    new Set(
      notes.map(
        (note) => note.category
      )
    ).size;

  function handleToggleStar(
    note: Note
  ) {
    const nowStarred =
      toggleLocalStar(
        note.id
      );

    const updated: Note = {
      ...note,
      isStarred: nowStarred,
    };

    setNotes((previous) =>
      previous.map((item) =>
        item.id === note.id
          ? updated
          : item
      )
    );

    /*
     * Keep the local cache
     * synchronized.
     */
    const cached =
      userId
        ? getCachedNotesList(userId)
        : null;

    if (cached && userId) {
      setCachedNotesList(userId, {
        ...cached,
        notes: cached.notes.map(
          (item) =>
            item.id === note.id
              ? updated
              : item
        ),
      });
    }
  }

  function handleDelete(
    note: Note
  ) {
    setDeleteModal(note);
  }

  async function confirmDelete() {
    if (!deleteModal) return;

    try {
      await deleteNote(
        deleteModal.id
      );

      /*
       * Remove from cache immediately.
       */
      if (userId) {
        removeNoteFromCache(
          userId,
          deleteModal.id
        );
      }

      setNotes((previous) =>
        previous.filter(
          (note) =>
            note.id !==
            deleteModal.id
        )
      );

      setTotalCount(
        (count) =>
          Math.max(0, count - 1)
      );

      setDeleteModal(null);
      setDeleteSuccess(true);

      setTimeout(
        () =>
          setDeleteSuccess(false),
        3000
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete note."
      );

      setDeleteModal(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              Notes
            </h1>

            <p className="page-subtitle">
              Capture, organize and find
              your important notes
            </p>
          </div>

          {canCreate && (
            <button
              className="btn-add"
              onClick={() =>
                router.push(
                  "/notes/new"
                )
              }
            >
              <Plus size={16} />
              New Note
            </button>
          )}
        </div>

        {error && (
          <div
            className="msg-error"
            style={{
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <div className="stats-grid-4">
          {[
            {
              label: "All Notes",
              value: totalCount,
              icon: (
                <FileText size={20} />
              ),
              color: "#4f46e5",
              bg: "#eef2ff",
            },
            {
              label: "Categories",
              value: categories,
              icon: (
                <Tag size={20} />
              ),
              color: "#7c3aed",
              bg: "#faf5ff",
            },
            {
              label: "Pinned",
              value: pinned,
              icon: (
                <Pin size={20} />
              ),
              color: "#0891b2",
              bg: "#ecfeff",
            },
            {
              label: "Archived",
              value: archived,
              icon: (
                <Archive size={20} />
              ),
              color: "#64748b",
              bg: "#f1f5f9",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="stat-card"
            >
              <div
                className="stat-card-icon"
                style={{
                  background:
                    card.bg,
                  color:
                    card.color,
                }}
              >
                {card.icon}
              </div>

              <div>
                <p
                  className="stat-card-value"
                  style={{
                    color:
                      card.color,
                  }}
                >
                  {card.value}
                </p>

                <p className="stat-card-label">
                  {card.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "#fff",
            border:
              "1px solid #e2e8f0",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow:
              "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              padding:
                "16px 20px",
              borderBottom:
                "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize:
                  "1rem",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              My Notes
            </h2>

            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "10px",
                flex: 1,
                maxWidth:
                  "500px",
                justifyContent:
                  "flex-end",
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
                  value={search}
                  onChange={(value) => {
                    setSearch(value);
                    setCurrentPage(
                      1
                    );
                  }}
                  placeholder="Search notes..."
                  resultCount={
                    filtered.length
                  }
                />
              </div>

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
                  onChange={(e) => {
                    setCategoryFilter(
                      e.target.value as
                        | "All"
                        | NoteCategory
                    );

                    setCurrentPage(
                      1
                    );
                  }}
                  style={{
                    padding:
                      "8px 36px 8px 14px",
                    borderWidth:
                      "1.5px",
                    borderStyle:
                      "solid",
                    borderColor:
                      "#e2e8f0",
                    borderRadius:
                      "8px",
                    background:
                      "#fff",
                    color:
                      "#374151",
                    fontSize:
                      "0.875rem",
                    fontFamily:
                      "inherit",
                    outline:
                      "none",
                    cursor:
                      "pointer",
                    appearance:
                      "none",
                    WebkitAppearance:
                      "none",
                    fontWeight: 500,
                  }}
                >
                  <option value="All">
                    All Categories
                  </option>

                  {ALL_CATEGORIES.map(
                    (category) => (
                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>

                <svg
                  style={{
                    position:
                      "absolute",
                    right: "11px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    color:
                      "#64748b",
                    pointerEvents:
                      "none",
                  }}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "20px",
            }}
          >
            {loading &&
            filtered.length === 0 ? (
              <ThemeLoader
                label="Loading notes..."
                minHeight={220}
              />
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <FileText
                  size={48}
                  color="#cbd5e1"
                  style={{
                    margin:
                      "0 auto 12px",
                    display:
                      "block",
                  }}
                />

                <p className="empty-state-title">
                  No notes found
                </p>

                <p className="empty-state-sub">
                  Try adjusting your
                  search or create a
                  new note.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "16px",
                }}
              >
                {filtered.map(
                  (note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onView={() => {
                        router.push(
                          `/notes/${note.id}`
                        );
                      }}
                      onEdit={() => {
                        router.push(
                          `/notes/${note.id}/edit`
                        );
                      }}
                      onDelete={() =>
                        handleDelete(
                          note
                        )
                      }
                      onToggleStar={() =>
                        handleToggleStar(
                          note
                        )
                      }
                    />
                  )
                )}
              </div>
            )}
          </div>

          {!loading &&
            filtered.length > 0 && (
              <div
                style={{
                  padding:
                    "4px 20px 16px",
                  borderTop:
                    "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    display: "flex",
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
                        "0.8125rem",
                      color:
                        "#64748b",
                    }}
                  >
                    Showing{" "}
                    <strong>
                      {Math.min(
                        (currentPage -
                          1) *
                          ITEMS_PER_PAGE +
                          1,
                        totalCount
                      )}
                    </strong>{" "}
                    to{" "}
                    <strong>
                      {Math.min(
                        currentPage *
                          ITEMS_PER_PAGE,
                        totalCount
                      )}
                    </strong>{" "}
                    of{" "}
                    <strong>
                      {totalCount}
                    </strong>{" "}
                    notes
                  </p>

                  <Pagination
                    currentPage={
                      currentPage
                    }
                    totalPages={
                      totalPages
                    }
                    totalItems={
                      totalCount
                    }
                    itemsPerPage={
                      ITEMS_PER_PAGE
                    }
                    onPageChange={
                      setCurrentPage
                    }
                  />
                </div>
              </div>
            )}
        </div>
      </div>

      {deleteModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget
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
              Delete Note
            </h2>

            <p className="modal-text">
              Are you sure you want
              to delete{" "}
              <strong
                style={{
                  color:
                    "var(--foreground)",
                }}
              >
                {deleteModal.title}
              </strong>
              ? This action cannot
              be undone.
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
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteSuccess && (
        <div className="toast">
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

          Note deleted
          successfully.
        </div>
      )}
    </DashboardLayout>
  );
}