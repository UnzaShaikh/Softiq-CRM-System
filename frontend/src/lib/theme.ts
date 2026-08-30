// Client-side theme management.
// The selected preference ("light" | "dark" | "system") is persisted
// in localStorage and applied as a `data-theme` attribute on <html>.

export type AppTheme = "light" | "dark" | "system";

const STORAGE_KEY = "app-theme";

export function getStoredTheme(): AppTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  const value = window.localStorage.getItem(STORAGE_KEY);

  return value === "dark" || value === "system"
    ? value
    : "light";
}

export function resolveTheme(
  theme: AppTheme
): "light" | "dark" {
  if (theme !== "system") {
    return theme;
  }

  if (
    typeof window === "undefined" ||
    !window.matchMedia
  ) {
    return "light";
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";
}

function applyAttribute(
  resolved: "light" | "dark"
): void {
  if (typeof document === "undefined") {
    return;
  }

  if (resolved === "dark") {
    document.documentElement.setAttribute(
      "data-theme",
      "dark"
    );
  } else {
    document.documentElement.removeAttribute(
      "data-theme"
    );
  }
}

let systemWatcherInstalled = false;

function installSystemWatcher(): void {
  if (
    systemWatcherInstalled ||
    typeof window === "undefined" ||
    !window.matchMedia
  ) {
    return;
  }

  systemWatcherInstalled = true;

  const mediaQuery = window.matchMedia(
    "(prefers-color-scheme: dark)"
  );

  mediaQuery.addEventListener("change", () => {
    if (getStoredTheme() === "system") {
      applyAttribute(resolveTheme("system"));
    }
  });
}

/**
 * Persist the selected theme and immediately apply it.
 */
export function applyTheme(theme: AppTheme): void {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    theme
  );

  applyAttribute(resolveTheme(theme));
  installSystemWatcher();
}

/**
 * Apply the previously stored theme.
 *
 * This should be called from a client-side useEffect.
 */
export function applyStoredTheme(): void {
  applyTheme(getStoredTheme());
}