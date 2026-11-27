import { dbSettings } from '../../storage.js';

export default {
  name: 'setelevenlabs',
  category: 'Owner',
  description: 'Mengatur API Key dan Voice ID untuk ElevenLabs AI TTS',
  usage: '.setelevenlabs <api_key> <voice_id>',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, args, p, safeReply, sentByBotIds }) {
    if (isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya untuk chat pribadi.', msg, sentByBotIds);
      return;
    }

    if (!args) {
      const s = dbSettings.get();
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Pengaturan ElevenLabs Saat Ini:\n• *Voice ID:* ${s.elevenlabsVoice || '(Kosong)'}\n• *Key Status:* ${s.elevenlabsKey ? '✅ Terpasang' : '❌ Kosong'}\n\nAtur dengan:\n*${p}setelevenlabs <api_key> <voice_id>*`,
        msg,
        sentByBotIds
      );
      return;
    }

    const [apiKey, voiceId] = args.trim().split(/\s+/);
    if (!apiKey || !voiceId) {
      await safeReply(sock, remoteJid, `⚠️ Masukkan API Key dan Voice ID.\nContoh: *${p}setelevenlabs xi_12345 21m00Tcm4TlvDq8ikWAM*`, msg, sentByBotIds);
      return;
    }

    const s = dbSettings.get();
    s.elevenlabsKey = apiKey;
    s.elevenlabsVoice = voiceId;
    dbSettings.save(s);

    await safeReply(sock, remoteJid, `✅ ElevenLabs berhasil dikonfigurasi!\n• Voice ID: \`${voiceId}\``, msg, sentByBotIds);
  },
};
