import { WORLD_SCALE } from '../world/iso';

export interface AgentDef {
  id: string;
  name: string;
  role: string;
  shirt: string;
  hair: string;
  skin: string;
  tie: number;
  gl: number;
  hs: number;
  be: number;
  cp: number;
  bun: number;
  skills: string[];
  home: [number, number];
  homeRoom: string;
  desk: [number, number];
  deskRoom: string;
  idle: string;
  verb: string;
  verbCap: string;
  intro: string;
}

export type ActivityType = 'work' | 'meet' | 'bil' | 'pool' | 'coffee' | 'sit' | 'lie' | 'walk';

const RAW_AGENT_DEFS: AgentDef[] = [
  {
    id: 'bima',
    name: 'Bima',
    role: 'Manager Proyek',
    shirt: '#f59e0b',
    hair: '#1f2937',
    skin: '#f1c9a5',
    tie: 1,
    gl: 0,
    hs: 0,
    be: 0,
    cp: 0,
    bun: 0,
    skills: ['Delegasi', 'Review', 'Prioritas'],
    home: [807, 92],
    homeRoom: 'Ruang Manager',
    desk: [807, 92],
    deskRoom: 'Ruang Manager',
    idle: 'Meninjau laporan',
    verb: 'membagi tugas',
    verbCap: 'Membagi tugas',
    intro: 'Halo, saya Bima. Beri saya target, nanti saya bagi ke tim.'
  },
  {
    id: 'sari',
    name: 'Sari',
    role: 'Peneliti',
    shirt: '#34d399',
    hair: '#7c2d12',
    skin: '#e8b88f',
    tie: 0,
    gl: 1,
    hs: 0,
    be: 0,
    cp: 0,
    bun: 0,
    skills: ['Riset web', 'Ringkasan', 'Cek fakta'],
    home: [78, 128],
    homeRoom: 'Kantor Utama',
    desk: [78, 128],
    deskRoom: 'Kantor Utama',
    idle: 'Meneliti topik',
    verb: 'meneliti',
    verbCap: 'Meneliti',
    intro: 'Hai, saya Sari. Kasih topik, saya carikan datanya.'
  },
  {
    id: 'dika',
    name: 'Dika',
    role: 'Programmer',
    shirt: '#60a5fa',
    hair: '#111827',
    skin: '#f1c9a5',
    tie: 0,
    gl: 0,
    hs: 1,
    be: 0,
    cp: 0,
    bun: 0,
    skills: ['Kode', 'Debug', 'Tes'],
    home: [190, 128],
    homeRoom: 'Kantor Utama',
    desk: [190, 128],
    deskRoom: 'Kantor Utama',
    idle: 'Menulis kode',
    verb: 'menulis kode',
    verbCap: 'Ngoding',
    intro: 'Yo, Dika di sini. Ada bug atau fitur baru?'
  },
  {
    id: 'maya',
    name: 'Maya',
    role: 'Desainer',
    shirt: '#f472b6',
    hair: '#be185d',
    skin: '#f5d0b0',
    tie: 0,
    gl: 0,
    hs: 0,
    be: 1,
    cp: 0,
    bun: 0,
    skills: ['UI', 'Poster', 'Brand'],
    home: [147, 384],
    homeRoom: 'Ruang Kerja',
    desk: [147, 384],
    deskRoom: 'Ruang Kerja',
    idle: 'Mendesain poster',
    verb: 'mendesain',
    verbCap: 'Mendesain',
    intro: 'Halo, saya Maya. Mau desain apa hari ini?'
  },
  {
    id: 'raka',
    name: 'Raka',
    role: 'Penulis',
    shirt: '#c084fc',
    hair: '#4c1d95',
    skin: '#e8b88f',
    tie: 0,
    gl: 0,
    hs: 0,
    be: 0,
    cp: 1,
    bun: 0,
    skills: ['Copywriting', 'Naskah', 'Editing'],
    home: [460, 78],
    homeRoom: 'Ruang Meeting',
    desk: [59, 384],
    deskRoom: 'Ruang Kerja',
    idle: 'Rapat ide konten',
    verb: 'menulis naskah',
    verbCap: 'Menulis',
    intro: 'Raka siap. Kasih brief, saya tuliskan.'
  },
  {
    id: 'tari',
    name: 'Tari',
    role: 'Analis Data',
    shirt: '#fb923c',
    hair: '#9a3412',
    skin: '#f5d0b0',
    tie: 0,
    gl: 1,
    hs: 0,
    be: 0,
    cp: 0,
    bun: 1,
    skills: ['Spreadsheet', 'Grafik', 'Insight'],
    home: [580, 78],
    homeRoom: 'Ruang Meeting',
    desk: [235, 384],
    deskRoom: 'Ruang Kerja',
    idle: 'Rapat ide konten',
    verb: 'mengolah data',
    verbCap: 'Olah data',
    intro: 'Halo, Tari di sini. Kirim datanya, saya cari polanya.'
  },
  {
    id: 'joko',
    name: 'Joko',
    role: 'Marketing',
    shirt: '#facc15',
    hair: '#713f12',
    skin: '#d9a679',
    tie: 1,
    gl: 0,
    hs: 0,
    be: 0,
    cp: 0,
    bun: 0,
    skills: ['Strategi', 'Sosmed', 'Iklan'],
    home: [648, 384],
    homeRoom: 'Ruang Santai',
    desk: [78, 238],
    deskRoom: 'Kantor Utama',
    idle: 'Main bilyard',
    verb: 'menyusun strategi',
    verbCap: 'Strategi',
    intro: 'Halo, Joko. Mau naikin penjualan? Bilang aja.'
  },
  {
    id: 'lina',
    name: 'Lina',
    role: 'Customer Service',
    shirt: '#2dd4bf',
    hair: '#0f766e',
    skin: '#f1c9a5',
    tie: 0,
    gl: 0,
    hs: 1,
    be: 0,
    cp: 0,
    bun: 0,
    skills: ['Balas chat', 'FAQ', 'Eskalasi'],
    home: [230, 620],
    homeRoom: 'Kolam Renang',
    desk: [190, 238],
    deskRoom: 'Kantor Utama',
    idle: 'Berenang santai',
    verb: 'membalas pelanggan',
    verbCap: 'Layani pelanggan',
    intro: 'Hai, Lina. Ada pelanggan yang perlu dibantu?'
  }
];

export const AGENT_DEFS: AgentDef[] = RAW_AGENT_DEFS.map((a) => ({
  ...a,
  home: [Math.round(a.home[0] * WORLD_SCALE), Math.round(a.home[1] * WORLD_SCALE)],
  desk: [Math.round(a.desk[0] * WORLD_SCALE), Math.round(a.desk[1] * WORLD_SCALE)]
}));

export const INITIAL_ACTIVITIES: Record<string, ActivityType> = {
  bima: 'work',
  sari: 'work',
  dika: 'work',
  maya: 'work',
  raka: 'meet',
  tari: 'meet',
  joko: 'bil',
  lina: 'pool'
};

export const INITIAL_PROGRESS: Record<string, number> = {
  bima: 35,
  sari: 60,
  dika: 20,
  maya: 70,
  raka: 45,
  tari: 15,
  joko: 0,
  lina: 0
};

const RAW_ACTIVITY_SPOTS: Record<string, [number, number][]> = {
  meeting: [
    [460, 78],
    [520, 78],
    [580, 78],
    [460, 216],
    [520, 216],
    [580, 216],
    [615, 150],
    [425, 150]
  ],
  pool: [
    [140, 600],
    [230, 640],
    [320, 600],
    [400, 650],
    [120, 660],
    [290, 665],
    [250, 570],
    [420, 585]
  ],
  lounge: [
    [700, 340],
    [750, 340],
    [800, 340],
    [700, 442],
    [750, 442],
    [800, 442],
    [866, 404],
    [880, 360]
  ],
  bil: [
    [648, 384],
    [520, 318],
    [520, 456],
    [450, 456]
  ],
  pantry: [
    [690, 590],
    [630, 640],
    [750, 640],
    [690, 700]
  ]
};

export const ACTIVITY_SPOTS: Record<string, [number, number][]> = Object.fromEntries(
  Object.entries(RAW_ACTIVITY_SPOTS).map(([k, spots]) => [
    k,
    spots.map((pt) => [Math.round(pt[0] * WORLD_SCALE), Math.round(pt[1] * WORLD_SCALE)])
  ])
);

export function getAgentDef(id: string): AgentDef {
  const d = AGENT_DEFS.find((a) => a.id === id);
  if (!d) throw new Error(`Agent not found: ${id}`);
  return d;
}
