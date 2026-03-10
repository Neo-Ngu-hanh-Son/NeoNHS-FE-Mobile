export type POIType =
  | 'PAGODA'
  | 'CAVE'
  | 'VIEWPOINT'
  | 'GENERAL'
  | 'CHECKIN'
  | 'STATUE'
  | 'GATE'
  | 'SHOP'
  | 'ELEVATOR'
  | 'EVENT'
  | 'WORKSHOP'
  | 'ATTRACTION' // Example: Thuy Son mountain, etc.
  | 'DEFAULT';

export type PointKind = 'path' | 'junction_3way' | 'junction_4way' | 'entrance' | 'dead_end';

// These are nodes in the graph
export type Point = {
  id: string; // stable unique id
  latitude: number;
  longitude: number;

  label?: string;
  kind?: PointKind;
};

export type EdgeHintDirection = 'left' | 'up' | 'right' | 'down' | 'straight';

export type Edge = {
  id: string;
  from: string;
  to: string;
  bidirectional: boolean;
  shape?: { latitude: number; longitude: number }[]; // polyline points
  directionHint?: EdgeHintDirection;
  note?: string;
};

// These are special points used for map markers and interactions (They are not necessarily nodes in the graph, but can be on the edges)
export interface MapPoint {
  // Base PointResponse Fields
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  latitude: string;
  longitude: string;
  orderIndex?: number;
  estTimeSpent?: number;
  type: POIType;
  attractionId?: string;
  panoramaImageUrl?: string;
  defaultYaw?: number;
  defaultPitch?: number;
  googlePlaceId?: string;
  historyAudioCount?: number;

  // Children check-in points
  checkinPoints?: MapPointCheckin[];

  // MapPointResponse Specific Fields (Events & Workshops)
  startTime?: string;
  endTime?: string;
  shortDescription?: string;
  maxParticipants?: number;
  currentEnrolled?: number;
  workshopOrganizerName?: string;

  // Only used by front end map (Don't mind about this)
  attachedTo?: {
    type: 'node' | 'edge';
    refId: string; // nodeId or edgeId
  };
}


export interface MapPointCheckin {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  isActive?: boolean;
  latitude: number;
  longitude: number;
  type: POIType;
  panoramaImageUrl?: string; // For 360 view
  defaultYaw?: number;
  defaultPitch?: number;
  rewardPoints?: number;
  qrCode?: string;
}

export type AttractionStatus = 'OPEN' | 'CLOSED' | 'MAINTENANCE' | 'TEMPORARILY_CLOSED';

export interface Attraction {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  status: AttractionStatus;
  thumbnailUrl: string;
  mapImageUrl: string | null;
  openHour: string; // format: "HH:mm:ss"
  closeHour: string; // format: "HH:mm:ss"
}
