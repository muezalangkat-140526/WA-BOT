export default {
  name: 'balas',
  aliases: ['replyuser', 'chatuser'],
  category: 'Owner',
  description: 'Membalas pesan pengguna yang dialihkan (termasuk yang menggunakan LID tersembunyi)',
  usage: '.balas <id_pengguna> <pesan>',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds }) {
    if (!args || !args.includes(' ')) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ *Format Balas Pengguna:*\n*${p}balas <id_pengguna_atau_nomor> <pesan>*\n\nContoh:\n*${p}balas 56376361529480 Halo, saya Owner bot. Ada yang bisa saya bantu?*`,
        msg,
        sentByBotIds
      );
      return;
    }

    const firstSpace = args.indexOf(' ');
    const target = args.slice(0, firstSpace).trim();
    const replyText = args.slice(firstSpace + 1).trim();

    let targetJid = target;
    if (!targetJid.includes('@')) {
      if (targetJid.length >= 14) {
        targetJid = `${targetJid}@lid`;
      } else {
        targetJid = `${targetJid}@s.whatsapp.net`;
      }
    }

    try {
      await sock.sendMessage(targetJid, {
        text: `💬 *PESAN DARI OWNER / DEVELOPER:*\n\n${replyText}\n\n_Anda dapat membalas langsung pesan ini untuk merespons Owner._`,
      });

      await safeReply(
        sock,
        remoteJid,
        `✅ Pesan berhasil terkirim ke pengguna (\`${targetJid}\`)!`,
        msg,
        sentByBotIds
      );
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal mengirim pesan ke pengguna: ${err?.message || err}`, msg, sentByBotIds);
    }
  },
};
