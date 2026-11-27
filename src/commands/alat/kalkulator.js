/**
 * Evaluasi ekspresi matematika sederhana secara aman tanpa eval()
 */
function safeCalculate(expression) {
  // Hanya izinkan angka, operator dasar, titik, kurung, dan spasi
  const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
  if (!sanitized.trim()) return null;

  try {
    // Evaluasi menggunakan Function terisolasi terbatas
    const result = new Function(`'use strict'; return (${sanitized});`)();
    if (typeof result === 'number' && !Number.isNaN(result) && Number.isFinite(result)) {
      return result;
    }
  } catch {}
  return null;
}

export default {
  name: 'kalkulator',
  aliases: ['hitung', 'calc'],
  category: 'Alat',
  description: 'Menghitung ekspresi matematika secara instan',
  usage: '.kalkulator 25 * (10 + 5) / 2',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds }) {
    if (!args) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Masukkan ekspresi matematika yang ingin dihitung.\nContoh: *${p}kalkulator 150000 * 11 / 100*`,
        msg,
        sentByBotIds
      );
      return;
    }

    const res = safeCalculate(args);
    if (res === null) {
      await safeReply(
        sock,
        remoteJid,
        `❌ Ekspresi matematika tidak valid. Hanya mendukung operasi angka (+, -, *, /, kurung).`,
        msg,
        sentByBotIds
      );
      return;
    }

    await safeReply(
      sock,
      remoteJid,
      `🧮 *Hasil Perhitungan:*\n\`${args}\` = *${res.toLocaleString('id-ID')}*`,
      msg,
      sentByBotIds
    );
  },
};
