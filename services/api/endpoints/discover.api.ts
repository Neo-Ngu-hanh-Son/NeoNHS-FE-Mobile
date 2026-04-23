export const discoverEndpoints = {
  /**
   * /api/attractions/all
   */
  getAllAttractions: () => `attractions/all`,
  /**
   * /api/attractions
   */
  getAllAttractionsWithPointPaginated: () => `attractions`,
  /**
   * /api/attractions/{attractionId}
   */
  getAttractionById: (id: string | number) => `attractions/${id}`,
  /**
   * /api/points/all/{attractionId}
   */
  getPointsOfAttraction: (attractionId: string | number) => `points/all/${attractionId}`,
  /**
   * /api/points/{pointId}
   */
  getPointById: (id: string | number) => `points/${id}`,
  /**
   * /api/attractions
   */
  getAttractions: () => `attractions`,
  /**
   * /api/points/all
   */
  getAllAvailablePoints: () => `points/all`,
  /**
   * /api/points/{pointId}/history-audios
   */
  getAllHistoryAudiosOfPoint: (pointId: string | number) => `points/${pointId}/history-audios`,
  /**
   * /api/points/{pointId}/public-checkin-images
   */
  getPointPublicCheckinImages: (poitnId: string | number) => `points/${poitnId}/public-checkin-images`,
} as const;
