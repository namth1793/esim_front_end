/**
 * eSIM Provider Service (eSIM Access API)
 * =======================================
 * Activates eSIMs and retrieves installation data after payment.
 *
 * TO CONNECT REAL API:
 * - Set USE_MOCK to false in services/api.ts
 * - Ensure API_BASE_URLS.esimProvider is set
 * - Add your eSIM Access API key in API_HEADERS.esimProvider
 */

import { USE_MOCK, apiUrl, apiFetch, API_HEADERS } from "./api";

// ── Types ──────────────────────────────────────
export interface EsimActivationRequest {
  order_id: number;
  product_id: string;
}

export interface EsimActivationResult {
  esim_id: string;
  qr_code_url: string;
  smdp_address: string;
  activation_code: string;
  status: "active" | "pending" | "failed";
}

export interface EsimStatus {
  esim_id: string;
  status: "active" | "expired" | "pending";
  data_remaining: string;
  expires_at: string;
}

// ── Service ────────────────────────────────────

/** POST /esim/activate — activate an eSIM after payment */
export async function activateEsim(
  request: EsimActivationRequest
): Promise<EsimActivationResult> {
  if (USE_MOCK) {
    await delay(1200);
    return {
      esim_id: `ESIM-${request.order_id}-${Date.now().toString(36).toUpperCase()}`,
      qr_code_url: "https://sample.com/qrcode.png",
      smdp_address: "smdp.sample.com",
      activation_code: `ACT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: "active",
    };
  }

  // REAL API: POST /esim/activate
  return apiFetch<EsimActivationResult>(
    apiUrl("esimProvider", "/esim/activate"),
    { method: "POST", body: JSON.stringify(request) },
    API_HEADERS.esimProvider
  );
}

/** GET /esim/{esimId}/status — check eSIM status */
export async function getEsimStatus(esimId: string): Promise<EsimStatus> {
  if (USE_MOCK) {
    await delay(400);
    return {
      esim_id: esimId,
      status: "active",
      data_remaining: "2.5 GB",
      expires_at: "2026-03-15T00:00:00Z",
    };
  }

  // REAL API: GET /esim/{esimId}/status
  return apiFetch<EsimStatus>(
    apiUrl("esimProvider", `/esim/${esimId}/status`),
    { method: "GET" },
    API_HEADERS.esimProvider
  );
}

// ── Helpers ────────────────────────────────────
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
