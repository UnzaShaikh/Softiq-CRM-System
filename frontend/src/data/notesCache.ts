import type { Note } from "@/data/notes";

const LIST_CACHE_KEY = "crm-notes-list-cache-v1";
const NOTE_CACHE_PREFIX = "crm-note-cache-v1:";

function getListCacheKey(userId: number | string): string {
  return `${LIST_CACHE_KEY}:${String(userId)}`;
}

function getNoteCacheKey(userId: number | string, id: string | number): string {
  return `${NOTE_CACHE_PREFIX}${String(userId)}:${String(id)}`;
}

export interface NotesListCache {
  notes: Note[];
  totalCount: number;
  search: string;
  currentPage: number;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getCachedNotesList(userId: number | string): NotesListCache | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(getListCacheKey(userId));

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (
      !parsed ||
      !Array.isArray(parsed.notes) ||
      typeof parsed.totalCount !== "number"
    ) {
      return null;
    }

    return {
      notes: parsed.notes,
      totalCount: parsed.totalCount,
      search: typeof parsed.search === "string" ? parsed.search : "",
      currentPage:
        typeof parsed.currentPage === "number"
          ? parsed.currentPage
          : 1,
    };
  } catch {
    return null;
  }
}

export function setCachedNotesList(
  userId: number | string,
  cache: NotesListCache
): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(
      getListCacheKey(userId),
      JSON.stringify(cache)
    );
  } catch {
    // Cache failure must never break the Notes module.
  }
}

export function clearCachedNotesList(userId: number | string): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.removeItem(getListCacheKey(userId));
  } catch {
    // Ignore cache errors.
  }
}

export function getCachedNote(
  userId: number | string,
  id: string | number
): Note | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(
      getNoteCacheKey(userId, id)
    );

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed as Note;
  } catch {
    return null;
  }
}

export function setCachedNote(
  userId: number | string,
  note: Note
): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(
      getNoteCacheKey(userId, note.id),
      JSON.stringify(note)
    );
  } catch {
    // Ignore cache errors.
  }
}

export function removeCachedNote(
  userId: number | string,
  id: string | number
): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.removeItem(
      getNoteCacheKey(userId, id)
    );
  } catch {
    // Ignore cache errors.
  }
}

export function updateCachedNote(
  userId: number | string,
  note: Note
): void {
  setCachedNote(userId, note);

  const listCache = getCachedNotesList(userId);

  if (!listCache) return;

  const exists = listCache.notes.some(
    (item) => String(item.id) === String(note.id)
  );

  if (!exists) return;

  setCachedNotesList(userId, {
    ...listCache,
    notes: listCache.notes.map((item) =>
      String(item.id) === String(note.id)
        ? note
        : item
    ),
  });
}

export function removeNoteFromCache(
  userId: number | string,
  id: string | number
): void {
  removeCachedNote(userId, id);

  const listCache = getCachedNotesList(userId);

  if (!listCache) return;

  setCachedNotesList(userId, {
    ...listCache,
    notes: listCache.notes.filter(
      (item) =>
        String(item.id) !== String(id)
    ),
    totalCount: Math.max(
      0,
      listCache.totalCount - 1
    ),
  });
}