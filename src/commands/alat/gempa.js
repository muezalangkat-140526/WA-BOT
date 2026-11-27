export default {
  name: 'gempa',
  aliases: ['bmkg', 'tsunami', 'infogempa'],
  category: 'Alat',
  description: 'Menampilkan data gempa bumi terkini dan potensi tsunami resmi dari BMKG RI beserta peta guncangan',
  usage: '.gempa',
  async execute({ sock, remoteJid, msg, safeReply, sentByBotIds, startTyping }) {
    const stopTyping = startTyping(sock, remoteJid);
    try {
      const res = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json', {
        headers: { 'User-Agent': 'WhatsAppBotBMKG/1.0' },
      });

      if (!res.ok) throw new Error(`BMKG server merespons HTTP ${res.status}`);

      const data = await res.json();
      const g = data?.Infogempa?.gempa;

      if (!g) {
        throw new Error('Data gempa tidak ditemukan');
      }

      const imageUrl = `https://data.bmkg.go.id/DataMKG/TEWS/${g.Shakemap}`;

      let caption = `🚨 *INFORMASI GEMPA BUMI TERKINI (BMKG)*\n`;
      caption += `──────────────────────\n`;
      caption += `• *Waktu Gempa :* ${g.Tanggal} - ${g.Jam}\n`;
      caption += `• *Magnitudo   :* *${g.Magnitude} SR*\n`;
      caption += `• *Kedalaman   :* ${g.Kedalaman}\n`;
      caption += `• *Koordinat   :* ${g.Coordinates} (${g.Lintang} - ${g.Bujur})\n`;
      caption += `• *Pusat Gempa :* ${g.Wilayah}\n`;
      caption += `• *Potensi     :* *${g.Potensi}*\n`;
      if (g.Dirasakan) {
        caption += `• *Dirasakan   :* ${g.Dirasakan}\n`;
      }
      caption += `──────────────────────\n`;
      caption += `_Sumber Resmi: BMKG Indonesia (Badan Meteorologi, Klimatologi, dan Geofisika)_\n`;
      caption += `_Aktifkan notifikasi otomatis di grup ini dengan ketik: *.peringatandini on*_`;

      // Coba unduh peta shakemap untuk dikirim sebagai gambar
      try {
        const imgRes = await fetch(imageUrl);
        if (imgRes.ok) {
          const arrayBuffer = await imgRes.arrayBuffer();
          const imgBuffer = Buffer.from(arrayBuffer);

          await sock.sendMessage(
            remoteJid,
            {
              image: imgBuffer,
              caption,
            },
            { quoted: msg }
          );
          return;
        }
      } catch {}

      // Fallback pesan teks jika gambar peta BMKG gagal diunduh
      await safeReply(sock, remoteJid, caption, msg, sentByBotIds);
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal mengambil data BMKG: ${err?.message || 'Server BMKG sibuk'}`, msg, sentByBotIds);
    } finally {
      await stopTyping();
    }
  },
};
