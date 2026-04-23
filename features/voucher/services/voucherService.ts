import { apiClient } from '@/services/api/client';
import { UserVoucherPaginatedResponse, UserVoucherQueryParams, VoucherPaginatedResponse, VoucherQueryParams } from '../types/voucher.types';

const BASE_URL = 'vouchers';

function buildQueryString(params: VoucherQueryParams | UserVoucherQueryParams): string {
  const { page = 0, size = 10, sortBy = 'id', sortDir = 'desc' } = params;
  const parts: string[] = [`page=${page}`, `size=${size}`, `sortBy=${sortBy}`, `sortDir=${sortDir}`];

  if ('voucherType' in params && params.voucherType) parts.push(`voucherType=${params.voucherType}`);
  if ('applicableProduct' in params && params.applicableProduct)
    parts.push(`applicableProduct=${params.applicableProduct}`);
  if ('code' in params && params.code) parts.push(`code=${encodeURIComponent(params.code)}`);
  if ('isUsed' in params && params.isUsed !== undefined) parts.push(`isUsed=${params.isUsed}`);

  return parts.join('&');
}

export const voucherService = {
  /**
   * Get available platform vouchers (paginated + filters)
   */
  async getAvailableVouchers(params: VoucherQueryParams = {}) {
    return apiClient.get<VoucherPaginatedResponse>(
      `${BASE_URL}/available?${buildQueryString(params)}`
    );
  },

  /**
   * Get available vouchers for a specific vendor (paginated + filters)
   */
  async getVendorVouchers(vendorId: string, params: VoucherQueryParams = {}) {
    return apiClient.get<VoucherPaginatedResponse>(
      `${BASE_URL}/available/vendor/${vendorId}?${buildQueryString(params)}`
    );
  },

  /**
   * Get available vouchers from ALL vendors (paginated + filters)
   */
  async getAllVendorVouchers(params: VoucherQueryParams = {}) {
    return apiClient.get<VoucherPaginatedResponse>(
      `${BASE_URL}/available/vendors?${buildQueryString(params)}`
    );
  },

  /**
   * Collect a voucher into user's wallet
   */
  async collectVoucher(voucherId: string) {
    return apiClient.post<any>(`${BASE_URL}/collect/${voucherId}`);
  },

  /**
   * Get currently authenticated user's vouchers
   */
  async getMyVouchers(params: UserVoucherQueryParams = {}) {
    // Override default sortBy for my vouchers if not provided
    const finalParams = { sortBy: 'obtainedDate', ...params };
    return apiClient.get<UserVoucherPaginatedResponse>(`${BASE_URL}/my?${buildQueryString(finalParams)}`);
  },
};
