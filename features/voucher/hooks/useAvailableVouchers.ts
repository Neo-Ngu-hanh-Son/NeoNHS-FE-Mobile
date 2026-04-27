import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voucherService } from '../services/voucherService';
import { VoucherFilterParams, VoucherPaginatedResponse } from '../types/voucher.types';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { translationApi } from '@/services/api/translationApi';

const VOUCHER_QUERY_KEY = 'available-vouchers';

export type VoucherScopeTab = 'PLATFORM' | 'VENDOR';

export function useAvailableVouchers(
  scopeTab: VoucherScopeTab,
  filters: VoucherFilterParams = {},
  pageSize = 10
) {
  const { language } = useLanguage();

  return useInfiniteQuery<VoucherPaginatedResponse>({
    queryKey: [VOUCHER_QUERY_KEY, scopeTab, filters, language],
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
        if (language === 'vi') return response.data;

        const fieldsToTranslate: Record<string, string> = {};
        response.data.content.forEach((voucher) => {
          if (voucher.description) {
            fieldsToTranslate[`${voucher.id}_desc`] = voucher.description;
          }
          if (voucher.giftDescription) {
            fieldsToTranslate[`${voucher.id}_gift`] = voucher.giftDescription;
          }
        });

        if (Object.keys(fieldsToTranslate).length > 0) {
          const translatedFields = await translationApi.translateBatch(fieldsToTranslate, language);
          response.data.content = response.data.content.map((voucher) => ({
            ...voucher,
            description: translatedFields[`${voucher.id}_desc`] || voucher.description,
            giftDescription: translatedFields[`${voucher.id}_gift`] || voucher.giftDescription,
          }));
        }

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
