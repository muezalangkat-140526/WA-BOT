import { dbResponses } from '../../storage.js';

export default {
  name: 'setrespon',
  aliases: ['autorespon', 'respon'],
  category: 'Grup',
  description: 'Mengatur balasan otomatis jika ada pesan yang memuat kata kunci tertentu',
  usage: '.setrespon add info | Ini adalah informasi penting grup kami',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, args, p, safeReply, sentByBotIds }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya untuk grup.', msg, sentByBotIds);
      return;
    }

    if (!args || args === 'list') {
      const resps = dbResponses.get(remoteJid);
      const keys = Object.keys(resps);
      if (keys.length === 0) {
        await safeReply(sock, remoteJid, 'ℹ️ Belum ada respon otomatis di grup ini.', msg, sentByBotIds);
        return;
      }
      let text = `💬 *RESPON OTOMATIS TERSIMPAN:*\n\n`;
      for (const k of keys) {
        text += `• *${k}* -> "${resps[k]}"\n`;
      }
      await safeReply(sock, remoteJid, text, msg, sentByBotIds);
      return;
    }

    if (args.startsWith('del ') || args.startsWith('delete ')) {
      const keyword = args.replace(/^(del|delete)\s+/, '').trim().toLowerCase();
      dbResponses.delete(remoteJid, keyword);
      await safeReply(sock, remoteJid, `✅ Respon otomatis untuk kata kunci *${keyword}* berhasil dihapus.`, msg, sentByBotIds);
      return;
    }

    if (!args.includes('|')) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Format setrespon:\n*${p}setrespon <kata_kunci> | <jawaban>*\n\nContoh: *${p}setrespon jadwal | Jadwal kumpul setiap hari Sabtu pukul 19:00.*`,
        msg,
        sentByBotIds
      );
      return;
    }

    const [key, ...ans] = args.split('|').map((s) => s.trim());
    const answer = ans.join('|').trim();

    if (!key || !answer) {
      await safeReply(sock, remoteJid, '⚠️ Kata kunci dan jawaban tidak boleh kosong.', msg, sentByBotIds);
      return;
    }

    dbResponses.set(remoteJid, key, answer);
    await safeReply(sock, remoteJid, `✅ Respon otomatis berhasil disetel!\n• Kata Kunci: *${key}*\n• Balasan: _"${answer}"_`, msg, sentByBotIds);
  },
};
