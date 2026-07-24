# Spesifikasi Teknis: Generasi PDF & Privasi Mutlak (Client-Side)

## 1. Konteks & Filosofi Arsitektur
Sesuai dengan *Problem Statement* (kebutuhan privasi mutlak untuk kerentanan) dan *Product Concept* (resume faktual non-diagnostik), fitur ekspor PDF tidak boleh mengandalkan server untuk merender dokumen. 
**Aturan Emas:** Server hanya bertindak sebagai "pipa" data. Seluruh proses pengambilan riwayat, penyusunan struktur, hingga *rendering* file PDF wajib terjadi 100% di sisi klien (*browser*). Server tidak pernah melihat, menyimpan, atau meng-*cache* file PDF.

## 2. Arsitektur 3 Lapis (Client-Side Execution)

### Lapis 1: Transfer Data Ephemeral (Server ke Client)
Data harus mengalir dari server ke klien tanpa meninggalkan jejak di infrastruktur server.
- **Kontrak HTTP:** Endpoint penyedia data (misal: `GET /api/thread/export`) wajib merespons dengan *header* ketat:
  - `Cache-Control: no-store, no-cache, must-revalidate`
  - `Pragma: no-cache`
- **Aturan Server:** *Route* ini harus di-*bypass* dari *middleware logging* apa pun. Data hanya exist di RAM server selama milidetik, lalu dihancurkan.

### Lapis 3: Rendering Engine & Manajemen Memori
Mengubah DOM teks yang panjang menjadi PDF di browser rentan terhadap *crash* dan *pagination* yang berantakan.
- **Chunking/Virtualisasi:** Jangan merender seluruh riwayat sekaligus ke DOM. Bagi data menjadi *chunk* (misal: per 20-30 pesan). Render *chunk* pertama ke PDF, hapus dari DOM, lanjutkan ke *chunk* berikutnya, lalu *merge* file PDF di memori.
- **CSS Print Media Queries:** Wajib menerapkan aturan CSS untuk *engine* PDF:
  - `page-break-inside: avoid;` pada setiap blok pesan (agar satu balasan chat tidak terbelah konyol antar halaman).
  - `page-break-after: always;` pada batas antar *chunk* jika diperlukan.

## 3. Struktur Konten PDF (Sesuai Product Concept)
PDF ini adalah "Asisten Resume Psikologis". Konten tidak boleh berupa *dump* chat mentah, melainkan dokumen terstruktur yang disiapkan untuk profesional. AI Coder wajib membuat *template* dengan struktur berikut:

1. **Header Dokumen:**
   - Judul: "Resume Konteks Emosional & Perilaku"
   - Metadata: Tanggal Ekspor, Durasi Thread (misal: "Thread berjalan sejak X hari").
2. **Bagian 1: Ringkasan Eksekutif (Faktual):**
   - Mengambil data dari `current_summary` (hasil *auto-summarization*).
   - Berisi pola perilaku dan keluhan utama (misal: "Melaporkan gangguan tidur 3x minggu ini, menyebutkan tekanan deadline").
3. **Bagian 2: Transkrip Pilihan (Kutipan Relevan):**
   - Hanya menampilkan 5-10 kutipan pesan terakhir yang paling menyoroti akar masalah, bukan seluruh percakapan.
4. **Bagian 3: Disclaimer Hukum & Etika (WAJIB & STATIS):**
   - Teks: *"Dokumen ini adalah catatan faktual perilaku dan keluhan yang dirangkum secara otomatis. Dokumen ini BUKAN diagnosis medis atau psikologis. Otoritas diagnosis dan penanganan klinis berada sepenuhnya pada profesional berlisensi."*

## 4. Instruksi Eksekusi untuk AI Agent
1. **Buat Utility IndexedDB:** Buat fungsi untuk menyimpan, mengambil, dan menghapus *full chat history* di IndexedDB.
2. **Buat Fungsi Export Handler:** 
   - Fetch data JSON dari endpoint server (pastikan *header* anti-cache sudah diset).
   - Bagi array pesan menjadi *chunks*.
3. **Buat Template HTML/CSS PDF:** 
   - Terapkan CSS *print media queries* (`page-break-inside: avoid`).
   - Pastikan *layout* memisahkan Bagian 1, 2, dan 3 secara visual rapi.
4. **Integrasi Library PDF:** Gunakan *library* seperti `html2pdf.js` atau `jspdf` + `html2canvas`. Pastikan proses *render* dilakukan secara asinkron (*await*) untuk mencegah *UI thread* browser *freeze*.
5. **Cleanup:** Setelah file diunduh, pastikan tidak ada variabel besar yang tersisa di memori *global state* frontend.
