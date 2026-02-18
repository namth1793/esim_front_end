/**
 * React Query hooks for data fetching
 * ====================================
 * Wraps service calls in useQuery / useMutation hooks.
 * Components should use these hooks instead of calling services directly.
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import { getProducts, getProductById, getFeaturedProducts } from "@/services/productService";
import { createOrder, getOrder, getMyOrders, processPayment, type CreateOrderRequest } from "@/services/orderService";
import { verifyPayment } from "@/services/paymentService";
import { activateEsim, getEsimStatus, getMyEsims, type EsimActivationRequest } from "@/services/esimService";
import { login, signup, forgotPassword } from "@/services/authService";

// ── Product hooks ──────────────────────────────

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id!),
    enabled: !!id,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: getFeaturedProducts,
  });
}

// ── Order hooks ────────────────────────────────

export function useCreateOrder() {
  return useMutation({
    mutationFn: (request: CreateOrderRequest) => createOrder(request),
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId!),
    enabled: !!orderId,
  });
}

export function useMyOrders() {
  return useQuery({
    queryKey: ["orders", "mine"],
    queryFn: getMyOrders,
  });
}

export function useProcessPayment() {
  return useMutation({
    mutationFn: (orderId: string) => processPayment(orderId),
  });
}

// ── Payment hooks ──────────────────────────────

export function useVerifyPayment() {
  return useMutation({
    mutationFn: (orderId: string) => verifyPayment(orderId),
  });
}

// ── eSIM hooks ─────────────────────────────────

export function useActivateEsim() {
  return useMutation({
    mutationFn: (request: EsimActivationRequest) => activateEsim(request),
  });
}

export function useMyEsims() {
  return useQuery({
    queryKey: ["esims", "mine"],
    queryFn: getMyEsims,
  });
}

export function useEsimStatus(esimId: string | undefined) {
  return useQuery({
    queryKey: ["esim-status", esimId],
    queryFn: () => getEsimStatus(esimId!),
    enabled: !!esimId,
  });
}

// ── Auth hooks ─────────────────────────────────

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      signup(email, password, name),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
}
