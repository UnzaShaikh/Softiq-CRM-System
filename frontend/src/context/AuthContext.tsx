"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// ---------- Types ----------
export interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, access: string, refresh: string) => void;
  logout: () => void;
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

  // On mount, read from cookies (or localStorage as fallback)
  useEffect(() => {
    // Try cookies first (used by middleware)
    const cookieAccess = getCookie("access_token");
    const cookieRefresh = getCookie("refresh_token");

    if (cookieAccess) {
      setAccessToken(cookieAccess);
      setRefreshToken(cookieRefresh);

      // Optionally read user from localStorage if stored
      try {
        const storedUser = localStorage.getItem("crm_user");
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch {
        // ignore
      }
    } else {
      // Fallback to localStorage
      try {
        const storedUser = localStorage.getItem("crm_user");
        const storedAccess = localStorage.getItem("access_token");
        const storedRefresh = localStorage.getItem("refresh_token");

        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedAccess) setAccessToken(storedAccess);
        if (storedRefresh) setRefreshToken(storedRefresh);

        // Also sync cookies for middleware
        if (storedAccess) {
          document.cookie = `access_token=${storedAccess}; path=/; max-age=86400`;
        }
        if (storedRefresh) {
          document.cookie = `refresh_token=${storedRefresh}; path=/; max-age=86400`;
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // ---------- Login ----------
  function login(userData: AuthUser, access: string, refresh: string) {
    setUser(userData);
    setAccessToken(access);
    setRefreshToken(refresh);

    // Store in localStorage for persistence
    localStorage.setItem("crm_user", JSON.stringify(userData));
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    // Store in cookies for middleware
    document.cookie = `access_token=${access}; path=/; max-age=86400`;
    document.cookie = `refresh_token=${refresh}; path=/; max-age=86400`;
  }

  // ---------- Logout ----------
  function logout() {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    localStorage.removeItem("crm_user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    document.cookie = "access_token=; path=/; max-age=0";
    document.cookie = "refresh_token=; path=/; max-age=0";
  }

  const isAuthenticated = !!accessToken;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated,
        login,
        logout,
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