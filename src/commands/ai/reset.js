import { resetConversation } from '../../ai.js';

export default {
  name: 'reset',
  aliases: ['clear', 'hapusmemori'],
  category: 'AI',
  description: 'Menghapus ingatan konteks obrolan AI di chat ini',
  async execute({ sock, remoteJid, msg, safeReply, sentByBotIds }) {
    resetConversation(remoteJid);
    await safeReply(
      sock,
      remoteJid,
      '🧹 *Konteks percakapan telah dibersihkan.* AI memulai obrolan baru dari awal.',
      msg,
      sentByBotIds
    );
  },
};
