import { getAIStatus, switchModel } from '../../ai.js';
import { getAllContacts } from '../../contacts.js';
import { config } from '../../config.js';

function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days}h ${hours}j ${minutes}m ${seconds}d`;
}

export default {
  name: 'status',
  category: 'Owner',
  description: 'Mengecek kondisi kesehatan bot, RAM, dan status modul',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, safeReply, sentByBotIds, startTime }) {
    const memoryUsage = process.memoryUsage();
    const ramMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const uptimeStr = formatDuration(Date.now() - (startTime || Date.now()));
    const aiStatus = getAIStatus();
    const totalContacts = getAllContacts().length;

    const statusText =
      `📊 *Status Sistem ${config.bot.name}*\n\n` +
      `• *Uptime:* ${uptimeStr}\n` +
      `• *RAM Digunakan:* ${ramMB} MB\n` +
      `• *Sesi Memori Aktif:* ${aiStatus.activeSessions} obrolan\n` +
      `• *Kontak Terdata:* ${totalContacts} chat\n` +
      `• *AI Provider:* ${aiStatus.provider.toUpperCase()}\n` +
      `• *AI Model Aktif:* ${aiStatus.model}\n` +
      `• *Proteksi Spam:* Aktif (Cooldown 3 dtk)\n` +
      `• *Izin Grup:* ${config.bot.allowGroups ? 'Aktif' : 'Nonaktif'}`;

    await safeReply(sock, remoteJid, statusText, msg, sentByBotIds);
  },
};
