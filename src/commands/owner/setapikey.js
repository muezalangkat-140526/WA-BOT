import { saveAIConfig, PROVIDER_BASE_URLS } from '../../config.js';
import { reloadAIClient } from '../../ai.js';

export default {
  name: 'setapikey',
  aliases: ['setkey'],
  category: 'Owner',
  description: 'Mengatur penyedia (provider) dan API key AI secara permanen',
  usage: '.setapikey <provider> <api_key> [model]',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, args, p, safeReply, sentByBotIds }) {
    // 1. KEAMANAN TINGKAT TINGGI: Larang keras eksekusi di dalam grup
    if (isGroup) {
      try {
        await sock.sendMessage(remoteJid, { delete: msg.key });
      } catch {}
      await safeReply(
        sock,
        remoteJid,
        '🛑 *PERINGATAN KEAMANAN:*\nPerintah *.setapikey* TIDAK DIIZINKAN di dalam grup demi mencegah kebocoran API Key. Silakan kirimkan perintah ini melalui obrolan pribadi (PC) ke bot.',
        null,
        sentByBotIds
      );
      return;
    }

    if (!args) {
      const validList = Object.keys(PROVIDER_BASE_URLS).join(', ');
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ *Format Perintah:*\n*${p}setapikey <provider> <api_key> [model]*\n\n` +
          `• *Contoh GutsAI:*\n*${p}setapikey gutsai your_key nemotron-3.5-lightning*\n` +
          `• *Contoh Groq:*\n*${p}setapikey groq gsk_xxxx llama-3.3-70b-versatile*\n` +
          `• *Contoh Gemini:*\n*${p}setapikey gemini AIzaSy_xxxx gemini-2.5-flash*\n\n` +
          `_Provider didukung: ${validList}, custom_`,
        msg,
        sentByBotIds
      );
      return;
    }

    const parts = args.trim().split(/\s+/);
    const providerInput = parts[0].toLowerCase();
    const apiKeyInput = parts[1];
    const modelInput = parts.slice(2).join(' ') || null;

    if (!apiKeyInput) {
      await safeReply(
        sock,
        remoteJid,
        `⚠️ API Key belum dimasukkan.\nGunakan format: *${p}setapikey <provider> <api_key> [model]*`,
        msg,
        sentByBotIds
      );
      return;
    }

    const validProviders = [...Object.keys(PROVIDER_BASE_URLS), 'custom'];
    if (!validProviders.includes(providerInput)) {
      await safeReply(
        sock,
        remoteJid,
        `⚠️ Provider *'${providerInput}'* tidak dikenal.\nPilih salah satu dari: ${validProviders.join(', ')}`,
        msg,
        sentByBotIds
      );
      return;
    }

    try {
      // Simpan ke memori dan file .env
      const updated = saveAIConfig({
        provider: providerInput,
        apiKey: apiKeyInput,
        model: modelInput,
      });

      // Muat ulang client OpenAI di memori
      reloadAIClient();

      const maskedKey =
        apiKeyInput.length > 8
          ? `${apiKeyInput.slice(0, 4)}••••••••${apiKeyInput.slice(-4)}`
          : '••••••••';

      let successText = `✅ *Konfigurasi AI Berhasil Diperbarui!*\n\n`;
      successText += `• *Provider:* ${updated.provider.toUpperCase()}\n`;
      successText += `• *API Key:* \`${maskedKey}\`\n`;
      successText += `• *Base URL:* \`${updated.baseURL}\`\n`;
      successText += `• *Model Aktif:* ${updated.model}\n\n`;
      successText += `_Pengaturan telah disimpan secara permanen ke file .env._`;

      await safeReply(sock, remoteJid, successText, msg, sentByBotIds);
    } catch (err) {
      await safeReply(
        sock,
        remoteJid,
        `❌ Gagal memperbarui API key: ${err?.message || err}`,
        msg,
        sentByBotIds
      );
    }
  },
};
