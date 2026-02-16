/**
 * Payment Service (Amazon Pay)
 * ============================
 * Handles payment redirect and status verification.
 *
 * TO CONNECT REAL API:
 * - Set USE_MOCK to false in services/api.ts
 * - Ensure API_BASE_URLS.payment is set to your Amazon Pay endpoint
 */

import { USE_MOCK, apiUrl, apiFetch, API_HEADERS } from "./api";

// ── Types ──────────────────────────────────────
export interface PaymentResult {
  order_id: number;
  payment_status: "paid" | "failed" | "pending";
  transaction_id?: string;
}

// ── Service ────────────────────────────────────

/**
 * Redirect user to Amazon Pay checkout.
 * In mock mode, simulates a redirect and auto-resolves as paid.
 */
export function redirectToPayment(paymentUrl: string): void {
  if (USE_MOCK) {
    // In mock mode we don't actually redirect.
    // The UI should call verifyPayment() after a short delay.
    console.log(`[MOCK] Would redirect to: ${paymentUrl}`);
    return;
  }

  // REAL: redirect the browser to Amazon Pay
  window.location.href = paymentUrl;
}

/**
 * Verify payment status after callback / redirect.
 * Called when user returns from payment gateway.
 */
export async function verifyPayment(orderId: number): Promise<PaymentResult> {
  if (USE_MOCK) {
    await delay(1000);
    return {
      order_id: orderId,
      payment_status: "paid",
      transaction_id: `TXN-${orderId}-${Date.now()}`,
    };
  }

  // REAL API: GET /payment/verify/{orderId}
  return apiFetch<PaymentResult>(
    apiUrl("payment", `/verify/${orderId}`),
    { method: "GET" },
    API_HEADERS.default
  );
}

// ── Helpers ────────────────────────────────────
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
