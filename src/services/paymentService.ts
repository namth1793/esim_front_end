/**
 * Payment Service
 * ===============
 * Handles payment redirect and status verification via backend REST API.
 */

import { USE_MOCK, apiUrl, apiFetch } from "./api";

// ── Types ──────────────────────────────────────
export interface PaymentResult {
  order_id: string;
  payment_status: "paid" | "failed" | "pending";
  transaction_id?: string;
}

// ── Service ────────────────────────────────────

/**
 * Redirect user to payment gateway.
 * In mock mode, simulates a redirect.
 */
export function redirectToPayment(paymentUrl: string): void {
  if (USE_MOCK) {
    console.log(`[MOCK] Would redirect to: ${paymentUrl}`);
    return;
  }

  window.location.href = paymentUrl;
}

/**
 * Verify payment status after callback / redirect.
 */
export async function verifyPayment(orderId: string): Promise<PaymentResult> {
  if (USE_MOCK) {
    await delay(1000);
    return {
      order_id: orderId,
      payment_status: "paid",
      transaction_id: `TXN-${orderId}-${Date.now()}`,
    };
  }

  return apiFetch<PaymentResult>(apiUrl(`/payments/verify/${orderId}`), {
    method: "GET",
  });
}

// ── Helpers ────────────────────────────────────
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
