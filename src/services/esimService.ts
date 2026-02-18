/**
 * eSIM Provider Service
 * =====================
 * Activates eSIMs and retrieves installation data via backend REST API.
 */

import { USE_MOCK, apiUrl, apiFetch } from "./api";

// ── Types ──────────────────────────────────────
export interface EsimActivationRequest {
  order_id: string;
  product_id: string;
}

export interface EsimActivationResult {
  esim_id: string;
  qr_code_url: string;
  smdp_address: string;
  activation_code: string;
  status: "active" | "pending" | "failed";
}

export interface PurchasedEsim {
  id: string;
  order_id: string;
  product_id: string;
  esim_id: string | null;
  qr_code_url: string | null;
  smdp_address: string | null;
  activation_code: string | null;
  status: string;
  created_at: string;
}

export interface EsimStatus {
  esim_id: string;
  status: "active" | "expired" | "pending";
  data_remaining: string;
  expires_at: string;
}

// ── Service ────────────────────────────────────

/** POST /esims/activate — activate an eSIM after payment */
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

  return apiFetch<EsimActivationResult>(apiUrl("/esims/activate"), {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/** GET /esims — get current user's purchased eSIMs */
export async function getMyEsims(): Promise<PurchasedEsim[]> {
  if (USE_MOCK) {
    await delay(500);
    return [
      {
        id: "pe-001",
        order_id: "order-10001",
        product_id: "esim-turkey-3",
        esim_id: "ESIM-ABC123",
        qr_code_url: "https://sample.com/qrcode.png",
        smdp_address: "smdp.sample.com",
        activation_code: "ACT-XYZ789",
        status: "active",
        created_at: "2026-02-10T10:05:00Z",
      },
    ];
  }

  return apiFetch<PurchasedEsim[]>(apiUrl("/esims"), { method: "GET" });
}

/** GET /esims/{esimId}/status — check eSIM status */
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

  return apiFetch<EsimStatus>(apiUrl(`/esims/${esimId}/status`), {
    method: "GET",
  });
}

// ── Helpers ────────────────────────────────────
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
