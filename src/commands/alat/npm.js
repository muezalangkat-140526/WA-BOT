export default {
  name: 'npm',
  aliases: ['npmjs'],
  category: 'Alat',
  description: 'Mencari paket pustaka (library) di npm registry',
  usage: '.npm baileys',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds, startTyping }) {
    if (!args) {
      await safeReply(sock, remoteJid, `ℹ️ Masukkan nama paket npm.\nContoh: *${p}npm axios*`, msg, sentByBotIds);
      return;
    }

    const stopTyping = startTyping(sock, remoteJid);
    try {
      const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(args)}&size=3`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Gagal menghubungi npm registry');

      const data = await res.json();
      const objects = data.objects || [];

      if (objects.length === 0) {
        await safeReply(sock, remoteJid, `❌ Paket "${args}" tidak ditemukan di npm registry.`, msg, sentByBotIds);
        return;
      }

      let text = `📦 *HASIL PENCARIAN NPM*\n\n`;
      for (const obj of objects) {
        const pkg = obj.package;
        text += `• *Nama:* \`${pkg.name}\` (v${pkg.version})\n`;
        text += `  Deskripsi: ${pkg.description || '-'}\n`;
        text += `  Author: ${pkg.publisher?.username || pkg.author?.name || '-'}\n`;
        text += `  Link: ${pkg.links?.npm || '-'}\n\n`;
      }

      await safeReply(sock, remoteJid, text.trim(), msg, sentByBotIds);
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal mencari paket npm: ${err?.message || err}`, msg, sentByBotIds);
    } finally {
      await stopTyping();
    }
  },
};
