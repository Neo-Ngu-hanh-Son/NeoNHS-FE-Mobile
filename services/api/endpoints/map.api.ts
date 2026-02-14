export const NHS_ATTRACTION_ID = '1f7b0d4d-0681-11f1-b9a6-0242ac120002';
export const mapEndpoints = {
  getAllAttractions: () => `attractions/all`,
  getPointsOfAttraction: (attractionId: string | number) => `points/all/${attractionId}`,
} as const;
