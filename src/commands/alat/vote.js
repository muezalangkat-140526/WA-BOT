export default {
  name: 'vote',
  aliases: ['poll', 'polling'],
  category: 'Alat',
  description: 'Membuat polling resmi WhatsApp di grup atau chat pribadi',
  usage: '.vote Judul Polling | Pilihan 1 | Pilihan 2',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds }) {
    if (!args || !args.includes('|')) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Format polling: pisahkan pertanyaan dan pilihan dengan tanda *|*.\nContoh:\n*${p}vote Menu makan siang? | Nasi Goreng | Bakso | Mie Ayam*`,
        msg,
        sentByBotIds
      );
      return;
    }

    const parts = args.split('|').map((s) => s.trim()).filter(Boolean);
    if (parts.length < 3) {
      await safeReply(sock, remoteJid, `⚠️ Polling membutuhkan minimal 1 pertanyaan dan 2 pilihan jawaban.`, msg, sentByBotIds);
      return;
    }

    const question = parts[0];
    const options = parts.slice(1);

    if (options.length > 12) {
      await safeReply(sock, remoteJid, `⚠️ WhatsApp membatasi maksimal 12 pilihan jawaban per polling.`, msg, sentByBotIds);
      return;
    }

    await sock.sendMessage(
      remoteJid,
      {
        poll: {
          name: question,
          values: options,
          selectableCount: 1,
        },
      },
      { quoted: msg }
    );
  },
};
