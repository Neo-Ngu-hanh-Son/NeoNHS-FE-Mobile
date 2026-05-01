import { useMutation } from "@tanstack/react-query";
import { SubmitReportRequest } from "../type";
import { reportServices } from "../services/ReportServices";
import { logger } from "@/utils/logger";

export const useReport = () => {
  return useMutation({
    mutationFn: async (payload: SubmitReportRequest) => {
      await reportServices.submitReport(payload);
    },
    gcTime: 0,
    onError: (error) => logger.error('[reportServices.submitReport] TanStackQuery POST failed:', error),
  });
}