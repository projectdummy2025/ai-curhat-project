# Spesifikasi Teknis: Sistem Guardrail (Red Flag) MVP

## 1. Konteks & Tujuan
Produk ini adalah *chatbot* kesehatan mental *single-thread* dengan privasi mutlak. Sistem Guardrail bertujuan mendeteksi indikasi krisis (*self-harm*, ideasi bunuh diri) secara *real-time* dan menghentikan alur AI utama untuk mencegah respons yang berbahaya atau tidak etis. 

## 2. Arsitektur 3 Lapis (Pipeline Eksekusi)
Sistem harus memproses *user input* secara berurutan. Jika salah satu lapis memicu *flag*, eksekusi ke lapis berikutnya atau ke LLM utama dihentikan (*short-circuit*).

### Lapis 1: Pre-check Berbasis Regex/Keyword (Synchronous & Cepat)
- **Fungsi**: Filter cepat untuk kata kunci eksplisit sebelum memanggil API LLM (menghemat *cost* dan *latency*).
- **Implementasi**: Buat array/list kata kunci bahasa Indonesia.
- **Daftar Keyword (Contoh)**: 
  `["bunuh diri", "ingin mati", "akhiri hidup", "tidak kuat hidup", "cara mati", "loncat dari gedung", "minum racun"]`
- **Logika**: 
  ```javascript
  const hasExplicitFlag = keywords.some(keyword => userInput.toLowerCase().includes(keyword));
  if (hasExplicitFlag) return triggerCrisisProtocol();
  ```

### Lapis 2: Klasifikasi Nuansa via LLM (Structured Output)
- **Fungsi**: Mendeteksi ideasi implisit atau konteks emosional yang luput dari Lapis 1 (misal: "Semua orang akan lebih bahagia tanpaku").
- **Implementasi**: Gunakan LLM utama dengan *System Prompt* khusus dan paksa output dalam format JSON (Structured Output).
- **System Prompt untuk Layer 2**:
  ```text
  Anda adalah modul klasifikasi keamanan. Tugas Anda MURNI menganalisis apakah pesan pengguna mengandung indikasi krisis, self-harm, atau ideasi bunuh diri (baik eksplisit maupun implisit). 
  JANGAN memberikan respons terapeutik. 
  Evaluasi pesan berikut dan kembalikan HANYA dalam format JSON yang valid.
  ```
- **JSON Schema Output**:
  ```json
  {
    "is_safe": boolean, // true jika aman, false jika terdeteksi krisis
    "confidence": number, // 0.0 hingga 1.0
    "reason": string // Alasan singkat deteksi (maks 10 kata)
  }
  ```
- **Logika**: 
  ```javascript
  const llmResponse = await callLLM(classificationPrompt);
  if (!llmResponse.is_safe) return triggerCrisisProtocol();
  ```

### Lapis 3: Protokol Krisis (Hardcoded Fallback)
- **Fungsi**: Menampilkan respons darurat yang empatik, tegas, dan menyediakan kontak profesional. AI tidak boleh berimprovisasi di tahap ini.
- **Implementasi**: *Bypass* LLM utama. Kembalikan *payload* statis ke *frontend*.
- **Payload Respons**:
  ```json
  {
    "type": "crisis_intervention",
    "message": "Kami mendengar kamu sedang sangat berat, dan keamananmu adalah prioritas utama saat ini. Chatbot ini tidak dilengkapi untuk menangani krisis. Tolong jangan bertindak apapun sekarang, dan segera hubungi layanan profesional yang bisa membantumu:\n\n📞 119 (ext. 8) - Layanan Darurat\n📞 021-7256526 / 0811-8450-245 - Into The Light Indonesia\n📞 112 - Call Center Emergency",
    "show_hotline_ui": true
  }
  ```

## 3. Kontrak Data & Edge Cases (Aturan untuk AI Coder)
1. **Privasi Mutlak**: Data percakapan yang memicu Lapis 3 **TIDAK BOLEH** disimpan ke database server. Hanya log sistem (timestamp) untuk audit, tanpa menyimpan isi pesan.
2. **Penanganan False Positive**: Jika Lapis 2 mengembalikan `is_safe: false` dengan `confidence < 0.7`, sistem boleh melempar peringatan lunak (*soft warning*) alih-alih memblokir total, atau meminta konfirmasi pengguna. (Opsional untuk MVP, bisa di-hardcode `is_safe: false` langsung ke Lapis 3 untuk keamanan maksimal).
3. **Non-Diagnostik**: Pastikan *reason* di Lapis 2 tidak pernah mengandung klaim medis (misal: "Pengguna depresi berat"). Gunakan deskripsi perilaku (misal: "Menyebutkan keinginan mengakhiri hidup").
4. **State Management**: Saat Lapis 3 terpicu, *state* UI di *frontend* harus mengunci input teks pengguna hingga mereka menutup modal darurat atau mengonfirmasi keselamatan.

## 4. Instruksi Eksekusi untuk AI Agent
1. Buat fungsi utilitas untuk Lapis 1 (`checkExplicitKeywords`).
2. Buat fungsi untuk memanggil LLM dengan *schema* JSON untuk Lapis 2 (`classifyImplicitRisk`).
3. Buat fungsi *handler* utama (`processUserMessage`) yang menggabungkan Lapis 1, Lapis 2, dan Lapis 3 secara berurutan.
4. Pastikan *error handling* ada: Jika API LLM gagal (timeout/500), sistem harus *fail-safe* (anggap aman untuk lanjut ke LLM utama, atau tampilkan pesan error umum, jangan tampilkan krisis palsu).
