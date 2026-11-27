import { searchWikipedia, getWeather } from '../../search.js';

export const webCommand = {
  name: 'web',
  aliases: ['cari', 'wiki'],
  category: 'Alat',
  description: 'Pencarian ensiklopedia dan informasi publik di internet',
  usage: '.web Albert Einstein',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds, startTyping }) {
    if (!args) {
      await safeReply(sock, remoteJid, `ℹ️ Masukkan topik pencarian.\nContoh: *${p}web Ki Hajar Dewantara*`, msg, sentByBotIds);
      return;
    }

    const stopTyping = startTyping(sock, remoteJid);
    try {
      const wikiResult = await searchWikipedia(args);
      if (wikiResult) {
        await safeReply(sock, remoteJid, `📚 *Hasil Pencarian: ${args}*\n\n${wikiResult}`, msg, sentByBotIds);
      } else {
        await safeReply(sock, remoteJid, `❌ Informasi mengenai "${args}" tidak ditemukan di ensiklopedia.`, msg, sentByBotIds);
      }
    } finally {
      await stopTyping();
    }
  },
};

export const cuacaCommand = {
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

export default webCommand;
