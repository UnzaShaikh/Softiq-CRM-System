import { apiRequest } from "@/lib/api";
import { Note, NoteCategory, NotePriority, ALL_CATEGORIES } from "@/data/notes";

// ---------- Backend response shapes ----------

export interface ApiNoteCategory {
  id: number;
  name: string;
}

export interface ApiNote {
  id: number;
  title: string;
  content: string;
  category: number | null;
  priority: "low" | "medium" | "high";
  tags: string[];
  pinned: boolean;
  archived: boolean;
  customer: number | null;
  lead: number | null;
  deal: number | null;
  related_type?: "Customer" | "Lead" | "Deal" | null;
  related_name?: string | null;
  created_by: number | null;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface NotesListParams {
  search?: string;
  category?: number | string;
  priority?: "low" | "medium" | "high";
  pinned?: boolean;
  archived?: boolean;
  tag?: string;
  ordering?: string;
  page?: number;
}

export interface NoteOptions {
  categories: ApiNoteCategory[];
  priorities: { value: string; label: string }[];
  statuses: {
    pinned: { value: boolean; label: string }[];
    archived: { value: boolean; label: string }[];
  };
}

export interface NotesSummary {
  total_notes: number;
  categories: number;
  pinned: number;
  archived: number;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  category?: number | null;
  priority?: "low" | "medium" | "high";
  tags?: string[];
  customer?: number | null;
  lead?: number | null;
  deal?: number | null;
}

// ---------- Query string helper ----------

function buildQuery(params: Record<string, unknown>): string {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      usp.set(key, String(value));
    }
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

// ---------- Mapping: backend format -> existing frontend Note type ----------

// Backend priority ("low"/"medium"/"high") -> your existing NotePriority labels
const PRIORITY_FROM_API: Record<ApiNote["priority"], NotePriority> = {
  low: "Low Priority",
  medium: "Medium Priority",
  high: "High Priority",
};

// Your existing NotePriority labels -> backend priority values (for create/update payloads)
export const PRIORITY_TO_API: Record<NotePriority, ApiNote["priority"]> = {
  "Low Priority": "low",
  "Medium Priority": "medium",
  "High Priority": "high",
};

function initialsFromName(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Matches a backend category name against your existing fixed NoteCategory enum.
// Falls back to "Personal" (last entry) if the backend category doesn't match any
// of your predefined categories, so the UI's CATEGORY_COLORS lookup never breaks.
function matchCategory(name: string | undefined): NoteCategory {
  if (name && (ALL_CATEGORIES as string[]).includes(name)) {
    return name as NoteCategory;
  }
  return "Personal";
}

// Local-only star tracking, since the backend has no starred field.
// Not persisted — resets on page refresh.
const starredIds = new Set<string>();
export function isLocallyStarred(id: string): boolean {
  return starredIds.has(id);
}
export function toggleLocalStar(id: string): boolean {
  if (starredIds.has(id)) {
    starredIds.delete(id);
    return false;
  }
  starredIds.add(id);
  return true;
}

/** Converts a backend ApiNote into your existing Note shape used by the UI components. */
export function mapApiNoteToUi(apiNote: ApiNote, categories: ApiNoteCategory[] = []): Note {
  const categoryObj = categories.find(c => c.id === apiNote.category);

  let relatedTo = "";
  let relatedType: Note["relatedType"] = null;
  if (apiNote.customer) {
    relatedType = "Customer";
    relatedTo = apiNote.related_name ?? "";
  } else if (apiNote.lead) {
    relatedType = "Lead";
    relatedTo = apiNote.related_name ?? "";
  } else if (apiNote.deal) {
    relatedType = "Deal";
    relatedTo = apiNote.related_name ?? "";
  }

  return {
    id: String(apiNote.id),
    title: apiNote.title,
    content: apiNote.content ?? "",
    category: matchCategory(categoryObj?.name),
    priority: PRIORITY_FROM_API[apiNote.priority],
    tags: (apiNote.tags ?? []).map(t => ({ id: t, label: t })),
    author: apiNote.created_by_name ?? "Unknown",
    authorInitials: initialsFromName(apiNote.created_by_name),
    relatedTo,
    relatedType,
    isPinned: apiNote.pinned,
    isStarred: isLocallyStarred(String(apiNote.id)),
    isArchived: apiNote.archived,
    createdAt: apiNote.created_at,
    updatedAt: apiNote.updated_at,
  };
}

// ---------- Notes CRUD ----------

export function listNotes(params: NotesListParams = {}): Promise<PaginatedResponse<ApiNote>> {
  return apiRequest<PaginatedResponse<ApiNote>>(`/api/notes/${buildQuery(params)}`);
}

export function getNote(id: number | string): Promise<ApiNote> {
  return apiRequest<ApiNote>(`/api/notes/${id}/`);
}

export function createNote(payload: CreateNotePayload): Promise<ApiNote> {
  return apiRequest<ApiNote>(`/api/notes/`, { method: "POST", body: payload });
}

export function updateNote(id: number | string, payload: Partial<CreateNotePayload>): Promise<ApiNote> {
  return apiRequest<ApiNote>(`/api/notes/${id}/`, { method: "PATCH", body: payload });
}

export function deleteNote(id: number | string): Promise<void> {
  return apiRequest<void>(`/api/notes/${id}/`, { method: "DELETE" });
}

export function pinNote(id: number | string): Promise<ApiNote> {
  return apiRequest<ApiNote>(`/api/notes/${id}/pin/`, { method: "PATCH" });
}

export function unpinNote(id: number | string): Promise<ApiNote> {
  return apiRequest<ApiNote>(`/api/notes/${id}/unpin/`, { method: "PATCH" });
}

export function archiveNote(id: number | string): Promise<ApiNote> {
  return apiRequest<ApiNote>(`/api/notes/${id}/archive/`, { method: "PATCH" });
}

export function unarchiveNote(id: number | string): Promise<ApiNote> {
  return apiRequest<ApiNote>(`/api/notes/${id}/unarchive/`, { method: "PATCH" });
}

export function getNotesSummary(): Promise<NotesSummary> {
  return apiRequest<NotesSummary>(`/api/notes/summary/`);
}

export function getNoteOptions(): Promise<NoteOptions> {
  return apiRequest<NoteOptions>(`/api/notes/options/`);
}

// ---------- Categories ----------

export async function listCategories(): Promise<ApiNoteCategory[]> {
  const res = await apiRequest<ApiNoteCategory[] | PaginatedResponse<ApiNoteCategory>>(
    `/api/note-categories/`
  );
  // Backend may return a bare array or a paginated {results: [...]} object
  // depending on DRF pagination settings — handle both safely.
  return Array.isArray(res) ? res : res.results ?? [];
}

export function createCategory(name: string): Promise<ApiNoteCategory> {
  return apiRequest<ApiNoteCategory>(`/api/note-categories/`, { method: "POST", body: { name } });
}