import { downloadMediaMessage } from '@whiskeysockets/baileys';
import pino from 'pino';

export default {
  name: 'readqr',
  aliases: ['scanqr', 'bacaqr'],
  category: 'Alat',
  description: 'Membaca dan menerjemahkan isi teks dari foto kode QR',
  usage: 'Kirim gambar QR atau reply foto QR dengan .readqr',
  async execute({ sock, remoteJid, msg, isImage, isQuotedImage, quotedMsg, p, safeReply, sentByBotIds, startTyping }) {
    if (!isImage && !isQuotedImage) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Kirim foto kode QR dengan caption *${p}readqr* atau reply foto kode QR dengan *${p}readqr*.`,
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

      // Gunakan public ZXing / QR Decoder API via FormData
      const formData = new FormData();
      formData.append('file', new Blob([buffer]), 'qr.jpg');

      const res = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Server pembaca QR merespons gagal');

      const data = await res.json();
      const qrData = data[0]?.symbol[0]?.data;
      const qrError = data[0]?.symbol[0]?.error;

      if (!qrData || qrError) {
        await safeReply(sock, remoteJid, '❌ Tidak dapat mendeteksi kode QR pada gambar tersebut. Pastikan gambar jelas dan tidak buram.', msg, sentByBotIds);
        return;
      }

      await safeReply(
        sock,
        remoteJid,
        `🏁 *HASIL PEMBACAAN KODE QR*\n\n\`\`\`\n${qrData}\n\`\`\``,
        msg,
        sentByBotIds
      );
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal membaca kode QR: ${err?.message || err}`, msg, sentByBotIds);
    } finally {
      await stopTyping();
    }
  },
};
