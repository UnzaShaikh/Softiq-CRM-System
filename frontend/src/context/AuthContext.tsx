"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Persist across page refreshes using localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("crm_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  function login(u: AuthUser) {
    setUser(u);
    localStorage.setItem("crm_user", JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("crm_user");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
