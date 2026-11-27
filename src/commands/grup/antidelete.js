import { dbSettings } from '../../storage.js';

export default {
  name: 'antidelete',
  category: 'Grup',
  description: 'Mengaktifkan atau mematikan fitur peringatan pesan dihapus',
  usage: '.antidelete on atau .antidelete off',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, args, safeReply, sentByBotIds }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya untuk grup.', msg, sentByBotIds);
      return;
    }

    const settings = dbSettings.get();
    const list = settings.antiDeleteGroups || [];
    const target = (args || '').toLowerCase().trim();

    if (target === 'on' || target === 'aktif') {
      if (!list.includes(remoteJid)) list.push(remoteJid);
      settings.antiDeleteGroups = list;
      dbSettings.save(settings);
      await safeReply(sock, remoteJid, '🛡️ *Anti-Delete Diaktifkan:* Bot akan memantau penghapusan pesan di grup ini.', msg, sentByBotIds);
    } else if (target === 'off' || target === 'mati') {
      settings.antiDeleteGroups = list.filter((id) => id !== remoteJid);
      dbSettings.save(settings);
      await safeReply(sock, remoteJid, '🛡️ *Anti-Delete Dinonaktifkan.*', msg, sentByBotIds);
    } else {
      const isEnabled = list.includes(remoteJid);
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Status Anti-Delete: *${isEnabled ? 'AKTIF' : 'NONAKTIF'}*\n\nUbah status:\n• *.antidelete on*\n• *.antidelete off*`,
        msg,
        sentByBotIds
      );
    }
  },
};
