import { dbAFK } from '../../storage.js';

export default {
  name: 'afk',
  category: 'Grup',
  description: 'Menandai status Anda sedang tidak aktif / AFK dengan alasan',
  usage: '.afk Sedang belajar ujian',
  async execute({ sock, remoteJid, msg, sender, args, safeReply, sentByBotIds }) {
    const reason = args || 'Tanpa keterangan';
    dbAFK.set(sender, reason);

    await safeReply(
      sock,
      remoteJid,
      `💤 @${sender.split('@')[0]} sekarang berstatus *AFK (Tidak Aktif)*.\nAlasan: _"${reason}"_`,
      msg,
      sentByBotIds
    );
  },
};
