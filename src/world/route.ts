import { ROOMS } from './map-data';
import { WORLD_SCALE } from './iso';

export interface NavNode {
  id: string;
  x: number;
  y: number;
  room: string;
  neighbors: string[];
}

/**
 * Complete navigation graph ensuring characters walk along clear aisles
 * and never clip through furniture, walls, or the swimming pool basin.
 */
const RAW_NAV_GRAPH: Record<string, NavNode> = {
  // === DOORS (inter-room thresholds) ===
  'door_K_M': { id: 'door_K_M', x: 380, y: 145, room: 'K', neighbors: ['K_east_aisle', 'M_door_K'] },
  'door_M_G': { id: 'door_M_G', x: 660, y: 145, room: 'M', neighbors: ['M_door_G', 'G_entry'] },
  'door_K_W': { id: 'door_K_W', x: 170, y: 280, room: 'K', neighbors: ['K_south_door', 'W_north_entry'] },
  'door_M_S': { id: 'door_M_S', x: 520, y: 280, room: 'M', neighbors: ['M_south_center', 'S_mid_north'] },
  'door_G_S': { id: 'door_G_S', x: 810, y: 280, room: 'G', neighbors: ['G_door_south', 'S_door_G'] },
  'door_W_S': { id: 'door_W_S', x: 380, y: 385, room: 'W', neighbors: ['W_door_east', 'S_door_W'] },
  'door_W_P': { id: 'door_W_P', x: 175, y: 480, room: 'W', neighbors: ['W_door_south', 'P_north_left'] },
  'door_S_P': { id: 'door_S_P', x: 510, y: 480, room: 'S', neighbors: ['S_mid_south', 'P_north_corner'] },
  'door_S_T': { id: 'door_S_T', x: 700, y: 480, room: 'S', neighbors: ['S_door_T', 'T_north_entry'] },
  'door_S_V': { id: 'door_S_V', x: 860, y: 480, room: 'S', neighbors: ['S_door_V', 'V_north_entry'] },
  'door_P_T': { id: 'door_P_T', x: 600, y: 605, room: 'P', neighbors: ['P_deck_south', 'T_west_door'] },
  'door_T_V': { id: 'door_T_V', x: 780, y: 605, room: 'T', neighbors: ['T_east_door', 'V_west_door'] },

  // === KANTOR UTAMA (aisles between desk rows and clear vertical corridor) ===
  'K_east_aisle': { id: 'K_east_aisle', x: 350, y: 145, room: 'K', neighbors: ['door_K_M', 'K_center_aisle'] },
  'K_center_aisle': { id: 'K_center_aisle', x: 190, y: 145, room: 'K', neighbors: ['K_east_aisle', 'K_west_aisle', 'K_vert_gap'] },
  'K_west_aisle': { id: 'K_west_aisle', x: 78, y: 145, room: 'K', neighbors: ['K_center_aisle'] },
  'K_vert_gap': { id: 'K_vert_gap', x: 134, y: 145, room: 'K', neighbors: ['K_center_aisle', 'K_south_aisle'] },
  'K_south_aisle': { id: 'K_south_aisle', x: 134, y: 255, room: 'K', neighbors: ['K_vert_gap', 'K_south_door', 'K_south_west'] },
  'K_south_west': { id: 'K_south_west', x: 78, y: 255, room: 'K', neighbors: ['K_south_aisle'] },
  'K_south_door': { id: 'K_south_door', x: 170, y: 255, room: 'K', neighbors: ['K_south_aisle', 'door_K_W'] },

  // === RUANG MEETING (corridors strictly avoiding round table 440..600, 110..190) ===
  'M_door_K': { id: 'M_door_K', x: 395, y: 145, room: 'M', neighbors: ['door_K_M', 'M_north_left', 'M_south_left'] },
  'M_north_left': { id: 'M_north_left', x: 400, y: 45, room: 'M', neighbors: ['M_door_K', 'M_north_right'] },
  'M_north_right': { id: 'M_north_right', x: 640, y: 45, room: 'M', neighbors: ['M_north_left', 'M_door_G'] },
  'M_door_G': { id: 'M_door_G', x: 645, y: 145, room: 'M', neighbors: ['door_M_G', 'M_north_right', 'M_south_right'] },
  'M_south_left': { id: 'M_south_left', x: 400, y: 240, room: 'M', neighbors: ['M_door_K', 'M_south_center'] },
  'M_south_center': { id: 'M_south_center', x: 520, y: 245, room: 'M', neighbors: ['M_south_left', 'M_south_right', 'door_M_S'] },
  'M_south_right': { id: 'M_south_right', x: 635, y: 240, room: 'M', neighbors: ['M_south_center', 'M_door_G'] },

  // === RUANG MANAGER (pathway avoiding executive desk and sofa) ===
  'G_entry': { id: 'G_entry', x: 685, y: 145, room: 'G', neighbors: ['door_M_G', 'G_center_cross', 'G_behind_desk'] },
  'G_center_cross': { id: 'G_center_cross', x: 700, y: 190, room: 'G', neighbors: ['G_entry', 'G_door_south'] },
  'G_door_south': { id: 'G_door_south', x: 810, y: 255, room: 'G', neighbors: ['G_center_cross', 'door_G_S'] },
  'G_behind_desk': { id: 'G_behind_desk', x: 710, y: 85, room: 'G', neighbors: ['G_entry', 'G_manager_chair'] },
  'G_manager_chair': { id: 'G_manager_chair', x: 807, y: 85, room: 'G', neighbors: ['G_behind_desk'] },

  // === RUANG KERJA (clear aisles avoiding cubicle partitions and cabinets) ===
  'W_north_entry': { id: 'W_north_entry', x: 190, y: 305, room: 'W', neighbors: ['door_K_W', 'W_main_aisle'] },
  'W_main_aisle': { id: 'W_main_aisle', x: 175, y: 415, room: 'W', neighbors: ['W_north_entry', 'W_door_south', 'W_west_aisle', 'W_east_aisle'] },
  'W_west_aisle': { id: 'W_west_aisle', x: 59, y: 415, room: 'W', neighbors: ['W_main_aisle'] },
  'W_east_aisle': { id: 'W_east_aisle', x: 360, y: 415, room: 'W', neighbors: ['W_main_aisle', 'W_door_east'] },
  'W_door_east': { id: 'W_door_east', x: 365, y: 385, room: 'W', neighbors: ['W_east_aisle', 'door_W_S'] },
  'W_door_south': { id: 'W_door_south', x: 175, y: 460, room: 'W', neighbors: ['W_main_aisle', 'door_W_P'] },

  // === RUANG SANTAI (aisles strictly avoiding billiard table and coffee table) ===
  'S_door_W': { id: 'S_door_W', x: 395, y: 385, room: 'S', neighbors: ['door_W_S', 'S_west_north', 'S_west_south'] },
  'S_west_north': { id: 'S_west_north', x: 395, y: 305, room: 'S', neighbors: ['S_door_W', 'S_mid_north'] },
  'S_west_south': { id: 'S_west_south', x: 395, y: 455, room: 'S', neighbors: ['S_door_W', 'S_mid_south'] },
  'S_mid_north': { id: 'S_mid_north', x: 520, y: 305, room: 'S', neighbors: ['S_west_north', 'door_M_S', 'S_east_north'] },
  'S_mid_south': { id: 'S_mid_south', x: 510, y: 455, room: 'S', neighbors: ['S_west_south', 'door_S_P', 'S_east_south'] },
  'S_east_north': { id: 'S_east_north', x: 635, y: 305, room: 'S', neighbors: ['S_mid_north', 'S_east_mid', 'S_door_G'] },
  'S_east_mid': { id: 'S_east_mid', x: 635, y: 385, room: 'S', neighbors: ['S_east_north', 'S_east_south', 'S_lounge_west'] },
  'S_east_south': { id: 'S_east_south', x: 635, y: 455, room: 'S', neighbors: ['S_mid_south', 'S_east_mid', 'S_door_T'] },
  'S_lounge_west': { id: 'S_lounge_west', x: 660, y: 385, room: 'S', neighbors: ['S_east_mid', 'S_lounge_north', 'S_lounge_south', 'S_door_T'] },
  'S_lounge_north': { id: 'S_lounge_north', x: 755, y: 360, room: 'S', neighbors: ['S_lounge_west', 'S_lounge_east', 'S_door_G'] },
  'S_lounge_south': { id: 'S_lounge_south', x: 755, y: 418, room: 'S', neighbors: ['S_lounge_west', 'S_lounge_east', 'S_door_T'] },
  'S_lounge_east': { id: 'S_lounge_east', x: 825, y: 385, room: 'S', neighbors: ['S_lounge_north', 'S_lounge_south', 'S_far_east', 'S_door_G'] },
  'S_door_G': { id: 'S_door_G', x: 810, y: 305, room: 'S', neighbors: ['door_G_S', 'S_east_north', 'S_lounge_north', 'S_lounge_east', 'S_far_east'] },
  'S_door_T': { id: 'S_door_T', x: 700, y: 460, room: 'S', neighbors: ['door_S_T', 'S_east_south', 'S_lounge_west', 'S_lounge_south'] },
  'S_far_east': { id: 'S_far_east', x: 860, y: 385, room: 'S', neighbors: ['S_door_G', 'S_lounge_east', 'S_door_V'] },
  'S_door_V': { id: 'S_door_V', x: 860, y: 460, room: 'S', neighbors: ['door_S_V', 'S_far_east'] },

  // === KOLAM RENANG (deck walkways strictly outside pool 36..456, 532..702 and loungers 480..564) ===
  'P_north_left': { id: 'P_north_left', x: 175, y: 505, room: 'P', neighbors: ['door_W_P', 'P_ladder_deck'] },
  'P_ladder_deck': { id: 'P_ladder_deck', x: 420, y: 505, room: 'P', neighbors: ['P_north_left', 'P_north_corner'] },
  'P_north_corner': { id: 'P_north_corner', x: 510, y: 505, room: 'P', neighbors: ['P_ladder_deck', 'door_S_P', 'P_deck_east'] },
  'P_deck_east': { id: 'P_deck_east', x: 580, y: 505, room: 'P', neighbors: ['P_north_corner', 'P_deck_south'] },
  'P_deck_south': { id: 'P_deck_south', x: 580, y: 605, room: 'P', neighbors: ['P_deck_east', 'door_P_T'] },

  // === PANTRY (walkways avoiding kitchen counters and dining table) ===
  'T_north_entry': { id: 'T_north_entry', x: 700, y: 505, room: 'T', neighbors: ['door_S_T', 'T_mid_cross'] },
  'T_mid_cross': { id: 'T_mid_cross', x: 690, y: 575, room: 'T', neighbors: ['T_north_entry', 'T_west_door', 'T_east_door', 'T_south'] },
  'T_west_door': { id: 'T_west_door', x: 615, y: 605, room: 'T', neighbors: ['T_mid_cross', 'door_P_T'] },
  'T_east_door': { id: 'T_east_door', x: 765, y: 605, room: 'T', neighbors: ['T_mid_cross', 'door_T_V'] },
  'T_south': { id: 'T_south', x: 690, y: 710, room: 'T', neighbors: ['T_mid_cross'] },

  // === RUANG SERVER (aisles avoiding server racks 796..936, 560..616) ===
  'V_north_entry': { id: 'V_north_entry', x: 860, y: 505, room: 'V', neighbors: ['door_S_V', 'V_aisle_north'] },
  'V_aisle_north': { id: 'V_aisle_north', x: 860, y: 535, room: 'V', neighbors: ['V_north_entry', 'V_west_bypass'] },
  'V_west_bypass': { id: 'V_west_bypass', x: 790, y: 535, room: 'V', neighbors: ['V_aisle_north', 'V_west_door'] },
  'V_west_door': { id: 'V_west_door', x: 790, y: 605, room: 'V', neighbors: ['door_T_V', 'V_west_bypass', 'V_main_aisle'] },
  'V_main_aisle': { id: 'V_main_aisle', x: 860, y: 635, room: 'V', neighbors: ['V_west_door'] }
};

export const NAV_GRAPH: Record<string, NavNode> = Object.fromEntries(
  Object.entries(RAW_NAV_GRAPH).map(([k, node]) => [
    k,
    {
      ...node,
      x: Math.round(node.x * WORLD_SCALE),
      y: Math.round(node.y * WORLD_SCALE)
    }
  ])
);

export function getRoomOf(x: number, y: number): string {
  const r = ROOMS.find((q) => x >= q.x0 && x < q.x1 && y >= q.y0 && y < q.y1);
  return r ? r.id : 'K';
}

export function getRoomDef(roomId: string) {
  return ROOMS.find((r) => r.id === roomId);
}

/**
 * Checks if a point is within the swimming pool water basin.
 */
export function isInsidePool(x: number, y: number): boolean {
  return (
    x >= Math.round(40 * WORLD_SCALE) &&
    x <= Math.round(452 * WORLD_SCALE) &&
    y >= Math.round(536 * WORLD_SCALE) &&
    y <= Math.round(698 * WORLD_SCALE)
  );
}

/**
 * Finds the closest walkable graph node to a given point.
 */
function findClosestNode(x: number, y: number, preferRoom?: string): string {
  let closestId = 'K_center_aisle';
  let minDist = Infinity;

  for (const node of Object.values(NAV_GRAPH)) {
    if (preferRoom && node.room !== preferRoom && !node.id.startsWith('door_')) {
      continue;
    }
    const dist = Math.hypot(node.x - x, node.y - y);
    if (dist < minDist) {
      minDist = dist;
      closestId = node.id;
    }
  }

  return closestId;
}

/**
 * Shortest path search on the navigation graph using Dijkstra / A*.
 */
function searchGraph(startId: string, targetId: string): [number, number][] {
  if (startId === targetId) {
    const n = NAV_GRAPH[targetId];
    return [[n.x, n.y]];
  }

  const dist: Record<string, number> = {};
  const prev: Record<string, string> = {};
  const unvisited = new Set<string>();

  for (const id of Object.keys(NAV_GRAPH)) {
    dist[id] = Infinity;
    unvisited.add(id);
  }
  dist[startId] = 0;

  while (unvisited.size > 0) {
    let currId: string | null = null;
    let shortest = Infinity;
    for (const id of unvisited) {
      if (dist[id] < shortest) {
        shortest = dist[id];
        currId = id;
      }
    }

    if (!currId || shortest === Infinity || currId === targetId) break;
    unvisited.delete(currId);

    const currNode = NAV_GRAPH[currId];
    for (const neighborId of currNode.neighbors) {
      if (!unvisited.has(neighborId)) continue;
      const neighbor = NAV_GRAPH[neighborId];
      if (!neighbor) continue;

      const alt = dist[currId] + Math.hypot(currNode.x - neighbor.x, currNode.y - neighbor.y);
      if (alt < dist[neighborId]) {
        dist[neighborId] = alt;
        prev[neighborId] = currId;
      }
    }
  }

  if (dist[targetId] === Infinity) {
    const end = NAV_GRAPH[targetId];
    return [[end.x, end.y]];
  }

  const path: [number, number][] = [];
  let u: string | undefined = targetId;
  while (u) {
    const n = NAV_GRAPH[u];
    path.unshift([n.x, n.y]);
    u = prev[u];
  }

  return path;
}

/**
 * Finds a complete safe route from (x0, y0) to (x1, y1).
 * Avoids walking through the billiard table, meeting table, office desks, and the swimming pool.
 */
export function findRoute(
  x0: number,
  y0: number,
  x1: number,
  y1: number
): [number, number][] {
  const startInPool = isInsidePool(x0, y0);
  const endInPool = isInsidePool(x1, y1);

  // Scenario 1: Already swimming and moving to another spot inside pool
  if (startInPool && endInPool) {
    return [[x1, y1]];
  }

  const startRoom = getRoomOf(x0, y0);
  const endRoom = getRoomOf(x1, y1);

  // Pool ladder coordinates:
  // Ladder base in water: (420, 545)
  // Ladder top on deck edge: (420, 516)
  // Main deck walkway node: (420, 505) ('P_ladder_deck')

  let exitPoints: [number, number][] = [];
  let startNodeId: string;

  if (startInPool) {
    // Agent must swim to the ladder, climb out onto the deck
    exitPoints = [
      [420, 545], // swim to ladder
      [420, 516], // climb onto ladder deck
      [420, 505]  // step onto poolside walkway
    ];
    startNodeId = 'P_ladder_deck';
  } else {
    startNodeId = findClosestNode(x0, y0, startRoom);
  }

  let enterPoints: [number, number][] = [];
  let endNodeId: string;

  if (endInPool) {
    // Graph route ends at ladder on the deck, then agent climbs down into pool
    endNodeId = 'P_ladder_deck';
    enterPoints = [
      [420, 516], // step to ladder
      [420, 545], // climb into water
      [x1, y1]    // swim to target spot
    ];
  } else {
    endNodeId = findClosestNode(x1, y1, endRoom);
  }

  const graphPath = searchGraph(startNodeId, endNodeId);

  const fullPath: [number, number][] = [
    ...exitPoints,
    ...graphPath,
    ...enterPoints
  ];

  // If not entering pool, add final destination point
  if (!endInPool) {
    fullPath.push([x1, y1]);
  }

  // Remove duplicate or virtually identical consecutive points
  const cleanedPath: [number, number][] = [];
  for (const pt of fullPath) {
    if (
      cleanedPath.length === 0 ||
      Math.hypot(pt[0] - cleanedPath[cleanedPath.length - 1][0], pt[1] - cleanedPath[cleanedPath.length - 1][1]) > 4
    ) {
      cleanedPath.push(pt);
    }
  }

  return cleanedPath.length > 0 ? cleanedPath : [[x1, y1]];
}
