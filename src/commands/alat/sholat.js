export default {
  name: 'sholat',
  aliases: ['jadwalsholat', 'salat', 'adzan'],
  category: 'Alat',
  description: 'Menampilkan jadwal sholat 5 waktu dan imsakiyah resmi real-time hari ini',
  usage: '.sholat Jakarta atau .sholat Medan',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds, startTyping }) {
    if (!args) {
      await safeReply(
        sock,
        remoteJid,
        `🕌 *Jadwal Sholat Real-Time*\n\n` +
          `• *Format:* *${p}sholat <nama_kota>*\n` +
          `• *Contoh:*\n` +
          `  - *${p}sholat Jakarta*\n` +
          `  - *${p}sholat Medan*\n` +
          `  - *${p}sholat Surabaya*\n` +
          `  - *${p}sholat Langkat*\n` +
          `  - *${p}sholat Bandung*`,
        msg,
        sentByBotIds
      );
      return;
    }

    const stopTyping = startTyping(sock, remoteJid);
    const queryCity = args.trim().toLowerCase();

    try {
      // 1. Cari ID Kota di MyQuran API (Kemenag Data)
      const searchUrl = `https://api.myquran.com/v2/sholat/kota/cari/${encodeURIComponent(queryCity)}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      let cityObj = searchData.data?.[0];

      if (cityObj && cityObj.id) {
        // Menggunakan waktu Asia/Jakarta untuk tanggal
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const schedUrl = `https://api.myquran.com/v2/sholat/jadwal/${cityObj.id}/${year}/${month}/${day}`;
        const schedRes = await fetch(schedUrl);
        const schedData = await schedRes.json();
        const j = schedData.data?.jadwal;

        if (j) {
          let text = `🕌 *JADWAL SHOLAT HARI INI*\n`;
          text += `📍 *Wilayah:* ${cityObj.lokasi}\n`;
          text += `📅 *Tanggal:* ${j.tanggal}\n`;
          text += `──────────────────────\n`;
          text += `• *Imsak   :* ${j.imsak} WIB\n`;
          text += `• *Subuh   :* ${j.subuh} WIB\n`;
          text += `• *Terbit  :* ${j.terbit} WIB\n`;
          text += `• *Dhuha   :* ${j.dhuha} WIB\n`;
          text += `• *Dzuhur  :* ${j.dzuhur} WIB\n`;
          text += `• *Ashar   :* ${j.ashar} WIB\n`;
          text += `• *Maghrib :* ${j.maghrib} WIB\n`;
          text += `• *Isya    :* ${j.isya} WIB\n`;
          text += `──────────────────────\n`;
          text += `_Sumber Data: Bimas Islam Kementerian Agama RI_`;

          await safeReply(sock, remoteJid, text, msg, sentByBotIds);
          return;
        }
      }

      // 2. Fallback jika nama kota tidak terdaftar di Kemenag: Aladhan Global API
      const aladhanUrl = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(queryCity)}&country=Indonesia&method=20`;
      const aladhanRes = await fetch(aladhanUrl);
      const aladhanData = await aladhanRes.json();

      if (aladhanData.code === 200 && aladhanData.data?.timings) {
        const t = aladhanData.data.timings;
        const d = aladhanData.data.date;

        let text = `🕌 *JADWAL SHOLAT: ${args.toUpperCase()}*\n`;
        text += `📅 *Tanggal:* ${d.readable} (${d.hijri?.day} ${d.hijri?.month?.en} ${d.hijri?.year} H)\n`;
        text += `──────────────────────\n`;
        text += `• *Imsak   :* ${t.Imsak}\n`;
        text += `• *Subuh   :* ${t.Fajr}\n`;
        text += `• *Terbit  :* ${t.Sunrise}\n`;
        text += `• *Dzuhur  :* ${t.Dhuhr}\n`;
        text += `• *Ashar   :* ${t.Asr}\n`;
        text += `• *Maghrib :* ${t.Maghrib}\n`;
        text += `• *Isya    :* ${t.Isha}\n`;
        text += `──────────────────────\n`;
        text += `_Perhitungan: Kemenag / Islamic Society of North America_`;

        await safeReply(sock, remoteJid, text, msg, sentByBotIds);
        return;
      }

      await safeReply(
        sock,
        remoteJid,
        `❌ Tidak dapat menemukan jadwal sholat untuk kota "${args}". Coba gunakan nama kota besar terdekat (contoh: *${p}sholat Medan*).`,
        msg,
        sentByBotIds
      );
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal mengambil jadwal sholat: ${err?.message || err}`, msg, sentByBotIds);
    } finally {
      await stopTyping();
    }
  },
};
