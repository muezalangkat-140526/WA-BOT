import { dbSettings } from '../../storage.js';

export default {
  name: 'antilink',
  category: 'Grup',
  description: 'Mengatur penghapusan otomatis tautan grup WhatsApp spam',
  usage: '.antilink on atau .antilink off',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, args, safeReply, sentByBotIds }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya untuk grup.', msg, sentByBotIds);
      return;
    }

    const settings = dbSettings.get();
    const list = settings.antiLinkGroups || [];
    const target = (args || '').toLowerCase().trim();

    if (target === 'on' || target === 'aktif') {
      if (!list.includes(remoteJid)) list.push(remoteJid);
      settings.antiLinkGroups = list;
      dbSettings.save(settings);
      await safeReply(sock, remoteJid, '🛡️ *Anti-Link Diaktifkan:* Pesan tautan grup lain akan otomatis dihapus.', msg, sentByBotIds);
    } else if (target === 'off' || target === 'mati') {
      settings.antiLinkGroups = list.filter((id) => id !== remoteJid);
      dbSettings.save(settings);
      await safeReply(sock, remoteJid, '🛡️ *Anti-Link Dinonaktifkan.*', msg, sentByBotIds);
    } else {
      const isEnabled = list.includes(remoteJid);
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Status Anti-Link: *${isEnabled ? 'AKTIF' : 'NONAKTIF'}*\n\nUbah status:\n• *.antilink on*\n• *.antilink off*`,
        msg,
        sentByBotIds
      );
    }
  },
};
