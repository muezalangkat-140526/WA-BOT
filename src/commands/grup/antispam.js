import { dbSettings } from '../../storage.js';

export default {
  name: 'antispam',
  category: 'Grup',
  description: 'Mengaktifkan atau menonaktifkan proteksi anti-spam di grup ini',
  usage: '.antispam on atau .antispam off',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, args, safeReply, sentByBotIds }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya untuk grup.', msg, sentByBotIds);
      return;
    }

    const settings = dbSettings.get();
    const list = settings.antiSpamGroups || [];
    const target = (args || '').toLowerCase().trim();

    if (target === 'on' || target === 'aktif') {
      if (!list.includes(remoteJid)) list.push(remoteJid);
      settings.antiSpamGroups = list;
      dbSettings.save(settings);
      await safeReply(sock, remoteJid, '⏱️ *Anti-Spam Diaktifkan:* Anggota wajib menunggu jeda sebelum mengirim perintah baru.', msg, sentByBotIds);
    } else if (target === 'off' || target === 'mati') {
      settings.antiSpamGroups = list.filter((id) => id !== remoteJid);
      dbSettings.save(settings);
      await safeReply(sock, remoteJid, '⏱️ *Anti-Spam Dinonaktifkan.*', msg, sentByBotIds);
    } else {
      const isEnabled = list.includes(remoteJid);
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Status Anti-Spam: *${isEnabled ? 'AKTIF' : 'NONAKTIF'}*\n\nUbah status:\n• *.antispam on*\n• *.antispam off*`,
        msg,
        sentByBotIds
      );
    }
  },
};
