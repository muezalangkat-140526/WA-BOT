import { config } from '../../config.js';

export default {
  name: 'report',
  aliases: ['lapor'],
  category: 'Umum',
  description: 'Mengirimkan pesan laporan kendala atau bug langsung ke Owner bot',
  usage: '.report Bot tidak merespons di grup saya',
  async execute({ sock, remoteJid, msg, sender, args, p, safeReply, sentByBotIds }) {
    if (!args) {
      await safeReply(sock, remoteJid, `ℹ️ Masukkan pesan yang ingin dilaporkan ke Owner.\nContoh: *${p}report Fitur stiker tidak bisa memproses gambar*`, msg, sentByBotIds);
      return;
    }

    if (!config.bot.ownerNumbers.length) {
      await safeReply(sock, remoteJid, '⚠️ Nomor Owner belum disetel oleh admin sistem.', msg, sentByBotIds);
      return;
    }

    const reportMsg =
      `🚨 *LAPORAN PENGGUNA DITERIMA*\n\n` +
      `• *Pengirim:* @${sender.split('@')[0]}\n` +
      `• *Dari Chat:* \`${remoteJid}\`\n` +
      `• *Isi Laporan:*\n"${args.trim()}"`;

    let sent = false;
    for (const owner of config.bot.ownerNumbers) {
      const targetJid = owner.includes('@') ? owner : `${owner}@s.whatsapp.net`;
      try {
        await sock.sendMessage(targetJid, { text: reportMsg, mentions: [sender] });
        sent = true;
      } catch {}
    }

    if (sent) {
      await safeReply(sock, remoteJid, `✅ Laporan Anda berhasil diteruskan kepada Owner bot. Terima kasih!`, msg, sentByBotIds);
    } else {
      await safeReply(sock, remoteJid, `❌ Gagal meneruskan laporan. Coba lagi nanti.`, msg, sentByBotIds);
    }
  },
};
