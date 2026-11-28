import fs from 'fs';
import path from 'path';
import { config } from '../../config.js';
import { dbSettings } from '../../storage.js';

export default {
  name: 'addowner',
  category: 'Owner',
  description: 'Menambahkan nomor atau LID owner baru ke sesi berjalan dan database permanen',
  usage: '.addowner 628123456789 atau reply target dengan .addowner',
  isOwnerOnly: true,
  async execute({ sock, remoteJid, msg, args, safeReply, sentByBotIds }) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo;
    let target = quoted?.participant || (args || '').trim();

    if (!target) {
      await safeReply(sock, remoteJid, 'ℹ️ Masukkan nomor atau reply pesan target dengan *.addowner*.', msg, sentByBotIds);
      return;
    }

    const cleanTarget = target.replace(/[^0-9]/g, '');
    if (cleanTarget.length < 6) {
      await safeReply(sock, remoteJid, '❌ Nomor atau LID tidak valid (minimal 6 digit angka).', msg, sentByBotIds);
      return;
    }

    const settings = dbSettings.get();
    if (!settings.extraOwners) settings.extraOwners = [];

    const isAlreadyOwner = config.bot.ownerNumbers.includes(cleanTarget) || settings.extraOwners.includes(cleanTarget);

    if (!isAlreadyOwner) {
      settings.extraOwners.push(cleanTarget);
      dbSettings.save(settings);

      if (!config.bot.ownerNumbers.includes(cleanTarget)) {
        config.bot.ownerNumbers.push(cleanTarget);
      }

      // Sinkronkan ke .env secara persisten
      const envPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        try {
          let envContent = fs.readFileSync(envPath, 'utf8');
          const allOwners = Array.from(new Set([...config.bot.ownerNumbers, ...settings.extraOwners]));
          const ownersStr = allOwners.join(', ');
          if (/^OWNER_NUMBERS?=/m.test(envContent)) {
            envContent = envContent.replace(/^OWNER_NUMBERS?=.*$/m, `OWNER_NUMBERS="${ownersStr}"`);
          } else {
            envContent += `\nOWNER_NUMBERS="${ownersStr}"`;
          }
          fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
        } catch (envErr) {
          console.error('[ADDOWNER_ENV_ERROR]', envErr?.message || envErr);
        }
      }

      await safeReply(sock, remoteJid, `✅ Berhasil mendaftarkan owner baru secara permanen: \`${cleanTarget}\``, msg, sentByBotIds);
    } else {
      await safeReply(sock, remoteJid, `ℹ️ ID \`${cleanTarget}\` sudah terdaftar sebagai Owner.`, msg, sentByBotIds);
    }
  },
};
