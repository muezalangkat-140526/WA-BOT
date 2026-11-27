import { generateAIImage } from '../../media.js';
import { config } from '../../config.js';

export default {
  name: 'gambar',
  aliases: ['imagine', 'draw'],
  category: 'AI',
  description: 'Membuat gambar ilustrasi baru secara gratis dengan AI',
  usage: '.gambar pemandangan kota masa depan gaya anime',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds, startTyping }) {
    if (!args) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Masukkan deskripsi gambar yang ingin dibuat.\nContoh: *${p}gambar kucing astronot di bulan gaya anime*`,
        msg,
        sentByBotIds
      );
      return;
    }

    const stopTyping = startTyping(sock, remoteJid);
    try {
      const imgBuffer = await generateAIImage(args);
      await sock.sendMessage(
        remoteJid,
        {
          image: imgBuffer,
          caption: `🎨 *Gambar AI: ${args}*\n_Dihasilkan oleh ${config.bot.name}_`,
        },
        { quoted: msg }
      );
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal membuat gambar: ${err?.message || 'Server sibuk'}`, msg, sentByBotIds);
    } finally {
      await stopTyping();
    }
  },
};
