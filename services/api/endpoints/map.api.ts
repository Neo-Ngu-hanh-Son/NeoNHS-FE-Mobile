export const NHS_ATTRACTION_ID = '1f7b0d4d-0681-11f1-b9a6-0242ac120002';
export const mapEndpoints = {
  // Map related
  getAllAttractions: () => `attractions/all`,
  getPointsOfAttraction: (attractionId: string | number) => `points/all/${attractionId}`,
  getCheckinPointsByPointId: (pointId: string, _params?: {
    page?: number; size?: number; sortBy?: string;
    sortDir?: 'asc' | 'desc'; search?: string
  }) => `/points/${pointId}/check-ins`,
  getCheckinPointById: (pointId: string, checkinId: string) =>
    `/points/${pointId}/check-ins/${checkinId}`,
  getMapPoints: () => `points/map`,

  // Panorama endpoints
  getPanorama: (pointId: string) => `points/${pointId}/panorama`,
  getCheckinPanorama: (pointId: string) => `checkin-points/${pointId}/panorama`,
  getMobilePointPanorama: () => `places/panorama/mobile`,
  getMobileCheckinPointPanorama: () => `places/checkin-points/panorama/mobile`,

  // Check-in related endpoints
  userCheckIn: () => `users/check-ins`,
  getNearbyCheckIns: () =>
    `points/-1/check-ins/nearby`,
} as const;
