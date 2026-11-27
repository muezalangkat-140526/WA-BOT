import { config } from '../../config.js';
import { dbSettings } from '../../storage.js';

export default {
  name: 'addowner',
  category: 'Owner',
  description: 'Menambahkan nomor atau LID owner baru ke sesi berjalan dan database permanen',
  usage: '.addowner 628123456789 atau reply target dengan .addowner',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, args, safeReply, sentByBotIds }) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo;
    let target = quoted?.participant || (args || '').trim();

    if (!target) {
      await safeReply(sock, remoteJid, 'ℹ️ Masukkan nomor atau reply pesan target dengan *.addowner*.', msg, sentByBotIds);
      return;
    }

    const cleanTarget = target.replace(/[^0-9]/g, '');
    const settings = dbSettings.get();
    if (!settings.extraOwners) settings.extraOwners = [];

    if (!config.bot.ownerNumbers.includes(cleanTarget) && !settings.extraOwners.includes(cleanTarget)) {
      settings.extraOwners.push(cleanTarget);
      dbSettings.save(settings);
      if (!config.bot.ownerNumbers.includes(cleanTarget)) {
        config.bot.ownerNumbers.push(cleanTarget);
      }
      await safeReply(sock, remoteJid, `✅ Berhasil mendaftarkan owner baru secara permanen: \`${cleanTarget}\``, msg, sentByBotIds);
    } else {
      await safeReply(sock, remoteJid, `ℹ️ ID \`${cleanTarget}\` sudah terdaftar sebagai Owner.`, msg, sentByBotIds);
    }
  },
};
