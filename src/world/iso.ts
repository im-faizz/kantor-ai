export const RAD_55 = (55 * Math.PI) / 180;
export const COS_55 = Math.cos(RAD_55); // ≈ 0.573576436351046
export const SIN_55 = Math.sin(RAD_55); // ≈ 0.8191520442889918
export const SQRT1_2 = Math.SQRT1_2; // ≈ 0.7071067811865475

export const WORLD_WIDTH = 960;
export const WORLD_HEIGHT = 740;
export const WORLD_CENTER_X = WORLD_WIDTH / 2; // 480
export const WORLD_CENTER_Y = WORLD_HEIGHT / 2; // 370

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Projects a 3D world coordinate (x, y, z) into 2D isometric screen space.
 * x: 0..960 (right)
 * y: 0..740 (down)
 * z: >= 0 (height above floor)
 */
export function worldToScreen(x: number, y: number, z: number = 0): Point2D {
  const x0 = x - WORLD_CENTER_X;
  const y0 = y - WORLD_CENTER_Y;

  // Rotate Z by -45 degrees:
  const x1 = (x0 + y0) * SQRT1_2;
  const y1 = (-x0 + y0) * SQRT1_2;

  // Rotate X by 55 degrees:
  const sx = x1;
  const sy = y1 * COS_55 - z * SIN_55;

  return { x: sx, y: sy };
}

/**
 * Inverse project from 2D isometric screen space back to ground plane (z = 0) world coordinates.
 */
export function screenToWorld(sx: number, sy: number, z: number = 0): Point2D {
  // sx = (x0 + y0) * SQRT1_2  => (x0 + y0) = sx / SQRT1_2
  // sy = (-x0 + y0) * SQRT1_2 * COS_55 - z * SIN_55 => (-x0 + y0) = (sy + z * SIN_55) / (SQRT1_2 * COS_55)
  const A = sx / SQRT1_2;
  const B = (sy + z * SIN_55) / (SQRT1_2 * COS_55);

  const y0 = (A + B) / 2;
  const x0 = (A - B) / 2;

  return {
    x: x0 + WORLD_CENTER_X,
    y: y0 + WORLD_CENTER_Y
  };
}

/**
 * Calculates depth sort key for isometric rendering.
 * Objects closer to the camera have higher depth values.
 * In this projection, increasing Y and decreasing X moves towards the camera.
 */
export function getDepth(x: number, y: number, z: number = 0): number {
  return -x + y + (z * 0.1);
}

/**
 * Darkens a hex color by a given fraction (0 to 1).
 */
export function darkenColor(hexStr: string, fraction: number): number {
  let hex = hexStr.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(hex, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  r = Math.max(0, Math.round(r * (1 - fraction)));
  g = Math.max(0, Math.round(g * (1 - fraction)));
  b = Math.max(0, Math.round(b * (1 - fraction)));

  return (r << 16) | (g << 8) | b;
}

export function parseHexColor(hexStr: string): number {
  let hex = hexStr.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  return parseInt(hex, 16);
}
