@echo off
setlocal
cd /d "%~dp0"
title Setup WhatsApp AI Bot

echo ========================================================
echo        INSTALASI WHATSAPP AI BOT MULTI-PROVIDER
echo ========================================================
echo Lokasi folder: %CD%
echo.

:: 1. Cek instalasi Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js belum terpasang di komputer Anda!
    echo Silakan unduh dan pasang Node.js (disarankan v20+) di:
    echo https://nodejs.org/
    echo.
    goto :selesai
)

echo [1/3] Node.js terdeteksi:
node -v
echo.

:: 2. Siapkan file .env jika belum ada
if not exist .env (
    echo [2/3] Membuat file konfigurasi .env dari .env.example...
    copy .env.example .env >nul
    echo      File .env berhasil dibuat!
) else (
    echo [2/3] File .env sudah ada.
)
echo.

:: 3. Pasang dependensi project
echo [3/3] Mengunduh dependensi (npm install)...
echo Mohon tunggu sebentar...
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Gagal memasang dependensi! Pastikan koneksi internet aktif.
    goto :selesai
)

echo.
echo ========================================================
echo [SELESAI] Instalasi berhasil!
echo.
echo LANGKAH SELANJUTNYA:
echo 1. Buka file .env menggunakan Notepad / Text Editor.
echo 2. Masukkan API Key dan model pilihan Anda.
echo 3. Jalankan bot dengan klik dua kali "start.bat"
echo ========================================================

:selesai
echo.
echo Tekan tombol apa saja untuk menutup jendela ini...
pause >nul