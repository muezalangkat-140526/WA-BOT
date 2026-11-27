import { resetConversation } from '../../ai.js';

export default {
  name: 'memorigrup',
  aliases: ['memorygc'],
  category: 'AI',
  description: 'Mengecek atau mereset memori konteks obrolan AI khusus grup ini',
  usage: '.memorigrup atau .memorigrup reset',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, args, safeReply, sentByBotIds }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya untuk grup.', msg, sentByBotIds);
      return;
    }

    if (args && (args.toLowerCase() === 'reset' || args.toLowerCase() === 'clear')) {
      resetConversation(remoteJid);
      await safeReply(sock, remoteJid, '🧹 *Memori AI grup ini telah dibersihkan.* AI melupakan obrolan sebelumnya.', msg, sentByBotIds);
    } else {
      await safeReply(
        sock,
        remoteJid,
        `🧠 *Memori AI Grup*\n\nStatus: Aktif dengan sistem TTL (Auto-expire 30 menit).\nUntuk membersihkan ingatan obrolan grup ini, ketik:\n*.memorigrup reset*`,
        msg,
        sentByBotIds
      );
    }
  },
};
