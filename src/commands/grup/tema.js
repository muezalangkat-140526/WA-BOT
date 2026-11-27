import fs from 'fs';
import path from 'path';

const THEME_FILE = path.join(process.cwd(), 'data', 'group_themes.json');

export default {
  name: 'tema',
  category: 'Grup',
  description: 'Melihat tema persona obrolan AI yang sedang aktif di grup ini',
  isGroupOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, safeReply, sentByBotIds }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya untuk grup.', msg, sentByBotIds);
      return;
    }

    let theme = 'Default (Asisten pintar ramah dan sopan)';
    try {
      if (fs.existsSync(THEME_FILE)) {
        const data = JSON.parse(fs.readFileSync(THEME_FILE, 'utf8'));
        if (data[remoteJid]) theme = data[remoteJid];
      }
    } catch {}

    await safeReply(
      sock,
      remoteJid,
      `🎭 *Tema AI Grup Ini:*\n_"${theme}"_\n\n_Ubah tema dengan .settema <karakter>_`,
      msg,
      sentByBotIds
    );
  },
};
