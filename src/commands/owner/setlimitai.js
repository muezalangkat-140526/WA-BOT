import { dbSettings } from '../../storage.js';

export default {
  name: 'setlimitai',
  category: 'Owner',
  description: 'Mengatur batas jatah pertanyaan AI gratis per pengguna per hari',
  usage: '.setlimitai 30',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds }) {
    if (!args) {
      const s = dbSettings.get();
      await safeReply(sock, remoteJid, `ℹ️ Limit AI saat ini: *${s.aiRateLimit || 50} pertanyaan/hari* per user.\n\nUbah dengan: *${p}setlimitai <jumlah>*`, msg, sentByBotIds);
      return;
    }

    const limit = parseInt(args);
    if (isNaN(limit) || limit < 1) {
      await safeReply(sock, remoteJid, '❌ Jumlah limit harus berupa angka lebih besar dari 0.', msg, sentByBotIds);
      return;
    }

    const s = dbSettings.get();
    s.aiRateLimit = limit;
    dbSettings.save(s);

    await safeReply(sock, remoteJid, `✅ Jatah pertanyaan AI per hari diatur ke: *${limit} kali / pengguna*.`, msg, sentByBotIds);
  },
};
