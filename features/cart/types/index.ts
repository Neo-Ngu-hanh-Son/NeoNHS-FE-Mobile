export interface CartItem {
    id: string;
    itemName: string;
    price: number;
    quantity: number;
    ticketCatalogId: string;
    totalPrice: number;
    // Event info (for event tickets)
    eventId?: string;
    eventName?: string;
    // Workshop info (for workshop sessions)
    workshopSessionId?: string;
    workshopName?: string;
}

export interface Cart {
    id: string;
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
}

export interface Voucher {
    userVoucherId: string;
    code: string;
    description: string | null;
    discountValue: number;
    type: 'FIXED' | 'PERCENT';
    minOrderValue: number;
}

export interface PreCheckoutResponse {
    cartItems: CartItem[];
    totalPrice: number;
    validVouchers: Voucher[];
    invalidVouchers: Voucher[];
    discountValue: number;
    finalTotalPrice: number;
    appliedVoucher: Voucher | null;
    transactionDate: string;
}

export interface PreCheckoutRequest {
    cartItemIds: string[];
    voucherIds: string[];
}

export interface AddToCartRequest {
    ticketCatalogId: string;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

export interface CreatePaymentLinkRequest {
    cartItemIds: string[];
    voucherIds: string[];
}

export interface PaymentLinkResponse {
    checkoutUrl: string;
    orderCode: string;
    paymentLinkId: string;
}
