export interface CartItem {
    id: string;
    itemName: string;
    price: number;
    quantity: number;
    ticketCatalogId: string;
    totalPrice: number;
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
    type: string;
    minOrderValue: number;
}

export interface PreCheckoutResponse {
    cartItems: CartItem[];
    totalPrice: number;
    validVouchers: Voucher[];
    invalidVouchers: any[];
    discountValue: number;
    finalTotalPrice: number;
    appliedVoucher: Voucher | null;
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
