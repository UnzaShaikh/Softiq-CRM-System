"use client";

import { useAuth } from "@/context/AuthContext";

/**
 * Check if the current user has a specific permission for a module.
 *
 * Usage:
 *   const canCreate = usePermission("customers", "create");
 *   const canDelete = usePermission("deals", "delete");
 */
export function usePermission(module: string, action: string): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(module, action);
}

/**
 * Check if the current user is an admin (is_staff).
 */
export function useAdmin(): boolean {
  const { isAdmin } = useAuth();
  return isAdmin;
}

/**
 * Get the current user's role name.
 */
export function useRole(): string | null {
  const { user } = useAuth();
  return user?.role ?? null;
}
