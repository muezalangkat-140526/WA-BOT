import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import { config } from './config.js';
import {
  generateAIResponse,
  checkCooldown,
  getAIStatus,
} from './ai.js';
import { saveContact } from './contacts.js';
import { loadCommands, registry } from './handlers/commandHandler.js';
import { dbSettings, dbAFK, dbResponses, dbBannedWords } from './storage.js';
import { startBMKGMonitor } from './bmkgMonitor.js';

const AUTH_FOLDER = 'auth_info_baileys';
const startTime = Date.now();

/**
 * Validasi apakah pengirim adalah pemilik bot (mendukung multi nomor & WhatsApp LID)
 */
function isOwner(msg, senderJid) {
  if (!config.bot.ownerNumbers.length) return true;
  if (msg?.key?.fromMe) return true;

  const cleanSender = (senderJid || '').replace(/[^0-9]/g, '');
  const rawSender = (senderJid || '').toLowerCase();
  const cleanRemote = (msg?.key?.remoteJid || '').replace(/[^0-9]/g, '');
  const rawRemote = (msg?.key?.remoteJid || '').toLowerCase();
  const cleanPn = (msg?.key?.participantPn || msg?.participantPn || '').replace(/[^0-9]/g, '');

  for (const owner of config.bot.ownerNumbers) {
    if (!owner) continue;

    // 1. Pencocokan langsung persis angka (LID / nomor telepon utuh)
    if (
      cleanSender === owner ||
      cleanSender.includes(owner) ||
      rawSender.includes(owner) ||
      cleanRemote === owner ||
      cleanRemote.includes(owner) ||
      rawRemote.includes(owner) ||
      cleanPn.includes(owner)
    ) {
      return true;
    }

    // 2. Pencocokan nomor telepon tanpa kode negara 62 / 0
    let coreOwner = owner;
    if (owner.startsWith('62')) {
      coreOwner = owner.slice(2);
    } else if (owner.startsWith('0')) {
      coreOwner = owner.slice(1);
    }

    if (coreOwner.length >= 7) {
      if (
        cleanSender.includes(coreOwner) ||
        cleanRemote.includes(coreOwner) ||
        cleanPn.includes(coreOwner)
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Helper kirim pesan aman dengan fallback tanpa quoted jika quoted gagal
 */
async function safeReply(sock, remoteJid, text, quotedMsg = null, sentByBotIds = null) {
  try {
    let sentMsg = null;
    if (quotedMsg) {
      try {
        sentMsg = await sock.sendMessage(remoteJid, { text }, { quoted: quotedMsg });
      } catch {
        sentMsg = await sock.sendMessage(remoteJid, { text });
      }
    } else {
      sentMsg = await sock.sendMessage(remoteJid, { text });
    }

    if (sentMsg?.key?.id && sentByBotIds) {
      sentByBotIds.add(sentMsg.key.id);
    }
    return sentMsg;
  } catch (err) {
    console.error(`[SEND_ERROR] Gagal mengirim pesan ke ${remoteJid}:`, err?.message || err);
    return null;
  }
}

/**
 * Menyalakan status "mengetik..." secara berulang (interval 1.5 detik)
 * dengan presence subscription agar status "sedang mengetik..." tampil konsisten di WA
 */
function startTyping(sock, jid) {
  let isTyping = true;

  const pingPresence = () => {
    try {
      sock.presenceSubscribe(jid).catch(() => {});
      sock.sendPresenceUpdate('composing', jid).catch(() => {});
    } catch {}
  };

  pingPresence();

  const interval = setInterval(() => {
    if (!isTyping) {
      clearInterval(interval);
      return;
    }
    pingPresence();
  }, 1500);

  return async () => {
    isTyping = false;
    clearInterval(interval);
    try {
      await sock.sendPresenceUpdate('paused', jid);
    } catch {}
  };
}

/**
 * Parser perintah: mendukung prefix kustom, serta tanda '.' dan '!' secara otomatis
 */
function parseCommand(text, customPrefix) {
  const trimmed = text.trim();
  const prefixes = Array.from(new Set([customPrefix, '!', '.'])).filter(Boolean);

  for (const p of prefixes) {
    if (trimmed.startsWith(p)) {
      const rest = trimmed.slice(p.length).trim();
      const firstSpace = rest.indexOf(' ');
      const command = (firstSpace === -1 ? rest : rest.slice(0, firstSpace)).toLowerCase();
      const args = (firstSpace === -1 ? '' : rest.slice(firstSpace + 1)).trim();
      return {
        isCommand: true,
        prefixUsed: p,
        command,
        args,
        raw: trimmed,
      };
    }
  }

  return {
    isCommand: false,
    prefixUsed: '',
    command: '',
    args: '',
    raw: trimmed,
  };
}

async function startBot() {
  // 1. Muat seluruh modul perintah modular
  await loadCommands();

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(`[WA] Menggunakan Baileys versi ${version.join('.')} (Latest: ${isLatest})`);

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false, // Cegah sinkronisasi pesan lama berlebihan penyebab Bad MAC
  });

  if (config.bot.pairingNumber && !sock.authState?.creds?.registered) {
    setTimeout(async () => {
      try {
        console.log(`[WA] Meminta Pairing Code untuk nomor: ${config.bot.pairingNumber}...`);
        const code = await sock.requestPairingCode(config.bot.pairingNumber);
        console.log(`\n=================================================`);
        console.log(`[PAIRING CODE] KODE TAUTAN WHATSAPP: ${code}`);
        console.log(`Buka WA > Perangkat Tertaut > Tautkan dengan nomor telepon`);
        console.log(`=================================================\n`);
      } catch (err) {
        console.error('[PAIRING CODE ERROR]', err?.message || err);
      }
    }, 4000);
  }

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !config.bot.pairingNumber) {
      console.log('\n[WA] Scan QR Code berikut dengan WhatsApp di HP Anda:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode =
        lastDisconnect?.error instanceof Boom
          ? lastDisconnect.error.output?.statusCode
          : null;

      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`[WA] Koneksi terputus (Status: ${statusCode}). Reconnect: ${shouldReconnect}`);

      if (shouldReconnect) {
        startBot();
      } else {
        console.error('[WA] Sesi logout/invalid. Hapus folder auth_info_baileys lalu scan ulang.');
      }
    } else if (connection === 'open') {
      try {
        await sock.sendPresenceUpdate('available');
      } catch (err) {
        console.error('[PRESENCE_ERROR]', err?.message || err);
      }
      const aiStatus = getAIStatus();
      console.log(`\n=================================================`);
      console.log(`[WA] Terhubung ke WhatsApp!`);
      console.log(`[BOT] Nama: ${config.bot.name}`);
      console.log(`[AI] Provider: ${aiStatus.provider.toUpperCase()} | Model: ${aiStatus.model}`);
      console.log(`[PREFIX] Utama: '${config.bot.prefix}' (Mendukung juga '.' dan '!')`);
      console.log(`[MODE] Prefix Wajib: ${config.bot.requirePrefix ? 'Ya' : 'Tidak (Chat pribadi otomatis)'}`);
      console.log(`[GRUP] Diizinkan: ${config.bot.allowGroups ? 'Ya' : 'Tidak'}`);
      if (config.bot.ownerNumbers.length) {
        console.log(`[OWNER] Terdaftar: ${config.bot.ownerNumbers.join(', ')}`);
      }
      console.log(`=================================================\n`);

      // Aktifkan Background Monitor Peringatan Dini Gempa & Tsunami BMKG
      try {
        startBMKGMonitor(sock);
      } catch (bmkgErr) {
        console.error('[BMKG_INIT_ERROR]', bmkgErr?.message || bmkgErr);
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);

  const sentByBotIds = new Set();

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message) continue;

      if (sentByBotIds.has(msg.key.id)) {
        sentByBotIds.delete(msg.key.id);
        continue;
      }

      if (msg.message.protocolMessage) continue;

      const remoteJid = msg.key.remoteJid;
      if (!remoteJid || remoteJid === 'status@broadcast') continue;

      const isGroup = remoteJid.endsWith('@g.us');
      saveContact(remoteJid);

      if (isGroup && !config.bot.allowGroups) {
        continue;
      }

      const isImage = Boolean(msg.message.imageMessage);
      const isAudio = Boolean(msg.message.audioMessage);
      const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
      const isQuotedImage = Boolean(quotedMsg?.imageMessage);

      const messageContent =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        '';

      const rawText = messageContent.trim();
      if (!rawText && !isImage && !isAudio) continue;

      const isFromMe = msg.key.fromMe;
      const sender = msg.key.participant || remoteJid;

      // 1. Cek apakah pengirim diblokir (Banned)
      const cleanSenderNum = sender.replace(/[^0-9]/g, '');
      const settings = dbSettings.get();
      if ((settings.bannedUsers || []).includes(cleanSenderNum)) {
        continue;
      }

      console.log(`\n[PESAN MASUK] Dari: ${sender} ${isFromMe ? '(Nomor Sendiri)' : ''} | Teks: "${rawText}" ${isImage ? '[Gambar]' : ''} ${isAudio ? '[Audio/VN]' : ''}`);

      const parsed = parseCommand(rawText, config.bot.prefix);
      const p = config.bot.prefix;

      // 2. Cek status AFK pengirim (Cabut status jika mengetik)
      const currentAfk = dbAFK.get()[sender];
      if (currentAfk && !rawText.startsWith(`${p}afk`)) {
        dbAFK.remove(sender);
        await safeReply(sock, remoteJid, `👋 Selamat datang kembali @${sender.split('@')[0]}! Status AFK Anda telah dicabut.`, msg, sentByBotIds);
      }

      // 3. Cek apakah ada yang me-mention orang yang sedang AFK
      const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      for (const m of mentions) {
        const targetAfk = dbAFK.get()[m];
        if (targetAfk) {
          await safeReply(sock, remoteJid, `💤 @${m.split('@')[0]} sedang *AFK (Tidak Aktif)*!\nAlasan: _"${targetAfk.reason}"_`, msg, sentByBotIds);
        }
      }

      // 4. Deteksi kata terlarang di grup
      if (isGroup && rawText) {
        const badWords = dbBannedWords.get(remoteJid);
        if (badWords.length > 0 && badWords.some((w) => rawText.toLowerCase().includes(w))) {
          const ownerCheck = isOwner(msg, sender);
          if (!ownerCheck) {
            try {
              await sock.sendMessage(remoteJid, { delete: msg.key });
            } catch {}
            await safeReply(sock, remoteJid, `⚠️ Pesan dari @${sender.split('@')[0]} telah dihapus karena memuat kata terlarang.`, null, sentByBotIds);
            continue;
          }
        }
      }

      // 5. Cek respon otomatis kustom di grup (tanpa AI)
      if (isGroup && rawText && !parsed.isCommand) {
        const groupResps = dbResponses.get(remoteJid);
        const lowerRaw = rawText.toLowerCase().trim();
        if (groupResps[lowerRaw]) {
          await safeReply(sock, remoteJid, groupResps[lowerRaw], msg, sentByBotIds);
          continue;
        }
      }

      // 6. Deteksi otomatis jika pengguna ingin berbicara langsung ke Owner / Developer
      const ownerIntentRegex = /(bicara|ngomong|hubung|chat|kontak|tanya|pesan|minta|panggil).*(owner|developer|pemilik|pembuat|creator|admin)|^(\.|\!)?(owner|developer|pembuat|creator|admin)$/i;
      if (ownerIntentRegex.test(rawText) && !parsed.isCommand) {
        const ownerCmd = registry.get('owner');
        if (ownerCmd) {
          await ownerCmd.execute({
            sock,
            remoteJid,
            msg,
            sender,
            rawText,
            safeReply,
            sentByBotIds,
          });
          continue;
        }
      }

      // ==========================================
      // DETEKSI ANTI-LINK DI DALAM GRUP
      // ==========================================
      if (isGroup && (rawText.includes('chat.whatsapp.com/') || rawText.includes('wa.me/settings/'))) {
        const ownerCheck = isOwner(msg, sender);
        if (!ownerCheck) {
          try {
            const groupMeta = await sock.groupMetadata(remoteJid);
            const botId = sock.user.id.split(':')[0];
            const botParticipant = groupMeta.participants.find((m) => m.id.startsWith(botId));
            const isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');

            if (isBotAdmin) {
              await sock.sendMessage(remoteJid, { delete: msg.key });
              await safeReply(sock, remoteJid, `⚠️ Pesan link grup dari @${sender.split('@')[0]} telah dihapus (Anti-Link aktif).`, null, sentByBotIds);
              continue;
            }
          } catch {}
        }
      }

      // ==========================================
      // ROUTING PERINTAH MODULAR REGISTRY
      // ==========================================
      if (parsed.isCommand) {
        const cmd = registry.get(parsed.command);
        if (cmd) {
          // Mode Self Check (Khusus Owner)
          if (config.bot.selfMode && !isOwner(msg, sender)) {
            continue;
          }

          // Owner Only Check
          if (cmd.isOwnerOnly && !isOwner(msg, sender)) {
            await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya dapat dijalankan oleh Owner bot.', msg, sentByBotIds);
            continue;
          }

          // Group Only Check
          if (cmd.isGroupOnly && !isGroup) {
            await safeReply(sock, remoteJid, '⚠️ Perintah ini hanya bisa digunakan di dalam grup WhatsApp.', msg, sentByBotIds);
            continue;
          }

          try {
            await cmd.execute({
              sock,
              msg,
              remoteJid,
              sender,
              isGroup,
              isImage,
              isAudio,
              isQuotedImage,
              quotedMsg,
              args: parsed.args,
              rawText,
              commandUsed: parsed.command,
              p,
              safeReply,
              isOwner,
              sentByBotIds,
              startTime,
              startTyping,
            });
          } catch (cmdErr) {
            console.error(`[COMMAND_ERROR: ${parsed.command}]`, cmdErr?.message || cmdErr);
            await safeReply(sock, remoteJid, `❌ Terjadi kesalahan: ${cmdErr?.message || 'Gagal mengeksekusi perintah'}`, msg, sentByBotIds);
          }
          continue;
        }
      }

      // ==========================================
      // TANGANI PESAN SUARA (VOICE NOTE)
      // ==========================================
      if (isAudio && !rawText) {
        await safeReply(
          sock,
          remoteJid,
          '🎙️ Bot menerima pesan suara Anda. Saat ini disarankan mengetik pertanyaan secara tertulis agar jawaban lebih presisi.',
          msg,
          sentByBotIds
        );
        continue;
      }

      // Mode Self Check untuk obrolan AI
      if (config.bot.selfMode && !isOwner(msg, sender)) {
        continue;
      }

      // ==========================================
      // DETEKSI SMART TRIGGER DI DALAM GRUP (TANPA PREFIX)
      // Bot otomatis merespons jika:
      // 1. Di-tag (@mention) oleh anggota grup
      // 2. Di-reply / quote pesan bot oleh anggota
      // 3. Nama bot disebut (misal: "Salwa", "Salwa Br")
      // ==========================================
      let isBotCalledInGroup = false;
      let groupCleanPrompt = rawText;

      if (isGroup && !parsed.isCommand) {
        const botJid = sock.user?.id || '';
        const botId = botJid.split(':')[0].replace(/[^0-9]/g, '');
        const botLid = (sock.user?.lid || '').replace(/[^0-9]/g, '');

        // 1. Cek mention (@bot)
        const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const isMentioned = mentionedJids.some((j) => {
          const clean = j.replace(/[^0-9]/g, '');
          return (botId && clean === botId) || (botLid && clean === botLid);
        });

        // 2. Cek apakah me-reply / quote pesan bot
        const quotedParticipant = (msg.message?.extendedTextMessage?.contextInfo?.participant || '').replace(/[^0-9]/g, '');
        const isQuoted = Boolean(quotedParticipant && ((botId && quotedParticipant === botId) || (botLid && quotedParticipant === botLid)));

        // 3. Cek apakah nama bot disebut dalam teks
        const botName = config.bot.name.trim();
        const firstName = botName.split(/\s+/)[0];
        const nameRegex = new RegExp(`\\b(${botName}|${firstName})\\b`, 'i');
        const isNameCalled = nameRegex.test(rawText);

        if (isMentioned || isQuoted || isNameCalled) {
          isBotCalledInGroup = true;
          // Bersihkan teks tag (@628xxx) dan nama panggilan bot dari teks pertanyaan
          groupCleanPrompt = rawText
            .replace(new RegExp(`@${botId}`, 'gi'), '')
            .replace(new RegExp(`@${botLid}`, 'gi'), '')
            .replace(nameRegex, '')
            .replace(/^[,.:;\s]+/, '')
            .trim();

          // Jika setelah nama dipanggil ada perintah modular (contoh: "Salwa menu" atau "Salwa cuaca Jakarta")
          const firstWord = (groupCleanPrompt.split(/\s+/)[0] || '').toLowerCase();
          const targetCmd = registry.get(firstWord);
          if (targetCmd) {
            const cmdArgs = groupCleanPrompt.slice(firstWord.length).trim();
            try {
              await targetCmd.execute({
                sock,
                msg,
                remoteJid,
                sender,
                isGroup,
                isImage,
                isAudio,
                isQuotedImage,
                quotedMsg,
                args: cmdArgs,
                rawText: groupCleanPrompt,
                commandUsed: firstWord,
                p: config.bot.prefix,
                safeReply,
                isOwner,
                sentByBotIds,
                startTime,
                startTyping,
              });
            } catch (err) {
              console.error(`[SMART_CMD_ERROR: ${firstWord}]`, err?.message || err);
            }
            continue;
          }
        }
      }

      // ==========================================
      // PARSING PROMPT CHAT AI
      // ==========================================
      let prompt = null;

      if (parsed.isCommand && parsed.command === 'ai') {
        prompt = parsed.args || (isImage ? 'Jelaskan gambar ini' : 'Halo');
      } else if (config.bot.requirePrefix) {
        if (parsed.isCommand) {
          prompt = parsed.raw.slice(parsed.prefixUsed.length).trim();
        } else if (isGroup && isBotCalledInGroup) {
          prompt = groupCleanPrompt || (isImage ? 'Jelaskan gambar ini' : 'Halo');
        } else {
          continue;
        }
      } else {
        if (!isGroup) {
          prompt = rawText;
        } else if (parsed.isCommand) {
          prompt = parsed.raw.slice(parsed.prefixUsed.length).trim();
        } else if (isBotCalledInGroup) {
          prompt = groupCleanPrompt || (isImage ? 'Jelaskan gambar ini' : 'Halo');
        } else {
          continue;
        }
      }

      if (!prompt && !isImage) continue;

      // Cek apakah AI dinonaktifkan di grup ini
      if (isGroup && (!parsed.isCommand || parsed.command !== 'ai')) {
        const disabledAIGroups = dbSettings.get().disabledAIGroups || [];
        if (disabledAIGroups.includes(remoteJid)) {
          continue;
        }
      }

      // Rate limiting: Cek cooldown anti-spam per pengguna
      const remainingCooldown = checkCooldown(sender);
      if (remainingCooldown > 0) {
        console.log(`[SPAM_BLOCK] Sender ${sender} terkena cooldown. Sisa: ${remainingCooldown}s`);
        await safeReply(
          sock,
          remoteJid,
          `⏳ Mohon tunggu *${remainingCooldown} detik* lagi sebelum mengirim pertanyaan berikutnya.`,
          msg,
          sentByBotIds
        );
        continue;
      }

      const stopTyping = startTyping(sock, remoteJid);
      try {
        console.log(`[AI] Memproses prompt untuk ${remoteJid}: "${prompt || '(Analisis Gambar)'}"...`);

        let imageAttachment = null;
        if (isImage) {
          console.log('[AI] Mengunduh gambar media...');
          try {
            const buffer = await downloadMediaMessage(
              msg,
              'buffer',
              {},
              { logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage }
            );
            imageAttachment = {
              data: buffer,
              mimeType: msg.message.imageMessage.mimetype || 'image/jpeg',
            };
          } catch (mediaErr) {
            console.error('[AI] Gagal mengunduh gambar:', mediaErr?.message || mediaErr);
          }
        }

        const aiReply = await generateAIResponse(remoteJid, prompt, imageAttachment);
        await safeReply(sock, remoteJid, aiReply, msg, sentByBotIds);

        console.log(`[AI] Sukses mengirim balasan ke ${remoteJid}`);
      } catch (err) {
        console.error('[ERROR_HANDLER]', err?.message || err);
      } finally {
        await stopTyping();
      }
    }
  });
}

startBot().catch((err) => {
  console.error('[FATAL]', err);
});
