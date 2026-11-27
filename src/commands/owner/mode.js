import { config } from '../../config.js';

export default {
  name: 'mode',
  category: 'Owner',
  description: 'Mengatur bot untuk semua orang (public) atau khusus owner (self)',
  usage: '.mode public atau .mode self',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, args, safeReply, sentByBotIds }) {
    const target = (args || '').toLowerCase().trim();
    if (target === 'self' || target === 'owner') {
      config.bot.selfMode = true;
      await safeReply(sock, remoteJid, '🔒 *Mode Bot:* Sekarang diset ke *SELF* (Hanya merespons Owner).', msg, sentByBotIds);
    } else if (target === 'public' || target === 'semua') {
      config.bot.selfMode = false;
      await safeReply(sock, remoteJid, '🌐 *Mode Bot:* Sekarang diset ke *PUBLIC* (Merespons semua pengguna).', msg, sentByBotIds);
    } else {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Mode saat ini: *${config.bot.selfMode ? 'SELF (Owner Only)' : 'PUBLIC (Semua Orang)'}*\n\nUbah mode dengan:\n• *.mode public*\n• *.mode self*`,
        msg,
        sentByBotIds
      );
    }
  },
};
