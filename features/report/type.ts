export enum ReportTypes {
  EVENT = 'EVENT',
  WORKSHOP = 'WORKSHOP',
  POINT = 'POINT',
  USER = 'USER',
  REVIEW = 'REVIEW',
  BLOG = 'BLOG',
}

export type SubmitReportRequest = {
  targetType: ReportTypes;
  targetId: string;
  reason: string;
  description?: string;
  evidenceUrl?: string;
}