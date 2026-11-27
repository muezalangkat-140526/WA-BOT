import { dbGreetings } from '../../storage.js';

export default {
  name: 'bye',
  category: 'Grup',
  description: 'Mengatur teks perpisahan ketika ada anggota yang keluar dari grup',
  usage: '.bye Selamat jalan kawan, semoga sukses selalu',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, args, p, safeReply, sentByBotIds }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya untuk grup.', msg, sentByBotIds);
      return;
    }

    if (!args) {
      const current = dbGreetings.get(remoteJid);
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Pesan Perpisahan Saat Ini:\n_"${current.bye || '(Belum disetel)'}"_\n\nAtur pesan dengan:\n*${p}bye <teks>*`,
        msg,
        sentByBotIds
      );
      return;
    }

    dbGreetings.setBye(remoteJid, args.trim());
    await safeReply(sock, remoteJid, `✅ Pesan perpisahan anggota berhasil disimpan!`, msg, sentByBotIds);
  },
};
