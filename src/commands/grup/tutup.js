export default {
  name: 'tutup',
  aliases: ['buka', 'group'],
  category: 'Grup',
  description: 'Membuka atau menutup obrolan grup untuk anggota',
  usage: '.tutup atau .buka',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, sender, commandUsed, safeReply, sentByBotIds, isOwner }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya bisa digunakan di dalam grup WhatsApp.', msg, sentByBotIds);
      return;
    }

    try {
      const meta = await sock.groupMetadata(remoteJid);
      const botId = sock.user.id.split(':')[0];
      const botParticipant = meta.participants.find((m) => m.id.startsWith(botId));
      if (!botParticipant || (botParticipant.admin !== 'admin' && botParticipant.admin !== 'superadmin')) {
        await safeReply(sock, remoteJid, '⚠️ Bot harus menjadi Admin grup untuk mengubah setelan ini.', msg, sentByBotIds);
        return;
      }

      const senderId = sender.replace(/[^0-9]/g, '');
      const isSenderAdmin = meta.participants.some(
        (m) => m.id.replace(/[^0-9]/g, '') === senderId && (m.admin === 'admin' || m.admin === 'superadmin')
      );
      if (!isSenderAdmin && !isOwner(msg, sender)) {
        await safeReply(sock, remoteJid, '⚠️ Hanya Admin grup atau Owner yang dapat mengatur izin obrolan.', msg, sentByBotIds);
        return;
      }

      const isClose = commandUsed === 'tutup';
      await sock.groupSettingUpdate(remoteJid, isClose ? 'announcement' : 'not_announcement');

      await safeReply(
        sock,
        remoteJid,
        isClose
          ? `🔒 *Grup Ditutup:* Sekarang hanya Admin yang dapat mengirim pesan.`
          : `🔓 *Grup Dibuka:* Sekarang seluruh anggota bebas mengirim pesan.`,
        msg,
        sentByBotIds
      );
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal mengubah status grup: ${err?.message || err}`, msg, sentByBotIds);
    }
  },
};
