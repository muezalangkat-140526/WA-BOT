export default {
  name: 'link',
  aliases: ['linkgrup', 'linkgc'],
  category: 'Grup',
  description: 'Mendapatkan tautan undangan resmi grup ini',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, sender, safeReply, sentByBotIds, isOwner }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya bisa digunakan di dalam grup WhatsApp.', msg, sentByBotIds);
      return;
    }

    try {
      const code = await sock.groupInviteCode(remoteJid);
      await safeReply(
        sock,
        remoteJid,
        `🔗 *Tautan Undangan Grup:*\nhttps://chat.whatsapp.com/${code}`,
        msg,
        sentByBotIds
      );
    } catch (err) {
      await safeReply(
        sock,
        remoteJid,
        `❌ Gagal mengambil link grup. Pastikan bot sudah dijadikan Admin di grup ini.`,
        msg,
        sentByBotIds
      );
    }
  },
};
