import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { config } from './config.js';

/**
 * Konversi buffer gambar ke WebP WhatsApp Sticker dengan metadata
 * @param {Buffer} imageBuffer
 * @param {string} [pack]
 * @param {string} [author]
 * @returns {Promise<Buffer>}
 */
export async function createSticker(imageBuffer, pack = null, author = null) {
  try {
    const sticker = new Sticker(imageBuffer, {
      pack: pack || config.bot.name,
      author: author || 'WhatsApp Bot',
      type: StickerTypes.FULL,
      quality: 65,
    });
    return await sticker.toBuffer();
  } catch (err) {
    console.error('[STICKER_ERROR]', err?.message || err);
    throw err;
  }
}

/**
 * Buat gambar AI secara gratis via Pollinations Engine
 * @param {string} prompt
 * @returns {Promise<Buffer>}
 */
export async function generateAIImage(prompt) {
  if (!prompt) throw new Error('Prompt gambar tidak boleh kosong');

  const encodedPrompt = encodeURIComponent(prompt.trim());
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

  const response = await fetch(imageUrl, {
    headers: {
      'User-Agent': 'WhatsAppAIBot/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Gagal menghasilkan gambar (Status: ${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
