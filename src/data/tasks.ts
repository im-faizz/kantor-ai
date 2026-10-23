export interface TaskTemplate {
  tag: string;
  title: string;
  summary: string;
  file: string;
}

export interface DocLine {
  t: string;
  fs: string;
  fw: string;
  col: string;
  pl: string;
  mt: string;
}

export interface ChartBar {
  h: string;
  v: number;
  n: string;
  bg: string;
}

export interface PaletteColor {
  c: string;
  n: string;
}

export interface OutputPreview {
  kind: 'code' | 'doc' | 'chart' | 'image' | 'palette';
  code?: string;
  lines?: DocLine[];
  bars?: ChartBar[];
  imgA?: string;
  imgB?: string;
  sw?: PaletteColor[];
}

export const TASK_BANK: Record<string, [string, string, string, string][]> = {
  bima: [
    ['REVIEW', 'Review proposal klien', '3 catatan revisi dikirim ke Raka dan Maya', 'review-proposal.md'],
    ['RENCANA', 'Prioritas sprint minggu ini', '5 tugas dibagi ke 6 agen', 'sprint-plan.md'],
    ['LAPORAN', 'Ringkasan progres tim', '4 dari 6 target minggu ini tercapai', 'progres-mingguan.md']
  ],
  sari: [
    ['RISET', 'Laporan tren pasar', '12 sumber dirangkum, 3 tren utama', 'laporan-pasar.pdf'],
    ['RISET', 'Ringkasan 3 artikel kompetitor', 'Ada 2 celah yang belum digarap kompetitor', 'ringkasan-kompetitor.md'],
    ['CEK FAKTA', 'Verifikasi statistik laporan', '9 dari 10 angka cocok dengan sumber', 'cek-fakta.md']
  ],
  dika: [
    ['KODE', 'Fungsi login selesai', '24 tes lulus, 0 gagal', 'login.js'],
    ['BUG', 'Bug halaman checkout diperbaiki', 'Validasi form kini menolak input kosong', 'checkout.js'],
    ['KODE', 'Refactor modul pembayaran', 'Duplikasi kode berkurang 40%', 'payment.js']
  ],
  maya: [
    ['DESAIN', 'Poster promo akhir tahun', '3 varian siap dipilih', 'poster-promo.png'],
    ['BRAND', 'Palet warna brand', '5 warna, kontras lolos standar AA', 'palet-brand.svg'],
    ['UI', 'Layout landing page', 'Versi desktop dan HP selesai', 'landing-page.fig']
  ],
  raka: [
    ['TULISAN', 'Naskah video 60 detik', '142 kata, 3 adegan', 'naskah-video.docx'],
    ['TULISAN', 'Caption Instagram', '3 opsi caption plus 8 tagar', 'caption.txt'],
    ['EDIT', 'Artikel blog diedit', 'Panjang dipangkas 18%, alur lebih rapi', 'artikel-blog.md']
  ],
  tari: [
    ['DATA', 'Grafik tren penjualan', 'Naik 12% dibanding bulan lalu', 'tren-penjualan.xlsx'],
    ['DATA', 'Segmentasi pelanggan', '3 segmen, 1 paling bernilai', 'segmen.csv'],
    ['INSIGHT', 'Analisis konversi kampanye', 'Konversi tertinggi di hari Jumat', 'konversi.xlsx']
  ],
  joko: [
    ['STRATEGI', 'Jadwal posting 2 minggu', '14 posting di 3 platform', 'jadwal-sosmed.xlsx'],
    ['IKLAN', 'Analisis performa iklan', 'Iklan B menang dengan CTR 3,4%', 'analisis-iklan.pdf'],
    ['STRATEGI', 'Rencana promo akhir tahun', '3 skema diskon dengan estimasi dampak', 'promo-akhir-tahun.md']
  ],
  lina: [
    ['LAYANAN', 'Balasan pelanggan hari ini', '5 chat dibalas, 1 dieskalasi ke Bima', 'tiket-hari-ini.csv'],
    ['FAQ', 'Daftar FAQ diperbarui', '8 pertanyaan baru ditambahkan', 'faq.md'],
    ['LAYANAN', 'Rekap masukan pelanggan', '3 keluhan berulang soal pengiriman', 'masukan.md']
  ]
};

const CODE_TEMPLATES: Record<string, string[]> = {
  'login.js': [
    "import { cekPassword, buatToken } from './auth.js';",
    '',
    'export async function login(email, password) {',
    '  if (!email || !password) {',
    "    throw new Error('Email dan password wajib diisi');",
    '  }',
    '  const user = await db.user.cari({ email });',
    '  if (!user || !(await cekPassword(password, user.hash))) {',
    "    throw new Error('Email atau password salah');",
    '  }',
    '  return { token: buatToken(user.id), nama: user.nama };',
    '}',
    '',
    '// Tes: 24 lulus, 0 gagal'
  ],
  'checkout.js': [
    'export function validasiCheckout(form) {',
    '  const galat = {};',
    "  if (!form.alamat.trim()) galat.alamat = 'Alamat tidak boleh kosong';",
    "  if (!/^\\d{10,13}$/.test(form.telepon)) galat.telepon = 'Nomor telepon tidak valid';",
    "  if (form.items.length === 0) galat.items = 'Keranjang masih kosong';",
    '  return { ok: Object.keys(galat).length === 0, galat };',
    '}',
    '',
    '// Perbaikan: input kosong kini ditolak'
  ],
  'payment.js': [
    'const metode = {',
    '  transfer: (jumlah) => buatVirtualAccount(jumlah),',
    '  kartu: (jumlah) => tagihKartu(jumlah),',
    '  dompet: (jumlah) => potongSaldo(jumlah)',
    '};',
    '',
    'export function bayar(jenis, jumlah) {',
    '  const proses = metode[jenis];',
    "  if (!proses) throw new Error('Metode tidak dikenal');",
    '  return proses(jumlah);',
    '}',
    '',
    '// Refactor: duplikasi kode berkurang 40%'
  ]
};

export function getOutputFor(
  agentId: string,
  task: { title: string; sum: string; file: string }
): OutputPreview {
  const sty: Record<string, [string, string, string, string, string]> = {
    h: ['14px', '700', '#fde68a', '0px', '12px'],
    p: ['13px', '400', '#dbe4f3', '0px', '5px'],
    b: ['13px', '400', '#dbe4f3', '14px', '3px']
  };

  const mk = (arr: [string, string][]): DocLine[] =>
    arr.map((r) => ({
      t: r[0] === 'b' ? '• ' + r[1] : r[1],
      fs: sty[r[0]][0],
      fw: sty[r[0]][1],
      col: sty[r[0]][2],
      pl: sty[r[0]][3],
      mt: sty[r[0]][4]
    }));

  if (agentId === 'dika') {
    const lines = CODE_TEMPLATES[task.file] || CODE_TEMPLATES['login.js'];
    return { kind: 'code', code: lines.join('\n') };
  }

  if (agentId === 'maya') {
    if (/palet/.test(task.file)) {
      return {
        kind: 'palette',
        sw: [
          { c: '#F59E0B', n: 'Amber' },
          { c: '#1B2742', n: 'Malam' },
          { c: '#34D399', n: 'Hijau' },
          { c: '#F472B6', n: 'Merah muda' },
          { c: '#F8FAFC', n: 'Putih' }
        ]
      };
    }
    const words = task.title.split(' ');
    const half = Math.ceil(words.length / 2);
    return {
      kind: 'image',
      imgA: words.slice(0, half).join(' ').toUpperCase(),
      imgB: words.slice(half).join(' ').toUpperCase()
    };
  }

  if (agentId === 'tari') {
    const v = [42, 47, 51, 49, 56, 63];
    const n = ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'];
    return {
      kind: 'chart',
      bars: v.map((x, i) => ({
        h: Math.round((x / 63) * 130) + 'px',
        v: x,
        n: n[i],
        bg: i === 5 ? '#fbbf24' : '#60a5fa'
      }))
    };
  }

  const DOCS: Record<string, [string, string][]> = {
    bima: [
      ['h', 'Ringkasan'],
      ['p', task.sum],
      ['h', 'Keputusan'],
      ['b', 'Tugas dengan tenggat terdekat dikerjakan lebih dulu'],
      ['b', 'Raka dan Maya memperbaiki catatan revisi'],
      ['b', 'Review lanjutan hari Jumat pukul 15.00'],
      ['h', 'Langkah berikutnya'],
      ['p', 'Bima memantau progres dan melapor ke pemilik kantor.']
    ],
    sari: [
      ['h', task.title],
      ['p', task.sum],
      ['h', 'Temuan utama'],
      ['b', 'Permintaan naik di segmen usia 25-34'],
      ['b', 'Dua kompetitor belum punya fitur langganan'],
      ['b', 'Harga rata-rata pasar turun 5%'],
      ['h', 'Sumber'],
      ['b', 'Laporan industri 2026, hal. 12-18'],
      ['b', '3 artikel berita ekonomi'],
      ['b', 'Survei konsumen internal']
    ],
    raka: [
      ['h', task.title],
      ['p', task.sum],
      ['h', 'Isi'],
      ['p', 'Adegan 1, Masalah: pelanggan kewalahan mengurus tugas harian.'],
      ['p', 'Adegan 2, Solusi: tim AI bekerja bersama tanpa jeda.'],
      ['p', 'Adegan 3, Ajakan: coba gratis hari ini.']
    ],
    joko: [
      ['h', task.title],
      ['p', task.sum],
      ['h', 'Rencana'],
      ['b', 'Minggu 1: teaser di Instagram dan TikTok'],
      ['b', 'Minggu 2: peluncuran plus iklan berbayar'],
      ['b', 'Minggu 3: konten testimoni pelanggan'],
      ['h', 'Target'],
      ['p', 'Jangkauan 50.000 akun, konversi 2,5%.']
    ],
    lina: [
      ['h', task.title],
      ['p', task.sum],
      ['h', 'Contoh balasan'],
      ['p', '"Halo Kak, pesanan sudah dikirim dan tiba dalam 2 hari."'],
      ['p', '"Mohon maaf atas keterlambatannya, kami bantu cek sekarang."'],
      ['h', 'Eskalasi'],
      ['b', '1 keluhan pengiriman diteruskan ke Bima']
    ]
  };

  return { kind: 'doc', lines: mk(DOCS[agentId] || DOCS.bima) };
}

export const WORK_RANDOM_LINES: Record<string, string[]> = {
  bima: [
    'Meninjau laporan mingguan',
    'Membagi tugas sprint ke tim',
    'Menyetujui draft proposal',
    'Menyusun prioritas minggu ini'
  ],
  sari: [
    'Mencari sumber untuk laporan pasar',
    'Merangkum 3 artikel riset',
    'Mengecek fakta statistik',
    'Menyusun daftar referensi'
  ],
  dika: [
    'Menulis fungsi login',
    'Memperbaiki bug halaman checkout',
    'Menjalankan tes unit: 24 lulus',
    'Commit: perbaiki validasi form',
    'Merapikan kode modul pembayaran'
  ],
  maya: [
    'Merancang poster promo',
    'Memilih palet warna brand',
    'Mengekspor ikon aplikasi',
    'Merapikan layout landing page'
  ],
  raka: [
    'Menulis naskah video 60 detik',
    'Merevisi caption Instagram',
    'Mengedit artikel blog',
    'Menyusun headline iklan'
  ],
  tari: [
    'Membersihkan data penjualan',
    'Membuat grafik tren bulanan',
    'Menemukan pola pelanggan baru',
    'Menghitung konversi kampanye'
  ],
  joko: [
    'Menyusun jadwal posting sosmed',
    'Menganalisis performa iklan',
    'Merancang promo akhir tahun',
    'Riset kompetitor'
  ],
  lina: [
    'Membalas 5 chat pelanggan',
    'Memperbarui daftar FAQ',
    'Mengeskalasi keluhan ke Bima',
    'Mencatat masukan pelanggan'
  ]
};

export const MEETING_RANDOM_LINES = [
  'Diskusi ide konten di ruang meeting',
  'Mencatat poin rapat',
  'Membahas jadwal rilis',
  'Menentukan target minggu ini'
];

export const REST_RANDOM_LINES: Record<string, string[]> = {
  bil: ['Main bilyard, skor sementara unggul', 'Mengincar bola terakhir'],
  pool: ['Berenang beberapa putaran', 'Mengambang santai di kolam'],
  coffee: ['Membuat kopi di pantry', 'Menyeruput kopi'],
  sit: ['Duduk santai sebentar', 'Mengobrol ringan'],
  lie: ['Rebahan, istirahat sebentar', 'Tidur ayam lima menit']
};
