import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
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
    * Get user vouchers
    */
    async getVouchers() {
        return apiClient.get<Voucher[]>(endpoints.cart.getVouchers());
    },

    /**
     * Pre-checkout to calculate totals
     */
    async preCheckout(body: any = {}) {
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
