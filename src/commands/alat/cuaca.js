import { getWeather } from '../../search.js';

export default {
  name: 'cuaca',
  aliases: ['weather'],
  category: 'Alat',
  description: 'Mengecek suhu dan cuaca terkini di kota tertentu',
  usage: '.cuaca Jakarta',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds, startTyping }) {
    if (!args) {
      await safeReply(sock, remoteJid, `ℹ️ Masukkan nama kota.\nContoh: *${p}cuaca Medan*`, msg, sentByBotIds);
      return;
    }

    const stopTyping = startTyping(sock, remoteJid);
    try {
      const weatherInfo = await getWeather(args);
      if (weatherInfo) {
        await safeReply(sock, remoteJid, `🌤️ *Laporan Cuaca Real-Time*\n\n${weatherInfo}`, msg, sentByBotIds);
      } else {
        await safeReply(sock, remoteJid, `❌ Data cuaca untuk "${args}" tidak ditemukan.`, msg, sentByBotIds);
      }
    } finally {
      await stopTyping();
    }
  },
};
