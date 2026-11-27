import { registry } from '../../handlers/commandHandler.js';
import { config } from '../../config.js';
import { getAIStatus } from '../../ai.js';

export default {
  name: 'menu',
  aliases: ['help'],
  category: 'Umum',
  description: 'Menampilkan daftar seluruh perintah yang tersedia',
  async execute({ sock, remoteJid, msg, p, safeReply, sentByBotIds }) {
    const aiStatus = getAIStatus();
    const categories = registry.getAllByCategory();

    let text = `🤖 *${config.bot.name.toUpperCase()} - MENU UTAMA*\n`;
    text += `_Provider: ${aiStatus.provider.toUpperCase()} | Model: ${aiStatus.model}_\n`;
    text += `_Prefix: ${p} | Gunakan ${p}bantuan <perintah> untuk info detail_\n`;
    text += `──────────────────────\n\n`;

    const categoryOrder = ['AI', 'Alat', 'Grup', 'Owner', 'Toko', 'Umum', 'Unduh'];

    for (const catName of categoryOrder) {
      const cmds = categories.get(catName) || [];
      if (cmds.length === 0) continue;

      text += `*${catName.toUpperCase()}*\n`;
      for (const cmd of cmds) {
        text += `• *${p}${cmd.name}* - ${cmd.description}\n`;
      }
      text += `\n`;
    }

    // Tampilkan kategori lain jika ada
    for (const [catName, cmds] of categories.entries()) {
      if (!categoryOrder.includes(catName)) {
        text += `*${catName.toUpperCase()}*\n`;
        for (const cmd of cmds) {
          text += `• *${p}${cmd.name}* - ${cmd.description}\n`;
        }
        text += `\n`;
      }
    }

    text += `──────────────────────\n`;
    text += `_Ketik pertanyaan apa saja untuk mengobrol dengan AI._`;

    await safeReply(sock, remoteJid, text.trim(), msg, sentByBotIds);
  },
};
