export interface PanoramaHotSpotResponse {
  id: string;
  yaw: number | null;
  pitch: number | null;
  tooltip: string | null;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  orderIndex: number | null;
}

export interface PointPanoramaResponse {
  id: string;
  name: string | null;
  address: string | null;
  description: string | null;
  panoramaImageUrl: string | null;
  thumbnailUrl: string | null;
  defaultYaw: number | null;
  defaultPitch: number | null;
  hotSpots: PanoramaHotSpotResponse[] | null;
}
