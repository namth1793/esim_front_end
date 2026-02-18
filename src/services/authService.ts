/**
 * Auth Service
 * ============
 * Handles user authentication via backend REST API.
 * JWT tokens are managed via api.ts token helpers.
 */

import { USE_MOCK, apiUrl, apiFetch, setToken, removeToken } from "./api";

// ── Types ──────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "agent";
  avatar_url?: string | null;
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
export async function signup(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  if (USE_MOCK) {
    await delay(600);
    const res = { user: { ...MOCK_USER, email, name }, token: MOCK_TOKEN };
    setToken(res.token);
    return res;
  }

  const res = await apiFetch<AuthResponse>(apiUrl("/auth/signup"), {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  setToken(res.token);
  return res;
}

/** Log in an existing user */
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  if (USE_MOCK) {
    await delay(600);
    const res = { user: { ...MOCK_USER, email }, token: MOCK_TOKEN };
    setToken(res.token);
    return res;
  }

  const res = await apiFetch<AuthResponse>(apiUrl("/auth/login"), {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(res.token);
  return res;
}

/** Get current user profile from token */
export async function getMe(): Promise<User> {
  if (USE_MOCK) {
    await delay(300);
    return MOCK_USER;
  }

  return apiFetch<User>(apiUrl("/auth/me"), { method: "GET" });
}

/** Request password reset email */
export async function forgotPassword(
  email: string
): Promise<{ success: boolean }> {
  if (USE_MOCK) {
    await delay(600);
    return { success: true };
  }

  return apiFetch(apiUrl("/auth/forgot-password"), {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/** Reset password with token */
export async function resetPassword(
  token: string,
  password: string
): Promise<{ success: boolean }> {
  if (USE_MOCK) {
    await delay(600);
    return { success: true };
  }

  return apiFetch(apiUrl("/auth/reset-password"), {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

/** Log out */
export async function logout(): Promise<void> {
  if (USE_MOCK) {
    removeToken();
    return;
  }

  try {
    await apiFetch(apiUrl("/auth/logout"), { method: "POST" });
  } finally {
    removeToken();
  }
}

// ── Helpers ────────────────────────────────────
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
