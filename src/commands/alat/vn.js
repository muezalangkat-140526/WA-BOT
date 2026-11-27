import fs from 'fs';
import path from 'path';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import pino from 'pino';
import { convertToOpus } from '../../utils/audio.js';

const VN_DIR = path.join(process.cwd(), 'data', 'vn');
if (!fs.existsSync(VN_DIR)) fs.mkdirSync(VN_DIR, { recursive: true });

export default {
  name: 'vn',
  aliases: ['voicenote', 'audio'],
  category: 'Alat',
  description: 'Menyimpan dan memutar pesan suara / audio pendek',
  usage: '.vn list atau .vn play <nama> atau reply audio dengan .vn save <nama>',
  async execute({ sock, remoteJid, msg, args, quotedMsg, p, safeReply, sentByBotIds }) {
    if (!args) {
      await safeReply(
        sock,
        remoteJid,
        `🎙️ *Penyimpan Voice Note (VN)*\n\n` +
          `• *${p}vn list* - Melihat daftar VN yang tersimpan\n` +
          `• *${p}vn play <nama>* - Memutar VN tersimpan\n` +
          `• *Reply Audio + ${p}vn save <nama>* - Menyimpan VN baru`,
        msg,
        sentByBotIds
      );
      return;
    }

    const [action, ...rest] = args.trim().split(/\s+/);
    const name = rest.join('_').toLowerCase();

    if (action === 'list') {
      const files = fs.readdirSync(VN_DIR).filter((f) => f.endsWith('.mp3') || f.endsWith('.ogg'));
      if (files.length === 0) {
        await safeReply(sock, remoteJid, 'ℹ️ Belum ada VN yang disimpan.', msg, sentByBotIds);
        return;
      }
      let text = `📂 *DAFTAR VOICE NOTE TERSIMPAN*\n\n`;
      for (const f of files) {
        text += `• \`${f.replace(/\.(mp3|ogg)$/, '')}\`\n`;
      }
      text += `\nPutar dengan: *${p}vn play <nama>*`;
      await safeReply(sock, remoteJid, text, msg, sentByBotIds);
      return;
    }

    if (action === 'play') {
      if (!name) {
        await safeReply(sock, remoteJid, `ℹ️ Masukkan nama VN yang ingin diputar. Contoh: *${p}vn play salam*`, msg, sentByBotIds);
        return;
      }
      const files = fs.readdirSync(VN_DIR);
      const match = files.find((f) => f.startsWith(name + '.'));
      if (!match) {
        await safeReply(sock, remoteJid, `❌ VN "${name}" tidak ditemukan. Cek daftar dengan *${p}vn list*.`, msg, sentByBotIds);
        return;
      }

      const filePath = path.join(VN_DIR, match);
      let audioBuffer = fs.readFileSync(filePath);
      let mimetype = 'audio/ogg; codecs=opus';
      let ptt = true;

      if (match.endsWith('.mp3')) {
        try {
          audioBuffer = await convertToOpus(audioBuffer);
        } catch {
          mimetype = 'audio/mpeg';
          ptt = false;
        }
      }

      await sock.sendMessage(
        remoteJid,
        {
          audio: audioBuffer,
          mimetype,
          ptt,
        },
        { quoted: msg }
      );
      return;
    }

    if (action === 'save') {
      if (!name) {
        await safeReply(sock, remoteJid, `ℹ️ Masukkan nama untuk menyimpan VN. Contoh reply audio dengan: *${p}vn save salam*`, msg, sentByBotIds);
        return;
      }

      if (!quotedMsg?.audioMessage && !msg.message?.audioMessage) {
        await safeReply(sock, remoteJid, '⚠️ Reply pesan audio / voice note untuk menyimpannya.', msg, sentByBotIds);
        return;
      }

      try {
        const targetMsg = msg.message?.audioMessage ? msg : { message: quotedMsg };
        const buffer = await downloadMediaMessage(
          targetMsg,
          'buffer',
          {},
          { logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage }
        );

        const savePath = path.join(VN_DIR, `${name}.ogg`);
        fs.writeFileSync(savePath, buffer);
        await safeReply(sock, remoteJid, `✅ Voice Note berhasil disimpan dengan nama: *${name}*`, msg, sentByBotIds);
      } catch (err) {
        await safeReply(sock, remoteJid, `❌ Gagal menyimpan VN: ${err?.message || err}`, msg, sentByBotIds);
      }
      return;
    }

    await safeReply(sock, remoteJid, `ℹ️ Aksi tidak dikenal. Gunakan list, play, atau save.`, msg, sentByBotIds);
  },
};
