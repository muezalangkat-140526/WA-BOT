import { downloadMediaMessage } from '@whiskeysockets/baileys';
import pino from 'pino';

export default {
  name: 'getexif',
  aliases: ['cekstiker'],
  category: 'Alat',
  description: 'Mengecek metadata pack dan pembuat dari stiker yang di-reply',
  usage: 'Reply stiker dengan .getexif',
  async execute({ sock, remoteJid, msg, safeReply, sentByBotIds }) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted?.stickerMessage) {
      await safeReply(sock, remoteJid, 'ℹ️ Reply sebuah stiker WhatsApp dengan *.getexif* untuk melihat metadatanya.', msg, sentByBotIds);
      return;
    }

    try {
      const isAnimated = quoted.stickerMessage.isAnimated ? 'Ya (Bergerak)' : 'Tidak (Statis)';
      const fileLength = quoted.stickerMessage.fileLength
        ? `${Math.round(quoted.stickerMessage.fileLength / 1024)} KB`
        : 'Tidak diketahui';

      let text = `🏷️ *INFORMASI METADATA STIKER*\n\n`;
      text += `• *Animasi:* ${isAnimated}\n`;
      text += `• *Ukuran File:* ${fileLength}\n`;
      text += `• *Mimetype:* \`${quoted.stickerMessage.mimetype || 'image/webp'}\`\n`;

      await safeReply(sock, remoteJid, text, msg, sentByBotIds);
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal membaca stiker: ${err?.message || err}`, msg, sentByBotIds);
    }
  },
};
