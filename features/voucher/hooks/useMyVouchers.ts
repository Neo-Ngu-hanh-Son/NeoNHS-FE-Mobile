import { useInfiniteQuery } from '@tanstack/react-query';
import { voucherService } from '../services/voucherService';
import { UserVoucherQueryParams, UserVoucherPaginatedResponse } from '../types/voucher.types';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { translationApi } from '@/services/api/translationApi';

export function useMyVouchers(isUsed: boolean, pageSize: number = 10) {
  const { language } = useLanguage();

  return useInfiniteQuery<UserVoucherPaginatedResponse>({
    queryKey: ['my-vouchers', { isUsed }, language],
    queryFn: async ({ pageParam = 0 }) => {
      const params: UserVoucherQueryParams = {
        isUsed,
        page: pageParam as number,
        size: pageSize,
        sortBy: 'obtainedDate',
        sortDir: 'desc',
      };
      const response = await voucherService.getMyVouchers(params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch my vouchers');
      }

      if (language === 'vi') return response.data;

      const fieldsToTranslate: Record<string, string> = {};
      response.data.content.forEach((voucher) => {
        if (voucher.description) {
          fieldsToTranslate[`${voucher.userVoucherId}_desc`] = voucher.description;
        }
        if (voucher.giftDescription) {
          fieldsToTranslate[`${voucher.userVoucherId}_gift`] = voucher.giftDescription;
        }
      });

      if (Object.keys(fieldsToTranslate).length > 0) {
        const translatedFields = await translationApi.translateBatch(fieldsToTranslate, language);
        response.data.content = response.data.content.map((voucher) => ({
          ...voucher,
          description: translatedFields[`${voucher.userVoucherId}_desc`] || voucher.description,
          giftDescription: translatedFields[`${voucher.userVoucherId}_gift`] || voucher.giftDescription,
        }));
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
