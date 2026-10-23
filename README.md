# Kantor AI - Kantor Virtual AI Isometrik

**Kantor AI** adalah aplikasi web kantor virtual bertampilan isometrik 2D ala game *Clash of Clans*, tempat 8 karyawan AI berjalan, bekerja, berdiskusi dalam rapat, dan bersantai bersama. Pengguna dapat menggeser dan memperbesar kamera, mengetuk karakter untuk mengobrol dan memberi instruksi kerja, serta melihat progres dan pratinjau hasil kerja nyata dari tiap agen.

Implementasi ini mencakup **Fase 1: Visual dan Simulasi Lengkap**, yang dirancang dengan arsitektur terstruktur agar siap diintegrasikan dengan Claude API pada **Fase 2** tanpa perlu menulis ulang antarmuka visual (UI).

---

## Fitur Utama

- **Dunia Isometrik 2D Real-time**:
  - Diberdayakan oleh **PixiJS v8** (WebGL/Canvas) dengan proyeksi isometrik 2D matematis (sudut kemiringan 55 derajat, rotasi 45 derajat).
  - Ringan dan mulus menargetkan 60 FPS pada laptop biasa maupun perangkat seluler.
  - Membatasi `devicePixelRatio` maksimal 2 untuk efisiensi daya baterai.
  - Simulasi otomatis berhenti ketika tab browser tidak aktif untuk menghemat daya.
- **8 Ruangan Kantor Lengkap & Furnitur Unik**:
  - **Kantor Utama**: Meja kerja berderet, monitor komputer, kursi kerja, dan pot tanaman hias.
  - **Ruang Meeting**: Meja bundar rapat besar, 6 kursi meeting, dan papan tulis whiteboard.
  - **Ruang Manager**: Meja pimpinan eksekutif, monitor laptop, kursi manager, sofa tamu, rak buku, dan tanaman hias.
  - **Ruang Kerja**: Partisi kerja cubicle, 4 meja desainer/penulis, monitor warna-warni, dan lemari arsip.
  - **Ruang Santai**: Meja bilyard hijau lengkap dengan stik dan bola, sofa empuk, meja kopi, bean bag santai, dan TV layar lebar.
  - **Kolam Renang**: Kolam air jernih dengan efek riak air dinamis, garis lintasan renang, tangga kolam, kursi berjemur (*sun lounger*), dan payung pantai.
  - **Pantry**: Meja dapur counter, microwave/mesin kopi, kulkas pendingin, meja makan bundar, dan kursi makan.
  - **Ruang Server**: Tiga rak server bertingkat dengan lampu LED hijau berkedip dinamis, dan meja terminal.
  - Label nama melayang di atas setiap ruangan.
- **Navigasi Rute Cerdas (BFS Pathfinding)**:
  - Karakter bergerak antarruangan melewati titik pintu yang telah ditentukan secara berurutan.
  - Karakter tidak pernah menembus dinding.
  - Kecepatan jalan konsisten 120 unit/detik dengan animasi langkah kaki dan tangan mengayun.
- **8 Karyawan AI dengan Karakter Chibi Kartun**:
  1. **Bima** (Manager Proyek): Baju amber, dasi merah, idle di Ruang Manager.
  2. **Sari** (Peneliti): Baju hijau emerald, kacamata riset, idle di Kantor Utama.
  3. **Dika** (Programmer): Baju biru langit, headset programmer, idle di Kantor Utama.
  4. **Maya** (Desainer): Baju merah muda, topi baret artistik, idle di Ruang Kerja.
  5. **Raka** (Penulis): Baju ungu, topi kasual biru, idle rapat di Ruang Meeting.
  6. **Tari** (Analis Data): Baju oranye, kacamata dan sanggul rapi, idle rapat di Ruang Meeting.
  7. **Joko** (Marketing): Baju kuning emas, dasi profesional, idle main bilyard di Ruang Santai.
  8. **Lina** (Customer Service): Baju toska, headset customer care, idle berenang di Kolam Renang.
- **Animasi Pose Karakter**:
  - **Berjalan**: Tubuh naik-turun, tangan dan kaki berayun berlawanan.
  - **Kerja (Duduk)**: Tubuh turun, kaki ditekuk, kedua tangan aktif mengetik keyboard.
  - **Rapat**: Tangan kanan bergerak komunikatif menyampaikan pendapat.
  - **Bilyard**: Tubuh miring, memegang stik bilyard menyodok bola maju-mundur.
  - **Ngopi**: Memegang cangkir kopi dan sesekali meminumnya di pantry.
  - **Duduk Santai & Rebahan**: Pose rebahan horizontal dengan teks "Zzz" melayang naik.
  - **Berenang**: Tubuh terapung naik-turun, tangan berputar mengayuh, riak air putih melingkar di permukaan kolam.
- **Bubble Obrolan Antar-Agen**:
  - Setiap ~4,5 detik, dua agen yang berada di ruangan yang sama saling bertegur sapa dan membalas obrolan sesuai aktivitas mereka.
- **Antarmuka Pengguna Bergaya Kartun Tebal (Gaming Aesthetic)**:
  - **Tim AI Drawer**: Menampilkan kartu profil 8 agen, keahlian, status lokasi, serta ruang obrolan interaktif (dengan saran instruksi cepat).
  - **Halaman Detail Agen**: Panel layar penuh menyajikan profil lengkap, progress bar 4 tahap (*Riset, Kerjakan, Periksa, Kirim*), dan pratinjau dokumen/kode/grafik/poster SVG.
  - **Panel Hasil Tugas**: Panel kanan bawah yang mencatat file hasil kerja terbaru beserta pembuat dan status review.
  - **Kontrol Kamera**: Tombol perbesar (+), perkecil (-), dan pusatkan kamera.

---

## Panduan Kontrol

| Aksi | Mouse / Keyboard | Touchscreen (HP / Tablet) |
|---|---|---|
| **Geser Kamera (Pan)** | Klik kiri & seret mouse (dengan inersia halus) | Seret dengan 1 jari |
| **Zoom Kamera** | Putar roda scroll mouse | Cubit dengan 2 jari (pinch-to-zoom) |
| **Pilih Agen & Chat** | Klik pada karakter di kantor atau kartu tim | Ketuk karakter atau kartu tim |
| **Fokus Cepat** | Klik tombol pusatkan kamera atau pilih agen | Ketuk tombol pusatkan kamera |
| **Kirim Instruksi** | Ketik di kolom chat lalu tekan `Enter` atau tombol kirim | Ketuk tombol kirim kuning |

---

## Struktur Proyek

```
kantor-ai/
  ├── public/
  ├── src/
  │   ├── main.ts              # Titik masuk utama aplikasi, Pixi loop, dan event listener
  │   ├── world/               # Modul dunia virtual
  │   │   ├── iso.ts           # Perhitungan proyeksi matematika isometrik 2D
  │   │   ├── types.ts         # Definisi tipe ruangan, pintu, kotak 3D, dan kamera
  │   │   ├── map-data.ts      # Data 8 ruangan, dinding luar/dalam, furnitur, dan label
  │   │   ├── route.ts         # Pencarian rute graf pintu dengan algoritma BFS
  │   │   ├── camera.ts        # Pengendali kamera gaya Clash of Clans (pan, zoom, clamp)
  │   │   └── world-renderer.ts# Render ruangan, dinding, furnitur, air kolam, dan label
  │   ├── agents/              # Modul karakter dan perilaku
  │   │   ├── agent-sprite.ts  # Pembuatan tekstur vektor GPU dan transform animasi sprite
  │   │   └── agent-manager.ts # Pengelola state 8 agen, progres kerja, dan obrolan
  │   ├── ui/                  # Modul antarmuka pengguna (DOM overlay)
  │   │   ├── styles.css       # Token desain, tipografi, dan tata letak responsif
  │   │   ├── top-bar.ts       # Kartu judul, tombol Detail Agen, dan tombol Tim AI
  │   │   ├── drawer.ts        # Drawer daftar tim dan obrolan instruksi interaktif
  │   │   ├── detail-modal.ts  # Modal detail agen, progres bar, dan pratinjau output
  │   │   ├── activity-log.ts  # Panel collapsible riwayat hasil tugas terbaru
  │   │   ├── camera-controls.ts# Tiga tombol kontrol kamera
  │   │   ├── hint.ts          # Petunjuk kontrol melayang di bawah
  │   │   └── ui-manager.ts    # Koordinator interaksi UI dan sinkronisasi state
  │   ├── brain/               # Modul logika kecerdasan agen
  │   │   ├── types.ts         # Interface AgentBrain, AgentAction, dan TaskEvent
  │   │   ├── MockBrain.ts     # Implementasi simulasi intent regex dan pengerjaan tugas
  │   │   └── ClaudeBrain.ts   # Kerangka kosong terstruktur untuk integrasi Claude API (Fase 2)
  │   └── data/                # Data statis
  │       ├── agents.ts        # Profil 8 agen, keahlian, warna, dan koordinat meja/aktivitas
  │       ├── tasks.ts         # Bank tugas per agen, template pratinjau kode/dokumen/grafik
  │       └── dialogs.ts       # Dialog bubble inisiatif dan balasan obrolan santai
  ├── index.html               # Halaman web utama
  ├── package.json             # Dependensi (PixiJS v8, Vite, TypeScript)
  ├── tsconfig.json            # Konfigurasi TypeScript
  ├── vite.config.ts           # Konfigurasi Vite bundler
  ├── .gitignore               # Pengecualian node_modules, dist, dan .env
  ├── .env.example             # Contoh konfigurasi variabel lingkungan tanpa rahasia
  └── README.md                # Dokumentasi proyek
```

---

## Cara Menjalankan

### Prasyarat
- **Node.js**: Versi 18 ke atas (disarankan Node.js v20+)
- **NPM**: Versi 9 ke atas

### 1. Instal Dependensi
```bash
npm install
```

### 2. Jalankan Server Pengembangan (Dev)
```bash
npm run dev
```
Buka browser di alamat yang tertera (biasanya `http://localhost:5173`).

### 3. Build untuk Produksi
```bash
npm run build
```
Hasil build produksi yang siap di-deploy akan berada di folder `dist/`.

### 4. Pratinjau Build Produksi
```bash
npm run preview
```

---

## Rencana Fase 2 (Integrasi Claude API)

Pada Fase 2, kecerdasan buatan sungguhan akan dihubungkan menggunakan model Claude dari Anthropic:
1. **Backend Server Terpisah (Node / Hono / Express)**:
   - Backend memegang `ANTHROPIC_API_KEY` dari environment variable.
   - Frontend **tidak pernah** memegang API key demi keamanan.
2. **System Prompt Khusus Per Agen**:
   - Tiap agen memiliki persona dan keahlian terperinci (Dika menghasilkan kode nyata, Maya menghasilkan SVG valid, Tari menghasilkan data JSON untuk grafik, dsb.).
3. **Koordinasi Tim via Bima**:
   - Pengguna memberi target besar ke Bima di chat, lalu Bima memecah target menjadi sub-tugas dan mendelegasikannya ke agen lain di ruangan kantor.
4. **Streaming Progres Real-time (SSE)**:
   - Server-Sent Events (SSE) mengirimkan kemajuan bertahap secara langsung ke progress bar antarmuka.
5. **Output Nyata**:
   - Kode yang dapat disalin, dokumen Markdown yang dapat diunduh, grafik interaktif, dan poster SVG siap pakai.
