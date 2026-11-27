export default {
  name: 'getlid',
  aliases: ['idku', 'lid'],
  category: 'Alat',
  description: 'Melihat ID WhatsApp dan Linked ID (LID) Anda',
  async execute({ sock, remoteJid, msg, sender, safeReply, sentByBotIds }) {
    const isGroup = remoteJid.endsWith('@g.us');
    let text = `👤 *Informasi Identitas WhatsApp Anda:*\n\n`;
    text += `• *Sender ID:* \`${sender}\`\n`;
    text += `• *Chat JID:* \`${remoteJid}\`\n`;
    text += `• *Tipe Chat:* ${isGroup ? 'Grup WhatsApp' : 'Obrolan Pribadi'}\n\n`;
    text += `_ID di atas digunakan untuk pendaftaran Owner di file .env._`;

    await safeReply(sock, remoteJid, text, msg, sentByBotIds);
  },
};
