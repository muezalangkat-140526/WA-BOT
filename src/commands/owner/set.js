import { dbSettings } from '../../storage.js';
import { config } from '../../config.js';

export default {
  name: 'set',
  aliases: ['settings'],
  category: 'Owner',
  description: 'Melihat seluruh pengaturan bot, limit, dan modul aktif',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, safeReply, sentByBotIds }) {
    const s = dbSettings.get();

    let text = `⚙️ *PENGATURAN BOT SAAT INI*\n\n`;
    text += `• *Nama Bot:* ${config.bot.name}\n`;
    text += `• *Prefix:* \`${config.bot.prefix}\`\n`;
    text += `• *Mode:* ${config.bot.selfMode ? 'SELF (Owner)' : 'PUBLIC (Semua Orang)'}\n`;
    text += `• *Izin Grup:* ${config.bot.allowGroups ? 'Diizinkan' : 'Dilarang'}\n`;
    text += `• *Provider AI:* ${config.ai.provider.toUpperCase()}\n`;
    text += `• *Model AI:* ${config.ai.model}\n`;
    text += `• *Limit AI Harian:* ${s.aiRateLimit || 50} tanya/hari\n`;
    text += `• *Gaya Menu:* ${s.menuStyle || 'default'}\n`;
    text += `• *Pengguna Diblokir:* ${(s.bannedUsers || []).length} orang\n`;
    text += `• *Grup Nonaktifkan AI:* ${(s.disabledAIGroups || []).length} grup\n`;
    text += `• *Grup Anti-Link:* ${(s.antiLinkGroups || []).length} grup\n`;
    text += `• *ElevenLabs Voice:* ${s.elevenlabsVoice || '(Belum disetel)'}\n`;

    await safeReply(sock, remoteJid, text, msg, sentByBotIds);
  },
};
