/**
 * Order Service (WooCommerce)
 * ===========================
 * Creates and retrieves orders.
 *
 * TO CONNECT REAL API:
 * - Set USE_MOCK to false in services/api.ts
 * - Ensure API_BASE_URLS.woocommerce is set
 */

import { USE_MOCK, apiUrl, apiFetch, API_HEADERS } from "./api";

// ── Types ──────────────────────────────────────
export interface OrderItem {
  product_id: string;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  customer_email: string;
}

export interface Order {
  order_id: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  payment_url: string;
  items: OrderItem[];
  total: number;
  currency: string;
  created_at: string;
}

// ── Mock data ──────────────────────────────────
let mockOrderCounter = 10000;

// ── Service ────────────────────────────────────

/** POST /orders — create a new order */
export async function createOrder(request: CreateOrderRequest): Promise<Order> {
  if (USE_MOCK) {
    await delay(800);
    mockOrderCounter++;
    return {
      order_id: mockOrderCounter,
      status: "pending",
      payment_url: `https://amazonpay.sample.com/checkout/${mockOrderCounter}`,
      items: request.items,
      total: 25.0, // Mock total
      currency: "USD",
      created_at: new Date().toISOString(),
    };
  }

  // REAL API: POST /orders
  return apiFetch<Order>(
    apiUrl("woocommerce", "/orders"),
    { method: "POST", body: JSON.stringify(request) },
    API_HEADERS.woocommerce
  );
}

/** GET /orders/{id} — get order status */
export async function getOrder(orderId: number): Promise<Order> {
  if (USE_MOCK) {
    await delay(400);
    return {
      order_id: orderId,
      status: "completed",
      payment_url: "",
      items: [],
      total: 25.0,
      currency: "USD",
      created_at: new Date().toISOString(),
    };
  }

  // REAL API: GET /orders/{id}
  return apiFetch<Order>(
    apiUrl("woocommerce", `/orders/${orderId}`),
    { method: "GET" },
    API_HEADERS.woocommerce
  );
}

/** GET /orders?customer_email=... — get user's orders */
export async function getOrdersByEmail(email: string): Promise<Order[]> {
  if (USE_MOCK) {
    await delay(500);
    return [
      {
        order_id: 10001,
        status: "completed",
        payment_url: "",
        items: [{ product_id: "esim-turkey-3", quantity: 1 }],
        total: 9.0,
        currency: "USD",
        created_at: "2026-02-10T10:00:00Z",
      },
    ];
  }

  // REAL API: GET /orders?customer_email=...
  return apiFetch<Order[]>(
    apiUrl("woocommerce", `/orders?customer_email=${encodeURIComponent(email)}`),
    { method: "GET" },
    API_HEADERS.woocommerce
  );
}

// ── Helpers ────────────────────────────────────
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
