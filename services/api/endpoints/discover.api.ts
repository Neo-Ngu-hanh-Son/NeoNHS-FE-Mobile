export const discoverEndpoints = {
  // WHO WRITE THESE COMMENTS??? MOBILE HAS NO ACCESS TO ADMIN ENDPOINTS???
  /**
   * /api/attractions/all
   */
  getAllAttractions: () => `attractions/all`,
  /**
   * /api/attractions
   */
  getAllAttractionsWithPointPaginated: () => `attractions`,
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
