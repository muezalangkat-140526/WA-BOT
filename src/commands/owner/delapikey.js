import { saveAIConfig } from '../../config.js';
import { reloadAIClient } from '../../ai.js';

export default {
  name: 'delapikey',
  aliases: ['removekey', 'clearkey'],
  category: 'Owner',
  description: 'Menghapus API key AI dari sistem dan file .env',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, safeReply, sentByBotIds }) {
    if (isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya dapat dijalankan di chat pribadi.', msg, sentByBotIds);
      return;
    }

    try {
      saveAIConfig({ apiKey: '' });
      reloadAIClient();

      await safeReply(
        sock,
        remoteJid,
        '🧹 *API Key AI berhasil dihapus.* Bot tidak akan memproses pertanyaan AI sebelum API key baru diatur kembali.',
        msg,
        sentByBotIds
      );
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal menghapus API key: ${err?.message || err}`, msg, sentByBotIds);
    }
  },
};
