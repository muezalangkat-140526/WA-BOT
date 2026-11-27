export default {
  name: 'add',
  category: 'Grup',
  description: 'Menambahkan anggota baru ke dalam grup menggunakan nomor telepon',
  usage: '.add 6281234567890',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, args, p, safeReply, sentByBotIds }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya bisa digunakan di dalam grup.', msg, sentByBotIds);
      return;
    }

    if (!args) {
      await safeReply(sock, remoteJid, `ℹ️ Masukkan nomor WhatsApp yang ingin ditambahkan.\nContoh: *${p}add 6281234567890*`, msg, sentByBotIds);
      return;
    }

    const cleanNum = args.replace(/[^0-9]/g, '');
    if (cleanNum.length < 9) {
      await safeReply(sock, remoteJid, '❌ Nomor telepon tidak valid.', msg, sentByBotIds);
      return;
    }

    const targetJid = `${cleanNum}@s.whatsapp.net`;

    try {
      const res = await sock.groupParticipantsUpdate(remoteJid, [targetJid], 'add');
      const status = res[0]?.status;

      if (status === '200') {
        await safeReply(sock, remoteJid, `✅ Berhasil menambahkan @${cleanNum} ke grup.`, msg, sentByBotIds);
      } else if (status === '403') {
        // Privasi pengguna tidak mengizinkan bot menambahkannya langsung, kirim invite link
        const code = await sock.groupInviteCode(remoteJid);
        await sock.sendMessage(targetJid, {
          text: `Halo, Anda diundang untuk bergabung ke grup via tautan berikut:\nhttps://chat.whatsapp.com/${code}`,
        });
        await safeReply(sock, remoteJid, `ℹ️ Privasi @${cleanNum} tidak mengizinkan penambahan langsung. Undangan grup telah dikirim via chat pribadi.`, msg, sentByBotIds);
      } else {
        await safeReply(sock, remoteJid, `⚠️ Tidak dapat menambahkan @${cleanNum} (Status: ${status}).`, msg, sentByBotIds);
      }
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal menambahkan anggota: ${err?.message || err}`, msg, sentByBotIds);
    }
  },
};
