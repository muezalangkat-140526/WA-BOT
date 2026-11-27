import fs from 'fs';
import path from 'path';

const THEME_FILE = path.join(process.cwd(), 'data', 'group_themes.json');

function getThemes() {
  try {
    if (fs.existsSync(THEME_FILE)) return JSON.parse(fs.readFileSync(THEME_FILE, 'utf8'));
  } catch {}
  return {};
}

function saveThemes(data) {
  fs.writeFileSync(THEME_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export default {
  name: 'settema',
  category: 'Grup',
  description: 'Mengatur tema obrolan dan kepribadian AI saat mengobrol di grup ini',
  usage: '.settema Bot berperan sebagai guru matematika yang sabar dan humoris',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, args, p, safeReply, sentByBotIds }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya untuk grup.', msg, sentByBotIds);
      return;
    }

    if (!args) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Masukkan persona/tema obrolan AI di grup ini.\nContoh: *${p}settema Komunitas gamer Mobile Legends, gunakan bahasa santai dan ramah*`,
        msg,
        sentByBotIds
      );
      return;
    }

    const themes = getThemes();
    themes[remoteJid] = args.trim();
    saveThemes(themes);

    await safeReply(
      sock,
      remoteJid,
      `🎭 *Tema AI Grup Diperbarui!*\nAI sekarang akan mengikuti gaya:\n_"${args.trim()}"_`,
      msg,
      sentByBotIds
    );
  },
};
