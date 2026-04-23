import { useInfiniteQuery } from '@tanstack/react-query';
import { voucherService } from '../services/voucherService';
import { UserVoucherQueryParams } from '../types/voucher.types';

export function useMyVouchers(isUsed: boolean, pageSize: number = 10) {
  return useInfiniteQuery({
    queryKey: ['my-vouchers', { isUsed }],
    queryFn: async ({ pageParam = 0 }) => {
      const params: UserVoucherQueryParams = {
        isUsed,
        page: pageParam,
        size: pageSize,
        sortBy: 'obtainedDate',
        sortDir: 'desc',
      };
      const response = await voucherService.getMyVouchers(params);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch my vouchers');
      }
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.last || lastPage.number + 1 >= lastPage.totalPages) {
        return undefined;
      }
      return lastPage.number + 1;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
