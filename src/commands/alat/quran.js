export default {
  name: 'quran',
  aliases: ['alquran', 'surah', 'ayat'],
  category: 'Alat',
  description: 'Menampilkan ayat Al-Qur\'an teks Arab dan terjemahan Bahasa Indonesia resmi Kemenag',
  usage: '.quran 1:1 atau .quran 2:255 (Ayat Kursi)',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds, startTyping }) {
    if (!args) {
      await safeReply(
        sock,
        remoteJid,
        `📖 *Pencarian Al-Qur'an Digital*\n\n` +
          `• *Format:* *${p}quran <nomor_surah:nomor_ayat>*\n` +
          `• *Contoh:*\n` +
          `  - *${p}quran 1:1* (Al-Fatihah ayat 1)\n` +
          `  - *${p}quran 2:255* (Ayat Kursi)\n` +
          `  - *${p}quran 112:1* (Al-Ikhlas ayat 1)\n` +
          `  - *${p}quran 1* (Menampilkan Surah 1 utuh)`,
        msg,
        sentByBotIds
      );
      return;
    }

    const stopTyping = startTyping(sock, remoteJid);
    try {
      const cleanInput = args.trim();

      // Kasus 1: Format Surah:Ayat (misal 2:255)
      if (cleanInput.includes(':')) {
        const [surahNum, ayahNum] = cleanInput.split(':').map((s) => s.trim());
        const url = `https://api.alquran.cloud/v1/ayah/${encodeURIComponent(surahNum)}:${encodeURIComponent(ayahNum)}/editions/quran-uthmani,id.indonesian`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.code !== 200 || !data.data || data.data.length < 2) {
          await safeReply(sock, remoteJid, `❌ Ayat Al-Qur'an "${cleanInput}" tidak ditemukan. Pastikan nomor surah (1-114) dan nomor ayat sesuai.`, msg, sentByBotIds);
          return;
        }

        const arabic = data.data[0];
        const indonesian = data.data[1];

        let text = `📖 *QS. ${arabic.surah.englishName} (${arabic.surah.name}) [Ayat ${arabic.numberInSurah}]*\n`;
        text += `_Surah ke-${arabic.surah.number} • ${arabic.surah.revelationType === 'Meccan' ? 'Makkiyyah' : 'Madaniyyah'} • Juz ${arabic.juz}_\n`;
        text += `──────────────────────\n\n`;
        text += `${arabic.text}\n\n`;
        text += `*Artinya:*\n_"${indonesian.text}"_\n\n`;
        text += `──────────────────────\n_Kemenag RI_`;

        await safeReply(sock, remoteJid, text, msg, sentByBotIds);
        return;
      }

      // Kasus 2: Nomor Surah Saja (misal .quran 1 atau .quran 114)
      const surahOnly = parseInt(cleanInput);
      if (!isNaN(surahOnly) && surahOnly >= 1 && surahOnly <= 114) {
        const url = `https://api.alquran.cloud/v1/surah/${surahOnly}/editions/quran-uthmani,id.indonesian`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.code !== 200 || !data.data) {
          throw new Error('Gagal mengambil data surah');
        }

        const arabicSurah = data.data[0];
        const indoSurah = data.data[1];

        let text = `📖 *SURAH ${arabicSurah.englishName.toUpperCase()} (${arabicSurah.name})*\n`;
        text += `_Surah ke-${arabicSurah.number} • ${arabicSurah.numberOfAyahs} Ayat • ${arabicSurah.revelationType === 'Meccan' ? 'Makkiyyah' : 'Madaniyyah'}_\n`;
        text += `──────────────────────\n\n`;

        // Tampilkan sampai 7 ayat agar tidak melebihi batasan panjang pesan WhatsApp
        const maxDisplay = Math.min(arabicSurah.ayahs.length, 7);
        for (let i = 0; i < maxDisplay; i++) {
          const ar = arabicSurah.ayahs[i];
          const id = indoSurah.ayahs[i];
          text += `*[${ar.numberInSurah}]* ${ar.text}\n`;
          text += `_"${id.text}"_\n\n`;
        }

        if (arabicSurah.numberOfAyahs > 7) {
          text += `_Menampilkan 7 dari ${arabicSurah.numberOfAyahs} ayat. Untuk ayat spesifik gunakan ${p}quran ${surahOnly}:<ayat>._\n`;
        }
        text += `──────────────────────`;

        await safeReply(sock, remoteJid, text.trim(), msg, sentByBotIds);
        return;
      }

      await safeReply(
        sock,
        remoteJid,
        `⚠️ Format tidak valid. Gunakan nomor surah dan ayat.\nContoh: *${p}quran 2:255* atau *${p}quran 1:1*`,
        msg,
        sentByBotIds
      );
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal mengambil data Al-Qur'an: ${err?.message || err}`, msg, sentByBotIds);
    } finally {
      await stopTyping();
    }
  },
};
