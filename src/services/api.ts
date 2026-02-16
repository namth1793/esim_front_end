/**
 * API Configuration
 * =================
 * Central config for all API endpoints, headers, and auth.
 * 
 * TO CONNECT REAL APIs:
 * 1. Replace BASE URLs below with your actual API endpoints
 * 2. Add real API keys/tokens to the AUTH_HEADERS
 * 3. Remove the `USE_MOCK` flag or set it to false
 * 
 * No UI changes are required when switching from mock to real APIs.
 */

// ──────────────────────────────────────────────
// Toggle: set to false when connecting real APIs
// ──────────────────────────────────────────────
export const USE_MOCK = true;

// ──────────────────────────────────────────────
// Base URLs — replace with real endpoints
// ──────────────────────────────────────────────
export const API_BASE_URLS = {
  /** WooCommerce REST API base (products + orders) */
  woocommerce: "https://api.sample-esim.com",

  /** Amazon Pay / payment gateway */
  payment: "https://amazonpay.sample.com",

  /** eSIM Access provider API */
  esimProvider: "https://esim-access.sample.com",

  /** Auth API (your own backend) */
  auth: "https://api.sample-esim.com/auth",
} as const;

// ──────────────────────────────────────────────
// Auth & Headers — replace with real credentials
// ──────────────────────────────────────────────
export const API_HEADERS = {
  /** WooCommerce consumer key / secret (Base64 encoded) */
  woocommerce: {
    "Content-Type": "application/json",
    // Authorization: "Basic <BASE64_ENCODED_CONSUMER_KEY:SECRET>",
  },

  /** eSIM Access API key */
  esimProvider: {
    "Content-Type": "application/json",
    // "X-API-Key": "<YOUR_ESIM_ACCESS_API_KEY>",
  },

  /** Default JSON headers */
  default: {
    "Content-Type": "application/json",
  },
} as const;

// ──────────────────────────────────────────────
// Helper: build full URL for a service
// ──────────────────────────────────────────────
type ServiceName = keyof typeof API_BASE_URLS;

export function apiUrl(service: ServiceName, path: string): string {
  return `${API_BASE_URLS[service]}${path}`;
}

// ──────────────────────────────────────────────
// Helper: generic fetch wrapper
// ──────────────────────────────────────────────
export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  headers: Record<string, string> = API_HEADERS.default
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
