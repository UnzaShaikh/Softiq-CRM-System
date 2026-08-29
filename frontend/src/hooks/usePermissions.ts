"use client";

import { useAuth } from "@/context/AuthContext";

/**
 * Check if the current user has a specific permission for a module.
 *
 * Administrators have immediate access so UI actions such as
 * Add Customer / Add Contact do not appear late while the
 * permission matrix is being fetched.
 *
 * Backend permission checks remain unchanged.
 */
export function usePermission(module: string, action: string): boolean {
  const { hasPermission, isAdmin } = useAuth();

  if (isAdmin) {
    return true;
  }

  return hasPermission(module, action);
}

/**
 * Check if the current user is an admin.
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