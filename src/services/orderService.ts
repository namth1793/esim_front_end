/**
 * Order Service
 * =============
 * Creates and retrieves orders via backend REST API.
 */

import { USE_MOCK, apiUrl, apiFetch } from "./api";

// ── Types ──────────────────────────────────────
export interface OrderItem {
  product_id: string;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
}

export interface Order {
  id: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  payment_url: string;
  items: OrderItem[];
  total: number;
  currency: string;
  transaction_id?: string | null;
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
      id: `order-${mockOrderCounter}`,
      status: "pending",
      payment_url: `https://amazonpay.sample.com/checkout/${mockOrderCounter}`,
      items: request.items,
      total: 25.0,
      currency: "USD",
      created_at: new Date().toISOString(),
    };
  }

  return apiFetch<Order>(apiUrl("/orders"), {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/** GET /orders/{id} — get order by id */
export async function getOrder(orderId: string): Promise<Order> {
  if (USE_MOCK) {
    await delay(400);
    return {
      id: orderId,
      status: "completed",
      payment_url: "",
      items: [],
      total: 25.0,
      currency: "USD",
      transaction_id: `TXN-${orderId}`,
      created_at: new Date().toISOString(),
    };
  }

  return apiFetch<Order>(apiUrl(`/orders/${orderId}`), { method: "GET" });
}

/** GET /orders — get current user's orders */
export async function getMyOrders(): Promise<Order[]> {
  if (USE_MOCK) {
    await delay(500);
    return [
      {
        id: "order-10001",
        status: "completed",
        payment_url: "",
        items: [{ product_id: "esim-turkey-3", quantity: 1 }],
        total: 9.0,
        currency: "USD",
        transaction_id: "TXN-10001",
        created_at: "2026-02-10T10:00:00Z",
      },
    ];
  }

  return apiFetch<Order[]>(apiUrl("/orders"), { method: "GET" });
}

/** POST /orders/{id}/pay — process payment for order */
export async function processPayment(orderId: string): Promise<Order> {
  if (USE_MOCK) {
    await delay(2000);
    return {
      id: orderId,
      status: "completed",
      payment_url: "",
      items: [],
      total: 25.0,
      currency: "USD",
      transaction_id: `TXN-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
  }

  return apiFetch<Order>(apiUrl(`/orders/${orderId}/pay`), { method: "POST" });
}

// ── Helpers ────────────────────────────────────
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
