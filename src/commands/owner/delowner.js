import fs from 'fs';
import path from 'path';
import { config } from '../../config.js';
import { dbSettings } from '../../storage.js';

export default {
  name: 'delowner',
  aliases: ['removeowner', 'hapusowner'],
  category: 'Owner',
  description: 'Menghapus hak akses Owner dari nomor atau WhatsApp LID tertentu',
  usage: '.delowner 628123456789 atau .delowner 56376361529480',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds }) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo;
    let target = quoted?.participant || (args || '').trim();

    if (!target) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Masukkan nomor atau LID yang ingin dihapus hak akses owner-nya.\n\nContoh:\n*${p}delowner 628123456789*\n*${p}delowner 56376361529480*\n\n_Ketik *${p}listowner* untuk melihat seluruh owner saat ini._`,
        msg,
        sentByBotIds
      );
      return;
    }

    const cleanTarget = target.replace(/[^0-9]/g, '');
    if (!cleanTarget) {
      await safeReply(sock, remoteJid, '❌ ID nomor/LID target tidak valid.', msg, sentByBotIds);
      return;
    }

    const settings = dbSettings.get();
    if (!settings.extraOwners) settings.extraOwners = [];

    // Ambil semua owner saat ini
    const currentOwners = Array.from(
      new Set(
        [...config.bot.ownerNumbers, ...settings.extraOwners]
          .map((s) => (s || '').replace(/[^0-9]/g, ''))
          .filter((s) => s.length >= 6)
      )
    );

    // Cari ID yang cocok secara tepat atau normalisasi
    const matchedId = currentOwners.find((id) => {
      if (id === cleanTarget) return true;
      if (id.length >= 10 && id.length <= 14 && cleanTarget.length >= 10 && cleanTarget.length <= 14) {
        const normA = id.startsWith('62') ? id.slice(2) : id.startsWith('0') ? id.slice(1) : id;
        const normB = cleanTarget.startsWith('62') ? cleanTarget.slice(2) : cleanTarget.startsWith('0') ? cleanTarget.slice(1) : cleanTarget;
        return normA === normB;
      }
      return false;
    });

    if (!matchedId) {
      await safeReply(sock, remoteJid, `❌ ID \`${cleanTarget}\` tidak ditemukan di dalam daftar Owner aktif.`, msg, sentByBotIds);
      return;
    }

    // Cegah menghapus semua owner (harus ada minimal 1 owner tersisa)
    const remaining = currentOwners.filter((id) => id !== matchedId);
    if (remaining.length === 0) {
      await safeReply(sock, remoteJid, '⚠️ Tindakan dibatalkan! Sistem harus memiliki minimal 1 Owner agar bot tidak terkunci.', msg, sentByBotIds);
      return;
    }

    // 1. Hapus dari settings.extraOwners
    settings.extraOwners = settings.extraOwners.filter((id) => id !== matchedId && id !== cleanTarget);
    dbSettings.save(settings);

    // 2. Hapus dari config.bot.ownerNumbers di memori
    config.bot.ownerNumbers = config.bot.ownerNumbers.filter((id) => id !== matchedId && id !== cleanTarget);

    // 3. Update file .env secara persisten
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      try {
        let envContent = fs.readFileSync(envPath, 'utf8');
        const newOwnersStr = remaining.join(', ');
        if (/^OWNER_NUMBERS?=/m.test(envContent)) {
          envContent = envContent.replace(/^OWNER_NUMBERS?=.*$/m, `OWNER_NUMBERS="${newOwnersStr}"`);
        } else {
          envContent += `\nOWNER_NUMBERS="${newOwnersStr}"`;
        }
        fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
      } catch (envErr) {
        console.error('[DELOWNER_ENV_ERROR]', envErr?.message || envErr);
      }
    }

    await safeReply(
      sock,
      remoteJid,
      `✅ Berhasil mencabut hak akses Owner dari: \`${matchedId}\`\n\n_Ketik *${p}listowner* untuk melihat daftar terbaru._`,
      msg,
      sentByBotIds
    );
  },
};
