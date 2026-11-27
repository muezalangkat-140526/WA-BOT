export default {
  name: 'panduan',
  aliases: ['tutorial'],
  category: 'Umum',
  description: 'Panduan lengkap cara memakai fitur-fitur bot',
  async execute({ sock, remoteJid, msg, p, safeReply, sentByBotIds }) {
    const text =
      `📘 *PANDUAN LENGKAP PENGGUNAAN BOT*\n\n` +
      `1. *Kecerdasan Buatan (AI)*:\n` +
      `   • Ketik langsung pertanyaan Anda (di chat pribadi) atau gunakan *${p}ai <pertanyaan>*.\n` +
      `   • Kirim gambar dengan caption *${p}ai* untuk menganalisis gambar.\n` +
      `   • Ketik *${p}hari* untuk mengecek tanggal dan jam real-time.\n\n` +
      `2. *Alat & Media*:\n` +
      `   • Kirim foto dengan caption *${p}sticker* untuk membuat stiker.\n` +
      `   • Gunakan *${p}kalkulator <ekspresi>* untuk perhitungan matematika.\n` +
      `   • Gunakan *${p}toqr <link>* untuk membuat QR code.\n` +
      `   • Gunakan *${p}vote <tanya> | <opsi1> | <opsi2>* untuk membuat polling WA.\n\n` +
      `3. *Grup WhatsApp*:\n` +
      `   • Admin dapat menggunakan *${p}tagall*, *${p}tutup*, *${p}kick*, dan *${p}groupinfo*.\n` +
      `   • Aktifkan anti-link dengan *${p}antilink on*.\n\n` +
      `_Ketik ${p}menu untuk melihat seluruh 50+ perintah._`;

    await safeReply(sock, remoteJid, text, msg, sentByBotIds);
  },
};
