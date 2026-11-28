import { config } from '../../config.js';
import { dbSettings } from '../../storage.js';

export default {
  name: 'listowner',
  aliases: ['ownerlist', 'owners'],
  category: 'Owner',
  description: 'Menampilkan seluruh nomor telepon dan WhatsApp LID yang memiliki akses Owner',
  usage: '.listowner',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, p, safeReply, sentByBotIds }) {
    const settings = dbSettings.get();
    const envOwners = config.bot.ownerNumbers || [];
    const extraOwners = settings.extraOwners || [];

    const allOwners = Array.from(
      new Set(
        [...envOwners, ...extraOwners]
          .map((s) => (s || '').replace(/[^0-9]/g, ''))
          .filter((s) => s.length >= 6)
      )
    );

    if (allOwners.length === 0) {
      await safeReply(sock, remoteJid, 'ℹ️ Tidak ada Owner yang terdaftar di sistem.', msg, sentByBotIds);
      return;
    }

    let text = `👑 *DAFTAR PEMILIK (OWNER) BOT AKTIF*\n\n`;
    allOwners.forEach((id, idx) => {
      const isLid = id.length >= 14;
      const typeStr = isLid ? 'WhatsApp LID' : 'Nomor WhatsApp';
      text += `${idx + 1}. \`${id}\` (${typeStr})\n`;
    });

    text += `\n──────────────────────\n`;
    text += `💡 *Panduan Manajemen Owner:*\n`;
    text += `• Tambah owner baru: *${p}addowner <nomor/LID>*\n`;
    text += `• Hapus owner: *${p}delowner <nomor/LID>*`;

    await safeReply(sock, remoteJid, text, msg, sentByBotIds);
  },
};
