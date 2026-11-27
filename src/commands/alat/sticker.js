import { downloadMediaMessage } from '@whiskeysockets/baileys';
import pino from 'pino';
import { createSticker } from '../../media.js';
import { config } from '../../config.js';

export default {
  name: 'sticker',
  aliases: ['s', 'stiker'],
  category: 'Alat',
  description: 'Mengubah foto menjadi stiker WhatsApp berkualitas tinggi',
  usage: 'Kirim foto dengan caption .sticker atau reply foto dengan .sticker',
  async execute({ sock, remoteJid, msg, isImage, isQuotedImage, quotedMsg, p, safeReply, sentByBotIds, startTyping }) {
    if (!isImage && !isQuotedImage) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Kirim foto dengan caption *${p}sticker* atau reply foto yang ada dengan ketik *${p}sticker*.`,
        msg,
        sentByBotIds
      );
      return;
    }

    const stopTyping = startTyping(sock, remoteJid);
    try {
      const targetMsg = isImage ? msg : { message: quotedMsg };
      const buffer = await downloadMediaMessage(
        targetMsg,
        'buffer',
        {},
        { logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage }
      );

      const stickerBuffer = await createSticker(buffer, config.bot.name, 'WhatsApp AI Bot');
      await sock.sendMessage(remoteJid, { sticker: stickerBuffer }, { quoted: msg });
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal membuat stiker: ${err?.message || 'Format tidak didukung'}`, msg, sentByBotIds);
    } finally {
      await stopTyping();
    }
  },
};
