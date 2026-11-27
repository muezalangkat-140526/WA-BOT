# Panduan Deployment 24/7 (Server / VPS)

Panduan ini digunakan agar WhatsApp AI Bot dapat berjalan nonstop 24 jam tanpa tergantung laptop/komputer pribadi Anda.

---

## Opsi A: Menggunakan VPS Linux (Ubuntu/Debian) dengan PM2 (Direkomendasikan)

### 1. Persiapan Server
Masuk ke VPS Anda via SSH, lalu perbarui paket dan pasang Node.js v20:
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
```

### 2. Pasang PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 3. Unggah / Kloning Bot
Salin file bot dari folder `dist-shareable` ke VPS (atau clone dari repo Git Anda):
```bash
mkdir -p /var/www/wa-bot
cd /var/www/wa-bot
# Jalankan setup
npm install
cp .env.example .env
nano .env # Isi API Key, OWNER_NUMBER, dll.
```

### 4. Jalankan dengan PM2
```bash
# Buat folder log
mkdir -p logs

# Jalankan bot
pm2 start ecosystem.config.cjs

# Simpan proses agar otomatis hidup kembali saat server reboot
pm2 save
pm2 startup
```

### 5. Melihat QR Code di VPS
Jika menggunakan scan QR:
```bash
pm2 logs wa-ai-bot --lines 100
```
*(Atau gunakan fitur `PAIRING_NUMBER` di `.env` untuk login via kode angka tanpa perlu scan kamera).*

---

## Opsi B: Menggunakan Docker Container

1. Bangun image Docker:
   ```bash
   docker build -t wa-ai-bot .
   ```
2. Jalankan container dengan volume sesi persisten:
   ```bash
   docker run -d \
     --name wa-bot-container \
     --restart unless-stopped \
     --env-file .env \
     -v $(pwd)/auth_info_baileys:/app/auth_info_baileys \
     wa-ai-bot
   ```
3. Cek log container untuk scan QR:
   ```bash
   docker logs -f wa-bot-container
   ```


---

## Opsi C: Menggunakan Panel Pterodactyl (console.jagoanproject.com / Bot Panel)

Panel Pterodactyl adalah panel hosting berbasis kontainer web untuk bot Discord/WhatsApp.

### Langkah-Langkah Pemasangan di Panel:
1. **Export Paket Bersih**:
   Jalankan `npm run export` di lokal. Kompres/ZIP isi dalam folder `dist-shareable` (jangan sertakan `.env` lokal atau folder `node_modules`).
2. **Unggah ke File Manager Panel**:
   - Buka `https://console.jagoanproject.com/` lalu pilih server bot Anda.
   - Buka menu **Files** > klik **Upload** file `.zip` tadi.
   - Klik titik tiga pada file `.zip` > pilih **Unarchive** (ekstrak langsung di direktori utama `/home/container`).
3. **Konfigurasi File `.env`**:
   - Di menu Files, buat atau edit file `.env` (bisa rename dari `.env.example`).
   - Isi `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, dan `OWNER_NUMBER`.
   - **Sangat Disarankan**: Isi `PAIRING_NUMBER=628xxx` (nomor bot Anda). Di web panel Pterodactyl, kode pairing angka jauh lebih stabil dan mudah di-input dibandingkan scan QR terminal yang karakternya sering terpotong di layar browser.
4. **Cek Konfigurasi Startup**:
   - Buka menu **Startup** di panel.
   - Pastikan **JS_FILE** atau startup file tertulis `index.js` (project ini sudah menyediakan file root `index.js`).
   - Pastikan Node.js version yang dipilih adalah Node 18 atau Node 20+.
5. **Start Bot di Console**:
   - Buka menu **Console** > klik **Start**.
   - Tunggu Pterodactyl memasang dependensi (`npm install`) secara otomatis.
   - Masukkan kode pairing 8 digit yang muncul di console ke WhatsApp HP Anda (**Perangkat Tertaut > Tautkan dengan nomor telepon**).
