import { dbSettings } from '../../storage.js';

export default {
  name: 'cekgrup',
  aliases: ['togglegrup', 'aigrup'],
  category: 'AI',
  description: 'Mengatur apakah AI merespons obrolan di grup ini atau tidak',
  usage: '.cekgrup on atau .cekgrup off',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, args, safeReply, sentByBotIds, isOwner, sender }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya bisa digunakan di grup.', msg, sentByBotIds);
      return;
    }

    const settings = dbSettings.get();
    const disabledList = settings.disabledAIGroups || [];
    const isCurrentlyDisabled = disabledList.includes(remoteJid);

    const target = (args || '').toLowerCase().trim();

    if (target === 'off' || target === 'nonaktif' || target === 'mati') {
      if (!isCurrentlyDisabled) {
        disabledList.push(remoteJid);
        settings.disabledAIGroups = disabledList;
        dbSettings.save(settings);
      }
      await safeReply(sock, remoteJid, '🛑 *AI Dinonaktifkan di grup ini:* Bot tidak akan lagi merespons obrolan otomatis AI di sini.', msg, sentByBotIds);
    } else if (target === 'on' || target === 'aktif' || target === 'hidup') {
      settings.disabledAIGroups = disabledList.filter((id) => id !== remoteJid);
      dbSettings.save(settings);
      await safeReply(sock, remoteJid, '✅ *AI Diaktifkan di grup ini:* Bot siap merespons pertanyaan AI para anggota.', msg, sentByBotIds);
    } else {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Status AI di grup ini: *${isCurrentlyDisabled ? 'NONAKTIF' : 'AKTIF'}*\n\nUbah status:\n• *.cekgrup on* (Aktifkan)\n• *.cekgrup off* (Matikan)`,
        msg,
        sentByBotIds
      );
    }
  },
};
