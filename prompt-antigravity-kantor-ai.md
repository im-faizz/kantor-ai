# Prompt untuk Antigravity: bangun "Kantor AI"

Salin seluruh isi file ini ke Antigravity. Letakkan juga file `reference-prototype.html` di folder proyek sebagai referensi (lihat bagian "File referensi").

---

## Tujuan

Bangun web app **Kantor AI**: kantor virtual bertampilan isometrik ala game Clash of Clans, tempat 8 karyawan AI berjalan, bekerja, rapat, dan bersantai. Pengguna menggeser dan memperbesar kamera, mengetuk karakter untuk chat dan memberi instruksi, serta melihat progres dan hasil kerja tiap agen.

Kerjakan **Fase 1: visual dan simulasi saja** (belum ada AI sungguhan). Susun kodenya supaya Fase 2 (menyambung ke Claude API) bisa dipasang tanpa menulis ulang UI. Detailnya ada di bagian "Fase 2".

Bahasa seluruh tampilan: **Bahasa Indonesia**.

## Tech stack

- Vite + TypeScript, tanpa framework UI berat. UI overlay (panel, tombol, chat) pakai DOM biasa atau Preact.
- **Render dunia dengan PixiJS v8 (canvas/WebGL)**, proyeksi isometrik 2D yang dihitung sendiri. **Jangan pakai CSS 3D transform**. Prototipe referensi memakai CSS 3D dan terbukti berat.
- Gambar karakter dan furnitur berupa bentuk vektor sederhana yang dirender ke tekstur sekali lalu dipakai ulang (sprite). Animasi pakai transform sprite, bukan redraw tiap frame.
- Target 60 fps di laptop biasa dan HP menengah. Batasi devicePixelRatio maksimal 2. Hentikan simulasi saat tab tidak terlihat.
- Jangan simpan API key di frontend.

## File referensi

`reference-prototype.html` adalah prototipe visual yang sudah disetujui. **Jangan dijalankan atau disalin mentah-mentah**, karena memakai format komponen khusus (`<x-dc>`, `{{...}}`) dan CSS 3D. Pakai sebagai sumber untuk koordinat ruangan, warna, teks Indonesia, daftar tugas per agen, nama animasi, dan tata letak UI. Kalau ada konflik antara prompt ini dan file itu, ikuti file itu untuk tampilan dan prompt ini untuk teknis.

## Dunia

Koordinat dunia berukuran 960 x 740 unit (x ke kanan, y ke bawah), digambar isometrik (sudut kemiringan 55 derajat, rotasi 45 derajat). Latar di luar kantor polos gelap (`#0f1830`), tanpa rumput atau pohon.

Ruangan (x0,y0 sampai x1,y1, warna lantai):

| Ruangan | Area | Lantai |
|---|---|---|
| Kantor Utama | 0,0 - 380,280 | #c7d4e6 |
| Ruang Meeting | 380,0 - 660,280 | #d7cde8 |
| Ruang Manager | 660,0 - 960,280 | #e6d1b8 |
| Ruang Kerja | 0,280 - 380,480 | #bfe0df |
| Ruang Santai | 380,280 - 960,480 | #ecd5c5 |
| Kolam Renang | 0,480 - 600,740 | #d3dce5 |
| Pantry | 600,480 - 780,740 | #f1e6bd |
| Ruang Server | 780,480 - 960,740 | #a9b6c4 |

Dinding tipis berwarna krem (tinggi dinding luar lebih tinggi dari dinding antarruang) dengan celah pintu di titik-titik berikut. Pintu ini juga menjadi graf untuk pencarian rute:

K-M (380,145), M-G (660,145), K-W (170,280), M-S (520,280), G-S (810,280), W-S (380,385), W-P (175,480), S-P (510,480), S-T (700,480), S-V (860,480), P-T (600,605), T-V (780,605). Huruf: K=Kantor Utama, M=Meeting, G=Manager, W=Ruang Kerja, S=Santai, P=Kolam, T=Pantry, V=Server.

Furnitur (ambil posisi dan warna dari file referensi): meja dan kursi di Kantor Utama dan Ruang Kerja (6 dan 4 meja dengan monitor), meja bundar meeting dengan 6 kursi dan papan tulis, meja manager dengan sofa, rak buku dan tanaman, meja bilyard hijau dengan sofa, meja kopi, bean bag dan TV di Ruang Santai, kolam renang dengan tangga, dua kursi berjemur dan ban renang, meja dapur dengan kulkas dan meja makan bundar di Pantry, tiga rak server berlampu di Ruang Server. Setiap ruangan punya label nama melayang.

## Kamera (gaya Clash of Clans)

- Seret satu jari atau mouse untuk menggeser dengan sedikit inersia.
- Scroll mouse atau cubit dua jari untuk zoom, rentang 0.45x sampai 2.4x, zoom berpusat di titik kursor atau jari.
- Batasi geseran supaya kantor tidak keluar jauh dari layar.
- Tombol di kiri bawah: perbesar, perkecil, pusatkan kamera.
- Mengetuk karakter memusatkan kamera ke karakter itu dengan animasi halus (sekitar 0,6 detik). Geseran yang melebihi 5 piksel tidak dianggap ketukan.
- Petunjuk kecil di tengah bawah: "Seret untuk geser kamera · scroll atau cubit untuk zoom · ketuk karakter untuk chat".

## Karakter

Karakter chibi kartun berdiri tegak menghadap kamera (billboard), kepala besar, mata bulat dengan highlight, pipi merah muda tipis, nama dan status singkat di label atas kepala (label berwarna sesuai warna baju). Cincin kuning di kaki menandai agen yang sedang dipilih.

Delapan agen (warna baju, rambut, kulit, aksesori, skill, posisi awal, meja kerja):

| ID | Nama | Peran | Baju | Aksesori | Skill | Awal | Meja |
|---|---|---|---|---|---|---|---|
| bima | Bima | Manager Proyek | #f59e0b | dasi merah | Delegasi, Review, Prioritas | Manager (807,92), kerja | sama |
| sari | Sari | Peneliti | #34d399 | kacamata | Riset web, Ringkasan, Cek fakta | Kantor Utama (78,128), kerja | sama |
| dika | Dika | Programmer | #60a5fa | headset | Kode, Debug, Tes | Kantor Utama (190,128), kerja | sama |
| maya | Maya | Desainer | #f472b6 | baret merah muda | UI, Poster, Brand | Ruang Kerja (147,384), kerja | sama |
| raka | Raka | Penulis | #c084fc | topi biru | Copywriting, Naskah, Editing | Meeting (452,104), rapat | Ruang Kerja (59,384) |
| tari | Tari | Analis Data | #fb923c | kacamata, sanggul | Spreadsheet, Grafik, Insight | Meeting (552,104), rapat | Ruang Kerja (235,384) |
| joko | Joko | Marketing | #facc15 | dasi | Strategi, Sosmed, Iklan | Ruang Santai (628,384), bilyard | Kantor Utama (78,238) |
| lina | Lina | Customer Service | #2dd4bf | headset | Balas chat, FAQ, Eskalasi | Kolam (230,620), berenang | Kantor Utama (190,238) |

Warna rambut dan kulit serta kalimat perkenalan tiap agen ada di file referensi.

### Aktivitas dan animasi

Setiap aktivitas punya pose animasi ringan (cukup gambar yang digerak-gerakkan, bukan rig tulang):

- **Berjalan:** badan naik-turun, tangan dan kaki mengayun berlawanan.
- **Kerja (duduk):** badan turun, kaki ditekuk, kedua tangan mengetik.
- **Rapat (duduk):** tangan kanan bergerak seperti berbicara.
- **Bilyard:** badan agak miring, memegang stik, tangan menyodok maju-mundur.
- **Ngopi:** memegang cangkir dan sesekali meminumnya.
- **Duduk santai** dan **rebahan** (badan diputar mendatar, muncul teks "Zzz" melayang).
- **Berenang:** badan naik-turun pelan, tangan berputar, riak air melingkar, kaki disembunyikan.

### Gerak antarruangan

Karakter **tidak boleh menembus dinding**. Hitung rute dengan BFS pada graf ruangan di atas: dari ruangan asal, lewati titik pintu berurutan, lalu ke titik tujuan. Kecepatan jalan sekitar 120 unit per detik, interpolasi linear per segmen. Selama berjalan pakai animasi berjalan. Tiba di tujuan, ganti ke animasi aktivitasnya.

### Bubble obrolan

Setiap sekitar 4,5 detik, pilih dua agen yang berada di **ruangan yang sama dan sedang tidak berjalan**. Agen pertama menampilkan bubble di atas kepala, dan sekitar 1,9 detik kemudian agen kedua membalas. Isi kalimat bergantung aktivitas masing-masing (kerja, rapat, bilyard, kolam, ngopi, duduk, rebahan). Ambil daftar kalimat dari file referensi. Bubble putih dengan ekor kecil, hilang setelah sekitar 3 detik.

## Antarmuka

Semua panel bergaya kartun tebal: latar `#1b2742`, border `#0b1220` 3px, sudut membulat, bayangan bawah tegas, tombol utama kuning `#fbbf24`. Font judul **Lilita One**, teks **Inter** (Google Fonts).

1. **Kiri atas:** kartu judul "Kantor AI" dengan ikon rumah. Tepat di bawahnya tombol **Detail Agen** (lihat poin 5).
2. **Kanan atas:** tombol kuning **Tim AI** dengan lencana jumlah agen (8). Menekannya membuka drawer di kanan (lebar 380px).
3. **Drawer, tampilan daftar:** judul "Tim Karyawan AI", satu kartu per agen berisi avatar wajah, nama, peran, status dan lokasi saat ini, serta chip skill. Ketuk kartu untuk membuka chat dan memusatkan kamera ke agen itu.
4. **Drawer, tampilan chat:** header berisi tombol kembali, inisial berwarna, nama, peran, status, tombol tutup. Di bawahnya catatan "Mode demo: balasan agen disimulasikan". Daftar pesan (pesan pengguna kuning rata kanan, balasan agen kelabu-biru rata kiri), tombol saran cepat (Mulai kerja, Rapat di ruang meeting, Main bilyard, Ngopi di pantry, Berenang, Laporan status), kolom ketik dengan tombol kirim, Enter juga mengirim.
5. **Halaman Detail Agen** (layar penuh dengan latar gelap transparan, panel di tengah):
   - Kiri: daftar 8 agen dengan progress bar mini. Ketuk untuk memilih.
   - Kanan: profil (avatar, nama, peran, status, lokasi, chip skill, tombol **Chat** yang menutup halaman dan membuka chat agen itu, tombol tutup), kartu **progres tugas** (judul tugas, persen, progress bar animasi, empat tahap Riset, Kerjakan, Periksa, Kirim), jumlah tugas selesai, lalu **Hasil Output**: deretan nama file hasil dan pratinjau isi file terpilih.
   - Jenis pratinjau: **kode** (Dika) dengan font monospace di kotak gelap, **dokumen** berjudul dan butir (Bima, Sari, Raka, Joko, Lina), **grafik batang** (Tari), **gambar poster** SVG dan **palet warna** (Maya). Kalau agen belum punya hasil, tampilkan contoh dan beri tulisan "Belum ada hasil, ini contoh output."
6. **Kanan bawah:** panel **Hasil Tugas**, bisa dilipat, berisi kartu hasil terbaru di atas: label bidang berwarna agen, nama, jam, judul, ringkasan, dan saat diketuk muncul nama file dan keterangan "Dikerjakan [nama] ([peran]) · menunggu review Bima". Panel ini disembunyikan saat drawer atau halaman Detail Agen terbuka.
7. **Kiri bawah:** tiga tombol kamera (perbesar, perkecil, pusatkan).

Semua tombol ikon wajib punya `aria-label`. Tombol harus berupa elemen `<button>`. Teks harus terbaca (kontras minimal 4,5:1). Tata letak harus tetap nyaman di lebar HP (panel jadi lembar penuh dari bawah).

## Simulasi (Fase 1)

Semua perilaku disimulasikan dari data statis. Pisahkan data dari logika (file `src/data/agents.ts`, `src/data/tasks.ts`, `src/data/dialogs.ts`).

- **Intent chat:** baca teks pengguna dengan regex sederhana. "laporan/status/progres" menjawab status saat ini. "rapat/meeting/diskusi" ke Ruang Meeting. "renang/kolam" ke kolam. "bilyard" ke Ruang Santai (meja bilyard). "kopi/pantry/makan/minum" ke Pantry. "santai/istirahat/break" ke sofa Ruang Santai (bergantian duduk dan rebahan). Selain itu dianggap tugas kerja: agen berjalan ke mejanya, status berubah menjadi "[kata kerja]: [potongan instruksi]", lalu setelah beberapa detik muncul kartu hasil "Selesai sesuai instruksimu".
- **Progres:** tiap detik, agen yang berstatus kerja atau rapat dan tidak berjalan naik 1,5 sampai 4 persen. Saat mencapai 100 persen, buat hasil tugas berikutnya dari daftar tugas agen itu (berputar), tampilkan bubble "Selesai! [judul]", lalu progres kembali 0. Agen yang sedang bilyard, berenang, ngopi, atau bersantai tidak menaikkan progres.
- **Daftar tugas per agen** (tag, judul, ringkasan, nama file) dan isi pratinjau tiap jenis output ada di file referensi. Semua angka dan isinya contoh karangan, jadi beri catatan kecil "Contoh output simulasi".

## Fase 2 (jangan dikerjakan sekarang, hanya siapkan antarmukanya)

Buat antarmuka `AgentBrain` di `src/brain/types.ts`:

```ts
interface AgentBrain {
  sendMessage(agentId: string, text: string): Promise<{ reply: string; action?: AgentAction }>;
  startTask(agentId: string, instruction: string): AsyncIterable<TaskEvent>; // progress, hasil
}
```

Implementasikan `MockBrain` (simulasi di atas) dan sisakan `ClaudeBrain` sebagai kerangka kosong dengan komentar TODO. Rencana Fase 2: server Node kecil (Hono atau Express) yang memegang `ANTHROPIC_API_KEY` dari environment, satu system prompt per peran agen, Bima memecah tugas ke agen lain, progres dikirim lewat SSE, hasil berupa kode, dokumen, data grafik, atau SVG. Frontend tidak pernah memegang kunci.

## Struktur proyek yang diharapkan

```
kantor-ai/
  src/
    main.ts
    world/      (proyeksi isometrik, peta, kamera, rute BFS)
    agents/     (sprite, animasi, perilaku)
    ui/         (panel, drawer, chat, detail, hasil tugas)
    brain/      (AgentBrain, MockBrain, ClaudeBrain kosong)
    data/       (agents, tasks, dialogs)
  public/
  index.html
  package.json
  README.md
  .gitignore
  .env.example
```

README berisi: apa itu Kantor AI, cara menjalankan (`npm install`, `npm run dev`, `npm run build`), kontrol kamera dan chat, struktur proyek, dan rencana Fase 2. `.gitignore` harus mengecualikan `node_modules`, `dist`, dan `.env`. `.env.example` hanya berisi nama variabel tanpa nilai rahasia.

## Kriteria selesai

- `npm run dev` jalan tanpa galat, `npm run build` sukses.
- Kantor tampil isometrik dengan 8 ruangan, furnitur, 8 agen beranimasi, dan kamera bisa geser serta zoom dengan lancar.
- Tidak ada agen yang menembus dinding. Pindah ruangan selalu lewat pintu.
- Semua perintah chat di atas bekerja dan agen menampilkan pose yang benar.
- Bubble obrolan antaragen muncul berkala.
- Panel Tim AI, Hasil Tugas, dan halaman Detail Agen berfungsi seperti dijelaskan.
- Buka aplikasi di browser, ambil tangkapan layar tampilan desktop dan lebar HP, dan periksa sendiri tidak ada elemen yang tumpang tindih atau terpotong sebelum menyatakan selesai.

## Setelah selesai: push ke GitHub

Jalankan langkah ini di terminal, berurutan:

1. `git init` lalu `git add .` lalu `git commit -m "Kantor AI: prototipe visual fase 1"`.
2. Periksa login GitHub dengan `gh auth status`. Kalau belum login, **berhenti dan minta saya menjalankan `gh auth login`**. Jangan meminta atau menyimpan token di file mana pun.
3. Buat repo dengan nama persis **`kantor-ai`**: `gh repo create kantor-ai --private --source=. --remote=origin --push`. Pakai `--private` kecuali saya minta publik.
4. Pastikan berhasil dengan `git remote -v` dan `git log --oneline`, lalu tampilkan URL repo.
5. Pastikan tidak ada `.env`, kunci API, atau `node_modules` yang ikut ter-commit.
