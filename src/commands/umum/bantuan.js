import { registry } from '../../handlers/commandHandler.js';

export default {
  name: 'bantuan',
  aliases: ['helpcmd'],
  category: 'Umum',
  description: 'Penjelasan cara pakai satu perintah tertentu',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds }) {
    if (!args) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Masukkan nama perintah yang ingin dicek.\nContoh: *${p}bantuan kalkulator*`,
        msg,
        sentByBotIds
      );
      return;
    }

    const cleanName = args.replace(/^[.!]/, '').trim().toLowerCase();
    const cmd = registry.get(cleanName);

    if (!cmd) {
      await safeReply(
        sock,
        remoteJid,
        `❌ Perintah *${args}* tidak ditemukan. Ketik *${p}menu* untuk melihat semua perintah.`,
        msg,
        sentByBotIds
      );
      return;
    }

    let detail = `📖 *Panduan Perintah: ${p}${cmd.name}*\n\n`;
    detail += `• *Kategori:* ${cmd.category}\n`;
    detail += `• *Deskripsi:* ${cmd.description}\n`;
    if (cmd.aliases && cmd.aliases.length > 0) {
      detail += `• *Alias:* ${cmd.aliases.map((a) => p + a).join(', ')}\n`;
    }
    if (cmd.usage) {
      detail += `• *Format:* ${cmd.usage}\n`;
    }
    if (cmd.isOwnerOnly) detail += `• *Akses:* Khusus Owner\n`;
    if (cmd.isGroupOnly) detail += `• *Akses:* Khusus Grup\n`;
    if (cmd.isAdminOnly) detail += `• *Akses:* Khusus Admin Grup\n`;

    await safeReply(sock, remoteJid, detail, msg, sentByBotIds);
  },
};
