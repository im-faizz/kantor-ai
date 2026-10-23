import { RoomDef, DoorDef, Box3D } from './types';
import { WORLD_SCALE } from './iso';

const s = (v: number) => Math.round(v * WORLD_SCALE);

const RAW_ROOMS: RoomDef[] = [
  { id: 'K', name: 'Kantor Utama', x0: 0, y0: 0, x1: 380, y1: 280, floorColor: '#c7d4e6' },
  { id: 'M', name: 'Ruang Meeting', x0: 380, y0: 0, x1: 660, y1: 280, floorColor: '#d7cde8' },
  { id: 'G', name: 'Ruang Manager', x0: 660, y0: 0, x1: 960, y1: 280, floorColor: '#e6d1b8' },
  { id: 'W', name: 'Ruang Kerja', x0: 0, y0: 280, x1: 380, y1: 480, floorColor: '#bfe0df' },
  { id: 'S', name: 'Ruang Santai', x0: 380, y0: 280, x1: 960, y1: 480, floorColor: '#ecd5c5' },
  { id: 'P', name: 'Kolam Renang', x0: 0, y0: 480, x1: 600, y1: 740, floorColor: '#d3dce5' },
  { id: 'T', name: 'Pantry', x0: 600, y0: 480, x1: 780, y1: 740, floorColor: '#f1e6bd' },
  { id: 'V', name: 'Ruang Server', x0: 780, y0: 480, x1: 960, y1: 740, floorColor: '#a9b6c4' }
];

const RAW_DOORS: DoorDef[] = [
  ['K', 'M', 380, 145],
  ['M', 'G', 660, 145],
  ['K', 'W', 170, 280],
  ['M', 'S', 520, 280],
  ['G', 'S', 810, 280],
  ['W', 'S', 380, 385],
  ['W', 'P', 175, 480],
  ['S', 'P', 510, 480],
  ['S', 'T', 700, 480],
  ['S', 'V', 860, 480],
  ['P', 'T', 600, 605],
  ['T', 'V', 780, 605]
];

const RAW_WALLS: Box3D[] = [
  // Outer North walls (segmented by room so each room's wall is properly behind that room's furniture)
  { x: -3, y: -3, w: 383, d: 6, h: 46, color: '#efe6d2' }, // Kantor Utama North
  { x: 380, y: -3, w: 280, d: 6, h: 46, color: '#efe6d2' }, // Ruang Meeting North
  { x: 660, y: -3, w: 300, d: 6, h: 46, color: '#efe6d2' }, // Ruang Manager North

  // Outer East walls (segmented by room)
  { x: 957, y: 0, w: 6, d: 280, h: 46, color: '#efe6d2' }, // Ruang Manager East
  { x: 957, y: 280, w: 6, d: 200, h: 46, color: '#efe6d2' }, // Ruang Santai East
  { x: 957, y: 480, w: 6, d: 260, h: 46, color: '#efe6d2' }, // Ruang Server East

  // Outer Front walls (low walls 12px height at front boundaries, segmented per room)
  { x: -3, y: -3, w: 6, d: 283, h: 12, color: '#cbbfa5' }, // West wall: Kantor Utama
  { x: -3, y: 280, w: 6, d: 200, h: 12, color: '#cbbfa5' }, // West wall: Ruang Kerja
  { x: -3, y: 480, w: 6, d: 260, h: 12, color: '#cbbfa5' }, // West wall: Kolam Renang
  { x: -3, y: 737, w: 300, d: 6, h: 12, color: '#cbbfa5' }, // South wall: Kolam Renang west
  { x: 297, y: 737, w: 303, d: 6, h: 12, color: '#cbbfa5' }, // South wall: Kolam Renang east
  { x: 600, y: 737, w: 180, d: 6, h: 12, color: '#cbbfa5' }, // South wall: Pantry
  { x: 780, y: 737, w: 183, d: 6, h: 12, color: '#cbbfa5' }, // South wall: Ruang Server

  // Inner walls at y=280 (Door K-W at 170 [130..210], Door M-S at 520 [480..560], Door G-S at 810 [770..850])
  { x: 0, y: 277, w: 130, d: 6, h: 16, color: '#d9cdb4' },
  { x: 210, y: 277, w: 270, d: 6, h: 16, color: '#d9cdb4' },
  { x: 560, y: 277, w: 210, d: 6, h: 16, color: '#d9cdb4' },
  { x: 850, y: 277, w: 110, d: 6, h: 16, color: '#d9cdb4' },

  // Inner walls at y=480 (Door W-P at 175 [135..215], Door S-P at 510 [470..550], Door S-T at 700 [660..740], Door S-V at 860 [820..900])
  { x: 0, y: 477, w: 135, d: 6, h: 16, color: '#d9cdb4' },
  { x: 215, y: 477, w: 255, d: 6, h: 16, color: '#d9cdb4' },
  { x: 550, y: 477, w: 110, d: 6, h: 16, color: '#d9cdb4' },
  { x: 740, y: 477, w: 80, d: 6, h: 16, color: '#d9cdb4' },
  { x: 900, y: 477, w: 60, d: 6, h: 16, color: '#d9cdb4' },

  // Inner walls at x=380 (Door K-M at 145 [105..185], Door W-S at 385 [345..425])
  { x: 377, y: 0, w: 6, d: 105, h: 16, color: '#d9cdb4' },
  { x: 377, y: 185, w: 6, d: 95, h: 16, color: '#d9cdb4' },
  { x: 377, y: 280, w: 6, d: 65, h: 16, color: '#d9cdb4' },
  { x: 377, y: 425, w: 6, d: 55, h: 16, color: '#d9cdb4' },

  // Inner walls at x=660 (Door M-G at 145 [105..185])
  { x: 657, y: 0, w: 6, d: 105, h: 16, color: '#d9cdb4' },
  { x: 657, y: 185, w: 6, d: 95, h: 16, color: '#d9cdb4' },

  // Inner walls at bottom (Door P-T at 605 [565..645], Door T-V at 605 [565..645])
  { x: 597, y: 480, w: 6, d: 85, h: 16, color: '#d9cdb4' },
  { x: 597, y: 645, w: 6, d: 95, h: 16, color: '#d9cdb4' },
  { x: 777, y: 480, w: 6, d: 85, h: 16, color: '#d9cdb4' },
  { x: 777, y: 645, w: 6, d: 95, h: 16, color: '#d9cdb4' }
];

const RAW_FURNITURE: Box3D[] = [
  // Kantor Utama: 6 desks
  { x: 36, y: 64, w: 84, d: 44, h: 16, color: '#b08a58' },
  { x: 148, y: 64, w: 84, d: 44, h: 16, color: '#b08a58' },
  { x: 260, y: 64, w: 84, d: 44, h: 16, color: '#b08a58' },
  { x: 36, y: 176, w: 84, d: 44, h: 16, color: '#b08a58' },
  { x: 148, y: 176, w: 84, d: 44, h: 16, color: '#b08a58' },
  { x: 260, y: 176, w: 84, d: 44, h: 16, color: '#b08a58' },

  // Kantor Utama: 6 monitors
  { x: 65, y: 70, w: 26, d: 6, h: 14, z: 16, color: '#7dd3fc' },
  { x: 177, y: 70, w: 26, d: 6, h: 14, z: 16, color: '#7dd3fc' },
  { x: 289, y: 70, w: 26, d: 6, h: 14, z: 16, color: '#7dd3fc' },
  { x: 65, y: 182, w: 26, d: 6, h: 14, z: 16, color: '#7dd3fc' },
  { x: 177, y: 182, w: 26, d: 6, h: 14, z: 16, color: '#7dd3fc' },
  { x: 289, y: 182, w: 26, d: 6, h: 14, z: 16, color: '#7dd3fc' },

  // Kantor Utama: 6 chairs
  { x: 68, y: 116, w: 20, d: 20, h: 10, color: '#5b6b84' },
  { x: 180, y: 116, w: 20, d: 20, h: 10, color: '#5b6b84' },
  { x: 292, y: 116, w: 20, d: 20, h: 10, color: '#5b6b84' },
  { x: 68, y: 228, w: 20, d: 20, h: 10, color: '#5b6b84' },
  { x: 180, y: 228, w: 20, d: 20, h: 10, color: '#5b6b84' },
  { x: 292, y: 228, w: 20, d: 20, h: 10, color: '#5b6b84' },

  // Kantor Utama: plant
  { x: 344, y: 238, w: 18, d: 18, h: 12, color: '#7c2d12' },
  { x: 340, y: 234, w: 26, d: 26, h: 24, z: 12, color: '#22a05a', isRound: true },

  // Ruang Meeting: round table (centered at x=520, y=150, span x: 440..600, y: 110..190)
  { x: 440, y: 110, w: 160, d: 80, h: 18, color: '#a9824f', isRound: true },

  // Ruang Meeting: 6 chairs (3 North chairs at y=68 with open gap, 3 South chairs at y=206, aligned at x=450, 510, 570)
  { x: 450, y: 68, w: 20, d: 20, h: 10, color: '#6d5bb0' },
  { x: 510, y: 68, w: 20, d: 20, h: 10, color: '#6d5bb0' },
  { x: 570, y: 68, w: 20, d: 20, h: 10, color: '#6d5bb0' },
  { x: 450, y: 206, w: 20, d: 20, h: 10, color: '#6d5bb0' },
  { x: 510, y: 206, w: 20, d: 20, h: 10, color: '#6d5bb0' },
  { x: 570, y: 206, w: 20, d: 20, h: 10, color: '#6d5bb0' },

  // Ruang Meeting: whiteboard
  { x: 430, y: 6, w: 180, d: 5, h: 34, z: 10, color: '#f8fafc' },

  // Ruang Manager: desk and monitor
  { x: 736, y: 110, w: 140, d: 56, h: 18, color: '#8a5a2f' },
  { x: 786, y: 116, w: 34, d: 6, h: 16, z: 18, color: '#7dd3fc' },

  // Ruang Manager: chairs
  { x: 796, y: 78, w: 22, d: 22, h: 10, color: '#334155' },
  { x: 766, y: 184, w: 20, d: 20, h: 10, color: '#64748b' },
  { x: 824, y: 184, w: 20, d: 20, h: 10, color: '#64748b' },

  // Ruang Manager: sofa
  { x: 680, y: 224, w: 120, d: 8, h: 38, color: '#6f7fa0' },
  { x: 680, y: 232, w: 120, d: 32, h: 20, color: '#6f7fa0' },

  // Ruang Manager: plant & bookshelf
  { x: 900, y: 44, w: 16, d: 16, h: 12, color: '#7c2d12' },
  { x: 894, y: 38, w: 28, d: 28, h: 26, z: 12, color: '#22a05a', isRound: true },
  { x: 926, y: 70, w: 24, d: 120, h: 56, color: '#7c4f2a' },

  // Ruang Kerja: partitions
  { x: 24, y: 322, w: 70, d: 4, h: 30, color: '#94a3b8' },
  { x: 112, y: 322, w: 70, d: 4, h: 30, color: '#94a3b8' },
  { x: 200, y: 322, w: 70, d: 4, h: 30, color: '#94a3b8' },
  { x: 288, y: 322, w: 70, d: 4, h: 30, color: '#94a3b8' },

  // Ruang Kerja: desks
  { x: 24, y: 332, w: 70, d: 34, h: 14, color: '#b08a58' },
  { x: 112, y: 332, w: 70, d: 34, h: 14, color: '#b08a58' },
  { x: 200, y: 332, w: 70, d: 34, h: 14, color: '#b08a58' },
  { x: 288, y: 332, w: 70, d: 34, h: 14, color: '#b08a58' },

  // Ruang Kerja: monitors
  { x: 47, y: 336, w: 24, d: 6, h: 14, z: 14, color: '#7dd3fc' },
  { x: 135, y: 336, w: 24, d: 6, h: 14, z: 14, color: '#f9a8d4' },
  { x: 223, y: 336, w: 24, d: 6, h: 14, z: 14, color: '#7dd3fc' },
  { x: 311, y: 336, w: 24, d: 6, h: 14, z: 14, color: '#7dd3fc' },

  // Ruang Kerja: chairs
  { x: 49, y: 374, w: 20, d: 20, h: 10, color: '#5b6b84' },
  { x: 137, y: 374, w: 20, d: 20, h: 10, color: '#5b6b84' },
  { x: 225, y: 374, w: 20, d: 20, h: 10, color: '#5b6b84' },
  { x: 313, y: 374, w: 20, d: 20, h: 10, color: '#5b6b84' },

  // Ruang Kerja: credenzas / filing cabinets (placed against back wall with 81px wide clear aisle x=135..216 leading to pool door W-P)
  { x: 24, y: 454, w: 110, d: 18, h: 20, color: '#a9824f' },
  { x: 216, y: 454, w: 140, d: 18, h: 20, color: '#a9824f' },

  // Ruang Santai: billiard table (shifted to x=428, providing generous 45px aisle from west wall and 62px aisle to lounge)
  { x: 428, y: 332, w: 190, d: 104, h: 22, color: '#15803d' },
  { x: 428, y: 332, w: 190, d: 8, h: 6, z: 22, color: '#6b3f1d' },
  { x: 428, y: 428, w: 190, d: 8, h: 6, z: 22, color: '#6b3f1d' },
  { x: 428, y: 332, w: 8, d: 104, h: 6, z: 22, color: '#6b3f1d' },
  { x: 610, y: 332, w: 8, d: 104, h: 6, z: 22, color: '#6b3f1d' },

  // Ruang Santai: sofas
  { x: 680, y: 316, w: 150, d: 8, h: 38, color: '#7c6bb0' },
  { x: 680, y: 324, w: 150, d: 34, h: 20, color: '#7c6bb0' },
  { x: 720, y: 422, w: 120, d: 34, h: 20, color: '#7c6bb0' },
  { x: 720, y: 456, w: 120, d: 8, h: 28, color: '#7c6bb0' },

  // Ruang Santai: coffee table, beanbag, TV
  { x: 710, y: 372, w: 90, d: 36, h: 12, color: '#a9824f', isRound: true },
  { x: 846, y: 384, w: 40, d: 40, h: 18, color: '#f97316', isRound: true },
  { x: 934, y: 336, w: 10, d: 90, h: 44, color: '#0f172a' },

  // Kolam Renang: Coping rim borders (hollow basin so pool water and swimmers are fully visible)
  { x: 36, y: 532, w: 420, d: 10, h: 8, color: '#f1f5f9' }, // North rim
  { x: 36, y: 542, w: 10, d: 150, h: 8, color: '#cbd5e1' }, // West rim
  { x: 446, y: 542, w: 10, d: 150, h: 8, color: '#cbd5e1' }, // East rim
  { x: 36, y: 692, w: 420, d: 10, h: 8, color: '#e2e8f0' }, // South rim
  // Pool ladder
  { x: 420, y: 524, w: 10, d: 14, h: 16, color: '#cbd5e1' },
  // Sun loungers
  { x: 480, y: 544, w: 36, d: 84, h: 10, color: '#f1f5f9' },
  { x: 528, y: 544, w: 36, d: 84, h: 10, color: '#f1f5f9' },
  // Umbrella
  { x: 518, y: 676, w: 4, d: 4, h: 46, color: '#94a3b8' },
  { x: 490, y: 648, w: 62, d: 62, h: 4, z: 46, color: '#f43f5e', isRound: true },

  // Pantry: counter, microwave, fridge, table & chairs
  { x: 612, y: 524, w: 148, d: 28, h: 26, color: '#94a3b8' },
  { x: 622, y: 530, w: 22, d: 16, h: 16, z: 26, color: '#0f172a' },
  { x: 724, y: 560, w: 30, d: 34, h: 50, color: '#e5e7eb' },
  { x: 654, y: 608, w: 72, d: 72, h: 16, color: '#a9824f', isRound: true },
  { x: 632, y: 598, w: 20, d: 20, h: 10, color: '#475569' },
  { x: 728, y: 598, w: 20, d: 20, h: 10, color: '#475569' },
  { x: 632, y: 672, w: 20, d: 20, h: 10, color: '#475569' },
  { x: 728, y: 672, w: 20, d: 20, h: 10, color: '#475569' },

  // Ruang Server: 3 racks (shifted to x=830, 872, 914, providing 50px clear hallway from door T-V)
  { x: 830, y: 550, w: 36, d: 56, h: 72, color: '#0f172a', isRack: true },
  { x: 872, y: 550, w: 36, d: 56, h: 72, color: '#0f172a', isRack: true },
  { x: 914, y: 550, w: 36, d: 56, h: 72, color: '#0f172a', isRack: true },
  // Server room terminal desk
  { x: 825, y: 655, w: 120, d: 40, h: 4, color: '#38bdf8' }
];

const RAW_ROOM_LABELS: { name: string; x: number; y: number }[] = [
  { name: 'Kantor Utama', x: 190, y: 24 },
  { name: 'Ruang Meeting', x: 520, y: 24 },
  { name: 'Ruang Manager', x: 810, y: 24 },
  { name: 'Ruang Kerja', x: 190, y: 300 },
  { name: 'Ruang Santai', x: 520, y: 300 },
  { name: 'Kolam Renang', x: 240, y: 500 },
  { name: 'Pantry', x: 690, y: 500 },
  { name: 'Ruang Server', x: 870, y: 500 }
];

export const ROOMS: RoomDef[] = RAW_ROOMS.map((r) => ({
  ...r,
  x0: s(r.x0),
  y0: s(r.y0),
  x1: s(r.x1),
  y1: s(r.y1)
}));

export const DOORS: DoorDef[] = RAW_DOORS.map((d) => [
  d[0],
  d[1],
  s(d[2]),
  s(d[3])
]);

export const WALLS: Box3D[] = RAW_WALLS.map((w) => ({
  ...w,
  x: s(w.x),
  y: s(w.y),
  w: s(w.w),
  d: s(w.d)
}));

export const FURNITURE: Box3D[] = RAW_FURNITURE.map((f) => ({
  ...f,
  x: s(f.x),
  y: s(f.y),
  w: s(f.w),
  d: s(f.d)
}));

export const ROOM_LABELS: { name: string; x: number; y: number }[] = RAW_ROOM_LABELS.map((l) => ({
  ...l,
  x: s(l.x),
  y: s(l.y)
}));
