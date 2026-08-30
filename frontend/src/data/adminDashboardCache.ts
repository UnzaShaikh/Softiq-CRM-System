export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalRoles: number;
  cachedAt: number;
}

const CACHE_KEY = "crm_admin_dashboard_stats";
const CACHE_TTL = 5 * 60 * 1000;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getAdminDashboardCache(): AdminDashboardStats | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AdminDashboardStats;

    if (
      typeof parsed.totalUsers !== "number" ||
      typeof parsed.activeUsers !== "number" ||
      typeof parsed.inactiveUsers !== "number" ||
      typeof parsed.totalRoles !== "number" ||
      typeof parsed.cachedAt !== "number"
    ) {
      window.localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function isAdminDashboardCacheFresh(cache: AdminDashboardStats | null) {
  return Boolean(cache && Date.now() - cache.cachedAt < CACHE_TTL);
}

export function setAdminDashboardCache(
  stats: Omit<AdminDashboardStats, "cachedAt">
) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        ...stats,
        cachedAt: Date.now(),
      })
    );
  } catch {
    // Cache is an optimization only. Never let storage failures break the page.
  }
}

export function clearAdminDashboardCache() {
  if (!canUseStorage()) return;

  try {
    window.localStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore storage failures.
  }
}
