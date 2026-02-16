import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints/endpoints";
import { ApiResponse } from "@/services/api/types";
import { Cart, PreCheckoutResponse, PaymentLinkResponse, CreatePaymentLinkRequest, Voucher } from "../types";

export const cartService = {
    /**
     * Get current user's cart
     */
    async getCart() {
        return apiClient.get<Cart>(endpoints.cart.getCart());
    },

    /**
     * Add item to cart
     */
    async addToCart(ticketCatalogId: string, quantity: number) {
        return apiClient.post<any>(endpoints.cart.addToCart(), { ticketCatalogId, quantity });
    },

    /**
     * Update cart item quantity
     */
    async updateCartItem(itemId: string, quantity: number) {
        return apiClient.put<any>(endpoints.cart.updateCartItem(itemId), { quantity });
    },

    /**
     * Remove item from cart
     */
    async removeCartItem(itemId: string) {
        return apiClient.delete<any>(endpoints.cart.removeCartItem(itemId));
    },

    /**
    * Get user vouchers
    */
    async getVouchers() {
        return apiClient.get<Voucher[]>(endpoints.cart.getVouchers());
    },

    /**
     * Pre-checkout to calculate totals
     */
    async preCheckout(body: { cartItemIds: string[], voucherIds: string[] }) {
        return apiClient.post<PreCheckoutResponse>(endpoints.cart.preCheckout(), body);
    },

    /**
     * Create payment link
     */
    async createPaymentLink(payload: CreatePaymentLinkRequest) {
        return apiClient.post<PaymentLinkResponse>(endpoints.payment.createPaymentLink(), payload);
    },

    /**
     * Verify payment status
     */
    async verifyPayment(orderCode: string | number) {
        return apiClient.get<any>(endpoints.payment.verifyPayment(orderCode));
    }
};
