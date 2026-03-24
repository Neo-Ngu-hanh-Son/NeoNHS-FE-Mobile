import { GeofencingEventType, LocationRegion } from 'expo-location';
import { LatLng } from 'react-native-maps';

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
  | 'ATTRACTION' // Not used anymore bruh
  | 'USER_CHECKIN'
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
  latitude: number;
  longitude: number;
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
  isUserCheckedIn?: boolean;
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

export interface BackgroundGeoFencingData {
  region: LocationRegion;
  eventType: GeofencingEventType;
}

export enum CheckinMethod {
  MANUAL = 'MANUAL',
  QR_CODE = 'QR_CODE',
  GPS = 'GPS',
}
export interface CheckinImageRequest {
  id?: string; // UUID (can be omitted if creating fresh)
  imageUrl: string;
  caption?: string; // Optional caption
}

export interface UserCheckinRequest {
  latitude: number;
  longitude: number;
  method: CheckinMethod;
  note?: string;
  checkinPointId: string;
  checkinImageRequest?: CheckinImageRequest[];
}

export type UserCheckinResultResponse = {
  earnedPoints: number;
  userTotalPoints: number;
};

export const mapConstants = {
  checkinPointDetectRadiusMeters: 20, // Radius to detect nearby check-in points
  fetchingCheckinParameters: 100, // Default radius for fetching nearby check-in points
  distanceMoveBeforeRefetchMeters: 30,
}

// Route types for Google Maps Directions API
export type TravelMode = 'DRIVE' | 'WALK' | 'BICYCLE' | 'TWO_WHEELER';

export type GoogleLatLng = {
  latitude: number;
  longitude: number;
};

export type DirectionsRequestBody = {
  origin: { location: { latLng: GoogleLatLng } };
  destination: { location: { latLng: GoogleLatLng } };
  travelMode: TravelMode;
  computeAlternativeRoutes: boolean;
  routeModifiers: {
    avoidTolls: boolean;
    avoidHighways: boolean;
    avoidFerries: boolean;
  };
  languageCode: string;
  units: 'METRIC';
  routingPreference?: 'TRAFFIC_AWARE';
};

export type PolylineCoordinate = LatLng;

// Maneuver types used by Google to help you choose icons (Left turn, Right turn, etc.)
export type Maneuver =
  | 'MANEUVER_UNSPECIFIED' | 'DEPART' | 'TURN_LEFT' | 'TURN_RIGHT'
  | 'TURN_SLIGHT_LEFT' | 'TURN_SLIGHT_RIGHT' | 'TURN_SHARP_LEFT'
  | 'TURN_SHARP_RIGHT' | 'UTURN_LEFT' | 'UTURN_RIGHT' | 'STRAIGHT'
  | 'RAMP_LEFT' | 'RAMP_RIGHT' | 'MERGE' | 'FORK_LEFT' | 'FORK_RIGHT'
  | 'FERRY' | 'ROUNDABOUT_LEFT' | 'ROUNDABOUT_RIGHT' | 'NAME_CHANGE';


export interface RouteResponse {
  routes: Route[];
}

export interface Route {
  legs: Leg[];
  polyline: {
    encodedPolyline: string; // The polyline for the ENTIRE trip
  };
}

export interface Leg {
  startLocation: { latLng: LatLng };
  endLocation: { latLng: LatLng };
  steps: Step[];
}

export interface Step {
  polyline: {
    encodedPolyline: string; // The polyline for just this specific step
  };
  navigationInstruction: {
    maneuver: Maneuver;
    instructions: string; // e.g., "Turn right at The Dreamers"
  };
  localizedValues: {
    distance: { text: string };       // e.g., "0.3 km"
    staticDuration: { text: string }; // e.g., "1 min"
  };
  travelMode: TravelMode;
}