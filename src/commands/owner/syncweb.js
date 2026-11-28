import fs from 'fs';
import path from 'path';

export default {
  name: 'syncweb',
  aliases: ['tarikweb', 'updateweb'],
  category: 'Owner',
  description: 'Menyinkronkan basis pengetahuan AI (Knowledge Base) langsung dari website salwa-dev.my.id',
  usage: '.syncweb atau .syncweb https://www.salwa-dev.my.id/',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds, startTyping }) {
    const targetUrl = (args && args.trim().startsWith('http')) ? args.trim() : 'https://www.salwa-dev.my.id/';
    const stopTyping = startTyping(sock, remoteJid);

    try {
      await safeReply(sock, remoteJid, `⏳ Membaca dan menyinkronkan data dari *${targetUrl}*...`, msg, sentByBotIds);

      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
        },
        signal: AbortSignal.timeout(12000),
      });

      if (!res.ok) throw new Error(`Server website merespons status ${res.status}`);

      const html = await res.text();

      // Ekstraksi teks bersih
      let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
      clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
      clean = clean.replace(/<[^>]+>/g, ' ');
      clean = clean.replace(/\s+/g, ' ').trim();

      if (clean.length < 50) {
        throw new Error('Konten website terlalu sedikit atau tidak terbaca.');
      }

      const knowledgePath = path.join(process.cwd(), 'data', 'knowledge.txt');
      const dir = path.dirname(knowledgePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const knowledgeHeader = `# ========================================================
# KNOWLEDGE BASE SALWA DEV & MUHAMMAD ANWAR
# Sumber Resmi: ${targetUrl}
# Terakhir Disinkronkan: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB
# ========================================================

Ringkasan Profil & Layanan Website (${targetUrl}):
${clean}

Pedoman Asisten:
- Gunakan informasi di atas untuk menjawab calon klien yang bertanya tentang jasa pembuatan website, portofolio, teknologi, maupun latar belakang Muhammad Anwar (salwa.dev).
- Jika ada penawaran proyek khusus atau negosiasi harga spesifik, arahkan klien untuk mengetik .owner agar berbicara langsung dengan Muhammad Anwar.
`;

      fs.writeFileSync(knowledgePath, knowledgeHeader, 'utf8');

      await safeReply(
        sock,
        remoteJid,
        `✅ *Sinkronisasi Berhasil!*\n\n• Sumber: *${targetUrl}*\n• Ukuran data tersimpan: *${clean.length} karakter*\n\n_AI sekarang dapat menjawab seluruh pertanyaan klien mengenai layanan, portofolio, dan keahlian di salwa-dev.my.id secara detail._`,
        msg,
        sentByBotIds
      );
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal sinkronisasi website: ${err?.message || err}`, msg, sentByBotIds);
    } finally {
      await stopTyping();
    }
  },
};
