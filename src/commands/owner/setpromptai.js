import fs from 'fs';
import path from 'path';

const PROMPT_FILE = path.join(process.cwd(), 'data', 'custom_prompt.txt');

export default {
  name: 'setpromptai',
  category: 'Owner',
  description: 'Mengatur kepribadian, karakter, dan aturan jawaban AI sistem',
  usage: '.setpromptai Kamu adalah konsultan IT yang sangat berpengalaman',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, args, safeReply, sentByBotIds }) {
    if (!args) {
      let current = '(Standar / Bawaan)';
      if (fs.existsSync(PROMPT_FILE)) current = fs.readFileSync(PROMPT_FILE, 'utf8');
      await safeReply(sock, remoteJid, `ℹ️ System Prompt Saat Ini:\n_"${current}"_\n\nUbah dengan:\n*.setpromptai <aturan_dan_karakter>*`, msg, sentByBotIds);
      return;
    }

    fs.writeFileSync(PROMPT_FILE, args.trim(), 'utf8');
    await safeReply(sock, remoteJid, `✅ Karakter AI berhasil diubah!\nPrompt baru:\n_"${args.trim()}"_`, msg, sentByBotIds);
  },
};
