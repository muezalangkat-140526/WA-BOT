import { dbWarns } from '../../storage.js';

export default {
  name: 'warn',
  aliases: ['peringatkan'],
  category: 'Grup',
  description: 'Memberi peringatan ke anggota (otomatis kick jika mencapai 3 kali)',
  usage: '.warn @member atau reply pesan target dengan .warn',
  isGroupOnly: true,
  isAdminOnly: true,
  async execute({ sock, remoteJid, msg, isGroup, sender, args, safeReply, sentByBotIds, isOwner }) {
    if (!isGroup) {
      await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya untuk grup.', msg, sentByBotIds);
      return;
    }

    const quoted = msg.message?.extendedTextMessage?.contextInfo;
    let targetJid = quoted?.participant || (quoted?.mentionedJid && quoted.mentionedJid[0]);

    if (!targetJid) {
      await safeReply(sock, remoteJid, 'ℹ️ Tag atau reply pesan anggota yang ingin diberi peringatan (*.warn*).', msg, sentByBotIds);
      return;
    }

    if (args && (args.toLowerCase() === 'reset' || args.toLowerCase() === 'clear')) {
      dbWarns.reset(remoteJid, targetJid);
      await safeReply(sock, remoteJid, `🕊️ Peringatan untuk @${targetJid.split('@')[0]} telah direset menjadi 0.`, msg, sentByBotIds);
      return;
    }

    const count = dbWarns.add(remoteJid, targetJid);

    if (count >= 3) {
      await safeReply(
        sock,
        remoteJid,
        `🚨 @${targetJid.split('@')[0]} telah menerima *3/3 Peringatan* dan akan dikeluarkan dari grup.`,
        msg,
        sentByBotIds
      );
      try {
        await sock.groupParticipantsUpdate(remoteJid, [targetJid], 'remove');
        dbWarns.reset(remoteJid, targetJid);
      } catch (err) {
        await safeReply(sock, remoteJid, `❌ Gagal mengeluarkan anggota: ${err?.message || err}`, msg, sentByBotIds);
      }
    } else {
      await safeReply(
        sock,
        remoteJid,
        `⚠️ *PERINGATAN [${count}/3]*\nKepada: @${targetJid.split('@')[0]}\nMohon patuhi aturan grup! Mencapai 3 peringatan akan dikeluarkan secara otomatis.`,
        msg,
        sentByBotIds
      );
    }
  },
};
