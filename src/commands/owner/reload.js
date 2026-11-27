import { loadCommands, registry } from '../../handlers/commandHandler.js';

export default {
  name: 'reload',
  aliases: ['restartplugins'],
  category: 'Owner',
  description: 'Memuat ulang seluruh plugin command tanpa merestart koneksi WhatsApp',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, safeReply, sentByBotIds }) {
    try {
      registry.commands.clear();
      registry.aliases.clear();
      registry.categories.clear();

      await loadCommands();
      await safeReply(
        sock,
        remoteJid,
        `🔄 *Reload Berhasil!*\nTotal *${registry.commands.size} perintah modular* telah dimuat ulang ke memori.`,
        msg,
        sentByBotIds
      );
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal reload: ${err?.message || err}`, msg, sentByBotIds);
    }
  },
};
