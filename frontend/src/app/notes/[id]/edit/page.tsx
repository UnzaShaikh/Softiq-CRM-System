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
  const router = useRouter();
  const params = useParams();

  const { user } = useAuth();
  const userId = user?.id;

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
         * Save the latest note
         * using user-specific cache.
         */
        setCachedNote(
          userId!,
          uiNote
        );

        setNotFound(false);
        setApiError(null);
        setLoading(false);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to fetch note:",
          error
        );

        /*
         * If cached data exists,
         * keep displaying it.
         */
        if (!cached) {
          setApiError(
            "Failed to load note."
          );
        }

        setLoading(false);
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
   * The remainder of your existing form,
   * validation, save, tag handling and JSX
   * should remain exactly as it was.
   */

  // KEEP YOUR EXISTING CODE BELOW THIS POINT
  // INCLUDING:
  // - validation
  // - handleChange
  // - tag handling
  // - handleSubmit
  // - loading UI
  // - error UI
  // - edit form JSX

  return (
    <DashboardLayout>
      <div className="p-6">
        {loading ? (
          <ThemeLoader />
        ) : notFound ? (
          <div>
            Note not found.
          </div>
        ) : (
          <div>
            {/* Keep your existing Edit Note form JSX here */}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}