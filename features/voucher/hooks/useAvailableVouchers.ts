import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voucherService } from '../services/voucherService';
import { VoucherFilterParams, VoucherPaginatedResponse } from '../types/voucher.types';

const VOUCHER_QUERY_KEY = 'available-vouchers';

export type VoucherScopeTab = 'PLATFORM' | 'VENDOR';

export function useAvailableVouchers(
  scopeTab: VoucherScopeTab,
  filters: VoucherFilterParams = {},
  pageSize = 10
) {
  return useInfiniteQuery<VoucherPaginatedResponse>({
    queryKey: [VOUCHER_QUERY_KEY, scopeTab, filters],
    queryFn: async ({ pageParam = 0 }) => {
      const params = {
        page: pageParam as number,
        size: pageSize,
        ...filters,
      };

      const response =
        scopeTab === 'PLATFORM'
          ? await voucherService.getAvailableVouchers(params)
          : await voucherService.getAllVendorVouchers(params);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch vouchers');
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
  });
}

export function useCollectVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (voucherId: string) => voucherService.collectVoucher(voucherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VOUCHER_QUERY_KEY] });
    },
  });
}
