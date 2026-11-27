#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo "========================================================"
echo "       INSTALASI WHATSAPP AI BOT MULTI-PROVIDER"
echo "========================================================"
echo ""

# 1. Cek Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js belum terpasang!"
    echo "Silakan install Node.js v20+ melalui https://nodejs.org/ atau paket manajer OS Anda."
    exit 1
fi

echo "[1/3] Node.js terdeteksi: $(node -v)"
echo ""

# 2. Siapkan .env
if [ ! -f .env ]; then
    echo "[2/3] Membuat file .env dari .env.example..."
    cp .env.example .env
    echo "     File .env berhasil dibuat!"
else
    echo "[2/3] File .env sudah ada."
fi
echo ""

# 3. npm install
echo "[3/3] Memasang dependensi (npm install)..."
npm install

echo ""
echo "========================================================"
echo "[SELESAI] Instalasi berhasil!"
echo ""
echo "LANGKAH SELANJUTNYA:"
echo "1. Edit file .env dan isi API Key AI Anda."
echo "2. Jalankan bot dengan perintah: npm start"
echo "========================================================"
