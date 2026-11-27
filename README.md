# WhatsApp AI Bot (Baileys + Multi-Provider AI)

Bot WhatsApp cerdas berbasis Node.js menggunakan `@whiskeysockets/baileys` dengan integrasi AI multi-provider (GutsAI, Gemini, Groq, OpenAI, DeepSeek, OpenRouter, Ollama) melalui standar OpenAI-compatible interface.

---

## 🔒 Panduan Distribusi Aman (PENTING)

Project ini dirancang agar **bisa dibagikan ke orang lain tanpa membocorkan API Key atau Sesi Akun WhatsApp Anda**:

1. **JANGAN BAGIKAN FILE `.env`**:
   - File `.env` berisi API Key pribadi Anda. File ini sudah dilindungi di [`.gitignore`](.gitignore).
2. **JANGAN BAGIKAN FOLDER `auth_info_baileys/`**:
   - Berisi sesi login WA. Jika terbagikan, akun Anda bisa dibajak.
3. **CARA MEMBAGIKAN PROYEK**:
   Jalankan perintah berikut sebelum membagikan ke orang lain:
   ```bash
   npm run export
   ```
   Perintah ini akan membuat salinan bersih di folder `dist-shareable/` (bebas dari `.env`, `auth_info_baileys/`, dan `node_modules/`). Anda bisa langsung mengompres (ZIP) folder `dist-shareable` tersebut dan membagikannya. Penerima cukup klik dua kali file `setup.bat`.

---

## 🚀 Fitur Utama

- 🧠 **Multi-Turn Memory (Auto-Expire TTL)**: Bot mengingat riwayat percakapan sebelumnya. Memori otomatis dibersihkan jika tidak aktif selama 30 menit (mencegah kebocoran RAM).
- 🖼️ **Sticker Maker (`.s` / `.sticker`)**: Konversi foto yang dikirim atau di-quote menjadi stiker WhatsApp berkualitas tinggi secara instan.
- 🎨 **AI Image Generator (`.gambar <deskripsi>`)**: Menghasilkan gambar ilustrasi baru secara gratis berbasis AI.
- 👁️ **Vision / Multimodal**: Kirim foto/gambar dengan caption `.ai <perintah>` untuk dianalisis oleh AI.
- 📚 **Pencarian Ensiklopedia (`.cari <topik>`)**: Terkoneksi langsung ke Wikipedia Bahasa Indonesia.
- 🌤️ **Laporan Cuaca Real-Time (`.cuaca <kota>`)**: Menampilkan suhu, kelembapan, dan angin via Open-Meteo.
- 👥 **Fitur Moderasi Grup (`.tagall`, `.hidetag`, Anti-Link)**: Memanggil semua anggota grup dan auto-delete link grup spam.
- 🛡️ **Proteksi Spam & Anti-Banned**: Dilengkapi cooldown per pengguna (3 detik) untuk mencegah banned nomor dari Meta.
- 🔄 **Dynamic Model Switcher**: Ganti model AI secara langsung via chat WhatsApp tanpa me-restart bot (`.model <nama_model>`).
- 📊 **Monitoring Sistem**: Cek uptime, pemakaian RAM, dan total kontak via `.status`.
- ✍️ **Indikator Sedang Mengetik**: Menampilkan teks "sedang mengetik..." secara stabil selama AI memproses jawaban.

---

## 🛠️ Instalasi Cepat

### Pengguna Windows:
1. Klik dua kali **`setup.bat`** (otomatis memeriksa Node.js, membuat `.env`, dan mengunduh dependensi).
2. Buka file `.env` dan masukkan API Key Anda.
3. Klik dua kali **`start.bat`** untuk menjalankan bot.

### Pengguna Linux / macOS:
```bash
chmod +x setup.sh
./setup.sh
npm start
```

---

## 📋 Daftar Perintah di WhatsApp

| Perintah | Deskripsi | Hak Akses |
|---|---|---|
| `.ai <pertanyaan>` | Tanya jawab cerdas ke model AI dengan ingatan obrolan | Semua |
| `[Kirim Foto] + .s` | Mengubah foto menjadi stiker WhatsApp | Semua |
| `.gambar <deskripsi>` | Membuat gambar AI baru secara gratis | Semua |
| `.cari <topik>` | Mencari informasi di ensiklopedia Wikipedia | Semua |
| `.cuaca <kota>` | Cek prakiraan cuaca kota secara real-time | Semua |
| `.tagall <pesan>` | Panggil seluruh member di grup WA | Admin Grup / Owner |
| `.hidetag <pesan>` | Mention tersembunyi ke semua member grup | Admin Grup / Owner |
| `.reset` | Menghapus ingatan percakapan di chat saat ini | Semua |
| `.status` | Cek penggunaan RAM, uptime bot, dan jumlah sesi aktif | Owner |
| `.model [nama]` | Melihat atau mengubah model AI secara instan | Owner |
| `.bc <pesan>` | Mengirim pesan siaran ke semua kontak | Owner |
| `.ping` | Uji kecepatan respon bot | Semua |
| `.menu` / `.help` | Menampilkan menu bantuan lengkap | Semua |
