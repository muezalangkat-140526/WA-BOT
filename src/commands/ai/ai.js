import { generateAIResponse } from '../../ai.js';

export default {
  name: 'ai',
  aliases: ['tanya', 'ask'],
  category: 'AI',
  description: 'Tanya jawab cerdas dengan AI yang mengingat konteks obrolan',
  usage: '.ai Jelaskan apa itu Virtual Private Server',
  async execute({ sock, remoteJid, msg, args, isImage, safeReply, sentByBotIds, startTyping }) {
    if (!args && !isImage) {
      await safeReply(sock, remoteJid, 'ℹ️ Masukkan pertanyaan Anda. Contoh: *.ai Cara merawat kucing persia*', msg, sentByBotIds);
      return;
    }

    const stopTyping = startTyping(sock, remoteJid);
    try {
      const response = await generateAIResponse(remoteJid, args || 'Jelaskan gambar ini');
      await safeReply(sock, remoteJid, response, msg, sentByBotIds);
    } finally {
      await stopTyping();
    }
  },
};
