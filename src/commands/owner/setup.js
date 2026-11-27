import { config } from '../../config.js';

export default {
  name: 'setup',
  category: 'Owner',
  description: 'Panduan navigasi seluruh pengaturan bot untuk Owner',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, p, safeReply, sentByBotIds }) {
    const text =
      `🛠️ *PANDUAN LENGKAP PENGATURAN OWNER*\n\n` +
      `1. *Kredensial AI:*\n` +
      `   • *${p}setapikey <provider> <key> [model]* -> Atur AI key\n` +
      `   • *${p}delapikey* -> Hapus AI key\n` +
      `   • *${p}model <nama>* -> Ganti model AI seketika\n` +
      `   • *${p}setpromptai <teks>* -> Atur watak AI\n\n` +
      `2. *Identitas & Akses Bot:*\n` +
      `   • *${p}namabot <nama>* -> Ganti nama bot\n` +
      `   • *${p}setprefix <simbol>* -> Ganti prefix (. / !)\n` +
      `   • *${p}mode <public/self>* -> Mode privat / umum\n` +
      `   • *${p}addowner <nomor>* -> Daftarkan owner baru\n` +
      `   • *${p}ban / ${p}unban <nomor>* -> Blokir user nakal\n\n` +
      `3. *Pemeliharaan Server:*\n` +
      `   • *${p}status* -> Cek RAM & Uptime\n` +
      `   • *${p}reload* -> Muat ulang seluruh modul file\n` +
      `   • *${p}set* -> Tampilkan ringkasan setelan\n` +
      `   • *${p}bc <pesan>* -> Kirim siaran massal`;

    await safeReply(sock, remoteJid, text, msg, sentByBotIds);
  },
};
