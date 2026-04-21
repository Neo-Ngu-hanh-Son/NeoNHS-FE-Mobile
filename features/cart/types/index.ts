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

export type DiscountType = 'FIXED' | 'PERCENT';
export type ApplicableProduct = 'ALL' | 'EVENT_TICKET' | 'WORKSHOP' | 'TICKET';
export type VoucherType = 'DISCOUNT' | 'GIFT_PRODUCT' | 'BONUS_POINTS' | 'FREE_SERVICE';

export interface Voucher {
    userVoucherId: string;
    voucherId: string;
    code: string;
    description: string | null;
    voucherType: VoucherType;
    discountType: DiscountType;
    discountValue: number;
    maxDiscountValue: number | null;
    minOrderValue: number;
    applicableProduct: ApplicableProduct;
    startDate: string | null;
    endDate: string | null;
    isAvailable: boolean;
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
