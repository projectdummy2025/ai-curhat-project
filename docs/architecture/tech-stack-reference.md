# Spesifikasi Referensi: Tech Stack & Arsitektur (All-in Next.js)

## 1. Filosofi & Sifat Dokumen
Dokumen ini adalah **referensi arsitektur pragmatis**, bukan mandat kaku. 
**Prinsip Utama:** Kecepatan eksekusi dan stabilitas mental tim > kesempurnaan arsitektur. Kita menggunakan **Next.js (App Router)** agar Frontend dan Backend menyatu dalam satu *codebase* dan satu *deployment* di Vercel. Ini menghilangkan masalah CORS, *split-hosting*, dan konfigurasi server rumit. Jika ada *tools* yang macet > 2 jam, gunakan "Escape Hatch" yang disediakan.

## 2. Susunan Tech Stack (The Stack)
Stack ini dirancang untuk ekosistem Vercel, mendukung AI *streaming* tanpa *timeout*, dan memisahkan logika *client* vs *server* secara tegas.

### A. Framework & Orkestrasi
- **Framework Utama:** `Next.js` (App Router). Menangani UI (Frontend) dan API Routes/Server Actions (Backend) dalam satu proyek.
- **Hosting:** `Vercel` (Zero-config deployment, optimal untuk Next.js & AI Streaming).
- **AI Orchestration:** `Vercel AI SDK` (`ai` package). Menangani *streaming* respons AI, manajemen *prompt*, dan *structured output* (JSON) untuk Guardrail.

### B. Database & Penyimpanan
- **Server-Side (Ephemeral State):** `Vercel KV` (Redis) atau `Supabase` (PostgreSQL). 
  *(Hanya menyimpan `current_summary` dan `recent_messages` untuk Sliding Window. Tidak menyimpan riwayat penuh).*
- **Client-Side (Local Vault):** `IndexedDB` (via library `Dexie.js` or `idb`). 
  *(Menyimpan `full_chat_history` di browser pengguna untuk menjamin Privasi Mutlak dan mendukung ekspor PDF).*

### C. Frontend & Rendering
- **Styling:** `Tailwind CSS` (Cepat untuk prototyping UI).
- **PDF Engine:** `html2pdf.js` atau `jspdf` + `html2canvas`. Berjalan 100% di sisi klien (*browser*).

## 3. Struktur Folder & Pembagian Tugas (Boundary Keras)
Meskipun dalam satu proyek Next.js, kita buat batas logis yang tegas agar tidak saling mengganggu.

```text
project-root/
├── app/                        # Next.js App Router
│   ├── api/                    # [TUGAS ORANG PERTAMA - BACKEND/AI]
│   │   ├── chat/               # Endpoint streaming chat & Guardrail logic
│   │   ├── summarize/          # Endpoint auto-summarization
│   │   └── export-data/        # Endpoint fetch summary & recent messages (JSON)
│   │
│   ├── (client-pages)/         # [TUGAS ORANG KEDUA - FRONTEND]
│   │   ├── page.tsx            # Halaman utama chat
│   │   └── layout.tsx          # Root layout
│   │
│   └── layout.tsx              # Root layout global
│
├── components/                 # [TUGAS ORANG KEDUA - FRONTEND]
│   ├── chat/                   # UI Chat, Message Bubble, Streaming effect
│   ├── modals/                 # Modal Red Flag, Modal Export PDF
│   └── ui/                     # Button, Input, dll (Tailwind)
│
├── lib/                        # Logika Inti (Terpisah)
│   ├── ai/                     # [TUGAS ORANG PERTAMA] Guardrail logic, Prompt templates
│   ├── db/                     # [TUGAS ORANG PERTAMA] Koneksi Vercel KV / Supabase
│   ├── pdf/                    # [TUGAS ORANG KEDUA] Template HTML PDF, html2pdf helper
│   └── local-vault/            # [TUGAS ORANG KEDUA] IndexedDB helper (Dexie.js)
│
├── types/                      # Shared TypeScript interfaces (Message, Summary)
├── docs/                       # Spesifikasi Arsitektur (Pilar 1-3)
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## 4. Aturan Main Tim (Boundary Keras)
1. **Orang Pertama (Backend/AI):** Hanya menyentuh folder `app/api/`, `lib/ai/`, dan `lib/db/`. Orang Pertama tidak memikirkan CSS atau cara PDF dirender.
2. **Orang Kedua (Frontend):** Hanya menyentuh folder `components/`, `lib/pdf/`, `lib/local-vault/`, dan halaman di `app/`. 
   - **ATURAN EMAS:** Setiap file komponen yang Orang Kedua buat **WAJIB** memiliki baris `"use client";` di paling atas file. Ini memaksa komponen tersebut berjalan murni di browser (seperti Vite/React biasa), sehingga Orang Kedua tidak perlu pusing memikirkan Server Components Next.js.
3. **Kontrak Data adalah Hukum:** Sepakati di awal struktur JSON untuk `Message` dan `Summary` di folder `types/`. 

## 5. Escape Hatches (Pintu Darurat untuk Lomba)
Jika terjebak, gunakan solusi ini untuk tetap bisa demo:
1. **PDF Gagal/Crash:** Ganti `html2pdf.js` dengan `window.print()` + CSS `@media print` yang di-*styling* rapi.
2. **Vercel KV/DB Gagal:** Gunakan `Map` in-memory di API Routes untuk demo (data hilang saat server restart, tapi cukup untuk presentasi juri).
3. **AI SDK Error:** Fallback ke `fetch` API standar ke OpenAI/Google dengan parsing JSON manual.

## 6. Instruksi Inisialisasi untuk AI Agent
1. Inisialisasi proyek Next.js: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"`
2. Install dependensi inti: `npm install ai @ai-sdk/openai dexie html2pdf.js` (sesuaikan provider AI jika perlu).
3. Buat struktur folder `app/api/`, `components/`, `lib/`, dan `types/` sesuai diagram di atas.
4. Buat file `types/index.ts` berisi interface dasar (`Message`, `Summary`, `GuardrailResponse`).
