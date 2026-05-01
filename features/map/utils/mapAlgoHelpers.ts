import { ManualMapNode, VirtualOverlay } from '../manualMapTypes';
import * as turf from '@turf/turf';

/**
 * Helper functions for A*
 */
export const calculateHeuristic = (
  id1: string,
  id2: string,
  nodes: Record<string, ManualMapNode>,
  overlay: VirtualOverlay
): number => {
  // Get the actual node objects from either the static graph or the dynamic overlay
  const node1 = nodes[id1] || overlay[id1]?.coords;
  const node2 = nodes[id2] || overlay[id2]?.coords;

  if (!node1 || !node2) return 0;

  // Turf expects [longitude, latitude]
  const from = turf.point([node1.x, node1.y]);
  const to = turf.point([node2.x, node2.y]);

  return turf.distance(from, to, { units: 'meters' });
};

/**
 * Reconstruct the path from the A* algorithm.
 *
 * @param cameFrom The map of nodes to their predecessors.
 * @param current The current node.
 * @returns The path from the start node to the current node.
 */
export const reconstructPath = (cameFrom: Record<string, string>, current: string): string[] => {
  const totalPath: string[] = [current];

  while (cameFrom[current]) {
    current = cameFrom[current];
    totalPath.push(current);
  }

  return totalPath.reverse();
};
