export type ManualMapNode = {
  x: number;
  y: number;
};

export type ManualMapAdj = {
  to: string;
  w: number;
};

export type ManualMapGraph = {
  nodes: Record<string, ManualMapNode>;
  adj: Record<string, ManualMapAdj[]>;
};

export interface GraphData {
  nodes: Record<string, ManualMapNode>;
  adj: Record<string, ManualMapAdj[]>;
}

export interface ManualMapEdge {
  routeId: string;
  // Note: these 2 ids are the ids corresponding to the node id in graph adj list
  id1: string;
  id2: string;
  p1: ManualMapNode;
  p2: ManualMapNode;
  lineCoords: any; // Turf LineString
}

export interface ScoredNode {
  id: string;
  f: number;
}

export interface VirtualOverlay {
  [key: string]: {
    coords: ManualMapNode;
    neighbors: ManualMapAdj[];
  };
}

export interface NearestEdge {
  edge: ManualMapEdge;
  distanceMeters: number;
}

export interface SnappedLocation {
  snapPoint: ManualMapNode;
  id1: string;
  id2: string;
  p1: ManualMapNode;
  p2: ManualMapNode;
  weightTo1: number;
  weightTo2: number;
}
