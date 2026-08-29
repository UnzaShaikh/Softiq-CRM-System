"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { API_URL, getAccessToken } from "@/lib/api";

// ---------- Types ----------

export type PermissionMatrix = Record<
  string,
  {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  }
>;

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

  /**
   * True only after the initial authentication state
   * has been restored from cookies/localStorage.
   */
  authInitialized: boolean;

  isAuthenticated: boolean;
  permissions: PermissionMatrix;
  isAdmin: boolean;

  hasPermission: (module: string, action: string) => boolean;

  login: (
    user: AuthUser,
    access: string,
    refresh: string
  ) => void;

  logout: () => void;

  refreshPermissions: (
    token?: string | null
  ) => Promise<void>;
}

// ---------- Helper to read cookies ----------

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }

  return null;
}

// ---------- Context ----------

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// ---------- Provider ----------

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    null
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    null
  );

  const [permissions, setPermissions] =
    useState<PermissionMatrix>({});

  /**
   * IMPORTANT:
   *
   * false = authentication state has not been restored yet.
   * true  = cookies/localStorage have been checked.
   *
   * AuthGuard uses this to prevent the login page from
   * flashing before the stored session is restored.
   */
  const [authInitialized, setAuthInitialized] =
    useState(false);

  // ---------- Fetch permissions ----------

  const fetchPermissions = useCallback(
    async (token?: string | null) => {
      const t = token || getAccessToken();

      if (!t) return;

      try {
        const res = await fetch(
          `${API_URL}/api/auth/permissions/`,
          {
            headers: {
              Authorization: `Bearer ${t}`,
            },
          }
        );

        if (!res.ok) return;

        const data = await res.json();

        setPermissions(data.permissions || {});

        // Update user with latest role information.
        setUser((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            isStaff:
              data.is_staff !== undefined
                ? data.is_staff
                : prev.isStaff,

            role:
              data.role !== undefined
                ? data.role
                : prev.role,

            roleId:
              data.role_id !== undefined
                ? data.role_id
                : prev.roleId,
          };
        });
      } catch {
        // Permissions are allowed to fail silently.
        // Existing authentication state remains valid.
      }
    },
    []
  );

  // ---------- Restore authentication on first mount ----------

  useEffect(() => {
    let mounted = true;

    const restoreAuthentication = async () => {
      try {
        /*
         * First preference:
         * browser cookies.
         */
        const cookieAccess = getCookie("access_token");
        const cookieRefresh = getCookie("refresh_token");

        /*
         * Second preference:
         * localStorage.
         */
        const storedAccess =
          localStorage.getItem("access_token");

        const storedRefresh =
          localStorage.getItem("refresh_token");

        const storedUser =
          localStorage.getItem("crm_user");

        /*
         * Prefer cookie tokens, then localStorage.
         */
        const access =
          cookieAccess || storedAccess || null;

        const refresh =
          cookieRefresh || storedRefresh || null;

        /*
         * Restore user first.
         */
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(
              storedUser
            ) as AuthUser;

            if (mounted) {
              setUser(parsedUser);
            }
          } catch {
            /*
             * Invalid stored user data.
             * Remove only the corrupted user entry.
             */
            localStorage.removeItem("crm_user");
          }
        }

        /*
         * Restore access token.
         */
        if (access && mounted) {
          setAccessToken(access);
        }

        /*
         * Restore refresh token.
         */
        if (refresh && mounted) {
          setRefreshToken(refresh);
        }

        /*
         * Keep cookies synchronized with localStorage
         * when localStorage was the source.
         */
        if (!cookieAccess && storedAccess) {
          document.cookie =
            `access_token=${storedAccess}; path=/; max-age=86400`;
        }

        if (!cookieRefresh && storedRefresh) {
          document.cookie =
            `refresh_token=${storedRefresh}; path=/; max-age=86400`;
        }

        /*
         * Authentication state is now restored.
         *
         * Do NOT wait for permissions here. Permissions are
         * supplementary and can load after the app knows whether
         * a session exists. Waiting for this request would make
         * the auth guard unnecessarily slow.
         */
        if (mounted) {
          setAuthInitialized(true);
        }

        if (access) {
          void fetchPermissions(access);
        }
      } catch {
        /*
         * Authentication restoration should never crash
         * the application.
         */
      } finally {
        /*
         * If restoring storage/cookies itself throws, the guard
         * must still be released so an unauthenticated user can
         * be redirected to login.
         */
        if (mounted) {
          setAuthInitialized(true);
        }
      }
    };

    void restoreAuthentication();

    return () => {
      mounted = false;
    };
  }, [fetchPermissions]);

  // ---------- Login ----------

  function login(
    userData: AuthUser,
    access: string,
    refresh: string
  ) {
    /*
     * Update React state immediately.
     */
    setUser(userData);
    setAccessToken(access);
    setRefreshToken(refresh);

    /*
     * Persist session.
     */
    localStorage.setItem(
      "crm_user",
      JSON.stringify(userData)
    );

    localStorage.setItem(
      "access_token",
      access
    );

    localStorage.setItem(
      "refresh_token",
      refresh
    );

    /*
     * Persist cookies.
     */
    document.cookie =
      `access_token=${access}; path=/; max-age=86400`;

    document.cookie =
      `refresh_token=${refresh}; path=/; max-age=86400`;

    /*
     * Authentication is definitely initialized after
     * a successful login.
     */
    setAuthInitialized(true);

    /*
     * Load current permissions.
     */
    void fetchPermissions(access);
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

    document.cookie =
      "access_token=; path=/; max-age=0";

    document.cookie =
      "refresh_token=; path=/; max-age=0";

    /*
     * Keep initialization true.
     *
     * We are already initialized; the user is simply
     * no longer authenticated.
     */
    setAuthInitialized(true);
  }

  // ---------- Permission check ----------

  const hasPermission = useCallback(
    (
      module: string,
      action: string
    ): boolean => {
      const mod = permissions[module];

      if (!mod) return false;

      return Boolean(
        mod[action as keyof typeof mod]
      );
    },
    [permissions]
  );

  // ---------- Derived authentication state ----------

  const isAdmin =
    user?.role === "Administrator";

  const isAuthenticated =
    Boolean(accessToken);

  // ---------- Provider ----------

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,

        authInitialized,

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

// ---------- Hook ----------

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}