export default {
  name: 'translate',
  aliases: ['tr'],
  category: 'Alat',
  description: 'Menerjemahkan teks ke berbagai bahasa asing',
  usage: '.translate en Selamat pagi dunia',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds }) {
    if (!args) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Format salah. Gunakan:\n*${p}translate <kode_bahasa> <teks>*\nContoh: *${p}translate en Selamat pagi, apa kabar?*\n(en=Inggris, id=Indonesia, ar=Arab, ja=Jepang)`,
        msg,
        sentByBotIds
      );
      return;
    }

    const spaceIdx = args.indexOf(' ');
    if (spaceIdx === -1) {
      await safeReply(sock, remoteJid, `ℹ️ Masukkan teks yang ingin diterjemahkan setelah kode bahasa.`, msg, sentByBotIds);
      return;
    }

    const targetLang = args.slice(0, spaceIdx).toLowerCase().trim();
    const textToTranslate = args.slice(spaceIdx + 1).trim();

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(textToTranslate)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Gagal memproses terjemahan');

      const data = await res.json();
      const translated = data[0]?.map((item) => item[0]).join('') || '';

      if (!translated) {
        throw new Error('Hasil terjemahan kosong');
      }

      await safeReply(
        sock,
        remoteJid,
        `🌐 *Terjemahan [${targetLang.toUpperCase()}]:*\n\n${translated}`,
        msg,
        sentByBotIds
      );
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal menerjemahkan teks: ${err?.message || err}`, msg, sentByBotIds);
    }
  },
};
