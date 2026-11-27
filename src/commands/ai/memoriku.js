import { resetConversation } from '../../ai.js';

export default {
  name: 'memoriku',
  aliases: ['mymemory'],
  category: 'AI',
  description: 'Mengecek atau menghapus data ingatan percakapan pribadi Anda',
  usage: '.memoriku atau .memoriku reset',
  async execute({ sock, remoteJid, msg, sender, args, safeReply, sentByBotIds }) {
    const targetChatId = remoteJid.endsWith('@g.us') ? `${remoteJid}_${sender}` : remoteJid;

    if (args && (args.toLowerCase() === 'reset' || args.toLowerCase() === 'hapus')) {
      resetConversation(targetChatId);
      await safeReply(sock, remoteJid, '🧹 *Konteks ingatan obrolan Anda telah direset.* AI akan memulai percakapan baru dengan Anda.', msg, sentByBotIds);
    } else {
      await safeReply(
        sock,
        remoteJid,
        `👤 *Pengaturan Memori Pribadi Anda*\n\n• Pengidentifikasi: \`${sender}\`\n• Keamanan: Memori tersimpan sementara (auto-expire 30 menit).\n\nUntuk menghapus ingatan obrolan Anda sekarang:\n*.memoriku reset*`,
        msg,
        sentByBotIds
      );
    }
  },
};
