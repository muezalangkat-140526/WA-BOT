export default {
  name: 'toqr',
  aliases: ['qr'],
  category: 'Alat',
  description: 'Mengubah teks atau tautan menjadi gambar QR code',
  usage: '.toqr https://example.com',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds }) {
    if (!args) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Masukkan teks atau link yang ingin dijadikan QR Code.\nContoh: *${p}toqr https://google.com*`,
        msg,
        sentByBotIds
      );
      return;
    }

    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(args)}`;
      const res = await fetch(qrUrl);
      if (!res.ok) throw new Error('Gagal mengambil gambar QR');

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await sock.sendMessage(
        remoteJid,
        {
          image: buffer,
          caption: `🏁 *QR Code Berhasil Dibuat!*\nKonten: \`${args}\``,
        },
        { quoted: msg }
      );
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal membuat QR code: ${err?.message || err}`, msg, sentByBotIds);
    }
  },
};
