function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days}h ${hours}j ${minutes}m ${seconds}d`;
}

export default {
  name: 'runtime',
  aliases: ['uptime'],
  category: 'Umum',
  description: 'Melihat lama bot sudah menyala tanpa henti',
  async execute({ sock, remoteJid, msg, safeReply, sentByBotIds, startTime }) {
    const uptime = Date.now() - (startTime || Date.now());
    await safeReply(
      sock,
      remoteJid,
      `⏱️ *Waktu Aktif Bot:*\n${formatDuration(uptime)}`,
      msg,
      sentByBotIds
    );
  },
};
