export default {
  name: 'kick',
  aliases: ['tendang'],
  category: 'Grup',
  description: 'Mengeluarkan anggota tertentu dari grup WhatsApp',
  usage: '.kick @member atau reply pesan target dengan .kick',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, sender, safeReply, sentByBotIds, isOwner }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya bisa digunakan di dalam grup WhatsApp.', msg, sentByBotIds);
      return;
    }

    try {
      const meta = await sock.groupMetadata(remoteJid);
      const botId = sock.user.id.split(':')[0];
      const botPart = meta.participants.find((m) => m.id.startsWith(botId));
      if (!botPart || (botPart.admin !== 'admin' && botPart.admin !== 'superadmin')) {
        await safeReply(sock, remoteJid, '⚠️ Bot harus berstatus Admin grup untuk mengeluarkan anggota.', msg, sentByBotIds);
        return;
      }

      const senderId = sender.replace(/[^0-9]/g, '');
      const isSenderAdmin = meta.participants.some(
        (m) => m.id.replace(/[^0-9]/g, '') === senderId && (m.admin === 'admin' || m.admin === 'superadmin')
      );
      if (!isSenderAdmin && !isOwner(msg, sender)) {
        await safeReply(sock, remoteJid, '⚠️ Anda bukan Admin grup.', msg, sentByBotIds);
        return;
      }

      const quoted = msg.message?.extendedTextMessage?.contextInfo;
      let targetJid = null;

      if (quoted?.participant) {
        targetJid = quoted.participant;
      } else if (quoted?.mentionedJid && quoted.mentionedJid.length > 0) {
        targetJid = quoted.mentionedJid[0];
      }

      if (!targetJid) {
        await safeReply(sock, remoteJid, 'ℹ️ Tag atau reply pesan anggota yang ingin dikeluarkan.', msg, sentByBotIds);
        return;
      }

      await sock.groupParticipantsUpdate(remoteJid, [targetJid], 'remove');
      await safeReply(sock, remoteJid, `🚪 Berhasil mengeluarkan @${targetJid.split('@')[0]} dari grup.`, msg, sentByBotIds);
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal mengeluarkan anggota: ${err?.message || err}`, msg, sentByBotIds);
    }
  },
};
