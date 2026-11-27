import fs from 'fs';
import path from 'path';

export default {
  name: 'ingat',
  category: 'AI',
  description: 'Menambahkan pengetahuan kustom ke dalam ingatan AI',
  usage: '.ingat Jam operasional toko kami adalah pukul 08:00 - 21:00 WIB',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds }) {
    if (!args) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Masukkan informasi yang ingin diajarkan ke AI.\nContoh: *${p}ingat Alamat kantor kami di Jl. Sudirman No. 10 Jakarta*`,
        msg,
        sentByBotIds
      );
      return;
    }

    try {
      const knowledgePath = path.join(process.cwd(), 'data', 'knowledge.txt');
      const dir = path.dirname(knowledgePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      fs.appendFileSync(knowledgePath, `\n- ${args.trim()}`, 'utf8');
      await safeReply(
        sock,
        remoteJid,
        `🧠 *Pengetahuan Berhasil Disimpan!*\nAI sekarang akan mengingat:\n_"${args.trim()}"_`,
        msg,
        sentByBotIds
      );
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal menyimpan pengetahuan: ${err?.message || err}`, msg, sentByBotIds);
    }
  },
};
