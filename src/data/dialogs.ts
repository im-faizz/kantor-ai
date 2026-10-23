export const CHATTER_INITIATIVE: Record<string, string[]> = {
  work: [
    '{n}, drafnya sudah kamu cek?',
    '{n}, tolong review ini ya.',
    '{n}, datanya sudah siap?',
    'Menurutmu ini oke, {n}?',
    '{n}, deadline-nya besok lho.'
  ],
  meet: [
    'Ide kampanye minggu ini gimana, {n}?',
    '{n}, setuju dengan jadwalnya?',
    'Kita bagi tugas dulu ya, {n}.',
    'Poin ketiga perlu data, {n}.'
  ],
  bil: ['Giliranmu, {n}!', '{n}, jago juga ya!', 'Awas meleset, {n}!'],
  pool: ['Airnya enak, {n}!', '{n}, ayo berenang!', 'Segar banget, {n}!'],
  coffee: ['Kopi dulu, {n}?', '{n}, mau kutraktir kopi?', 'Pantry wangi banget, {n}.'],
  sit: ['Capek ya, {n}?', '{n}, istirahat dulu yuk.', 'Santai dulu, {n}.'],
  lie: ['{n}, jangan bangunin aku.', 'Zzz... eh, {n}, jam berapa?', '{n}, lima menit lagi ya.']
};

export const CHATTER_RESPONSE: Record<string, string[]> = {
  work: ['Sudah, tinggal revisi kecil.', 'Siap, kukirim sebentar lagi.', 'Oke, kukerjakan sekarang.'],
  meet: ['Setuju, lanjut!', 'Boleh, aku siapkan datanya.', 'Noted, aku catat.'],
  bil: ['Hehe, lihat saja nanti.', 'Siap, yang kalah traktir kopi!', 'Tunggu, aku fokus dulu.'],
  pool: ['Ayo, byur!', 'Iya, segar banget!', 'Sebentar, lagi renang.'],
  coffee: ['Boleh, dua gula ya.', 'Mau dong!', 'Wah, makasih!'],
  sit: ['Iya, nyaman banget.', 'Yuk, lima menit.', 'Setuju.'],
  lie: ['Mmh... oke.', 'Jangan ribut dong.', 'Zzz...']
};
