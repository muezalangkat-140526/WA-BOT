import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { config } from './config.js';

let client = null;
let currentModel = config.ai.model;

function loadKnowledge() {
  try {
    const p = path.join(process.cwd(), 'data', 'knowledge.txt');
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, 'utf8').trim();
    }
  } catch {}
  return '';
}

// ==========================================
// 1. MEMORY STORAGE DENGAN TTL (AUTO-EXPIRE)
// Mencegah Memory Leak (RAM Jebol) saat bot berjalan berminggu-minggu
// ==========================================
const TTL_MS = 30 * 60 * 1000; // 30 Menit tidak aktif = memori dibersihkan
const MAX_TURNS = 10; // Maksimal 5 pasang dialog terakhir disimpan

class ConversationMemory {
  constructor() {
    this.store = new Map();
  }

  get(chatId) {
    const record = this.store.get(chatId);
    if (!record) return [];

    // Jika sudah lewat TTL, bersihkan otomatis
    if (Date.now() - record.lastActive > TTL_MS) {
      this.store.delete(chatId);
      return [];
    }
    return record.messages;
  }

  add(chatId, role, content) {
    let record = this.store.get(chatId);
    if (!record || Date.now() - record.lastActive > TTL_MS) {
      record = { messages: [], lastActive: Date.now() };
      this.store.set(chatId, record);
    }

    record.messages.push({ role, content });
    record.lastActive = Date.now();

    // Batasi jumlah turn agar tidak boros token
    if (record.messages.length > MAX_TURNS * 2) {
      record.messages.splice(0, record.messages.length - MAX_TURNS * 2);
    }
  }

  clear(chatId) {
    this.store.delete(chatId);
  }

  activeSessionsCount() {
    const now = Date.now();
    let count = 0;
    for (const [id, record] of this.store.entries()) {
      if (now - record.lastActive <= TTL_MS) {
        count++;
      } else {
        this.store.delete(id);
      }
    }
    return count;
  }
}

const memory = new ConversationMemory();

// ==========================================
// 2. COOLDOWN RATE-LIMITER PER PENGGUNA
// Mencegah spam command yang menyebabkan banned WA & limit 429
// ==========================================
const userCooldowns = new Map();
const COOLDOWN_SECONDS = 3;

/**
 * Cek apakah user sedang dalam masa cooldown
 * @param {string} senderId
 * @returns {number} Sisa detik cooldown (0 jika aman)
 */
export function checkCooldown(senderId) {
  const lastTime = userCooldowns.get(senderId);
  const now = Date.now();
  const cooldownMs = COOLDOWN_SECONDS * 1000;

  if (lastTime && now - lastTime < cooldownMs) {
    return Math.ceil((cooldownMs - (now - lastTime)) / 1000);
  }

  userCooldowns.set(senderId, now);

  // Bersihkan map jika terlalu besar (mencegah leak)
  if (userCooldowns.size > 1000) {
    userCooldowns.clear();
  }

  return 0;
}

// ==========================================
// 3. CLIENT OPENAI-COMPATIBLE
// ==========================================
function getClient() {
  if (!client) {
    const isPlaceholder = !config.ai.apiKey || config.ai.apiKey === 'your_api_key_here';
    if (isPlaceholder && config.ai.provider !== 'ollama') {
      throw new Error(
        `AI_API_KEY belum diisi di file .env. Isi API key untuk provider '${config.ai.provider.toUpperCase()}' lalu restart bot.`
      );
    }

    client = new OpenAI({
      apiKey: config.ai.apiKey || 'ollama-no-key',
      baseURL: config.ai.baseURL,
    });
  }
  return client;
}

export function resetConversation(chatId) {
  memory.clear(chatId);
}

export function reloadAIClient() {
  client = null;
  currentModel = config.ai.model;
}

export function getAIStatus() {
  return {
    provider: config.ai.provider,
    model: currentModel,
    activeSessions: memory.activeSessionsCount(),
  };
}

export function switchModel(newModel) {
  if (!newModel || typeof newModel !== 'string') return currentModel;
  currentModel = newModel.trim();
  return currentModel;
}

export function getCurrentDateTimeIndonesian() {
  const now = new Date();
  const options = {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  const formatter = new Intl.DateTimeFormat('id-ID', options);
  return formatter.format(now) + ' WIB';
}

/**
 * Menghasilkan respons teks atau multimodal (gambar + teks)
 */
export async function generateAIResponse(chatId, prompt, imageAttachment = null, extraContext = null) {
  try {
    const aiClient = getClient();
    const history = memory.get(chatId);
    const customKnowledge = loadKnowledge();
    const currentDateTime = getCurrentDateTimeIndonesian();

    let userMessageContent;
    if (imageAttachment && imageAttachment.data) {
      const base64Data = imageAttachment.data.toString('base64');
      const mime = imageAttachment.mimeType || 'image/jpeg';
      userMessageContent = [
        { type: 'text', text: prompt || 'Jelaskan gambar ini secara detail.' },
        {
          type: 'image_url',
          image_url: {
            url: `data:${mime};base64,${base64Data}`,
          },
        },
      ];
    } else {
      userMessageContent = prompt;
    }

    let systemInstruction = `Kamu adalah asisten pintar WhatsApp bernama "${config.bot.name}". Selalu gunakan Bahasa Indonesia yang ramah, sopan, ringkas, dan jelas, kecuali jika pengguna bertanya dalam bahasa lain. Berikan jawaban informatif dan mudah dibaca di layar chat HP tanpa format markdown berlebihan. Kamu mengingat konteks percakapan sebelumnya.

[WAKTU REAL-TIME SAAT INI]:
Hari, tanggal, dan waktu saat ini adalah: ${currentDateTime}.
Gunakan informasi ini jika pengguna bertanya tentang hari ini hari apa, tanggal berapa, jam berapa, besok hari apa, kemarin hari apa, atau pertanyaan waktu lainnya.

[KONTAK OWNER / DEVELOPER]:
Jika pengguna ingin berbicara langsung dengan manusia/owner/developer atau membutuhkan bantuan yang tidak bisa kamu selesaikan, sarankan mereka untuk mengetik perintah .owner agar dialihkan secara otomatis.`;

    if (customKnowledge) {
      systemInstruction += `\n\n[PANDUAN INFORMASI KUSTOM / KNOWLEDGE BASE]:\n${customKnowledge}`;
    }

    const customPromptPath = path.join(process.cwd(), 'data', 'custom_prompt.txt');
    if (fs.existsSync(customPromptPath)) {
      const customPrompt = fs.readFileSync(customPromptPath, 'utf8').trim();
      if (customPrompt) {
        systemInstruction += `\n\n[ATURAN KHUSUS OWNER]:\n${customPrompt}`;
      }
    }

    const themePath = path.join(process.cwd(), 'data', 'group_themes.json');
    if (fs.existsSync(themePath)) {
      try {
        const themes = JSON.parse(fs.readFileSync(themePath, 'utf8'));
        if (themes[chatId]) {
          systemInstruction += `\n\n[PERAN & TEMA KHUSUS GRUP INI]:\n${themes[chatId]}`;
        }
      } catch {}
    }

    if (extraContext) {
      systemInstruction += `\n\n[INFORMASI TAMBAHAN REAL-TIME]:\n${extraContext}`;
    }

    const messages = [
      {
        role: 'system',
        content: systemInstruction,
      },
      ...history,
      { role: 'user', content: userMessageContent },
    ];

    const completion = await aiClient.chat.completions.create({
      model: currentModel,
      messages,
      temperature: 0.7,
      max_tokens: 2500,
    });

    let reply = completion.choices[0]?.message?.content?.trim();
    if (!reply && completion.choices[0]?.message?.reasoning) {
      reply = completion.choices[0]?.message?.reasoning?.trim();
    }

    if (!reply) {
      console.warn('[AI_WARN] Model returned empty content:', JSON.stringify(completion.choices[0] || {}));
      return 'Maaf, model AI sedang mengalami jeda pemrosesan. Silakan kirimkan kembali pertanyaan Anda.';
    }

    // Simpan ke memori percakapan
    const textToStore = typeof userMessageContent === 'string' ? userMessageContent : `[Gambar]: ${prompt || 'Jelaskan gambar'}`;
    memory.add(chatId, 'user', textToStore);
    memory.add(chatId, 'assistant', reply);

    return reply;
  } catch (error) {
    console.error('[AI_ERROR]', error?.message || error);

    if (error?.status === 401) {
      return 'Gagal: API Key tidak valid atau telah kedaluwarsa. Periksa file .env.';
    }
    if (error?.status === 404) {
      return `Gagal: Model '${currentModel}' tidak ditemukan pada provider '${config.ai.provider}'. Periksa pengaturan model.`;
    }
    if (error?.status === 429) {
      return 'Gagal: Rate limit provider tercapai. Silakan coba lagi dalam beberapa saat.';
    }
    return `Gagal memproses AI: ${error?.message || 'Terjadi kesalahan sistem'}`;
  }
}
