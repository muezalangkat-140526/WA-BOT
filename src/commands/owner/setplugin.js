import { registry } from '../../handlers/commandHandler.js';

export default {
  name: 'setplugin',
  category: 'Owner',
  description: 'Mengecek atau mengelola daftar file modul plugin perintah',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, safeReply, sentByBotIds }) {
    const cats = registry.getAllByCategory();
    let text = `🧩 *STATUS PLUGIN MODULAR SAAT INI*\n\n`;

    for (const [cat, cmds] of cats.entries()) {
      text += `📁 *Kategori: ${cat}* (${cmds.length} modul)\n`;
      text += `  Perintah: ${cmds.map((c) => '.' + c.name).join(', ')}\n\n`;
    }

    text += `_Semua plugin aktif dan terisolasi try-catch._`;
    await safeReply(sock, remoteJid, text.trim(), msg, sentByBotIds);
  },
};
