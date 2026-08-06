export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

function getCookie(name: string): string |null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()!.split(";").shift()!;
  }

  return null;
}
export function getAccessToken(): string | null {
  return getCookie(ACCESS_KEY) || localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_KEY) || localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const res = await fetch(`${API_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  localStorage.setItem(ACCESS_KEY, data.access);
  if (data.refresh) localStorage.setItem(REFRESH_KEY, data.refresh);
  return data.access;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function apiRequest<T = unknown>(
  path: string,
  { body, headers, ...options }: RequestOptions = {}
): Promise<T> {
  const send = async (token: string | null): Promise<Response> => {
    return fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  };

  let res = await send(getAccessToken());

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await send(newToken);
    } else {
      clearTokens();
    }
  }

  if (!res.ok) {
    let detail = `Request failed with status ${res.status}`;
    try {
      const err = await res.json();
      detail = err.detail ?? JSON.stringify(err);
    } catch {
      // ignore body parse errors
    }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
