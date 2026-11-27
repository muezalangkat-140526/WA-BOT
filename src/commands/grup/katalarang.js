import { dbBannedWords } from '../../storage.js';

export default {
  name: 'katalarang',
  aliases: ['badword', 'bannedword'],
  category: 'Grup',
  description: 'Menambah, menghapus, atau melihat daftar kata terlarang di grup',
  usage: '.katalarang add <kata> atau .katalarang del <kata> atau .katalarang list',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, args, p, safeReply, sentByBotIds }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya untuk grup.', msg, sentByBotIds);
      return;
    }

    const words = dbBannedWords.get(remoteJid);
    if (!args || args === 'list') {
      if (words.length === 0) {
        await safeReply(sock, remoteJid, 'ℹ️ Belum ada kata terlarang yang didaftarkan di grup ini.', msg, sentByBotIds);
        return;
      }
      let text = `🚫 *DAFTAR KATA TERLARANG GRUP:*\n\n`;
      for (const w of words) {
        text += `• \`${w}\`\n`;
      }
      await safeReply(sock, remoteJid, text, msg, sentByBotIds);
      return;
    }

    const [action, ...rest] = args.split(/\s+/);
    const word = rest.join(' ').toLowerCase().trim();

    if (action === 'add' && word) {
      dbBannedWords.add(remoteJid, word);
      await safeReply(sock, remoteJid, `✅ Kata \`${word}\` berhasil ditambahkan ke daftar terlarang.`, msg, sentByBotIds);
    } else if ((action === 'del' || action === 'delete') && word) {
      dbBannedWords.remove(remoteJid, word);
      await safeReply(sock, remoteJid, `✅ Kata \`${word}\` dihapus dari daftar terlarang.`, msg, sentByBotIds);
    } else {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Gunakan:\n• *${p}katalarang add <kata>*\n• *${p}katalarang del <kata>*\n• *${p}katalarang list*`,
        msg,
        sentByBotIds
      );
    }
  },
};
