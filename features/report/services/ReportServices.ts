import { apiClient, reportEndpoints } from "@/services/api"
import { SubmitReportRequest } from "../type";
import { logger } from "@/utils/logger";

async function submitReport(data: SubmitReportRequest): Promise<void> {
  try {
    await apiClient.post(reportEndpoints.submitReport(), data, {
      requiresAuth: true,
    })
  } catch (error) {
    logger.error('[ReportServices] Failed to submit report', error);
    throw error;
  }
}

export const reportServices = {
  submitReport,
}