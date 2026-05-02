import { PriorityQueue } from 'datastructures-js';
import { GraphData, ManualMapAdj, ScoredNode, VirtualOverlay } from '../manualMapTypes';
import { logger } from '@/utils/logger';
import { calculateHeuristic, reconstructPath } from './mapAlgoHelpers';

/**
 * Finds the shortest path between two nodes using the A* (A-Star) algorithm.
 *
 * @description
 * This method implements an informed search algorithm that uses a heuristic to find the
 * optimal path through a graph. It is designed to work with a static mountain path graph
 * while allowing for dynamic "injections" (user location and destination) via a VirtualOverlay.
 *
 * ### Prerequisites
 * 1. **GraphData**: A pre-processed map containing static `nodes` and an adjacency list `adj`.
 * 2. **VirtualOverlay**: Before calling this, you must calculate the "snap points" for the
 *    user and destination. These virtual nodes (e.g., 'V_START', 'V_GOAL') must be
 *    connected to their nearest static neighbors within this overlay.
 *
 * ### How it Works
 * - **Priority Queue**: Uses a Min-Heap to explore nodes with the lowest estimated total
 *   cost (f = g + h) first.
 * - **gScore**: The actual cost (distance in meters) from the start node to the current node.
 * - **hScore (Heuristic)**: The estimated distance from the current node to the goal.
 * - **Hybrid Lookup**: In each iteration, it merges static neighbors from the graph
 *   with temporary neighbors from the `virtualOverlay`.
 *
 * ### Returns
 * - `string[]`: A sequential list of Node IDs representing the path.
 * - `[]`: An empty array if no path is found (disconnected graph components).
 *
 * @param {string} startId - The ID of the starting node (usually 'V_START').
 * @param {string} goalId - The ID of the destination node (usually 'V_GOAL').
 * @param {GraphData} graph - The static map data containing nodes and adjacency list.
 * @param {VirtualOverlay} virtualOverlay - Temporary nodes/edges for the current navigation session.
 * @returns {string[]} An array of node IDs from start to goal.
 */
export const findAStarPath = (
  startId: string,
  goalId: string,
  graph: GraphData,
  virtualOverlay: VirtualOverlay = {}
): string[] => {
  const { nodes, adj } = graph;

  logger.debug(
    `🔍 [findAStarPath] startId=${startId}, goalId=${goalId}, graphLength=${Object.keys(nodes).length}, virtualOverlayLength=${Object.keys(virtualOverlay).length}`
  );

  logger.debug('🔍 [findAStarPath] virtualOverlay: ', virtualOverlay);

  // Min-Heap: prioritize lower f-score (g + h)
  const openSet = new PriorityQueue<ScoredNode>((a, b) => a.f - b.f);

  const gScore: Record<string, number> = {};
  const cameFrom: Record<string, string> = {};

  // Initialize start node
  gScore[startId] = 0;

  openSet.enqueue({
    id: startId,
    f: calculateHeuristic(startId, goalId, nodes, virtualOverlay),
  });

  const closedSet = new Set<string>();

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue()?.id;
    // Safety break if queue becomes corrupted or empty
    if (!current) break;
    if (closedSet.has(current)) continue;
    closedSet.add(current);

    // Path found: reconstruct and return the array of IDs
    if (current === goalId) {
      return reconstructPath(cameFrom, current);
    }

    // Merge static neighbors from the pre-built graph with injected dynamic neighbors
    const neighbors: ManualMapAdj[] = [...(adj[current] || []), ...(virtualOverlay[current]?.neighbors || [])];
    if (current !== startId && current !== goalId) {
      if (!adj[current]) {
        if (!virtualOverlay[current]) {
          logger.error(
            `🚨 BROKEN BRIDGE: Node '${current}' was injected, but does NOT exist in the static 'adj'
            AND virtual overlay list! Check string formatting.`
          );
        }
      }
    }

    for (const edge of neighbors) {
      const neighborId = edge.to;
      const tentativeGScore = gScore[current] + edge.w;
      if (gScore[current] === undefined) {
        logger.warn(`AStar: Current node has no gScore ${current}, skipping`);
        continue;
      }
      // If this path to the neighbor is better than any previous one, record it
      if (gScore[neighborId] === undefined || tentativeGScore < gScore[neighborId]) {
        cameFrom[neighborId] = current;
        gScore[neighborId] = tentativeGScore;

        // Calculate h (heuristic) to prioritize nodes closer to the goal
        const h = calculateHeuristic(neighborId, goalId, nodes, virtualOverlay);

        // Enqueue based on total estimated cost (f)
        openSet.enqueue({
          id: neighborId,
          f: tentativeGScore + h,
        });
      }
    }
  }

  // If we exhaust the openSet without reaching the goalId, no path exists
  return [];
};
