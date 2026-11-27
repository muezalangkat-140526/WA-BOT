export default {
  name: 'setdesk',
  aliases: ['setdesc'],
  category: 'Grup',
  description: 'Mengganti deskripsi grup WhatsApp',
  usage: '.setdesk Deskripsi baru grup...',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, sender, args, safeReply, sentByBotIds, isOwner }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya bisa digunakan di dalam grup.', msg, sentByBotIds);
      return;
    }

    if (!args) {
      await safeReply(sock, remoteJid, 'ℹ️ Masukkan deskripsi baru untuk grup ini.', msg, sentByBotIds);
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

      await sock.groupUpdateDescription(remoteJid, args);
      await safeReply(sock, remoteJid, `✅ Deskripsi grup berhasil diperbarui!`, msg, sentByBotIds);
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal mengganti deskripsi: ${err?.message || err}`, msg, sentByBotIds);
    }
  },
};
