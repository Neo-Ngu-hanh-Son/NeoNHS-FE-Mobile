import { Edge, Step } from '@/features/map';
import MAP_CONSTANTS from '@/features/map/constants';
import { RenderRoute } from '@/features/map/data';
import { ThuySonMapData } from '@/features/map/data/ThuySonMapData';
import {
  GraphData,
  ManualMapEdge,
  ManualMapNode,
  NearestEdge,
  SnappedLocation,
  VirtualOverlay,
} from '@/features/map/manualMapTypes';
import { findAStarPath } from '@/features/map/utils/pathFindingAlgo';
import * as turf from '@turf/turf';
import { logger } from './logger';

const calculateDistance = (
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
) => {
  const from = turf.point([point1.longitude, point1.latitude]);
  const to = turf.point([point2.longitude, point2.latitude]);
  return turf.distance(from, to, {
    units: 'meters',
  });
};

const calculatePointToLineStringDistance = (
  point: { latitude: number; longitude: number },
  lineString: any
): number => {
  const pt = turf.point([point.longitude, point.latitude]);
  return turf.pointToLineDistance(pt, lineString, { units: 'meters' });
};

const calculatePointToLineDistance = (
  point: { latitude: number; longitude: number },
  lineStart: { latitude: number; longitude: number },
  lineEnd: { latitude: number; longitude: number }
) => {
  const pt = turf.point([point.longitude, point.latitude]);
  const line = turf.lineString([
    [lineStart.longitude, lineStart.latitude],
    [lineEnd.longitude, lineEnd.latitude],
  ]);
  return turf.pointToLineDistance(pt, line, { units: 'meters' });
};

const findCurrentUserStepIndex = (
  userLocation: { latitude: number; longitude: number },
  currentStepIndex: number,
  steps: Step[]
): number => {
  if (steps.length === 0) return 0;

  const boundedCurrentStepIndex = Math.min(Math.max(currentStepIndex, 0), steps.length - 1);
  const userPoint = turf.point([userLocation.longitude, userLocation.latitude]);

  let closestDistance = Infinity;
  let closestStepIndex = boundedCurrentStepIndex;

  // Check neighbors (-2 to +2) to allow for forward/backward movement
  for (let offset = -2; offset <= 2; offset++) {
    const index = boundedCurrentStepIndex + offset;
    if (index >= 0 && index < steps.length) {
      const step = steps[index];
      const stepLine = turf.lineString([
        [step.startLocation.latLng.longitude, step.startLocation.latLng.latitude],
        [step.endLocation.latLng.longitude, step.endLocation.latLng.latitude],
      ]);

      const distance = turf.pointToLineDistance(userPoint, stepLine, { units: 'meters' });
      if (distance < closestDistance) {
        closestDistance = distance;
        closestStepIndex = index;
      }
    }
  }

  return closestStepIndex;
};

const hasUserArrivedAtDestination = (
  userLocation: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): boolean => {
  const distance = calculateDistance(userLocation, destination);
  return distance <= MAP_CONSTANTS.ARRIVAL_RADIUS_M;
};

export const generateNodeId = (x: number, y: number): string => {
  const factor = 10000000;

  const xRounded = Math.round(x * factor) / factor;
  const yRounded = Math.round(y * factor) / factor;

  return `${xRounded},${yRounded}`;
};

/**
 * Converts your visual polylines into searchable, individual line segments.
 * Run this once on startup.
 *
 * Get the routes from ThuySonMapData.ts
 */
const buildEdgesFromRoutes = (routes: RenderRoute[]): ManualMapEdge[] => {
  const edges: ManualMapEdge[] = [];

  for (const route of routes) {
    // Loop through the coordinates array, stopping 1 before the end
    for (let i = 0; i < route.coordinates.length - 1; i++) {
      const point1 = route.coordinates[i];
      const point2 = route.coordinates[i + 1];

      // Generate edge ID so that it can be retrivable from the adj list lookup
      edges.push({
        routeId: route.id,
        id1: generateNodeId(point1.longitude, point1.latitude),
        id2: generateNodeId(point2.longitude, point2.latitude),
        p1: {
          x: point1.longitude,
          y: point1.latitude,
        },
        p2: {
          x: point2.longitude,
          y: point2.latitude,
        },
        // Pre-build Turf line for the fast snapping function
        lineCoords: turf.lineString([
          [point1.longitude, point1.latitude],
          [point2.longitude, point2.latitude],
        ]),
      });
    }
  }

  return edges;
};

/**
 * Takes the nearest edge and calculates the exact projection (snap point)
 * on that line, along with the distances to the edge's original nodes.
 */
const snapLocationToEdge = (location: ManualMapNode, nearest: NearestEdge): SnappedLocation => {
  const { edge } = nearest;
  const locationPt = turf.point([location.x, location.y]);

  // Turf calculates the exact perpendicular projection point on the line segment
  const snappedPt = turf.nearestPointOnLine(edge.lineCoords, locationPt, { units: 'meters' });

  const snapPoint: ManualMapNode = {
    x: snappedPt.geometry.coordinates[0],
    y: snappedPt.geometry.coordinates[1],
  };

  // Calculate the distance from the snap point to the original nodes
  const weightTo1 = calculateDistance(
    {
      latitude: snappedPt.geometry.coordinates[1],
      longitude: snappedPt.geometry.coordinates[0],
    },
    {
      latitude: edge.p1.y,
      longitude: edge.p1.x,
    }
  );
  const weightTo2 = calculateDistance(
    {
      latitude: snappedPt.geometry.coordinates[1],
      longitude: snappedPt.geometry.coordinates[0],
    },
    {
      latitude: edge.p2.y,
      longitude: edge.p2.x,
    }
  );

  return {
    snapPoint,
    id1: edge.id1,
    id2: edge.id2,
    p1: edge.p1,
    p2: edge.p2,
    weightTo1,
    weightTo2,
  };
};

/**
 * Takes a user's GPS position and finds the closest edge in the graph.
 *
 * @param userNode The raw x/y coordinate of the user.
 * @param uniqueEdges The array generated by buildEdgeList().
 * @returns The closest edge and the distance to it.
 */
const findNearestEdge = (userLoc: ManualMapNode, edges: ManualMapEdge[]): NearestEdge => {
  const userPt = turf.point([userLoc.x, userLoc.y]);

  let closestEdge: ManualMapEdge | null = null;
  let minDistance = Infinity;

  for (const edge of edges) {
    const dist = turf.pointToLineDistance(userPt, edge.lineCoords, { units: 'meters' });

    if (dist < minDistance) {
      minDistance = dist;
      closestEdge = edge;
    }
  }

  if (!closestEdge) throw new Error('No paths found near user.');

  return {
    edge: closestEdge,
    distanceMeters: minDistance,
  };
};

/**
 * Creates the VirtualOverlay for A* by connecting the snap point
 * to the two nodes of the nearest visual edge.
 */
const createNavigationVirtualOverlay = (snapData: SnappedLocation, type: 'START' | 'GOAL'): VirtualOverlay => {
  const virtualId = type === 'START' ? 'V_START' : 'V_GOAL';

  return {
    [virtualId]: {
      coords: snapData.snapPoint,
      neighbors: [
        { to: snapData.id1, w: snapData.weightTo1 },
        { to: snapData.id2, w: snapData.weightTo2 },
      ],
    },
    // 2. Reverse connections: allow the graph to "see" the virtual node
    [snapData.id1]: {
      coords: snapData.p1,
      neighbors: [{ to: virtualId, w: snapData.weightTo1 }],
    },
    [snapData.id2]: {
      coords: snapData.p2,
      neighbors: [{ to: virtualId, w: snapData.weightTo2 }],
    },
  };
};

/**
 * Generates Navigation path by snapping the start and end points to the nearest edges
 * and finding the A* path between them.
 *
 * @param userLoc The user's current location as a ManualMapNode
 * @param destLoc The destination location as a ManualMapNode
 * @param graph The graph data (nodes and their connections)
 * @param mapEdges The edges of the map (generated by buildEdgesFromRoutes)
 * @returns An object containing the path IDs and the overlay
 */
const getNavigationPath = (
  userLoc: ManualMapNode,
  destLoc: ManualMapNode,
  graph: GraphData,
  mapEdges: ManualMapEdge[]
): { pathIds: string[]; overlay: VirtualOverlay } => {
  const startTime = performance.now();

  // 1. Snap both the User and the Destination to the nearest paths
  const nearestStart = findNearestEdge(userLoc, mapEdges);
  const nearestGoal = findNearestEdge(destLoc, mapEdges);

  const startSnap = snapLocationToEdge(userLoc, nearestStart);
  const goalSnap = snapLocationToEdge(destLoc, nearestGoal);
  logger.info(
    '🗺️ [distanceUtils] Snap location: ' +
      startSnap.snapPoint.x +
      ', ' +
      startSnap.snapPoint.y +
      ' -> ' +
      goalSnap.snapPoint.x +
      ', ' +
      goalSnap.snapPoint.y
  );

  // EDGE CASE: If the user is standing on the exact same line segment as the goal
  if (nearestStart.edge.routeId === nearestGoal.edge.routeId && nearestStart.edge.id1 === nearestGoal.edge.id1) {
    const directOverlay: VirtualOverlay = {
      V_START: { coords: startSnap.snapPoint, neighbors: [{ to: 'V_GOAL', w: 1 }] },
      V_GOAL: { coords: goalSnap.snapPoint, neighbors: [] },
    };
    return { pathIds: ['V_START', 'V_GOAL'], overlay: directOverlay };
  }

  const startOverlay = createNavigationVirtualOverlay(startSnap, 'START');
  const goalOverlay = createNavigationVirtualOverlay(goalSnap, 'GOAL');

  // 3. Stop the timer
  const endTime = performance.now();
  const executionTimeMs = (endTime - startTime).toFixed(2);

  const combinedOverlay: VirtualOverlay = {
    ...startOverlay,
    ...goalOverlay,
  };

  const pathIds = findAStarPath('V_START', 'V_GOAL', graph, combinedOverlay);

  logger.info(`🗺️ [distanceUtils] A* computed in ${executionTimeMs}ms`);

  if (pathIds.length === 0) {
    logger.error(`⚠️ [distanceUtils] A* failed to find a path!`);
  }

  // We return the overlay as well, because the UI needs it to draw the V_START and V_GOAL coordinates
  return { pathIds, overlay: combinedOverlay };
};

/**
 * Check if a location is inside Thuy Son
 */
const isInsideThuySon = (location: { latitude: number; longitude: number }): boolean => {
  const pt = turf.point([location.longitude, location.latitude]);
  const polygon = turf.polygon([ThuySonMapData.polygon]);
  return turf.booleanPointInPolygon(pt, polygon);
};

const pointToPolygonDistance = (
  point: { latitude: number; longitude: number },
  polygon: { polygon: number[][][] }
): number => {
  const pt = turf.point([point.longitude, point.latitude]);
  const poly = turf.polygon(polygon.polygon);
  return turf.pointToPolygonDistance(pt, poly, { units: 'meters' });
};

/**
 * List of distance-related utility functions that use the turf.js library
 */
export const distanceUtils = {
  calculateDistance,
  calculatePointToLineDistance,
  findCurrentUserStepIndex,
  hasUserArrivedAtDestination,
  findNearestEdge,
  buildEdgesFromRoutes,
  snapLocationToEdge,
  createNavigationVirtualOverlay,
  getNavigationPath,
  isInsideThuySon,
  pointToPolygonDistance,
  calculatePointToLineStringDistance
};
