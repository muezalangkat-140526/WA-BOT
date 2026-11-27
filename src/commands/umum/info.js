import { config } from '../../config.js';

export default {
  name: 'info',
  category: 'Umum',
  description: 'Informasi sistem dan identitas bot',
  async execute({ sock, remoteJid, msg, safeReply, sentByBotIds }) {
    const memoryUsage = process.memoryUsage();
    const ramMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);

    const infoText =
      `ℹ️ *Informasi Sistem Bot*\n\n` +
      `• *Nama Bot:* ${config.bot.name}\n` +
      `• *Node.js:* ${process.version}\n` +
      `• *Platform:* ${process.platform} (${process.arch})\n` +
      `• *Penggunaan RAM:* ${ramMB} MB\n` +
      `• *Baileys Multi-Device:* Aktif\n` +
      `• *Status:* Stabil 24/7`;

    await safeReply(sock, remoteJid, infoText, msg, sentByBotIds);
  },
};
