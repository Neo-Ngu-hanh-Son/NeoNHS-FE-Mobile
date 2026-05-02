import { distanceUtils } from '@/utils/distanceUtils';
import { encode } from '@googlemaps/polyline-codec';
import { LatLng } from 'react-native-maps';
import { GraphData, ManualMapEdge } from '../manualMapTypes';
import { TravelMode, RouteResponse, Step, Leg } from '../types';
import { ThuySonMapData } from '../data/ThuySonMapData';
import { RenderRoute } from '../data';

const WALKING_SPEED_MPS = 1.2;

let memoizedEdges: ManualMapEdge[] | null = null;

const getEdges = (routes: RenderRoute[]): ManualMapEdge[] => {
  if (!memoizedEdges) {
    console.log('[customMapService]🏗️ Building and caching Thuy Son edges for the first time...');
    memoizedEdges = distanceUtils.buildEdgesFromRoutes(routes);
  }
  return memoizedEdges;
};

/**
 * Use this function to get the directions from the user's current location to the destination.
 *
 * @param origin The user's current location
 * @param destination The destination location
 * @param travelMode SHOULD ALWAYS BE WALKING because this map is used internally in Thuy Son mountain
 * @param graph The graph data
 * @param mapEdges The edges of the map, if not provided, it will use the pre-built edges from ThuySonMapData.edges
 * @returns An object containing the directions
 */
export const customMapDirectionService = {
  getDirections: async (
    origin: LatLng,
    destination: LatLng,
    travelMode: TravelMode,
    graph: GraphData,
    mapEdges?: ManualMapEdge[]
  ): Promise<RouteResponse> => {
    const _mapEdges = mapEdges || getEdges(ThuySonMapData.routes);

    const { pathIds, overlay } = distanceUtils.getNavigationPath(
      { x: origin.longitude, y: origin.latitude },
      { x: destination.longitude, y: destination.latitude },
      graph,
      _mapEdges
    );

    if (pathIds.length === 0) {
      throw new Error('No internal path found.');
    }

    // 2. Translate IDs to coordinates and [lat, lng] tuples for the encoder
    const pathCoords: LatLng[] = [];
    const pathTuples: [number, number][] = [];

    for (const id of pathIds) {
      const node = overlay[id]?.coords || graph.nodes[id];
      if (node) {
        pathCoords.push({ latitude: node.y, longitude: node.x });
        pathTuples.push([node.y, node.x]); // Format specifically for the encoder
      }
    }

    let totalDistanceMeters = 0;
    let totalDurationSec = 0;
    const steps: Step[] = [];

    // 3. Build the Steps (Note: We don't build steps description here)
    for (let i = 0; i < pathCoords.length - 1; i++) {
      const startLoc = pathCoords[i];
      const endLoc = pathCoords[i + 1];

      const stepDist = Math.round(distanceUtils.calculateDistance(startLoc, endLoc));
      const stepDur = Math.round(stepDist / WALKING_SPEED_MPS);

      totalDistanceMeters += stepDist;
      totalDurationSec += stepDur;

      steps.push({
        distanceMeters: stepDist,
        staticDuration: `${stepDur}s`,
        // Simply pass the two points as a tuple array into the official encoder
        polyline: { encodedPolyline: encode([pathTuples[i], pathTuples[i + 1]]) },
        startLocation: { latLng: startLoc },
        endLocation: { latLng: endLoc },
        navigationInstruction: {
          maneuver: 'CUSTOM',
          instructions: 'CUSTOM',
        },
        localizedValues: {
          distance: { text: stepDist > 1000 ? `${(stepDist / 1000).toFixed(1)} km` : `${stepDist} m` },
          staticDuration: { text: `${Math.max(1, Math.ceil(stepDur / 60))} min` },
        },
        travelMode: travelMode,
      });
    }

    // 4. Build the final Leg and Route
    const leg: Leg = {
      distanceMeters: totalDistanceMeters,
      duration: `${totalDurationSec}s`,
      startLocation: { latLng: pathCoords[0] },
      endLocation: { latLng: pathCoords[pathCoords.length - 1] },
      steps: steps,
    };

    return {
      routes: [
        {
          legs: [leg],
          // Encode the entire trip perfectly using the official library
          polyline: { encodedPolyline: encode(pathTuples) },
        },
      ],
    };
  },
};
