import { GeofencingEventType, LocationRegion } from 'expo-location';
import { LatLng } from 'react-native-maps';
import { PointPanoramaResponse } from '../panorama/types';

/**
 * ===== Types related to Map Points, Attractions, Check-ins, etc. =====
 */
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

export enum PointVibe {
  SPIRITUAL = 'SPIRITUAL',
  RELAXING = 'RELAXING',
  ENERGETIC = 'ENERGETIC',
  SCENIC = 'SCENIC',
  HISTORICAL = 'HISTORICAL',
}

export enum PointDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

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
  googlePlaceId?: string;
  historyAudioCount?: number;
  history?: string;
  vibe?: PointVibe;
  difficulty?: PointDifficulty;
  address?: string;

  // Children check-in points
  checkinPoints?: MapPointCheckin[];

  // MapPointResponse Specific Fields (Events & Workshops)
  startTime?: string;
  endTime?: string;
  shortDescription?: string;
  maxParticipants?: number;
  currentEnrolled?: number;
  workshopOrganizerName?: string;

  // List of panoramas
  panoramas?: PointPanoramaResponse[] | null;

  // Only used by front end map (Don't mind about this)
  attachedTo?: {
    type: 'node' | 'edge';
    refId: string; // nodeId or edgeId
  };

  // Marker visual metadata (From backend if they include it)
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
  points: PointPreview[];
}

export interface PointPreview {
  id: string;
  attractionId: string;
  name: string;
  thumbnailUrl?: string;
  description?: string;
  type: POIType;
  latitude: number;
  longitude: number;
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
  checkinPointId?: string;
  parentCheckinPointId?: string;
};

/**
 * ====== Types related to Directions & Navigation (Google Maps API) ======
 */
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
  | 'MANEUVER_UNSPECIFIED'
  | 'DEPART'
  | 'TURN_LEFT'
  | 'TURN_RIGHT'
  | 'TURN_SLIGHT_LEFT'
  | 'TURN_SLIGHT_RIGHT'
  | 'TURN_SHARP_LEFT'
  | 'TURN_SHARP_RIGHT'
  | 'UTURN_LEFT'
  | 'UTURN_RIGHT'
  | 'STRAIGHT'
  | 'RAMP_LEFT'
  | 'RAMP_RIGHT'
  | 'MERGE'
  | 'FORK_LEFT'
  | 'FORK_RIGHT'
  | 'FERRY'
  | 'ROUNDABOUT_LEFT'
  | 'ROUNDABOUT_RIGHT'
  | 'NAME_CHANGE';

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
  distanceMeters?: number;
  duration?: string;
  startLocation: { latLng: LatLng };
  endLocation: { latLng: LatLng };
  steps: Step[];
}

export interface Step {
  distanceMeters?: number;
  staticDuration?: string;
  polyline: {
    encodedPolyline: string; // The polyline for just this specific step
  };
  startLocation: { latLng: LatLng };
  endLocation: { latLng: LatLng };
  navigationInstruction: {
    maneuver: Maneuver;
    instructions: string; // e.g., "Turn right at The Dreamers"
  };
  localizedValues: {
    distance: { text: string }; // e.g., "0.3 km"
    staticDuration: { text: string }; // e.g., "1 min"
  };
  travelMode: TravelMode;
}

/**
 * Custom types for quick retrival when working with the hook
 */
export type NavigationSteps = {
  previousStep: Step | null;
  currentStep: Step | null;
  nextStep: Step | null;
};

export type CurrentNavigationStepData = {
  tripDistanceText: string | undefined;
  tripDurationText: string | undefined;
  currentManeuver: Maneuver | null;
  currentInstructionText: string | undefined;
  currentStepDistanceText: string | undefined;
  currentStepDurationText: string | undefined;
  currentStepProgressText: string | undefined;
};

export type TripMetadata = {
  tripTotalDistanceText: string | undefined;
  tripTotalDurationText: string | undefined;

  tripRemainingDistanceText: string | undefined;
  tripRemainingDurationText: string | undefined;

  tripTotalDistanceMeters: number | undefined; // in meters
  tripTotalDuration: number | undefined; // in seconds

  tripRemainingDistanceMeters: number | undefined; // in meters
  tripRemainingDuration: number | undefined; // in seconds
};

export type NavigationStatusState = {
  isMapReady: boolean;
  isUserArrived: boolean;
};

export type NavigationRouteState = {
  routeSummary: RouteResponse | null;
  steps: Step[];
  navigationPolylineCoordinates: PolylineCoordinate[];
  navigationEndpoints: {
    origin: PolylineCoordinate;
    destination: PolylineCoordinate;
  } | null;
};

// Check-in related types
export type CheckinSessionGalleryImage = {
  id: string;
  uri: string;
  caption?: string;
  label: string;
  uploadStatus?: 'pending' | 'uploaded' | 'failed';
  draftId?: string;
  publicId?: string;
};
