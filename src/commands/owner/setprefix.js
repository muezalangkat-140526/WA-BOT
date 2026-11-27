import fs from 'fs';
import path from 'path';
import { config } from '../../config.js';

export default {
  name: 'setprefix',
  aliases: ['setprepix', 'prefix', 'prepix'],
  category: 'Owner',
  description: 'Mengganti prefix simbol perintah bot WhatsApp',
  usage: '.setprefix ! atau .setprefix .',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, args, safeReply, sentByBotIds }) {
    if (!args) {
      await safeReply(sock, remoteJid, `ℹ️ Prefix saat ini: *${config.bot.prefix}*\n\nUbah dengan: *.setprefix <simbol>*`, msg, sentByBotIds);
      return;
    }

    const newPrefix = args.trim().slice(0, 2);
    config.bot.prefix = newPrefix;

    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, 'utf8');
      if (/^COMMAND_PREFIX=.*$/m.test(content)) {
        content = content.replace(/^COMMAND_PREFIX=.*$/m, `COMMAND_PREFIX=${newPrefix}`);
      } else {
        content += `\nCOMMAND_PREFIX=${newPrefix}`;
      }
      fs.writeFileSync(envPath, content.trim() + '\n', 'utf8');
    }

    await safeReply(sock, remoteJid, `✅ Prefix perintah berhasil diubah ke: *${newPrefix}*`, msg, sentByBotIds);
  },
};
