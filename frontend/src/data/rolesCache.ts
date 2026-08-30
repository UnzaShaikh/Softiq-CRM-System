import type { Role } from "@/lib/projectSettingsApi";

const CACHE_KEY = "crm_roles_permissions_cache_v1";
const MAX_AGE_MS = 5 * 60 * 1000;

interface RoleCachePayload {
  savedAt: number;
  roles: Role[];
}

export function getCachedRoles(): Role[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RoleCachePayload;
    if (!Array.isArray(parsed.roles)) return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) return null;
    return parsed.roles;
  } catch {
    return null;
  }
}

export function setCachedRoles(roles: Role[]): void {
  if (typeof window === "undefined") return;
  try {
    const payload: RoleCachePayload = { savedAt: Date.now(), roles };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Cache is an optimization; never block the Roles page if storage fails.
  }
}

export function clearCachedRoles(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore storage errors.
  }
}
