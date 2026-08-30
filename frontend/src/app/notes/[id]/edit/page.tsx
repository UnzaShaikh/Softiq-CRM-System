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
import { useAuth } from "@/context/AuthContext";

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
  const { user } = useAuth();
  const userId = user?.id;

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

    if (!userId) {
      return;
    }

    const cached =
      getCachedNote(
        userId,
        id
      );

    if (cached) {
      setForm(
        noteToForm(cached)
      );

      setLoading(false);
    }

    setHydrated(true);
  }, [id, userId]);

  /*
   * Refresh API after hydration.
   */
  useEffect(() => {
    if (
      !hydrated ||
      !id ||
      !userId
    ) {
      return;
    }

    let cancelled = false;

    async function fetchNote() {
      const cached =
        getCachedNote(
          userId!,
          id
        );

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

        if (cancelled) {
          return;
        }

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

        /*
         * Cache note using the
         * authenticated user's ID.
         */
        setCachedNote(
          userId!,
          uiNote
        );

        setNotFound(false);
        setApiError(null);
      } catch (error: any) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load note:",
          error
        );

        /*
         * If cached data exists,
         * keep showing it.
         */
        if (!cached) {
          setNotFound(
            error?.response?.status === 404 ||
            error?.status === 404
          );

          setApiError(
            error?.message ||
              "Failed to load note."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchNote();

    return () => {
      cancelled = true;
    };
  }, [
    hydrated,
    id,
    userId,
  ]);

  /*
   * The remainder of your existing component
   * should remain unchanged below this point.
   */

  const handleChange = (
    field: keyof FormValues,
    value: string
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );

    setErrors(
      (previous) => ({
        ...previous,
        [field]: undefined,
      })
    );
  };

  const handleAddTag = () => {
    const tag =
      tagInput.trim();

    if (!tag) {
      return;
    }

    if (
      !form.tags.includes(tag)
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
  };

  const handleRemoveTag = (
    tag: string
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        tags: previous.tags.filter(
          (item) =>
            item !== tag
        ),
      })
    );
  };

  const validate = () => {
    const newErrors: FormErrors =
      {};

    if (!form.title.trim()) {
      newErrors.title =
        "Title is required.";
    }

    if (!form.category) {
      newErrors.category =
        "Category is required.";
    }

    if (!form.priority) {
      newErrors.priority =
        "Priority is required.";
    }

    if (!form.content.trim()) {
      newErrors.content =
        "Content is required.";
    }

    setErrors(newErrors);

    return (
      Object.keys(
        newErrors
      ).length === 0
    );
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    if (!id) {
      return;
    }

    setSaving(true);
    setApiError(null);
    setSuccess(false);

    try {
      const updatedNote =
        await updateNote(
          id,
          {
            title:
              form.title.trim(),
            category:
              form.category,
            priority:
              form.priority
                ? PRIORITY_TO_API[
                    form.priority
                  ]
                : undefined,
            tags: form.tags,
            content:
              form.content,
            related_to:
              form.relatedTo || null,
          } as any
        );

      /*
       * Update local cache after
       * successful save.
       */
      if (userId) {
        const categories =
          apiCategories;

        const uiNote =
          mapApiNoteToUi(
            updatedNote,
            categories
          );

        setCachedNote(
          userId,
          uiNote
        );

        setForm(
          noteToForm(uiNote)
        );
      }

      setSuccess(true);
    } catch (error: any) {
      console.error(
        "Failed to update note:",
        error
      );

      setApiError(
        error?.message ||
          "Failed to update note."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading && !form.title) {
    return (
      <DashboardLayout>
        <ThemeLoader />
      </DashboardLayout>
    );
  }

  if (notFound) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-xl font-semibold">
            Note not found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {apiError ||
              "The requested note could not be found."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/notes"
              )
            }
            className="mt-4 rounded-lg px-4 py-2 text-sm font-medium border"
          >
            Back to Notes
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Edit Note
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Update your note details.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/notes/${id}`
              )
            }
            className="rounded-lg border px-4 py-2 text-sm"
          >
            Cancel
          </button>
        </div>

        {apiError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {apiError}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Note updated successfully.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Title
            </label>

            <input
              type="text"
              value={form.title}
              onChange={(event) =>
                handleChange(
                  "title",
                  event.target.value
                )
              }
              className="w-full rounded-lg border px-3 py-2"
            />

            {errors.title && (
              <p className="mt-1 text-sm text-red-500">
                {errors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>

              <select
                value={form.category}
                onChange={(event) =>
                  handleChange(
                    "category",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">
                  Select category
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

              {errors.category && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Priority
              </label>

              <select
                value={form.priority}
                onChange={(event) =>
                  handleChange(
                    "priority",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">
                  Select priority
                </option>

                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>
              </select>

              {errors.priority && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.priority}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Tags
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(event) =>
                  setTagInput(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    event.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 rounded-lg border px-3 py-2"
                placeholder="Add tag"
              />

              <button
                type="button"
                onClick={
                  handleAddTag
                }
                className="rounded-lg border px-4 py-2"
              >
                Add
              </button>
            </div>

            {form.tags.length >
              0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.tags.map(
                  (tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
                    >
                      {tag}

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveTag(
                            tag
                          )
                        }
                        className="ml-1"
                      >
                        <X
                          size={14}
                        />
                      </button>
                    </span>
                  )
                )}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Content
            </label>

            <textarea
              value={form.content}
              onChange={(event) =>
                handleChange(
                  "content",
                  event.target.value
                )
              }
              rows={10}
              className="w-full rounded-lg border px-3 py-2"
            />

            {errors.content && (
              <p className="mt-1 text-sm text-red-500">
                {errors.content}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Related To
            </label>

            <input
              type="text"
              value={form.relatedTo}
              onChange={(event) =>
                handleChange(
                  "relatedTo",
                  event.target.value
                )
              }
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/notes/${id}`
                )
              }
              className="rounded-lg border px-5 py-2"
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg px-5 py-2 font-medium border"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}