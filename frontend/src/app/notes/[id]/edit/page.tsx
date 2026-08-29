"use client";

import {
  useState,
  useEffect,
} from "react";

import {
  useRouter,
  useParams,
} from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";

import {
  NoteCategory,
  NotePriority,
  ALL_CATEGORIES,
  CATEGORY_COLORS,
} from "@/data/notes";

import {
  getNote,
  updateNote,
  listCategories,
  mapApiNoteToUi,
  PRIORITY_TO_API,
  ApiNoteCategory,
} from "@/lib/notesApi";

import {
  getCachedNote,
  setCachedNote,
} from "@/data/notesCache";

import { X } from "lucide-react";

interface FormValues {
  title: string;
  category: NoteCategory | "";
  priority: NotePriority | "";
  tags: string[];
  content: string;
  relatedTo: string;
}

interface FormErrors {
  title?: string;
  category?: string;
  priority?: string;
  content?: string;
}

function noteToForm(
  note: {
    title: string;
    category: NoteCategory;
    priority: NotePriority;
    tags: {
      id: string;
      label: string;
    }[];
    content: string;
    relatedTo: string;
  }
): FormValues {
  return {
    title: note.title,
    category: note.category,
    priority: note.priority,
    tags: note.tags.map(
      (tag) => tag.label
    ),
    content: note.content,
    relatedTo:
      note.relatedTo || "",
  };
}

export default function EditNotePage() {
  const router = useRouter();
  const params = useParams();

  const id =
    params?.id as string;

  const [
    form,
    setForm,
  ] =
    useState<FormValues>({
      title: "",
      category: "",
      priority: "",
      tags: [],
      content: "",
      relatedTo: "",
    });

  const [
    errors,
    setErrors,
  ] =
    useState<FormErrors>({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    hydrated,
    setHydrated,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    success,
    setSuccess,
  ] = useState(false);

  const [
    notFound,
    setNotFound,
  ] = useState(false);

  const [
    apiError,
    setApiError,
  ] =
    useState<string | null>(
      null
    );

  const [
    tagInput,
    setTagInput,
  ] = useState("");

  const [
    apiCategories,
    setApiCategories,
  ] =
    useState<ApiNoteCategory[]>(
      []
    );

  /*
   * Restore cached Note AFTER hydration.
   */
  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      setHydrated(true);
      return;
    }

    const cached =
      getCachedNote(id);

    if (cached) {
      setForm(
        noteToForm(cached)
      );

      setLoading(false);
    }

    setHydrated(true);
  }, [id]);

  /*
   * Refresh API after hydration.
   */
  useEffect(() => {
    if (!hydrated || !id) {
      return;
    }

    let cancelled = false;

    async function fetchNote() {
      const cached =
        getCachedNote(id);

      if (!cached) {
        setLoading(true);
      } else {
        setLoading(false);
      }

      try {
        /*
         * Fetch categories and note
         * simultaneously.
         */
        const [
          cats,
          apiNote,
        ] = await Promise.all([
          listCategories(),
          getNote(id),
        ]);

        if (cancelled) return;

        setApiCategories(
          cats
        );

        const uiNote =
          mapApiNoteToUi(
            apiNote,
            cats
          );

        setForm(
          noteToForm(uiNote)
        );

        setCachedNote(
          uiNote
        );

        setNotFound(false);
        setApiError(null);
      } catch (err) {
        if (cancelled) return;

        /*
         * Keep cached form visible
         * if refresh fails.
         */
        if (!cached) {
          setNotFound(true);

          setApiError(
            err instanceof Error
              ? err.message
              : "Failed to load note."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchNote();

    return () => {
      cancelled = true;
    };
  }, [hydrated, id]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLSelectElement |
        HTMLTextAreaElement
    >
  ) {
    const {
      name,
      value,
    } = e.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    if (
      errors[
        name as keyof FormErrors
      ]
    ) {
      setErrors(
        (previous) => ({
          ...previous,
          [name]:
            undefined,
        })
      );
    }
  }

  function addTag(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (
      e.key ===
        "Enter" &&
      tagInput.trim()
    ) {
      e.preventDefault();

      const tag =
        tagInput.trim();

      if (
        !form.tags.includes(
          tag
        )
      ) {
        setForm(
          (previous) => ({
            ...previous,
            tags: [
              ...previous.tags,
              tag,
            ],
          })
        );
      }

      setTagInput("");
    }
  }

  function removeTag(
    tag: string
  ) {
    setForm(
      (previous) => ({
        ...previous,
        tags:
          previous.tags.filter(
            (item) =>
              item !== tag
          ),
      })
    );
  }

  function validate(): boolean {
    const nextErrors: FormErrors =
      {};

    if (
      !form.title.trim()
    ) {
      nextErrors.title =
        "Title is required";
    }

    if (!form.category) {
      nextErrors.category =
        "Please select a category";
    }

    if (!form.priority) {
      nextErrors.priority =
        "Please select a priority";
    }

    if (
      !form.content.trim()
    ) {
      nextErrors.content =
        "Content is required";
    }

    setErrors(
      nextErrors
    );

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    setApiError(null);

    try {
      const matchedCategory =
        apiCategories.find(
          (category) =>
            category.name ===
            form.category
        );

      const updated =
        await updateNote(
          id,
          {
            title:
              form.title,
            content:
              form.content,
            category:
              matchedCategory
                ? matchedCategory.id
                : null,
            priority:
              PRIORITY_TO_API[
                form.priority as NotePriority
              ],
            tags:
              form.tags,
          }
        );

      /*
       * If updateNote returns
       * the API object, refresh the
       * detail cache from it.
       *
       * Otherwise the next detail
       * visit will refresh from API.
       */
      if (updated) {
        try {
          const refreshed =
            await getNote(id);

          const uiNote =
            mapApiNoteToUi(
              refreshed,
              apiCategories
            );

          setCachedNote(
            uiNote
          );
        } catch {
          // The update itself succeeded.
        }
      }

      setSaving(false);
      setSuccess(true);

      setTimeout(
        () =>
          router.push(
            `/notes/${id}`
          ),
        1000
      );
    } catch (err) {
      setSaving(false);

      setApiError(
        err instanceof Error
          ? err.message
          : "Failed to save note."
      );
    }
  }

  if (
    loading &&
    !form.title
  ) {
    return (
      <DashboardLayout>
        <ThemeLoader
          label="Loading note..."
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
              fontSize: "3rem",
              margin:
                "0 0 12px",
            }}
          >
            📝
          </p>

          <h2>
            Note Not Found
          </h2>

          {apiError && (
            <p
              style={{
                color:
                  "#ef4444",
                fontSize:
                  "0.8rem",
              }}
            >
              {apiError}
            </p>
          )}

          <button
            className="btn-add"
            onClick={() =>
              router.push(
                "/notes"
              )
            }
          >
            Back to Notes
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div
        style={{
          display:
            "flex",
          flexDirection:
            "column",
          gap: "20px",
        }}
      >
        <div>
          <button
            className="back-btn"
            onClick={() =>
              router.push(
                `/notes/${id}`
              )
            }
            style={{
              marginBottom:
                "8px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>

            Back to Note
          </button>

          <h1 className="page-title">
            Edit Note
          </h1>

          <p className="page-subtitle">
            Update the note
            details below.
          </p>
        </div>

        {success && (
          <div className="msg-success">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>

            Note updated
            successfully!
            Redirecting...
          </div>
        )}

        {apiError && (
          <div className="msg-error">
            {apiError}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          noValidate
          className="company-form-card"
        >
          <div className="form-section">
            <div className="form-section-header">
              <h2>
                Note Details
              </h2>

              <p>
                Update all the
                required fields
                below.
              </p>
            </div>

            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap: "20px",
              }}
            >
              <div className="form-group">
                <label className="form-label">
                  Title{" "}
                  <span
                    style={{
                      color:
                        "var(--error)",
                    }}
                  >
                    *
                  </span>
                </label>

                <div
                  style={{
                    position:
                      "relative",
                  }}
                >
                  <input
                    name="title"
                    value={
                      form.title
                    }
                    onChange={
                      handleChange
                    }
                    maxLength={
                      200
                    }
                    className={`form-input${
                      errors.title
                        ? " error"
                        : ""
                    }`}
                    placeholder="Enter note title..."
                  />

                  <span
                    style={{
                      position:
                        "absolute",
                      right:
                        "12px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      fontSize:
                        "0.75rem",
                      color:
                        "#94a3b8",
                    }}
                  >
                    {
                      form.title
                        .length
                    }
                    /200
                  </span>
                </div>

                {errors.title && (
                  <p className="form-error">
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">
                    Category
                  </label>

                  <div
                    style={{
                      position:
                        "relative",
                    }}
                  >
                    <select
                      name="category"
                      value={
                        form.category
                      }
                      onChange={
                        handleChange
                      }
                      className={`form-input${
                        errors.category
                          ? " error"
                          : ""
                      }`}
                    >
                      <option value="">
                        Select category
                      </option>

                      {ALL_CATEGORIES.map(
                        (
                          category
                        ) => (
                          <option
                            key={
                              category
                            }
                            value={
                              category
                            }
                          >
                            {
                              category
                            }
                          </option>
                        )
                      )}
                    </select>

                    {form.category && (
                      <span
                        style={{
                          position:
                            "absolute",
                          left:
                            "12px",
                          top: "50%",
                          transform:
                            "translateY(-50%)",
                          padding:
                            "2px 8px",
                          borderRadius:
                            "5px",
                          fontSize:
                            "0.72rem",
                          fontWeight:
                            600,
                          background:
                            CATEGORY_COLORS[
                              form.category as NoteCategory
                            ]?.bg,
                          color:
                            CATEGORY_COLORS[
                              form.category as NoteCategory
                            ]?.color,
                          pointerEvents:
                            "none",
                        }}
                      >
                        {
                          form.category
                        }
                      </span>
                    )}
                  </div>

                  {errors.category && (
                    <p className="form-error">
                      {
                        errors.category
                      }
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={
                      form.priority
                    }
                    onChange={
                      handleChange
                    }
                    className={`form-input${
                      errors.priority
                        ? " error"
                        : ""
                    }`}
                  >
                    <option value="">
                      Select priority
                    </option>

                    <option value="High Priority">
                      High Priority
                    </option>

                    <option value="Medium Priority">
                      Medium Priority
                    </option>

                    <option value="Low Priority">
                      Low Priority
                    </option>
                  </select>

                  {errors.priority && (
                    <p className="form-error">
                      {
                        errors.priority
                      }
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Tags
                </label>

                <div
                  style={{
                    border:
                      "1.5px solid #e2e8f0",
                    borderRadius:
                      "8px",
                    padding:
                      "8px 12px",
                    display:
                      "flex",
                    flexWrap:
                      "wrap",
                    gap: "6px",
                    background:
                      "#fff",
                    minHeight:
                      "44px",
                  }}
                  onClick={() =>
                    document
                      .getElementById(
                        "tag-input"
                      )
                      ?.focus()
                  }
                >
                  {form.tags.map(
                    (tag) => (
                      <span
                        key={tag}
                        style={{
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          gap: "4px",
                          padding:
                            "3px 8px",
                          borderRadius:
                            "9999px",
                          fontSize:
                            "0.78rem",
                          fontWeight:
                            500,
                          background:
                            "#eef2ff",
                          color:
                            "#4f46e5",
                        }}
                      >
                        {tag}

                        <button
                          type="button"
                          onClick={() =>
                            removeTag(
                              tag
                            )
                          }
                          style={{
                            border:
                              "none",
                            background:
                              "none",
                            cursor:
                              "pointer",
                            padding: 0,
                            color:
                              "#4f46e5",
                            display:
                              "flex",
                            alignItems:
                              "center",
                          }}
                        >
                          <X
                            size={
                              12
                            }
                          />
                        </button>
                      </span>
                    )
                  )}

                  <input
                    id="tag-input"
                    value={
                      tagInput
                    }
                    onChange={(e) =>
                      setTagInput(
                        e.target
                          .value
                      )
                    }
                    onKeyDown={
                      addTag
                    }
                    placeholder={
                      form.tags
                        .length ===
                      0
                        ? "Add a tag..."
                        : ""
                    }
                    style={{
                      border:
                        "none",
                      outline:
                        "none",
                      fontSize:
                        "0.875rem",
                      flex: 1,
                      minWidth:
                        "100px",
                      fontFamily:
                        "inherit",
                      background:
                        "transparent",
                    }}
                  />
                </div>

                <p
                  style={{
                    margin:
                      "4px 0 0",
                    fontSize:
                      "0.75rem",
                    color:
                      "#94a3b8",
                  }}
                >
                  Press Enter to
                  add a tag
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Note Content{" "}
                  <span
                    style={{
                      color:
                        "var(--error)",
                    }}
                  >
                    *
                  </span>
                </label>

                <textarea
                  name="content"
                  value={
                    form.content
                  }
                  onChange={
                    handleChange
                  }
                  rows={12}
                  className={`form-input${
                    errors.content
                      ? " error"
                      : ""
                  }`}
                  style={{
                    resize:
                      "vertical",
                    minHeight:
                      "240px",
                  }}
                  placeholder="Write your note content here..."
                />

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    marginTop:
                      "4px",
                  }}
                >
                  {errors.content && (
                    <p className="form-error">
                      {
                        errors.content
                      }
                    </p>
                  )}

                  <p
                    style={{
                      margin:
                        "0 0 0 auto",
                      fontSize:
                        "0.75rem",
                      color:
                        "#94a3b8",
                    }}
                  >
                    {
                      form.content
                        .split(
                          /\s+/
                        )
                        .filter(
                          Boolean
                        ).length
                    }{" "}
                    words
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                router.push(
                  `/notes/${id}`
                )
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-add"
              disabled={
                saving ||
                success
              }
            >
              {saving ? (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      animation:
                        "spin 0.8s linear infinite",
                    }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>

                  Saving...
                </>
              ) : success ? (
                "Saved!"
              ) : (
                "Save Note"
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </DashboardLayout>
  );
}