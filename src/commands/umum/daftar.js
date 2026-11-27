import { dbUsers } from '../../storage.js';

export default {
  name: 'daftar',
  aliases: ['register'],
  category: 'Umum',
  description: 'Mendaftarkan diri sebagai pengguna resmi bot',
  usage: '.daftar NamaAnda.20',
  async execute({ sock, remoteJid, msg, sender, args, p, safeReply, sentByBotIds }) {
    if (!args || !args.includes('.')) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Format pendaftaran:\n*${p}daftar Nama.Umur*\nContoh: *${p}daftar Budi.21*`,
        msg,
        sentByBotIds
      );
      return;
    }

    const [name, ageStr] = args.split('.').map((s) => s.trim());
    const age = parseInt(ageStr);

    if (!name || isNaN(age)) {
      await safeReply(sock, remoteJid, '❌ Nama dan umur harus valid.', msg, sentByBotIds);
      return;
    }

    dbUsers.register(sender, name, age);
    await safeReply(
      sock,
      remoteJid,
      `🎉 *Pendaftaran Berhasil!*\n\n• *Nama:* ${name}\n• *Umur:* ${age} tahun\n• *ID:* \`${sender}\`\n\nSelamat menggunakan seluruh fitur bot kami!`,
      msg,
      sentByBotIds
    );
  },
};
