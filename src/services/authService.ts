/**
 * Auth Service
 * ============
 * Handles user authentication (login, signup, logout, password reset).
 *
 * TO CONNECT REAL API:
 * - Replace mock implementations with calls to your auth backend
 * - Update API_BASE_URLS.auth in services/api.ts
 */

import { USE_MOCK, apiUrl, apiFetch, API_HEADERS } from "./api";

// ── Types ──────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "agent";
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ── Mock data ──────────────────────────────────
const MOCK_USER: User = {
  id: "usr-001",
  email: "demo@globesim.com",
  name: "Demo User",
  role: "customer",
};

const MOCK_TOKEN = "mock-jwt-token-xyz";

// ── Service ────────────────────────────────────

/** Sign up a new user */
export async function signup(email: string, password: string, name: string): Promise<AuthResponse> {
  if (USE_MOCK) {
    await delay(600);
    return { user: { ...MOCK_USER, email, name }, token: MOCK_TOKEN };
  }

  // REAL API: POST /auth/signup
  return apiFetch<AuthResponse>(
    apiUrl("auth", "/signup"),
    { method: "POST", body: JSON.stringify({ email, password, name }) },
    API_HEADERS.default
  );
}

/** Log in an existing user */
export async function login(email: string, password: string): Promise<AuthResponse> {
  if (USE_MOCK) {
    await delay(600);
    return { user: { ...MOCK_USER, email }, token: MOCK_TOKEN };
  }

  // REAL API: POST /auth/login
  return apiFetch<AuthResponse>(
    apiUrl("auth", "/login"),
    { method: "POST", body: JSON.stringify({ email, password }) },
    API_HEADERS.default
  );
}

/** Request password reset email */
export async function forgotPassword(email: string): Promise<{ success: boolean }> {
  if (USE_MOCK) {
    await delay(600);
    return { success: true };
  }

  // REAL API: POST /auth/forgot-password
  return apiFetch(
    apiUrl("auth", "/forgot-password"),
    { method: "POST", body: JSON.stringify({ email }) },
    API_HEADERS.default
  );
}

/** Log out */
export async function logout(): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    return;
  }

  // REAL API: POST /auth/logout
  await apiFetch(apiUrl("auth", "/logout"), { method: "POST" }, API_HEADERS.default);
}

// ── Helpers ────────────────────────────────────
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
