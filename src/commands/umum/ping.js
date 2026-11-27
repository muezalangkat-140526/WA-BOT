export default {
  name: 'ping',
  aliases: ['p'],
  category: 'Umum',
  description: 'Cek kondisi koneksi dan latensi bot',
  async execute({ sock, remoteJid, msg, safeReply, sentByBotIds }) {
    const start = Date.now();
    await safeReply(
      sock,
      remoteJid,
      `🏓 Pong!\nBot aktif normal. Latensi: ${Date.now() - start}ms`,
      msg,
      sentByBotIds
    );
  },
};
