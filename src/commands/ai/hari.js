import { getCurrentDateTimeIndonesian } from '../../ai.js';

export default {
  name: 'hari',
  aliases: ['waktu', 'jam', 'tanggal'],
  category: 'AI',
  description: 'Mengecek hari, tanggal, dan waktu real-time saat ini secara instan',
  async execute({ sock, remoteJid, msg, safeReply, sentByBotIds }) {
    const nowStr = getCurrentDateTimeIndonesian();
    await safeReply(
      sock,
      remoteJid,
      `📅 *Waktu Real-Time Sekarang:*\n${nowStr}`,
      msg,
      sentByBotIds
    );
  },
};
