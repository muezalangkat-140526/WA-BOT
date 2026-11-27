import { config } from '../../config.js';

export default {
  name: 'owner',
  aliases: ['developer', 'creator', 'pembuat', 'adminbot'],
  category: 'Umum',
  description: 'Menghubungkan dan mengalihkan percakapan langsung ke Owner / Developer bot',
  async execute({ sock, remoteJid, msg, sender, rawText, safeReply, sentByBotIds }) {
    // 1. Ambil nomor HP utama Owner dari konfigurasi .env
    const phoneOwner =
      config.bot.ownerNumbers.find((n) => n.startsWith('62') && n.length <= 15) ||
      config.bot.ownerNumbers.find((n) => n.length >= 10 && n.length <= 14);

    if (!phoneOwner) {
      await safeReply(
        sock,
        remoteJid,
        '⚠️ Nomor WhatsApp Owner / Developer belum dikonfigurasi di file `.env` (variabel `OWNER_NUMBERS`).',
        msg,
        sentByBotIds
      );
      return;
    }

    const ownerName = 'Owner ' + config.bot.name;

    console.log(`[OWNER_REDIRECT] Permintaan bicara ke owner dari: ${sender}`);

    // 2. Buat Kartu Kontak WhatsApp (vCard) interaktif
    const vcard =
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      `FN:${ownerName}\n` +
      `ORG:Developer ${config.bot.name};\n` +
      `TEL;type=CELL;type=VOICE;waid=${phoneOwner}:+${phoneOwner}\n` +
      'END:VCARD';

    // 3. Kirim Kartu Kontak ke pengguna yang meminta
    await sock.sendMessage(
      remoteJid,
      {
        contacts: {
          displayName: ownerName,
          contacts: [{ vcard }],
        },
      },
      { quoted: msg }
    );

    // 4. Kirim pesan pengantar & link cepat ke pengguna
    const redirectText =
      `👋 *Halo! Anda sedang dialihkan ke Owner / Developer.*\n\n` +
      `• *Nama:* ${ownerName}\n` +
      `• *Nomor WhatsApp:* +${phoneOwner}\n` +
      `• *Tautan Chat Cepat:* https://wa.me/${phoneOwner}\n\n` +
      `_Silakan ketuk tombol *Kirim Pesan / Chat* pada kartu kontak di atas untuk memulai obrolan langsung._`;

    await safeReply(sock, remoteJid, redirectText, msg, sentByBotIds);

    // 5. Analisis Identitas Pengirim (Nomor Telepon Asli vs WhatsApp LID)
    const senderClean = (sender || '').replace(/[^0-9]/g, '');
    const isFromGroup = remoteJid.endsWith('@g.us');
    const pushName = msg.pushName || 'Pengguna';

    // Periksa apakah ini nomor telepon biasa atau LID privasi WhatsApp
    const pn = msg?.key?.participantPn || msg?.participantPn;
    const isLid = sender.endsWith('@lid') || (senderClean.length >= 14 && !senderClean.startsWith('62'));
    const realPhone = pn ? pn.replace(/[^0-9]/g, '') : (!isLid && senderClean.startsWith('62') ? senderClean : null);

    let contactDetail = '';
    if (realPhone) {
      contactDetail =
        `• *Pengguna:* ${pushName} (+${realPhone})\n` +
        `• *Tautan WhatsApp:* https://wa.me/${realPhone}`;
    } else {
      contactDetail =
        `• *Pengguna:* ${pushName} (\`${senderClean}@lid\`)\n` +
        `• *Status Nomor:* Nomor telepon disembunyikan oleh sistem privasi WhatsApp pengguna (Linked ID).\n` +
        `• *Cara Hubungi:* Pengguna telah menerima kartu kontak Anda dan bisa langsung chat. Atau Anda dapat membalasnya lewat bot dengan perintah:\n` +
        `  👉 *.balas ${senderClean} <pesan Anda>*`;
    }

    const alertToOwner =
      `🔔 *NOTIFIKASI PENGALIHAN KE OWNER*\n\n` +
      `Ada pengguna yang meminta berbicara langsung dengan Anda:\n` +
      `${contactDetail}\n` +
      `• *Dari Chat:* ${isFromGroup ? 'Grup WhatsApp' : 'Obrolan Pribadi'}\n` +
      `• *Pesan Terakhir:* _"${rawText || 'Meminta kontak owner'}"_\n\n` +
      `_Kartu kontak resmi Anda telah dikirimkan ke pengguna tersebut._`;

    // Kirim notifikasi ke nomor HP Owner
    const targetJid = `${phoneOwner}@s.whatsapp.net`;
    try {
      console.log(`[OWNER_NOTIF] Mengirim notifikasi alert ke Owner: ${targetJid}`);
      await sock.sendMessage(targetJid, { text: alertToOwner });
      console.log(`[OWNER_NOTIF] Sukses terkirim ke Owner: ${targetJid}`);
    } catch (err) {
      console.error(`[OWNER_NOTIF_ERROR] Gagal mengirim ke ${targetJid}:`, err?.message || err);
    }
  },
};
