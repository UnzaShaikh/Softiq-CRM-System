// Client-side theme management. The selected preference ("light" | "dark" |
// "system") is persisted in localStorage and applied as a `data-theme`
// attribute on <html>. The backend copy (user preferences) is synced by the
// preferences page; localStorage keeps instant application across reloads.

export type AppTheme = "light" | "dark" | "system";

const STORAGE_KEY = "app-theme";

export function getStoredTheme(): AppTheme {
  if (typeof window === "undefined") return "light";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "dark" || v === "system" ? v : "light";
}

export function resolveTheme(theme: AppTheme): "light" | "dark" {
  if (theme !== "system") return theme;
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyAttribute(resolved: "light" | "dark") {
  if (resolved === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

let systemWatcherInstalled = false;

function installSystemWatcher() {
  if (systemWatcherInstalled || typeof window === "undefined" || !window.matchMedia) return;
  systemWatcherInstalled = true;
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (getStoredTheme() === "system") applyAttribute(resolveTheme("system"));
    });
}

/** Persist the choice and immediately apply it to <html>. */
export function applyTheme(theme: AppTheme): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, theme);
  applyAttribute(resolveTheme(theme));
  installSystemWatcher();
}

/** Apply whatever theme was previously stored (call once on app mount). */
export function applyStoredTheme(): void {
  applyTheme(getStoredTheme());
}

/**
 * Inline script for the root layout — runs before first paint so a saved
 * dark theme is applied without a flash of light content.
 */
export const THEME_NO_FLASH_SCRIPT = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="dark"||(t==="system"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.setAttribute("data-theme","dark")}}catch(e){}`;
