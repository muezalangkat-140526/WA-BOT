import { dbStore } from '../../storage.js';
import { config } from '../../config.js';

export default {
  name: 'store',
  aliases: ['toko', 'produk', 'beli'],
  category: 'Toko',
  description: 'Melihat katalog produk, daftar harga, dan info pembayaran toko',
  async execute({ sock, remoteJid, msg, p, safeReply, sentByBotIds }) {
    const store = dbStore.get();

    let text = `🛍️ *KATALOG ${store.name.toUpperCase()}*\n\n`;
    text += `Daftar Produk yang Tersedia:\n`;

    for (const prod of store.products) {
      text += `┌ *[ID: ${prod.id}] ${prod.name}*\n`;
      text += `│ • Harga: *${prod.price}*\n`;
      text += `│ • Keterangan: ${prod.desc}\n`;
      text += `└────────────────────\n`;
    }

    text += `\n💳 *Metode Pembayaran:*\n${store.payment}\n\n`;
    text += `_Untuk pemesanan, silakan kirim ID produk ke Owner atau gunakan ${p}report [pesan order]._`;

    await safeReply(sock, remoteJid, text, msg, sentByBotIds);
  },
};
