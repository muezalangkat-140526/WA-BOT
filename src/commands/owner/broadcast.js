import { getAllContacts } from '../../contacts.js';
import { config } from '../../config.js';

export default {
  name: 'bc',
  aliases: ['broadcast'],
  category: 'Owner',
  description: 'Mengirim pesan pengumuman/siaran ke seluruh kontak terdata',
  usage: '.bc Halo semuanya, bot sedang update fitur baru.',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds }) {
    if (!args) {
      await safeReply(sock, remoteJid, `ℹ️ Masukkan pesan yang ingin disiarkan.\nContoh: *${p}bc Pengumuman jadwal libur.*`, msg, sentByBotIds);
      return;
    }

    const allContacts = getAllContacts().filter((c) => c !== remoteJid);
    if (allContacts.length === 0) {
      await safeReply(sock, remoteJid, 'ℹ️ Belum ada kontak lain yang tercatat di database.', msg, sentByBotIds);
      return;
    }

    await safeReply(sock, remoteJid, `📢 Memulai broadcast ke ${allContacts.length} kontak... Harap tunggu.`, msg, sentByBotIds);

    let successCount = 0;
    let failCount = 0;
    const bcMessage = `📢 *PENGUMUMAN DARI ${config.bot.name.toUpperCase()}*\n\n${args}`;

    for (const targetJid of allContacts) {
      try {
        await sock.sendMessage(targetJid, { text: bcMessage });
        successCount++;
        await new Promise((r) => setTimeout(r, 1500));
      } catch {
        failCount++;
      }
    }

    await safeReply(
      sock,
      remoteJid,
      `✅ Broadcast selesai!\n• Terkirim: ${successCount}\n• Gagal: ${failCount}`,
      msg,
      sentByBotIds
    );
  },
};
