# Spesifikasi Teknis: Manajemen Konteks (Single-Thread)

## 1. Konteks & Keputusan Arsitektur
Produk ini adalah *chatbot single-thread* dengan aturan **"Privasi Mutlak"** dan batasan biaya *token*. 
- **Keputusan**: TIDAK menggunakan RAG (*Retrieval-Augmented Generation*) atau *Vector Database*. RAG melanggar privasi (menyimpan *embedding* di DB eksternal) dan tidak cocok untuk aliran emosi *single-thread*.
- **Solusi**: Menggunakan kombinasi **Sliding Window** (memori jangka pendek) dan **Auto-Summarization** (memori jangka panjang).

## 2. Mekanisme 1: Sliding Window (Jendela Geser)
Sistem hanya menyertakan pesan-pesan terbaru dalam *prompt* aktif untuk mengontrol biaya *token* secara ketat.
- **Batas Jendela (Window Size)**: 10 pesan terakhir (5 pasang *user-assistant*).
- **Logika**: 
  - Saat menyusun *prompt* untuk LLM utama, ambil hanya 10 pesan terakhir dari database.
  - Pesan ke-11 dan seterusnya **dibuang dari prompt aktif** (namun tetap aman di *local storage* klien untuk ekspor PDF).

## 3. Mekanisme 2: Auto-Summarization (Rangkuman Otomatis)
Untuk mencegah AI "lupa" konteks emosional awal saat *thread* memanjang, sistem akan membuat rangkuman berjalan (*running summary*).
- **Pemicu (Trigger)**: Setiap kali jumlah pesan di *database* mencapai kelipatan 20 (10 pasang).
- **Proses**: 
  1. Sistem mengambil 10 pesan *terlama* yang akan segera keluar dari *Sliding Window*.
  2. Memanggil LLM sekunder (model murah/cepat, misal: `gpt-4o-mini` atau `gemini-flash`) untuk merangkumnya.
  3. Menyimpan hasil rangkuman ke kolom `current_summary` di database.
- **Aturan Rangkuman (Sesuai Product Concept)**:
  - Harus berfokus pada **fakta perilaku dan konteks emosional** (misal: *"Pengguna merasa cemas karena deadline, pola tidur terganggu, merasa tidak didengar pasangan"*).
  - **STRICTLY NON-DIAGNOSTIC**: Dilarang keras menggunakan istilah medis/psikologis (misal: *"Pengguna depresi"*, *"Pengguna mengalami anxiety disorder"*).

## 4. Struktur Prompt Akhir (Payload ke LLM Utama)
Saat pengguna mengirim pesan baru, Backend harus menyusun *array of messages* dengan struktur persis seperti ini sebelum dikirim ke API LLM:

```json
[
  {
    "role": "system",
    "content": "Kamu adalah asisten pendengar empatik. Berikut adalah konteks emosional dan historis pengguna saat ini: \n\n[CONTEXT_SUMMARY]: Pengguna sedang cemas terkait deadline kerja dan merasa tidak didukung pasangannya. \n\nTetaplah berfokus pada validasi emosi. Jangan memberikan diagnosis medis."
  },
  {
    "role": "user",
    "content": "Pesan user ke-6 (dari sliding window)"
  },
  {
    "role": "assistant",
    "content": "Respons AI ke-6"
  },
  // ... (hingga pesan ke-10 / batas sliding window)
  {
    "role": "user",
    "content": "Pesan user terbaru (Input saat ini)"
  }
]
```
*Catatan: Jika `current_summary` masih kosong (percakapan baru dimulai), abaikan bagian `[CONTEXT_SUMMARY]`.*

## 5. Instruksi Eksekusi untuk AI Agent
1. **Buat Fungsi `buildContextPrompt(userId)`**:
   - Ambil `current_summary` dari DB.
   - Ambil 10 pesan terakhir dari DB.
   - Gabungkan ke dalam format *array of messages* seperti di Bagian 4.
2. **Buat Fungsi `triggerSummarization(userId)`**:
   - Cek jumlah total pesan. Jika >= 20 dan belum dirangkum, ambil 10 pesan terlama.
   - Buat *prompt* khusus untuk LLM murah: *"Rangkum percakapan berikut menjadi 1 paragraf konteks emosional dan faktual. JANGAN gunakan istilah diagnosis medis. Fokus pada perasaan dan situasi pengguna."*
   - Update `current_summary` di DB.
3. **Error Handling**: 
   - Jika proses *summarization* gagal (API error), sistem harus *fail-safe*: lanjutkan dengan *sliding window* saja, jangan blokir percakapan pengguna.
