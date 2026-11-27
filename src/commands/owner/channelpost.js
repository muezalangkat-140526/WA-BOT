export default {
  name: 'channelpost',
  aliases: ['saluranpost', 'postch'],
  category: 'Owner',
  description: 'Mengirim postingan teks ke Saluran (Channel) WhatsApp resmi',
  usage: '.channelpost 120363xxx@newsletter | Isi pesan pengumuman',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds }) {
    if (!args || !args.includes('|')) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Format pengiriman channel:\n*${p}channelpost <channel_jid> | <pesan>*\n\nContoh: *${p}channelpost 120363283921829102@newsletter | Halo selamat datang di channel bot kami!*`,
        msg,
        sentByBotIds
      );
      return;
    }

    const [channelJid, ...textParts] = args.split('|').map((s) => s.trim());
    const textContent = textParts.join('|').trim();

    try {
      await sock.sendMessage(channelJid, { text: textContent });
      await safeReply(sock, remoteJid, `✅ Postingan berhasil dikirim ke Saluran WhatsApp: \`${channelJid}\``, msg, sentByBotIds);
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal mengirim ke channel: ${err?.message || err}`, msg, sentByBotIds);
    }
  },
};
