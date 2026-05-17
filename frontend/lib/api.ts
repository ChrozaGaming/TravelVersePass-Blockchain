// Lightweight fetch wrapper. Otomatis attach Bearer JWT dari localStorage.
import type { ApiError } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const TOKEN_KEY = "tvp_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

type FetchOpts = RequestInit & { auth?: boolean };

export async function api<T = unknown>(
  path: string,
  opts: FetchOpts = {}
): Promise<T> {
  const { auth = false, headers, ...rest } = opts;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: finalHeaders,
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const err = body as ApiError;
    const error = new Error(err?.message || `HTTP ${res.status}`);
    (error as Error & { status?: number; code?: string }).status = res.status;
    (error as Error & { status?: number; code?: string }).code = err?.error;
    throw error;
  }

  return body as T;
}

export { API_BASE };
