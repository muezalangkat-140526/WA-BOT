import { getAIStatus, switchModel } from '../../ai.js';

export default {
  name: 'model',
  category: 'Owner',
  description: 'Mengecek atau mengganti model AI secara instan',
  usage: '.model nemotron-3.5-lightning',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds }) {
    if (args) {
      const updated = switchModel(args);
      await safeReply(sock, remoteJid, `✅ Model AI berhasil diubah ke: *${updated}*`, msg, sentByBotIds);
    } else {
      const aiStatus = getAIStatus();
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Model AI saat ini: *${aiStatus.model}* (Provider: ${aiStatus.provider.toUpperCase()})\n\nUbah model via:\n*${p}model <nama_model>*`,
        msg,
        sentByBotIds
      );
    }
  },
};
