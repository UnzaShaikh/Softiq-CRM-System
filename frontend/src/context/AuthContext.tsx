"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { API_URL, getAccessToken } from "@/lib/api";

// ---------- Types ----------
export type PermissionMatrix = Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>;

export interface AuthUser {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  isStaff?: boolean;
  role?: string | null;
  roleId?: number | null;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  permissions: PermissionMatrix;
  isAdmin: boolean;
  hasPermission: (module: string, action: string) => boolean;
  login: (user: AuthUser, access: string, refresh: string) => void;
  logout: () => void;
  refreshPermissions: () => Promise<void>;
}

// ---------- Helper to read cookies ----------
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

// ---------- Context ----------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<PermissionMatrix>({});

  // Fetch permissions from API
  const fetchPermissions = useCallback(async (token?: string | null) => {
    const t = token || getAccessToken();
    if (!t) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/permissions/`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPermissions(data.permissions || {});
        // Update user with latest role info
        setUser((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            isStaff: data.is_staff ?? prev.isStaff,
            role: data.role ?? prev.role,
          };
        });
      }
    } catch {
      // silently fail — permissions stay as-is
    }
  }, []);

  // On mount, read from cookies (or localStorage as fallback)
  useEffect(() => {
    const cookieAccess = getCookie("access_token");
    const cookieRefresh = getCookie("refresh_token");

    if (cookieAccess) {
      setAccessToken(cookieAccess);
      setRefreshToken(cookieRefresh);

      try {
        const storedUser = localStorage.getItem("crm_user");
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch {
        // ignore
      }

      // Fetch permissions on mount
      fetchPermissions(cookieAccess);
    } else {
      try {
        const storedUser = localStorage.getItem("crm_user");
        const storedAccess = localStorage.getItem("access_token");
        const storedRefresh = localStorage.getItem("refresh_token");

        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedAccess) setAccessToken(storedAccess);
        if (storedRefresh) setRefreshToken(storedRefresh);

        if (storedAccess) {
          document.cookie = `access_token=${storedAccess}; path=/; max-age=86400`;
        }
        if (storedRefresh) {
          document.cookie = `refresh_token=${storedRefresh}; path=/; max-age=86400`;
        }

        // Fetch permissions
        if (storedAccess) fetchPermissions(storedAccess);
      } catch {
        // ignore
      }
    }
  }, [fetchPermissions]);

  // ---------- Login ----------
  function login(userData: AuthUser, access: string, refresh: string) {
    setUser(userData);
    setAccessToken(access);
    setRefreshToken(refresh);

    localStorage.setItem("crm_user", JSON.stringify(userData));
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    document.cookie = `access_token=${access}; path=/; max-age=86400`;
    document.cookie = `refresh_token=${refresh}; path=/; max-age=86400`;

    // Fetch permissions after login
    fetchPermissions(access);
  }

  // ---------- Logout ----------
  function logout() {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setPermissions({});

    localStorage.removeItem("crm_user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    document.cookie = "access_token=; path=/; max-age=0";
    document.cookie = "refresh_token=; path=/; max-age=0";
  }

  // ---------- Permission check ----------
  const hasPermission = useCallback(
    (module: string, action: string): boolean => {
      const mod = permissions[module];
      if (!mod) return false;
      return Boolean(mod[action as keyof typeof mod]);
    },
    [permissions]
  );

  const isAdmin = user?.role === "Administrator";

  const isAuthenticated = !!accessToken;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated,
        permissions,
        isAdmin,
        hasPermission,
        login,
        logout,
        refreshPermissions: fetchPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
