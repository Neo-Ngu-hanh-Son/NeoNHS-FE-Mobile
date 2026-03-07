export const discoverEndpoints = {
  /**
   * /api/admin/attractions/all
   */
  getAllAttractions: () => `attractions/all`,
  /**
   * /api/admin/attractions/{attractionId}
   */
  getAttractionById: (id: string | number) => `attractions/${id}`,
  /**
   * /api/admin/points/all/{attractionId}
   */
  getPointsOfAttraction: (attractionId: string | number) => `points/all/${attractionId}`,
  /**
   * /api/admin/points/{pointId}
   */
  getPointById: (id: string | number) => `points/${id}`,
  /**
   * /api/admin/attractions
   */
  getAttractions: () => `attractions`,
  /**
   * /api/admin/points/all
   */
  getAllAvailablePoints: () => `points/all`,
  /**
   * /api/admin/points/{pointId}/history-audios
   */
  getAllHistoryAudiosOfPoint: (pointId: string | number) => `points/${pointId}/history-audios`,
} as const;
