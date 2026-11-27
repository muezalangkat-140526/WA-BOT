export default {
  name: 'groupinfo',
  aliases: ['infogrup', 'gcinfo'],
  category: 'Grup',
  description: 'Menampilkan informasi lengkap mengenai grup WhatsApp',
  isGroupOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, safeReply, sentByBotIds }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya bisa digunakan di dalam grup WhatsApp.', msg, sentByBotIds);
      return;
    }

    try {
      const meta = await sock.groupMetadata(remoteJid);
      const totalParticipants = meta.participants.length;
      const admins = meta.participants.filter((p) => p.admin === 'admin' || p.admin === 'superadmin');

      let info = `👥 *INFORMASI GRUP*\n\n`;
      info += `• *Nama Grup:* ${meta.subject}\n`;
      info += `• *ID Grup:* \`${meta.id}\`\n`;
      info += `• *Pembuat:* @${meta.owner ? meta.owner.split('@')[0] : 'Tidak diketahui'}\n`;
      info += `• *Total Anggota:* ${totalParticipants} orang\n`;
      info += `• *Jumlah Admin:* ${admins.length} orang\n`;
      info += `• *Status Obrolan:* ${meta.announce ? 'Hanya Admin yang dapat mengirim pesan' : 'Semua anggota bebas mengirim pesan'}\n`;
      info += `• *Edit Info Grup:* ${meta.restrict ? 'Hanya Admin' : 'Semua Anggota'}\n`;
      if (meta.desc) {
        info += `\n📝 *Deskripsi Grup:*\n${meta.desc}\n`;
      }

      const mentions = meta.owner ? [meta.owner] : [];
      await sock.sendMessage(remoteJid, { text: info, mentions }, { quoted: msg });
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal mengambil informasi grup: ${err?.message || err}`, msg, sentByBotIds);
    }
  },
};
