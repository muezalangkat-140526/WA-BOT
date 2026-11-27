import fs from 'fs';
import path from 'path';
import { config } from '../../config.js';

export default {
  name: 'namabot',
  aliases: ['setnamebot'],
  category: 'Owner',
  description: 'Mengganti nama identitas bot secara permanen',
  usage: '.namabot Salwa AI Assistant',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, args, safeReply, sentByBotIds }) {
    if (!args) {
      await safeReply(sock, remoteJid, `ℹ️ Nama bot saat ini: *${config.bot.name}*\n\nUbah dengan: *.namabot <nama_baru>*`, msg, sentByBotIds);
      return;
    }

    const newName = args.trim();
    config.bot.name = newName;

    // Simpan ke .env
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, 'utf8');
      if (/^BOT_NAME=.*$/m.test(content)) {
        content = content.replace(/^BOT_NAME=.*$/m, `BOT_NAME="${newName}"`);
      } else {
        content += `\nBOT_NAME="${newName}"`;
      }
      fs.writeFileSync(envPath, content.trim() + '\n', 'utf8');
    }

    await safeReply(sock, remoteJid, `✅ Nama bot berhasil diubah menjadi: *${newName}*`, msg, sentByBotIds);
  },
};
