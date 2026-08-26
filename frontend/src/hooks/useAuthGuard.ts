"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const PUBLIC_PATHS = ["/login", "/register"];
const ADMIN_PATHS = ["/admin"];

export function useAuthGuard(): void {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isAuthenticated } = useAuth();

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );

    const token = getAccessToken();

    if (!token && !isPublic) {
      const next = encodeURIComponent(pathname + window.location.search);
      router.replace(`/login?next=${next}`);
      return;
    }

    if (token && isPublic) {
      router.replace("/dashboard");
    }
  }, [pathname, router]);

  // Admin route protection
  useEffect(() => {
    if (!isAuthenticated) return;

    const isAdminRoute = ADMIN_PATHS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );

    if (isAdminRoute && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [pathname, router, isAdmin, isAuthenticated]);
}
