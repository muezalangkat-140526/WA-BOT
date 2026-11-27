export default {
  name: 'setnamegc',
  aliases: ['setsubject'],
  category: 'Grup',
  description: 'Mengganti nama subjek grup WhatsApp',
  usage: '.setnamegc Nama Baru Grup',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, sender, args, safeReply, sentByBotIds, isOwner }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya bisa digunakan di dalam grup.', msg, sentByBotIds);
      return;
    }

    if (!args) {
      await safeReply(sock, remoteJid, 'ℹ️ Masukkan nama baru untuk grup ini.', msg, sentByBotIds);
      return;
    }

    try {
      const meta = await sock.groupMetadata(remoteJid);
      const senderId = sender.replace(/[^0-9]/g, '');
      const isSenderAdmin = meta.participants.some(
        (m) => m.id.replace(/[^0-9]/g, '') === senderId && (m.admin === 'admin' || m.admin === 'superadmin')
      );
      if (!isSenderAdmin && !isOwner(msg, sender)) {
        await safeReply(sock, remoteJid, '⚠️ Anda bukan Admin grup.', msg, sentByBotIds);
        return;
      }

      await sock.groupUpdateSubject(remoteJid, args);
      await safeReply(sock, remoteJid, `✅ Nama grup berhasil diubah menjadi: *${args}*`, msg, sentByBotIds);
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal mengganti nama grup: ${err?.message || err}`, msg, sentByBotIds);
    }
  },
};
