import { getAIStatus } from '../../ai.js';
import { config } from '../../config.js';

export default {
  name: 'aistatus',
  category: 'Owner',
  description: 'Melihat konfigurasi provider AI dan model tanpa membocorkan key',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, safeReply, sentByBotIds }) {
    const ai = getAIStatus();
    let text = `🧠 *Pengaturan AI Aktif*\n\n`;
    text += `• *Provider:* ${ai.provider.toUpperCase()}\n`;
    text += `• *Model:* ${ai.model}\n`;
    text += `• *Base URL:* \`${config.ai.baseURL}\`\n`;
    text += `• *API Key Status:* ${config.ai.apiKey ? '✅ Terpasang (Aman)' : '❌ Kosong'}\n`;
    text += `• *Sesi Memori Berjalan:* ${ai.activeSessions} percakapan\n`;
    text += `• *TTL Memori:* 30 Menit auto-expire`;

    await safeReply(sock, remoteJid, text, msg, sentByBotIds);
  },
};
