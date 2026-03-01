export const discoverEndpoints = {
  getAllAttractions: () => `attractions/all`,
  getAttractionById: (id: string | number) => `attractions/${id}`,
  getPointsOfAttraction: (attractionId: string | number) => `points/all/${attractionId}`,
  getPointById: (id: string | number) => `points/${id}`,
  getAttractions: () => `attractions`,
  getAllAvailablePoints: () => `points/all`,
} as const;
