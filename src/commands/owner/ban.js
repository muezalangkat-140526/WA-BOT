import { dbSettings } from '../../storage.js';

export default {
  name: 'ban',
  aliases: ['unban', 'blokir'],
  category: 'Owner',
  description: 'Melarang atau membuka blokir pengguna memakai bot',
  usage: '.ban 628123456789 atau .unban 628123456789',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, args, commandUsed, safeReply, sentByBotIds }) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo;
    let target = quoted?.participant || (args || '').trim();

    if (!target) {
      await safeReply(sock, remoteJid, 'ℹ️ Tag atau reply orang yang ingin di-ban/unban, atau ketik nomornya.', msg, sentByBotIds);
      return;
    }

    const cleanNum = target.replace(/[^0-9]/g, '');
    const settings = dbSettings.get();
    let banned = settings.bannedUsers || [];

    if (commandUsed === 'unban') {
      settings.bannedUsers = banned.filter((n) => n !== cleanNum);
      dbSettings.save(settings);
      await safeReply(sock, remoteJid, `✅ Pengguna @${cleanNum} berhasil di-unban.`, msg, sentByBotIds);
    } else {
      if (!banned.includes(cleanNum)) {
        banned.push(cleanNum);
        settings.bannedUsers = banned;
        dbSettings.save(settings);
      }
      await safeReply(sock, remoteJid, `🚫 Pengguna @${cleanNum} telah di-ban dari penggunaan bot.`, msg, sentByBotIds);
    }
  },
};
