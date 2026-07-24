# Panduan Alur Kerja & Eksekusi Fitur

## 1. Tujuan Dokumen
Dokumen ini berfungsi sebagai peta jalan alur kerja tim pengembang (Orang Pertama dan Orang Kedua) agar proses implementasi kode berjalan secara terstruktur, meminimalkan konflik integrasi, dan menjaga kualitas setiap modul sesuai spesifikasi arsitektur.

## 2. Urutan Membaca Dokumen Referensi
Sebelum memulai penulisan kode, seluruh tim sangat disarankan membaca dokumen-dokumen berikut secara berurutan:

### Level 1: Konsep Dasar Produk (Baca Pertama)
1. **`product-concept.md`** → Memahami visi, fitur inti, serta batasan etika produk (non-diagnostik, privasi mutlak).
2. **`problem-statement.md`** → Memahami akar masalah pengguna dan posisi produk sebagai intervensi preventif.

### Level 2: Logika AI & Manajemen Konteks (Baca Kedua)
3. **`guardrail-spec.md`** → Memahami arsitektur deteksi krisis 3 lapis untuk keamanan pengguna.
4. **`context-management-spec.md`** → Memahami mekanisme memori AI (Sliding Window & Auto-Summarization).

### Level 3: Fitur Sisi Klien & Privasi (Baca Ketiga)
5. **`pdf-export-spec.md`** → Memahami arsitektur rendering PDF di sisi browser serta penggunaan IndexedDB.

### Level 4: Referensi Arsitektur & Teknologi (Baca Terakhir)
6. **`tech-stack-reference.md`** → Memahami struktur folder Next.js, pembagian peran kerja, serta rencana cadangan (escape hatches).

## 3. Kriteria Kelayakan (Quality Gates)
Sebelum beralih dari satu fase ke fase berikutnya, pastikan poin-poin berikut telah dipahami dan dipenuhi:

### Kriteria Fondasi Produk
- [ ] Produk bersifat **single-thread** (tidak menyediakan fitur "chat baru" atau multi-thread).
- [ ] Ringkasan PDF berupa **resume faktual**, bukan lembar diagnosis medis/klinis.
- [ ] Aspek **privasi mutlak** terpenuhi dengan tidak menyimpan riwayat chat lengkap di database server.

### Kriteria Logika AI
- [ ] Deteksi krisis memiliki 3 lapisan pengamanan (Regex → LLM Classifier → Hardcoded Fallback).
- [ ] Manajemen konteks menggunakan batas **10 pesan terakhir** (Sliding Window) dan pembuatan ringkasan otomatis setiap **20 pesan** (Auto-Summarization).
- [ ] Hasil ringkasan `current_summary` bebas dari istilah medis, klinis, atau diagnosis psikologis.

### Kriteria Fitur Klien & Ekspor
- [ ] Dokumen PDF dihasilkan **100% di browser** pengguna (menggunakan library `html2pdf.js` atau `jspdf`).
- [ ] Riwayat obrolan lengkap disimpan secara aman di **IndexedDB** lokal (bukan LocalStorage).
- [ ] Endpoint data ekspor (`/api/export-data`) tidak meninggalkan jejak atau log di server.

### Kriteria Implementasi Teknis
- [ ] Batas folder jelas: `/app/api/` untuk Orang Pertama (Backend/AI), dan `/components/` untuk Orang Kedua (Frontend).
- [ ] Seluruh komponen frontend pada folder `/components/` dan `/app/` memiliki direktif `"use client";` pada baris pertama.
- [ ] Rencana cadangan siap digunakan jika terjadi kendala teknis (misalnya menggunakan `window.print()` jika PDF engine bermasalah).

## 4. Alur Pengembangan Bertahap (Sprint Phase)

### Fase 1: Setup Infrastruktur & Tipe Data
1. Inisialisasi proyek Next.js dengan Tailwind CSS.
2. Buat struktur folder proyek sesuai panduan di `tech-stack-reference.md`.
3. Definisikan tipe data dan interface dasar (`Message`, `Summary`, `GuardrailResponse`) pada `types/index.ts`.
4. **STOP.** Lakukan peninjauan struktur folder dan pastikan tipe data sudah disepakati bersama.

### Fase 2: Implementasi Logika Guardrail (Tugas Orang Pertama)
1. Buat fungsi deteksi kata kunci eksplisit `checkExplicitKeywords()` di `lib/ai/guardrail.ts`.
2. Buat fungsi klasifikasi risiko implisit `classifyImplicitRisk()` menggunakan Vercel AI SDK.
3. Buat fungsi protokol krisis `triggerCrisisProtocol()` yang mengembalikan pesan darurat terprogram.
4. **STOP.** Jalankan uji coba fungsionalitas deteksi krisis sebelum masuk ke modul berikutnya.

### Fase 3: Implementasi Manajemen Konteks (Tugas Orang Pertama)
1. Buat utilitas penggabung memori `buildContextPrompt()` (menggabungkan ringkasan lama dengan 10 pesan terbaru).
2. Buat mekanisme pembaruan ringkasan otomatis `triggerSummarization()`.
3. Hubungkan penyimpanan data ringkasan dan pesan terdekat menggunakan Vercel KV.
4. **STOP.** Pastikan alur sliding window dan auto-summarization berjalan lancar tanpa kebocoran data chat lengkap.

### Fase 4: Ekspor PDF & Vault Lokal (Tugas Orang Kedua)
1. Buat komponen utilitas `PDFGenerator` di `lib/pdf/` dengan library pilihan (misal: `html2pdf.js`).
2. Sediakan endpoint `/api/export-data` untuk menyalurkan data ringkasan secara aman dan cepat.
3. Desain template HTML/CSS PDF sesuai spesifikasi visual di `pdf-export-spec.md`.
4. Hubungkan dengan IndexedDB lokal untuk memuat dan merender riwayat obrolan lengkap.
5. **STOP.** Pastikan file PDF terunduh dengan struktur yang rapi dan aman di browser.

### Fase 5: Integrasi UI & Antarmuka Utama (Kolaborasi)
1. Rancang komponen chat `ChatInterface` dengan efek respons mengalir (streaming) menggunakan Vercel AI SDK.
2. Integrasikan modal darurat (`CrisisModal`) agar muncul saat terdeteksi indikasi krisis.
3. Hubungkan tombol ekspor di UI dengan utilitas `PDFGenerator`.
4. **STOP.** Lakukan pengujian akhir secara menyeluruh (End-to-End Testing).

## 5. Batasan Ketat (Red Rules)
1. **Dilarang keras** menyimpan riwayat chat lengkap di database server. Server hanya diizinkan menyimpan `summary` dan 10 pesan terakhir.
2. **Dilarang keras** menuliskan diagnosis medis atau psikologis di dalam ringkasan `current_summary` maupun berkas PDF.
3. **Dilarang keras** memproses tanggapan dari LLM utama jika pesan pengguna terdeteksi masuk kategori krisis oleh sistem Guardrail.
4. **Dilarang keras** menggunakan direktif `"use client";` pada berkas API Routes (`app/api/`).
5. **Dilarang keras** membuat fitur "chat baru" atau multi-thread.

## 6. Panduan Penggunaan
Gunakan alur panduan ini sebagai checklist utama saat berdiskusi, merencanakan tugas, atau melakukan peninjauan kode di setiap akhir fase pengembangan.
Pastikan setiap fase selesai dengan baik dan lolos verifikasi sebelum memulai fase berikutnya.
