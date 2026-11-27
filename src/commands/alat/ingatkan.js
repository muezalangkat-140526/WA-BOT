export default {
  name: 'ingatkan',
  aliases: ['remind', 'reminder'],
  category: 'Alat',
  description: 'Membuat pengingat otomatis dalam hitungan menit atau jam',
  usage: '.ingatkan 10m Matikan kompor air',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds }) {
    if (!args) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Format pengingat:\n*${p}ingatkan <durasi> <pesan>*\n\nContoh durasi:\n• *10m* (10 menit)\n• *2h* (2 jam)\n• *30s* (30 detik)\n\nContoh: *${p}ingatkan 15m Telepon customer*`,
        msg,
        sentByBotIds
      );
      return;
    }

    const spaceIdx = args.indexOf(' ');
    if (spaceIdx === -1) {
      await safeReply(sock, remoteJid, 'ℹ️ Masukkan pesan pengingat setelah waktu durasi.', msg, sentByBotIds);
      return;
    }

    const timeStr = args.slice(0, spaceIdx).trim().toLowerCase();
    const reminderText = args.slice(spaceIdx + 1).trim();

    let durationMs = 0;
    const num = parseInt(timeStr);

    if (isNaN(num) || num <= 0) {
      await safeReply(sock, remoteJid, '❌ Durasi tidak valid.', msg, sentByBotIds);
      return;
    }

    if (timeStr.endsWith('s')) durationMs = num * 1000;
    else if (timeStr.endsWith('m')) durationMs = num * 60 * 1000;
    else if (timeStr.endsWith('h') || timeStr.endsWith('j')) durationMs = num * 60 * 60 * 1000;
    else durationMs = num * 60 * 1000; // default menit

    await safeReply(
      sock,
      remoteJid,
      `⏰ *Pengingat Disetel!*\nBot akan mengingatkan Anda dalam *${timeStr}*:\n_"${reminderText}"_`,
      msg,
      sentByBotIds
    );

    setTimeout(async () => {
      try {
        await sock.sendMessage(
          remoteJid,
          {
            text: `⏰ *WAKTU PENGINGAT TELAH TIBA!*\n\n📝 Pesan: *${reminderText}*`,
          },
          { quoted: msg }
        );
      } catch {}
    }, durationMs);
  },
};
