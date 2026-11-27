import { dbSettings } from '../../storage.js';

export default {
  name: 'setmenu',
  category: 'Owner',
  description: 'Mengatur gaya tampilan perintah menu bot',
  usage: '.setmenu default atau .setmenu compact',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, args, safeReply, sentByBotIds }) {
    const style = (args || '').toLowerCase().trim();
    if (style !== 'default' && style !== 'compact' && style !== 'classic') {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Pilihan gaya menu:\n• *.setmenu default* (Kategori lengkap)\n• *.setmenu compact* (Satu baris ringkas)\n• *.setmenu classic* (Gaya bot klasik)`,
        msg,
        sentByBotIds
      );
      return;
    }

    const s = dbSettings.get();
    s.menuStyle = style;
    dbSettings.save(s);

    await safeReply(sock, remoteJid, `✅ Gaya menu berhasil diubah menjadi: *${style.toUpperCase()}*`, msg, sentByBotIds);
  },
};
