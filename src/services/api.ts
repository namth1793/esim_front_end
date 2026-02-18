/**
 * API Configuration
 * =================
 * Central config for all API endpoints, headers, and auth.
 *
 * All data access goes through the backend REST API.
 * No direct database/Supabase calls from the frontend.
 */

// ──────────────────────────────────────────────
// Toggle: set to false when connecting real APIs
// ──────────────────────────────────────────────
export const USE_MOCK = true;

// ──────────────────────────────────────────────
// Base URL — configurable via environment variable
// ──────────────────────────────────────────────
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.sample-esim.com";

// ──────────────────────────────────────────────
// Token management
// ──────────────────────────────────────────────
const TOKEN_KEY = "globesim_access_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ──────────────────────────────────────────────
// Helper: build full URL
// ──────────────────────────────────────────────
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

// ──────────────────────────────────────────────
// Helper: build auth headers with JWT
// ──────────────────────────────────────────────
function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ──────────────────────────────────────────────
// API Error class
// ──────────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// ──────────────────────────────────────────────
// Generic fetch wrapper with JWT auth
// ──────────────────────────────────────────────
export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers as Record<string, string>) },
  });

  if (!response.ok) {
    let message = `API error ${response.status}: ${response.statusText}`;
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      // use default message
    }

    // If 401, clear token (session expired)
    if (response.status === 401) {
      removeToken();
    }

    throw new ApiError(response.status, message);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
