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
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  history?: string;
  historyAudioUrl?: string;
  latitude: number;
  longitude: number;
  orderIndex?: number;
  estTimeSpent?: number;
  type: POIType;

  // Optional graph attachment
  attachedTo?: {
    type: 'node' | 'edge';
    refId: string; // nodeId or edgeId
  };
}

export type AttractionStatus = 'OPEN' | 'CLOSED';

export interface Attraction {
  id: string;
  name: string;
  description: string;
  address: string;

  latitude: number;
  longitude: number;

  openHour: string; // format: "HH:mm:ss"
  closeHour: string; // format: "HH:mm:ss"

  status: AttractionStatus;

  thumbnailUrl: string;
  mapImageUrl: string | null;
}
