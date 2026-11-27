import { dbGreetings } from '../../storage.js';

export default {
  name: 'welcome',
  category: 'Grup',
  description: 'Mengatur pesan sapaan selamat datang untuk anggota baru',
  usage: '.welcome Selamat datang di grup kami, mohon patuhi aturan ya!',
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
        `ℹ️ Pesan Selamat Datang Saat Ini:\n_"${current.welcome || '(Belum disetel)'}"_\n\nAtur pesan dengan:\n*${p}welcome <teks>*`,
        msg,
        sentByBotIds
      );
      return;
    }

    dbGreetings.setWelcome(remoteJid, args.trim());
    await safeReply(sock, remoteJid, `✅ Pesan sambutan anggota baru berhasil disimpan!`, msg, sentByBotIds);
  },
};
