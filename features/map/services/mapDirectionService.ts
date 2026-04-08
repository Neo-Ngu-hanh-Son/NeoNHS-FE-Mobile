import { LatLng } from 'react-native-maps';
import { logger } from '@/utils/logger';
import { DirectionsRequestBody, RouteResponse, TravelMode } from '../types';
import { ApiResponse } from '@/services/api';
import axios from 'axios';

const ROUTES_API_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

const buildDirectionsRequestBody = (
  origin: LatLng,
  destination: LatLng,
  travelMode: TravelMode
): DirectionsRequestBody => {
  const body: DirectionsRequestBody = {
    origin: {
      location: {
        latLng: {
          latitude: origin.latitude,
          longitude: origin.longitude,
        },
      },
    },
    destination: {
      location: {
        latLng: {
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
      },
    },
    travelMode,
    computeAlternativeRoutes: false,
    routeModifiers: {
      avoidTolls: false,
      avoidHighways: false,
      avoidFerries: false,
    },
    languageCode: 'en-US',
    units: 'METRIC',
  };

  if (travelMode === 'DRIVE' || travelMode === 'TWO_WHEELER') {
    body.routingPreference = 'TRAFFIC_AWARE';
  }

  return body;
};

const ROUTES_FIELD_MASK = [
  'routes.polyline',
  'routes.legs.startLocation',
  'routes.legs.endLocation',
  'routes.legs.distanceMeters',
  'routes.legs.duration',
  'routes.legs.steps.polyline',
  'routes.legs.steps.navigationInstruction',
  'routes.legs.steps.localizedValues',
  'routes.legs.steps.travelMode',
  'routes.legs.steps.startLocation',
  'routes.legs.steps.endLocation',
  'routes.legs.steps.distanceMeters',
].join(',');

export const mapDirectionService = {
  getDirections: async (
    origin: LatLng,
    destination: LatLng,
    travelMode: TravelMode
  ): Promise<ApiResponse<RouteResponse>> => {
    const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAP_API;

    if (!googleMapsApiKey) {
      const message = 'Missing EXPO_PUBLIC_GOOGLE_MAP_API for map direction requests';
      logger.error(`[mapDirectionService] ${message}`);
      throw new Error(message);
    }

    const requestBody = buildDirectionsRequestBody(origin, destination, travelMode);

    try {
      const response = await axios.post<RouteResponse>(ROUTES_API_URL, requestBody, {
        // requiresAuth: false,
        headers: {
          'X-Goog-Api-Key': googleMapsApiKey,
          'Content-Type': 'application/json',
          'X-Goog-FieldMask': ROUTES_FIELD_MASK,
        },
      });

      /**
       * In legs.steps.navigationInstruction:
       * "instructions": "Head southeast on Thanh Khê 6 toward Lý Thái Tông\nPass by Ngã tư (on left)"},
       * There will be 2 navigation instructions separated by a newline, we only get the first one
       */
      // response.data.routes.forEach((route) => {
      //   route.legs.forEach((leg) => {
      //     leg.steps.forEach((step) => {
      //       try {
      //         step.navigationInstruction.instructions = step.navigationInstruction.instructions.split('\n')[0];
      //       } catch (e) {
      //         logger.warn(`[mapDirectionService] Failed to split navigation instruction, skipping ${e}`);
      //       }
      //     });
      //   });
      // });
      return response;
    } catch (error) {
      logger.error('[mapDirectionService] Network error while fetching directions', error);
      throw error;
    }
  },
};
