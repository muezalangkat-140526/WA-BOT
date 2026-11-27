export default {
  name: 'promote',
  aliases: ['admin'],
  category: 'Grup',
  description: 'Menaikkan anggota menjadi admin grup',
  usage: '.promote @member atau reply pesan target dengan .promote',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, sender, safeReply, sentByBotIds, isOwner }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya bisa digunakan di dalam grup.', msg, sentByBotIds);
      return;
    }

    try {
      const meta = await sock.groupMetadata(remoteJid);
      const botId = sock.user.id.split(':')[0];
      const botPart = meta.participants.find((m) => m.id.startsWith(botId));
      if (!botPart || (botPart.admin !== 'admin' && botPart.admin !== 'superadmin')) {
        await safeReply(sock, remoteJid, '⚠️ Bot harus menjadi Admin grup terlebih dahulu.', msg, sentByBotIds);
        return;
      }

      const senderId = sender.replace(/[^0-9]/g, '');
      const isSenderAdmin = meta.participants.some(
        (m) => m.id.replace(/[^0-9]/g, '') === senderId && (m.admin === 'admin' || m.admin === 'superadmin')
      );
      if (!isSenderAdmin && !isOwner(msg, sender)) {
        await safeReply(sock, remoteJid, '⚠️ Hanya Admin grup yang dapat menaikkan admin baru.', msg, sentByBotIds);
        return;
      }

      const quoted = msg.message?.extendedTextMessage?.contextInfo;
      let targetJid = quoted?.participant || (quoted?.mentionedJid && quoted.mentionedJid[0]);

      if (!targetJid) {
        await safeReply(sock, remoteJid, 'ℹ️ Tag atau reply pesan anggota yang ingin dinaikkan sebagai Admin.', msg, sentByBotIds);
        return;
      }

      await sock.groupParticipantsUpdate(remoteJid, [targetJid], 'promote');
      await safeReply(sock, remoteJid, `👑 Selamat, @${targetJid.split('@')[0]} sekarang adalah Admin grup.`, msg, sentByBotIds);
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal promote: ${err?.message || err}`, msg, sentByBotIds);
    }
  },
};
