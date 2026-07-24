# Pembagian Tugas Tim & Batasan Kerja (Boundary Keras)

## 1. Prinsip Utama
Dokumen ini berfungsi untuk membagi batas area kerja guna mencegah terjadinya tumpang tindih pengerjaan kode atau konflik saat penggabungan (merge conflict).
- **Orang Pertama (Backend/AI):** Bertanggung jawab pada logika server, kecerdasan buatan (AI), keamanan, dan penyimpanan ephemeral.
- **Orang Kedua (Frontend):** Bertanggung jawab pada visual antarmuka pengguna (UI), interaksi komponen, serta logika di sisi browser (client-side).
- **Aturan Emas:** Setiap pengembang dilarang mengubah kode di luar folder tanggung jawabnya, kecuali melalui koordinasi berkas di folder `types/` (kontrak data).

---

## 2. Ruang Lingkup Orang Pertama (Backend & AI)
Fokus kerja meliputi pemastian keamanan respon AI (Guardrail), pengelolaan ingatan AI (Memory/Context), serta pemastian bahwa data server bersifat sementara (ephemeral).

### Folder yang Dikelola:
- `/app/api/` (Seluruh endpoint API Backend)
- `/lib/ai/` (Logika deteksi krisis, templat prompt, dan pembuat ringkasan)
- `/lib/db/` (Koneksi database/Vercel KV)

### Daftar Rencana Pengembangan:
- **Pilar 1 (Guardrail):** Pembuatan deteksi krisis 3 lapis (Regex → LLM Classifier JSON → Hardcoded Fallback).
- **Pilar 2 (Konteks):** Pembuatan mekanisme Sliding Window (10 pesan terakhir) dan Auto-Summarization (rangkuman otomatis per 20 pesan).
- **Database Server:** Konfigurasi Vercel KV untuk menyimpan `current_summary` dan `recent_messages` secara terenkripsi/aman dengan mekanisme penghapusan otomatis.
- **Endpoints API:**
  - `POST /api/chat` (Menangani streaming AI + evaluasi Guardrail).
  - `GET /api/export-data` (Menyalurkan ringkasan data tanpa meninggalkan log).

---

## 3. Ruang Lingkup Orang Kedua (Frontend & Client)
Fokus kerja meliputi pembangunan antarmuka pengguna yang responsif, pemeliharaan privasi mutlak di browser, serta pemrosesan dokumen PDF di sisi klien.

### Folder yang Dikelola:
- `/app/(client-pages)/` (Halaman visual)
- `/components/` (Komponen UI seperti chat bubble, tombol, dan modal)
- `/lib/pdf/` (Penyusunan templat dan generator PDF)
- `/lib/local-vault/` (Manajemen IndexedDB)

### Daftar Rencana Pengembangan:
- **Antarmuka Utama & Streaming:** Membuat UI Chat interaktif dan menghubungkan Vercel AI SDK untuk efek streaming obrolan.
- **Pilar 3 (Local Vault):** Implementasi database lokal IndexedDB (via Dexie.js) untuk menyimpan riwayat lengkap secara fisik di gawai pengguna.
- **Pilar 3 (PDF Export):**
  - Mendesain template visual "Resume Psikologis Faktual" (Non-diagnostik).
  - Menyiapkan generator PDF client-side menggunakan library html2pdf.js.
- **UI Tanggap Darurat:** Membuat pop-up krisis (`CrisisModal`) jika backend memberikan indikasi `is_safe: false`.

### Ketentuan Penting Frontend:
- Setiap berkas komponen di folder `/components/` dan `/app/` wajib menyertakan direktif `"use client";` pada baris pertama berkas untuk memastikan eksekusi murni di sisi browser.

---

## 4. Titik Kolaborasi (Kontrak Data)
Titik temu utama kedua belah pihak berada pada direktori `types/`.
- **Berkas:** `/types/index.ts`
- **Tujuan:** Menampung spesifikasi interface TypeScript bersama seperti `Message`, `Summary`, dan `GuardrailResponse`.
- **Ketentuan:** Setiap kali terdapat perubahan struktur JSON dari sisi Backend, Orang Pertama wajib berkoordinasi dengan Orang Kedua untuk memperbarui interface TypeScript pada berkas tersebut sebelum dilakukan deployment.

---

## 5. Rencana Cadangan (Escape Hatch)
Bila salah satu pihak menemui kendala teknis yang memakan waktu lama, gunakan alternatif berikut demi kelancaran demo:
- **Frontend (Kendala PDF Engine):** Alihkan dari `html2pdf.js` ke pemanfaatan fitur `window.print()` bawaan browser dengan penyesuaian CSS media print.
- **Backend (Kendala Vercel KV):** Alihkan database server ke variabel `Map` in-memory sementara.
