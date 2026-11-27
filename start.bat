@echo off
cd /d "%~dp0"
title WhatsApp AI Bot

echo ========================================================
echo              MEMULAI WHATSAPP AI BOT
echo ========================================================
echo.

node -v >nul 2>&1
if errorlevel 1 goto no_node

if not exist node_modules goto no_modules
if not exist .env goto no_env

echo Menjalankan WhatsApp AI Bot...
echo.
call npm start
goto selesai

:no_node
echo [ERROR] Node.js belum terpasang atau tidak terdaftar di PATH.
echo Silakan unduh dan pasang Node.js dari: https://nodejs.org/
goto selesai

:no_modules
echo [INFO] Folder node_modules belum ditemukan.
echo Memasang dependensi dengan npm install, harap tunggu.
echo.
call npm install
if errorlevel 1 goto install_fail
echo.
echo [SUKSES] Dependensi berhasil dipasang!
echo.
call npm start
goto selesai

:install_fail
echo.
echo [ERROR] Gagal memasang dependensi npm!
goto selesai

:no_env
echo [PERINGATAN] File .env belum ditemukan!
echo Membuat file .env baru dari .env.example...
copy .env.example .env >nul
echo.
echo [PENTING] Silakan buka file .env dan isi API Key Anda.
echo Setelah diisi, jalankan kembali start.bat ini.
goto selesai

:selesai
echo.
echo ========================================================
echo Tekan tombol apa saja untuk menutup jendela ini...
echo ========================================================
pause >nul