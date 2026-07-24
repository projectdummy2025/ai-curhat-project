# Product Context

## Bagian 1: Problem Statement

Dokumen ini menguraikan perumusan masalah (problem statement) yang menjadi landasan pengembangan aplikasi. Analisis didasarkan pada identifikasi masalah utama yang dialami oleh target pengguna.

### Pemetaan Masalah (Problem Formulation)

Tabel berikut memetakan gejala yang dialami pengguna terhadap akar permasalahan psikologis dan sosial yang akan diselesaikan:

| Gejala Pengguna (User Symptoms) | Akar Permasalahan (Root Cause) |
| --- | --- |
| **Kebutuhan Dukungan di Luar Jam Aktif** | **Ketidaktersediaan Layanan 24/7:** Pengguna tidak memiliki akses ke sistem dukungan emosional yang tersedia setiap saat, terutama di luar jam aktif sosial normal. |
| **Keengganan Menerima Penghakiman/Nasihat** | **Ketiadaan Ruang Aman (Safe Space) Objektif:** Pengguna tidak memiliki medium komunikasi yang sepenuhnya objektif, netral, dan bersifat memvalidasi tanpa memberikan penghakiman atau nasihat yang tidak diminta. |
| **Kebutuhan Menjaga Citra Profesional/Sosial** | **Keterbatasan Privasi untuk Kerentanan:** Individu dengan tuntutan peran sosial atau profesional yang tinggi kesulitan menemukan platform dengan privasi mutlak untuk mengekspresikan kerentanan emosional tanpa risiko reputasi. |
| **Keengganan Mengganggu Koneksi Sosial** | **Penumpukan Stres Mikro (Micro-stressors):** Tidak adanya medium yang tepat untuk menyalurkan tekanan emosional berskala kecil karena kekhawatiran dianggap mengganggu (*spamming*) lingkaran sosial terdekat. |

---

### Pernyataan Masalah Utama (Core Problem Statement)

Berdasarkan pemetaan di atas, pernyataan masalah utama yang diselesaikan oleh aplikasi ini dirumuskan sebagai berikut:

> **"Masyarakat modern rentan mengalami penumpukan emosi dan kesepian akibat ketiadaan akses instan terhadap platform komunikasi suportif yang menjamin privasi absolut, ketersediaan 24/7, dan beroperasi sepenuhnya tanpa penghakiman (*judgement-free*)."**

Aplikasi ini diposisikan sebagai medium intervensi awal (preventif) untuk memfasilitasi pelepasan emosi secara aman, bukan sebagai pengganti penanganan psikologis klinis profesional.

---

## Bagian 2: Product Concept (MVP)

Dokumen ini menguraikan konsep utama produk untuk fase Minimum Viable Product (MVP), dengan fokus pada fitur pengunduhan PDF untuk menghindari kerumitan teknis di awal pengembangan.

### Konsep Utama: Single-Thread Chatbot dengan Asisten Resume Psikologis

**1. Pengalaman Pengguna (UX)**
* **Desain Berkelanjutan (Single Thread):** Mengeliminasi fitur sesi obrolan terpisah (*new chat*) guna menciptakan alur komunikasi yang menyerupai percakapan natural dengan satu entitas yang sama secara berkesinambungan.
* **Medium Penyaluran Emosi:** Platform beroperasi sebagai medium ekspresi emosional yang selalu tersedia dengan agen AI yang merespons secara empatik untuk menampung berbagai tingkat keluhan pengguna.

**2. Fitur Inti (Core Features)**
* **Deteksi Pola Emosional:** Sistem AI menganalisis pola percakapan secara proaktif. Apabila terdeteksi eskalasi beban emosional, AI akan menawarkan bantuan untuk merangkum percakapan sebagai persiapan konsultasi profesional.
* **Ekspor Dokumen (PDF):** Atas persetujuan eksplisit pengguna, sistem menghasilkan resume percakapan yang diunduh lokal dalam format PDF. Dokumen ini menjadi referensi mandiri pengguna tanpa integrasi data ke pihak ketiga.

**3. Nilai Proposisi (Value Proposition)**
* **Optimalisasi Konseling Awal:** Mengatasi hambatan komunikasi pada sesi konsultasi psikologis pertama. Resume AI menyajikan data historis dan konteks secara terstruktur agar profesional dapat langsung memahami akar masalah.
* **Peningkatan Kesadaran (Awareness):** Mendorong kesadaran mandiri pengguna untuk mencari bantuan profesional melalui pendekatan interaktif yang suportif dan bebas dari penghakiman.

**4. Batasan Sistem dan Etika (System Boundaries & Ethics)**
* **Orientasi Faktual (Non-Diagnostik):** Dokumen resume (PDF) hanya memuat catatan faktual perilaku dan keluhan (contoh: gangguan pola tidur, kelelahan kerja). Sistem dilarang keras memberikan diagnosis medis. Diagnosis adalah otoritas absolut psikolog.
* **Protokol Intervensi Krisis (Red Flags):** Sistem dibekali detektor risiko. Jika terindikasi intensi membahayakan diri (*self-harm*), alur normal dihentikan dan sistem memicu protokol darurat, seperti mengarahkan ke kontak *hotline* pencegahan krisis.
* **Privasi Mutlak:** Menjamin kerahasiaan data percakapan secara penuh. Pemrosesan data menjadi resume (PDF) hanya dilakukan setelah mendapatkan otorisasi dari pengguna bersangkutan.
