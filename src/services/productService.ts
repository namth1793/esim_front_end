/**
 * Product Service
 * ===============
 * Fetches eSIM product listings and details via backend REST API.
 */

import { USE_MOCK, apiUrl, apiFetch } from "./api";
import { mockEsims, type EsimPackage } from "@/data/mockEsims";

// ── Service ────────────────────────────────────

/** GET /products — fetch all eSIM products */
export async function getProducts(): Promise<EsimPackage[]> {
  if (USE_MOCK) {
    await delay(400);
    return mockEsims;
  }

  return apiFetch<EsimPackage[]>(apiUrl("/products"), { method: "GET" });
}

/** GET /products/{id} — fetch single product */
export async function getProductById(
  id: string
): Promise<EsimPackage | null> {
  if (USE_MOCK) {
    await delay(300);
    return mockEsims.find((e) => e.id === id) ?? null;
  }

  return apiFetch<EsimPackage>(apiUrl(`/products/${id}`), { method: "GET" });
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
