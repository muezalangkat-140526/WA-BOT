export default {
  name: 'rules',
  aliases: ['aturan'],
  category: 'Umum',
  description: 'Aturan pemakaian bot',
  async execute({ sock, remoteJid, msg, safeReply, sentByBotIds }) {
    const rulesText =
      `📜 *Aturan Pemakaian Bot*\n\n` +
      `1. Dilarang melakukan spam perintah beruntun (terdapat cooldown otomatis 3 detik).\n` +
      `2. Dilarang menggunakan bot untuk menyebarkan konten berbahaya, SARA, atau link penipuan.\n` +
      `3. Gunakan AI secara wajar dan bijak.\n` +
      `4. Nomor yang melanggar aturan dapat diblokir permanen oleh sistem.`;

    await safeReply(sock, remoteJid, rulesText, msg, sentByBotIds);
  },
};
