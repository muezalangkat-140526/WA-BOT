import { convertToOpus } from '../../utils/audio.js';
import { dbSettings } from '../../storage.js';

export default {
  name: 'voice',
  aliases: ['tts', 'suara'],
  category: 'AI',
  description: 'Mengubah teks menjadi pesan suara (voice note) menggunakan Google TTS atau ElevenLabs',
  usage: '.voice id Halo semuanya, ini suara asisten WhatsApp bot',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds, startTyping }) {
    if (!args) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Format salah. Gunakan:\n*${p}voice <kode_bahasa> <teks>*\nContoh: *${p}voice id Selamat datang di layanan kami!*\n\n_(id = Indonesia, en = Inggris, ja = Jepang, ar = Arab)_`,
        msg,
        sentByBotIds
      );
      return;
    }

    const spaceIdx = args.indexOf(' ');
    let lang = 'id';
    let text = args;

    if (spaceIdx !== -1) {
      const maybeLang = args.slice(0, spaceIdx).toLowerCase().trim();
      if (maybeLang.length === 2 || maybeLang.length === 5) {
        lang = maybeLang;
        text = args.slice(spaceIdx + 1).trim();
      }
    }

    if (!text) {
      await safeReply(sock, remoteJid, 'ℹ️ Masukkan teks yang ingin diubah menjadi suara.', msg, sentByBotIds);
      return;
    }

    const stopTyping = startTyping(sock, remoteJid);
    try {
      const s = dbSettings.get();
      let audioBuffer;

      // Cek apakah ElevenLabs dikonfigurasi
      if (s.elevenlabsKey && s.elevenlabsVoice) {
        try {
          const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${s.elevenlabsVoice}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': s.elevenlabsKey,
            },
            body: JSON.stringify({
              text,
              model_id: 'eleven_multilingual_v2',
              voice_settings: { stability: 0.5, similarity_boost: 0.75 },
            }),
          });
          if (elRes.ok) {
            const arr = await elRes.arrayBuffer();
            audioBuffer = Buffer.from(arr);
          }
        } catch (elErr) {
          console.warn('[VOICE_ELEVENLABS_WARN] Fallback ke Google TTS:', elErr?.message || elErr);
        }
      }

      // Fallback ke Google TTS jika belum ada audioBuffer
      if (!audioBuffer) {
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
        const res = await fetch(ttsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        });

        if (!res.ok) throw new Error(`Google TTS merespons status ${res.status}`);

        const arrayBuffer = await res.arrayBuffer();
        audioBuffer = Buffer.from(arrayBuffer);
      }

      // Konversi ke standar WhatsApp PTT Voice Note (OGG Opus)
      let sendPayload;
      try {
        const opusBuffer = await convertToOpus(audioBuffer);
        sendPayload = {
          audio: opusBuffer,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true,
        };
      } catch (convErr) {
        console.warn('[VOICE_CONVERT_FALLBACK]', convErr?.message || convErr);
        sendPayload = {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          ptt: false, // fallback aman tanpa PTT agar WhatsApp tidak error
        };
      }

      await sock.sendMessage(remoteJid, sendPayload, { quoted: msg });
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal menghasilkan suara: ${err?.message || err}`, msg, sentByBotIds);
    } finally {
      await stopTyping();
    }
  },
};
