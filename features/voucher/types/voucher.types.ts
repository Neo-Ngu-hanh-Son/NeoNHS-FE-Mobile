export type VoucherType = 'DISCOUNT' | 'GIFT_PRODUCT';
export type VoucherScope = 'PLATFORM' | 'VENDOR';
export type DiscountType = 'PERCENT' | 'FIXED';
export type ApplicableProduct = 'ALL' | 'EVENT_TICKET' | 'WORKSHOP';

export interface VoucherResponse {
  id: string;
  code: string;
  description: string | null;
  voucherType: VoucherType;
  scope: VoucherScope;
  applicableProduct: ApplicableProduct;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountValue: number | null;
  minOrderValue: number;
  giftDescription: string | null;
  giftImageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number;
  usageCount: number;
  vendorId: string | null;
  vendorName: string | null;
  pointCost: number | null;
  isCollected?: boolean;
}

export interface VoucherPaginatedResponse {
  content: VoucherResponse[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
}

export interface VoucherFilterParams {
  voucherType?: VoucherType;
  applicableProduct?: ApplicableProduct;
  code?: string;
}

export interface VoucherQueryParams extends VoucherFilterParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface UserVoucherResponse {
  userVoucherId: string;
  isUsed: boolean;
  obtainedDate: string;
  usedDate: string | null;
  voucherId: string;
  code: string;
  description: string | null;
  voucherType: VoucherType;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountValue: number | null;
  minOrderValue: number;
  applicableProduct: ApplicableProduct;
  giftDescription: string | null;
  giftImageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  isAvailable: boolean;
  vendorId: string | null;
  vendorName: string | null;
}

export interface UserVoucherPaginatedResponse {
  content: UserVoucherResponse[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
}

export interface UserVoucherQueryParams {
  isUsed?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
