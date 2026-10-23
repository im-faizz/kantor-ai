export interface RoomDef {
  id: string;
  name: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  floorColor: string;
}

export type DoorDef = [string, string, number, number];

export interface Box3D {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  z?: number;
  color: string;
  isRound?: boolean;
  isRack?: boolean;
  roundRadius?: number;
}

export interface CameraState {
  x: number;
  y: number;
  z: number;
  targetX?: number;
  targetY?: number;
  targetZ?: number;
  animating?: boolean;
  animStart?: number;
  animDuration?: number;
  startX?: number;
  startY?: number;
  startZ?: number;
}
