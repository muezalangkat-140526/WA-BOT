import { dbSettings } from '../../storage.js';

export default {
  name: 'peringatandini',
  aliases: ['autotews', 'infobencana', 'alertgempa'],
  category: 'Grup',
  description: 'Mengaktifkan atau mematikan siaran darurat otomatis saat BMKG mendeteksi gempa baru',
  usage: '.peringatandini on atau .peringatandini off',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, args, safeReply, sentByBotIds }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya bisa digunakan di dalam grup WhatsApp.', msg, sentByBotIds);
      return;
    }

    const settings = dbSettings.get();
    const list = settings.earlyWarningGroups || [];
    const target = (args || '').toLowerCase().trim();

    if (target === 'on' || target === 'aktif' || target === 'hidup') {
      if (!list.includes(remoteJid)) {
        list.push(remoteJid);
        settings.earlyWarningGroups = list;
        dbSettings.save(settings);
      }
      await safeReply(
        sock,
        remoteJid,
        '🚨 *Peringatan Dini Bencana Diaktifkan di Grup Ini!*\nBot akan otomatis menyiarkan informasi jika BMKG mendeteksi gempa bumi signifikan atau potensi tsunami secara real-time.',
        msg,
        sentByBotIds
      );
    } else if (target === 'off' || target === 'mati' || target === 'nonaktif') {
      settings.earlyWarningGroups = list.filter((id) => id !== remoteJid);
      dbSettings.save(settings);
      await safeReply(sock, remoteJid, '🔕 *Peringatan Dini Bencana Dinonaktifkan di grup ini.*', msg, sentByBotIds);
    } else {
      const isEnabled = list.includes(remoteJid);
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Status Peringatan Dini BMKG di grup ini: *${isEnabled ? 'AKTIF (Berlangganan)' : 'NONAKTIF'}*\n\nUbah status:\n• *.peringatandini on* (Aktifkan siaran otomatis)\n• *.peringatandini off* (Matikan siaran otomatis)\n• Ketik *.gempa* untuk cek manual saat ini.`,
        msg,
        sentByBotIds
      );
    }
  },
};
