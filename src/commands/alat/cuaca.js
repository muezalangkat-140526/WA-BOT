import { getWeather } from '../../search.js';

export default {
  name: 'cuaca',
  aliases: ['weather'],
  category: 'Alat',
  description: 'Mengecek suhu dan cuaca terkini di kota/kabupaten tertentu',
  usage: '.cuaca Medan / .cuaca Deli Serdang',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds, startTyping }) {
    if (!args) {
      await safeReply(sock, remoteJid, `ℹ️ Masukkan nama kota atau kabupaten.\n\nContoh:\n• *${p}cuaca Medan*\n• *${p}cuaca Deli Serdang*\n• *${p}cuaca Jakarta*`, msg, sentByBotIds);
      return;
    }

    const stopTyping = startTyping(sock, remoteJid);
    try {
      const weatherInfo = await getWeather(args);
      if (weatherInfo) {
        await safeReply(sock, remoteJid, `🌤️ *Laporan Cuaca Real-Time*\n\n${weatherInfo}`, msg, sentByBotIds);
      } else {
        await safeReply(
          sock,
          remoteJid,
          `❌ Data cuaca untuk "${args}" tidak ditemukan.\n\n💡 *Tips*: Coba ketik nama kota utama tanpa singkatan, contoh: *${p}cuaca Medan* atau *${p}cuaca Deli Serdang*.`,
          msg,
          sentByBotIds
        );
      }
    } finally {
      await stopTyping();
    }
  },
};
