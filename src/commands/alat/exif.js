import { config } from '../../config.js';

let customPack = null;
let customAuthor = null;

export function getStickerMetadata() {
  return {
    pack: customPack || config.bot.name,
    author: customAuthor || 'WhatsApp AI Bot',
  };
}

export default {
  name: 'exif',
  aliases: ['setexif'],
  category: 'Alat',
  description: 'Mengatur nama pack dan author pembuat stiker',
  usage: '.exif Nama Pack | Nama Pembuat',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds }) {
    if (!args || !args.includes('|')) {
      const current = getStickerMetadata();
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Metadata Stiker Saat Ini:\n• *Pack:* ${current.pack}\n• *Author:* ${current.author}\n\nUntuk mengubah format:\n*${p}exif NamaPack | NamaAuthor*`,
        msg,
        sentByBotIds
      );
      return;
    }

    const [pack, author] = args.split('|').map((s) => s.trim());
    customPack = pack || config.bot.name;
    customAuthor = author || 'WhatsApp AI Bot';

    await safeReply(
      sock,
      remoteJid,
      `✅ Metadata stiker diperbarui!\n• *Pack:* ${customPack}\n• *Author:* ${customAuthor}`,
      msg,
      sentByBotIds
    );
  },
};
