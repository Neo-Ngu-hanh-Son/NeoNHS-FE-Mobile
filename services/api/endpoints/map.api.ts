export const NHS_ATTRACTION_ID = '844856a5-04c2-11f1-a975-0242ac110002';
export const mapEndpoints = {
  getAllAttractions: () => `attractions/all`,
  getPointsOfAttraction: (attractionId: string | number) => `points/all/${attractionId}`,
} as const;
