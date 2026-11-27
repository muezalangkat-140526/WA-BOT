export default {
  name: 'tagall',
  aliases: ['hidetag'],
  category: 'Grup',
  description: 'Memanggil seluruh anggota di dalam grup',
  usage: '.tagall [pesan]',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, sender, args, commandUsed, safeReply, sentByBotIds, isOwner }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya bisa digunakan di dalam grup WhatsApp.', msg, sentByBotIds);
      return;
    }

    try {
      const groupMeta = await sock.groupMetadata(remoteJid);
      const senderId = sender.replace(/[^0-9]/g, '');
      const isSenderAdmin = groupMeta.participants.some(
        (m) => m.id.replace(/[^0-9]/g, '') === senderId && (m.admin === 'admin' || m.admin === 'superadmin')
      );

      if (!isSenderAdmin && !isOwner(msg, sender)) {
        await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya dapat digunakan oleh Admin Grup atau Owner.', msg, sentByBotIds);
        return;
      }

      const mentions = groupMeta.participants.map((m) => m.id);

      if (commandUsed === 'tagall') {
        let tagText = `📢 *PANGGILAN GRUP: ${groupMeta.subject}*\n`;
        if (args) tagText += `Pesan: *${args}*\n`;
        tagText += `Total Anggota: ${mentions.length}\n\n`;
        for (const pId of mentions) {
          tagText += `@${pId.split('@')[0]}\n`;
        }
        await sock.sendMessage(remoteJid, { text: tagText, mentions }, { quoted: msg });
      } else {
        // Hidetag (mention tersembunyi)
        const hideText = args || `📢 Pemberitahuan untuk seluruh anggota grup.`;
        await sock.sendMessage(remoteJid, { text: hideText, mentions }, { quoted: msg });
      }
    } catch (groupErr) {
      await safeReply(sock, remoteJid, `❌ Gagal tagall: ${groupErr?.message || groupErr}`, msg, sentByBotIds);
    }
  },
};
