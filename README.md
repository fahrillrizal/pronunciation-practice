# Fonem Practice

Latihan pelafalan bahasa Inggris berbasis web: pilih kata dari CMU ARCTIC,
dengarkan referensi, rekam ucapan, lalu bandingkan durasi dan kecocokan fonem
dengan MFCC + DTW di dalam peramban.

## Kebutuhan

- Node.js 22 atau lebih baru
- CMU ARCTIC untuk penutur `slt` dan `bdl` di `dataset/cmu_us_<speaker>_arctic`
  (`wav/`, `etc/txt.done.data`, dan `utts/`)
- Aset referensi hasil `npm run refs:build` di `public/ref/`

Dataset dan aset tidak disimpan di Git. Jalankan pipeline data sebelum build
pertama.

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Script

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan Next.js |
| `npm run check` | Type-check, lint, pemeriksaan ekspor, dan unit test |
| `npm test` | Unit test `src/core` |
| `npm run refs:build` | Membangun `public/ref/` dan indeks kata dari dataset |
| `npm run annotations:fetch` | Mengunduh anotasi FestVox ke `dataset/*/utts/` |
| `npm run accuracy:measure` | Mengukur boundary error dan diskriminasi DTW |
| `npm run build` | Build statis ke `out/` |

## Pipeline Aset

1. Letakkan CMU ARCTIC di `dataset/cmu_us_slt_arctic` dan
   `dataset/cmu_us_bdl_arctic`.
2. Unduh anotasi fonem: `npm run annotations:fetch`.
3. Bangun aset: `npm run refs:build`.

`refs:build` memilih token yang diapit jeda, memotong audio per kata,
menghitung MFCC, dan menulis `audio.wav`, `mfcc.bin`, serta `annotation.json`
untuk setiap penutur. Hanya kata yang punya deret fonem sama pada kedua penutur
yang masuk indeks.

## Pengukuran Akurasi

```bash
npm run accuracy:measure
```

Skrip ini memakai aset yang sudah ada untuk mengukur:

- error batas fonem internal lewat proyeksi `slt` ↔ `bdl`
- pemisahan `normalizedCost` antara kata yang sama lintas penutur dan kata berbeda
- equal error rate (EER) pada threshold terbaik

Ini proksi teknis, bukan validasi terhadap rekaman pembelajar.

## Build Statis

```bash
npm run build
```

Hasil ada di `out/`. Proyek memakai `output: "export"`, jadi tidak memerlukan
runtime server. Gunakan `npm run dev` untuk pengembangan; `next start` tidak
dipakai untuk konfigurasi export ini.
