export default {
  name: 'audit',
  aliases: ['webcheck', 'cekweb'],
  category: 'Alat',
  description: 'Memeriksa header keamanan, SSL, dan teknologi sebuah website',
  usage: '.audit https://example.com',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds, startTyping }) {
    if (!args) {
      await safeReply(sock, remoteJid, `ℹ️ Masukkan URL website yang ingin diaudit.\nContoh: *${p}audit https://google.com*`, msg, sentByBotIds);
      return;
    }

    let targetUrl = args.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const stopTyping = startTyping(sock, remoteJid);
    try {
      const startTime = Date.now();
      const res = await fetch(targetUrl, {
        method: 'HEAD',
        redirect: 'follow',
        headers: { 'User-Agent': 'WhatsAppBotAudit/1.0' },
      });
      const latency = Date.now() - startTime;

      const server = res.headers.get('server') || 'Disembunyikan';
      const contentType = res.headers.get('content-type') || '-';
      const hsts = res.headers.has('strict-transport-security') ? '✅ Aktif' : '❌ Tidak Aktif';
      const xFrame = res.headers.get('x-frame-options') || '❌ Tidak Ada';
      const xContentType = res.headers.get('x-content-type-options') || '❌ Tidak Ada';

      let text = `🛡️ *HASIL AUDIT WEBSITE*\n\n`;
      text += `• *Target URL:* \`${targetUrl}\`\n`;
      text += `• *Status HTTP:* ${res.status} ${res.statusText}\n`;
      text += `• *Kecepatan Respons:* ${latency} ms\n`;
      text += `• *Web Server:* ${server}\n`;
      text += `• *Content Type:* ${contentType}\n\n`;
      text += `🔒 *Header Keamanan:*\n`;
      text += `• HSTS (SSL Strict): ${hsts}\n`;
      text += `• X-Frame-Options (Anti-Clickjacking): ${xFrame}\n`;
      text += `• X-Content-Type-Options: ${xContentType}\n`;

      await safeReply(sock, remoteJid, text, msg, sentByBotIds);
    } catch (err) {
      await safeReply(sock, remoteJid, `❌ Gagal melakukan audit ke "${targetUrl}": ${err?.message || err}`, msg, sentByBotIds);
    } finally {
      await stopTyping();
    }
  },
};
