/**
 * Product Service (WooCommerce)
 * =============================
 * Fetches eSIM product listings and details.
 *
 * TO CONNECT REAL API:
 * - Set USE_MOCK to false in services/api.ts
 * - Ensure API_BASE_URLS.woocommerce points to your WooCommerce REST API
 * - Add WooCommerce auth headers in API_HEADERS.woocommerce
 */

import { USE_MOCK, apiUrl, apiFetch, API_HEADERS } from "./api";
import { mockEsims, type EsimPackage } from "@/data/mockEsims";

// ── Types (WooCommerce response shape) ─────────
export interface WooProduct {
  id: number;
  name: string;
  country: string;
  region: string;
  country_code: string;
  flag_emoji: string;
  data: string;
  data_gb: number;
  validity: string;
  validity_days: number;
  price: number;
  agent_price: number;
  currency: string;
  coverage: string[];
  provider: string;
  speed: string;
  popular: boolean;
}

// ── Mappers ────────────────────────────────────
function wooProductToEsim(p: WooProduct): EsimPackage {
  return {
    id: `esim-${p.id}`,
    name: p.name,
    country: p.country,
    region: p.region,
    countryCode: p.country_code,
    flagEmoji: p.flag_emoji,
    dataAmount: p.data,
    dataAmountGB: p.data_gb,
    validity: p.validity,
    validityDays: p.validity_days,
    price: p.price,
    agentPrice: p.agent_price,
    currency: p.currency,
    coverage: p.coverage,
    provider: p.provider,
    speed: p.speed,
    popular: p.popular,
  };
}

// ── Service ────────────────────────────────────

/** GET /products — fetch all eSIM products */
export async function getProducts(): Promise<EsimPackage[]> {
  if (USE_MOCK) {
    await delay(400);
    return mockEsims;
  }

  // REAL API: GET /products
  const data = await apiFetch<WooProduct[]>(
    apiUrl("woocommerce", "/products"),
    { method: "GET" },
    API_HEADERS.woocommerce
  );
  return data.map(wooProductToEsim);
}

/** GET /products/{id} — fetch single product */
export async function getProductById(id: string): Promise<EsimPackage | null> {
  if (USE_MOCK) {
    await delay(300);
    return mockEsims.find((e) => e.id === id) ?? null;
  }

  // REAL API: GET /products/{id}
  // Extract numeric ID if needed: id might be "esim-123"
  const numericId = id.replace("esim-", "");
  const data = await apiFetch<WooProduct>(
    apiUrl("woocommerce", `/products/${numericId}`),
    { method: "GET" },
    API_HEADERS.woocommerce
  );
  return wooProductToEsim(data);
}

/** Get featured/popular products */
export async function getFeaturedProducts(): Promise<EsimPackage[]> {
  const all = await getProducts();
  return all.filter((e) => e.popular);
}

// ── Helpers ────────────────────────────────────
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
