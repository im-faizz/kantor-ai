import { ROOMS, DOORS } from './map-data';

export function getRoomOf(x: number, y: number): string {
  const r = ROOMS.find((q) => x >= q.x0 && x < q.x1 && y >= q.y0 && y < q.y1);
  return r ? r.id : 'K';
}

export function getRoomDef(roomId: string) {
  return ROOMS.find((r) => r.id === roomId);
}

/**
 * Finds a path from (x0, y0) to (x1, y1) via door waypoints using BFS.
 * Characters walk sequentially between waypoints to avoid crossing walls.
 */
export function findRoute(
  x0: number,
  y0: number,
  x1: number,
  y1: number
): [number, number][] {
  const startRoom = getRoomOf(x0, y0);
  const endRoom = getRoomOf(x1, y1);

  if (startRoom === endRoom) {
    return [[x1, y1]];
  }

  const queue: [string, [number, number][]][] = [[startRoom, []]];
  const seen: Record<string, boolean> = { [startRoom]: true };

  while (queue.length > 0) {
    const [currentRoom, path] = queue.shift()!;

    if (currentRoom === endRoom) {
      return [...path, [x1, y1]];
    }

    for (const [rA, rB, doorX, doorY] of DOORS) {
      let nextRoom: string | null = null;
      if (rA === currentRoom) nextRoom = rB;
      else if (rB === currentRoom) nextRoom = rA;

      if (nextRoom && !seen[nextRoom]) {
        seen[nextRoom] = true;
        queue.push([nextRoom, [...path, [doorX, doorY]]]);
      }
    }
  }

  // Fallback direct point if no door path found
  return [[x1, y1]];
}
