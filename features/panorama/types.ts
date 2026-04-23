export type PanoramaHotSpotType = 'INFO' | 'LINK';
export interface PanoramaHotSpotResponse {
  id: string;
  yaw: number;
  pitch: number;
  tooltip: string;
  title: string;
  description: string;
  imageUrl: string | null;
  orderIndex: number;
  type: PanoramaHotSpotType;
  targetPanoramaId: string | null;
}

export interface PointPanoramaResponse {
  id: string;
  title: string;
  panoramaImageUrl: string;
  defaultYaw: number;
  defaultPitch: number;
  isDefault: boolean;
  placeId: string;
  hotSpots: PanoramaHotSpotResponse[];
}
