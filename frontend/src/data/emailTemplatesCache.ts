import type { EmailTemplate } from "@/data/emailTemplates";

export interface EmailTemplatesListCache {
  templates: EmailTemplate[];
  search: string;
  categoryFilter: string;
  currentPage: number;
  cachedAt: number;
}

const LIST_CACHE_KEY = "email-templates:list";

const detailCache = new Map<string, EmailTemplate>();

let listCache: EmailTemplatesListCache | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/* =========================================================
   LIST CACHE
   ========================================================= */

export function getCachedEmailTemplatesList(): EmailTemplatesListCache | null {
  if (!isBrowser()) {
    return listCache;
  }

  if (listCache) {
    return listCache;
  }

  const stored = safeParse<EmailTemplatesListCache>(
    window.sessionStorage.getItem(LIST_CACHE_KEY)
  );

  if (stored) {
    listCache = stored;
  }

  return listCache;
}

export function setCachedEmailTemplatesList(
  value: Omit<EmailTemplatesListCache, "cachedAt"> |
    EmailTemplatesListCache
): void {
  const next: EmailTemplatesListCache = {
    ...value,
    cachedAt:
      "cachedAt" in value && typeof value.cachedAt === "number"
        ? value.cachedAt
        : Date.now(),
  };

  listCache = next;

  if (!isBrowser()) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      LIST_CACHE_KEY,
      JSON.stringify(next)
    );
  } catch {
    // Cache is only an optimization.
  }
}

export function clearCachedEmailTemplatesList(): void {
  listCache = null;

  if (!isBrowser()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(LIST_CACHE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

/* =========================================================
   DETAIL CACHE
   ========================================================= */

export function getCachedEmailTemplate(
  id: string | number
): EmailTemplate | null {
  const key = String(id);

  const memoryValue = detailCache.get(key);

  if (memoryValue) {
    return memoryValue;
  }

  if (!isBrowser()) {
    return null;
  }

  const stored = safeParse<EmailTemplate>(
    window.sessionStorage.getItem(`email-template:${key}`)
  );

  if (stored) {
    detailCache.set(key, stored);
  }

  return stored;
}

export function setCachedEmailTemplate(
  template: EmailTemplate
): void {
  const key = String(template.id);

  detailCache.set(key, template);

  if (!isBrowser()) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      `email-template:${key}`,
      JSON.stringify(template)
    );
  } catch {
    // Cache is only an optimization.
  }
}

export function removeCachedEmailTemplate(
  id: string | number
): void {
  const key = String(id);

  detailCache.delete(key);

  if (!isBrowser()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(`email-template:${key}`);
  } catch {
    // Ignore storage errors.
  }
}

/* =========================================================
   SYNCHRONIZE LIST + DETAIL CACHE
   ========================================================= */

export function upsertCachedEmailTemplate(
  template: EmailTemplate
): void {
  setCachedEmailTemplate(template);

  const existing = getCachedEmailTemplatesList();

  if (!existing) {
    return;
  }

  const index = existing.templates.findIndex(
    item => String(item.id) === String(template.id)
  );

  const templates = [...existing.templates];

  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.unshift(template);
  }

  setCachedEmailTemplatesList({
    ...existing,
    templates,
    currentPage: 1,
  });
}

export function removeCachedEmailTemplateFromList(
  id: string | number
): void {
  const existing = getCachedEmailTemplatesList();

  removeCachedEmailTemplate(id);

  if (!existing) {
    return;
  }

  setCachedEmailTemplatesList({
    ...existing,
    templates: existing.templates.filter(
      item => String(item.id) !== String(id)
    ),
  });
}