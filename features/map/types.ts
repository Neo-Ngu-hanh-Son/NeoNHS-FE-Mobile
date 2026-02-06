export type POIType =
  | 'pagoda'
  | 'cave'
  | 'viewpoint'
  | 'general'
  | 'checkin'
  | 'statue'
  | 'gate'
  | 'shop'
  | 'elevator';

export type PointKind = 'path' | 'junction_3way' | 'junction_4way' | 'entrance' | 'dead_end';

export type Point = {
  id: string; // stable unique id
  lat: number;
  lng: number;

  label?: string;
  kind?: PointKind;
};

export type EdgeHintDirection = 'left' | 'up' | 'right' | 'down' | 'straight';

export type Edge = {
  id: string;
  from: string;
  to: string;
  bidirectional: boolean;
  shape?: { lat: number; lng: number }[]; // polyline points
  directionHint?: EdgeHintDirection;
  note?: string;
};

// These are special points used for map markers and interactions (They are not necessarily nodes in the graph, but can be on the edges)
export interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: POIType;

  // Optional graph attachment
  attachedTo?: {
    type: 'node' | 'edge';
    refId: string; // nodeId or edgeId
  };
}
