"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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

  login: (
    user: AuthUser,
    access: string,
    refresh: string
  ) => void;

  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  refreshToken: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
const [accessToken, setAccessToken] = useState<string | null>(null);
const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Persist across page refreshes using localStorage
useEffect(() => {
  try {
    const storedUser = localStorage.getItem("crm_user");
    const storedAccess = localStorage.getItem("access_token");
    const storedRefresh = localStorage.getItem("refresh_token");

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedAccess) setAccessToken(storedAccess);
    if (storedRefresh) setRefreshToken(storedRefresh);
  } catch {}
}, []);

  function login(
    u: AuthUser,
    access: string,
    refresh: string
) {
    setUser(u);
    setAccessToken(access);
    setRefreshToken(refresh);

    localStorage.setItem("crm_user", JSON.stringify(u));
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
}

 function logout() {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    localStorage.removeItem("crm_user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
}

 return (
  <AuthContext.Provider
    value={{
      user,
      accessToken,
      refreshToken,
      login,
      logout,
    }}
  >
    {children}
  </AuthContext.Provider>
);
}

export function useAuth() {
  return useContext(AuthContext);
}
