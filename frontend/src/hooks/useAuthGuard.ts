

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const PUBLIC_PATHS = ["/login", "/register"];
const ADMIN_PATHS = ["/admin"];

function isPathMatch(pathname: string, paths: string[]): boolean {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function useAuthGuard(): void {
  const pathname = usePathname();
  const router = useRouter();

  const {
    authInitialized,
    isAuthenticated,
    isAdmin,
  } = useAuth();

  const redirectingRef = useRef(false);

  useEffect(() => {
    if (!pathname) return;

    /*
     * IMPORTANT:
     *
     * AuthContext restores the token/user from cookies and
     * localStorage asynchronously. Until that is complete,
     * the guard MUST NOT redirect.
     *
     * This prevents the sequence:
     *
     * authenticated session
     *       ↓
     * accessToken initially null
     *       ↓
     * redirect to /login
     *       ↓
     * session restored
     *       ↓
     * dashboard
     */
    if (!authInitialized) {
      redirectingRef.current = false;
      return;
    }

    if (redirectingRef.current) {
      return;
    }

    const isPublicPath = isPathMatch(pathname, PUBLIC_PATHS);
    const isAdminPath = isPathMatch(pathname, ADMIN_PATHS);

    /*
     * ------------------------------------------------------------
     * 1. User is not authenticated
     * ------------------------------------------------------------
     *
     * Public pages remain accessible.
     * Every other route requires authentication.
     */
    if (!isAuthenticated) {
      if (isPublicPath) {
        return;
      }

      redirectingRef.current = true;

      const search =
        typeof window !== "undefined"
          ? window.location.search
          : "";

      const nextPath = `${pathname}${search}`;

      router.replace(
        `/login?next=${encodeURIComponent(nextPath)}`
      );

      return;
    }

    /*
     * ------------------------------------------------------------
     * 2. Authenticated user visits login/register
     * ------------------------------------------------------------
     *
     * Do not allow an already authenticated user to see the
     * login/register screen.
     */
    if (isPublicPath) {
      redirectingRef.current = true;

      router.replace("/dashboard");

      return;
    }

    /*
     * ------------------------------------------------------------
     * 3. Administrator-only routes
     * ------------------------------------------------------------
     *
     * Only the Administrator role can access /admin.
     */
    if (isAdminPath && !isAdmin) {
      redirectingRef.current = true;

      router.replace("/dashboard");

      return;
    }

    /*
     * Current route is valid.
     */
    redirectingRef.current = false;
  }, [
    pathname,
    router,
    authInitialized,
    isAuthenticated,
    isAdmin,
  ]);
}
