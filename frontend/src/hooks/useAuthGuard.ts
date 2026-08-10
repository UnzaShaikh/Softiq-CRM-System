"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/api";

const PUBLIC_PATHS = ["/login", "/register"];

export function useAuthGuard(): void {
  const pathname = usePathname();
  const router = useRouter();

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
}
