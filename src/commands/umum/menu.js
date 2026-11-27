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

    const renderCategory = (catName, cmds) => {
      if (!cmds || cmds.length === 0) return '';
      const seen = new Set();
      const uniqueCmds = [];
      for (const cmd of cmds) {
        const lower = cmd.name.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          uniqueCmds.push(cmd);
        }
      }
      if (uniqueCmds.length === 0) return '';
      let catText = `*${catName.toUpperCase()}*\n`;
      for (const cmd of uniqueCmds) {
        catText += `• *${p}${cmd.name}* - ${cmd.description}\n`;
      }
      return catText + '\n';
    };

    for (const catName of categoryOrder) {
      text += renderCategory(catName, categories.get(catName));
    }

    // Tampilkan kategori lain jika ada
    for (const [catName, cmds] of categories.entries()) {
      if (!categoryOrder.includes(catName)) {
        text += renderCategory(catName, cmds);
      }
    }

    text += `──────────────────────\n`;
    text += `_Ketik pertanyaan apa saja untuk mengobrol dengan AI._`;

    await safeReply(sock, remoteJid, text.trim(), msg, sentByBotIds);
  },
};
