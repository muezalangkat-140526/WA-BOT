export default {
  name: 'tiktok',
  aliases: ['tt', 'ttdl'],
  category: 'Unduh',
  description: 'Mengunduh video TikTok tanpa tanda air (watermark) dari URL tautan',
  usage: '.tiktok https://vt.tiktok.com/xxxxxx/',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds, startTyping }) {
    if (!args) {
      await safeReply(sock, remoteJid, `ℹ️ Masukkan tautan/link video TikTok.\nContoh: *${p}tiktok https://vt.tiktok.com/ZSxxxxxx/*`, msg, sentByBotIds);
      return;
    }

    const stopTyping = startTyping(sock, remoteJid);
    try {
      const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(args.trim())}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('API pengunduh tidak merespons');

      const data = await res.json();
      if (data.code !== 0 || !data.data) {
        throw new Error(data.msg || 'Gagal mengekstrak video TikTok');
      }

      const videoUrl = data.data.play || data.data.wmplay;
      const title = data.data.title || 'Video TikTok';
      const author = data.data.author?.nickname || 'TikTok User';

      if (!videoUrl) {
        throw new Error('Link video tidak ditemukan');
      }

      await safeReply(sock, remoteJid, `⏳ Mengirim video: *${title.slice(0, 50)}...*\nAuthor: @${author}`, msg, sentByBotIds);

      await sock.sendMessage(
        remoteJid,
        {
          video: { url: videoUrl },
          caption: `🎬 *${title}*\n_Diupload oleh @${author}_\n_Dihasilkan via WhatsApp Bot_`,
        },
        { quoted: msg }
      );
    } catch (err) {
      await safeReply(
        sock,
        remoteJid,
        `❌ Gagal mengunduh video TikTok: ${err?.message || 'Server sedang sibuk'}\nPastikan link bersifat publik dan bukan akun privat.`,
        msg,
        sentByBotIds
      );
    } finally {
      await stopTyping();
    }
  },
};
