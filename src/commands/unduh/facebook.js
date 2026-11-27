export default {
  name: 'facebook',
  aliases: ['fb', 'fbdl'],
  category: 'Unduh',
  description: 'Mengunduh video Facebook (Reels / Post / Watch) tanpa watermark',
  usage: '.facebook https://www.facebook.com/reel/xxxxxx/ atau .fb <url>',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds, startTyping }) {
    if (!args) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Masukkan link video Facebook / Reels.\nContoh: *${p}facebook https://www.facebook.com/reel/123456789/*`,
        msg,
        sentByBotIds
      );
      return;
    }

    const inputUrl = args.trim().split(/\s+/)[0];
    if (!inputUrl.includes('facebook.com') && !inputUrl.includes('fb.watch') && !inputUrl.includes('fb.gg')) {
      await safeReply(sock, remoteJid, '⚠️ Tautan tidak valid. Masukkan tautan resmi dari Facebook atau fb.watch.', msg, sentByBotIds);
      return;
    }

    const stopTyping = startTyping(sock, remoteJid);
    try {
      let videoUrl = null;
      let quality = 'HD';
      let title = 'Video Facebook';

      // Metode 1: Direct Web Scraping (Regex browser_native_hd_url / browser_native_sd_url)
      try {
        const pageRes = await fetch(inputUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(10000),
        });

        if (pageRes.ok) {
          const html = await pageRes.text();

          const hdMatch = html.match(/browser_native_hd_url["']?\s*:\s*["']([^"']+)["']/);
          const sdMatch = html.match(/browser_native_sd_url["']?\s*:\s*["']([^"']+)["']/);

          const unescapeJSON = (str) => {
            if (!str) return null;
            try {
              return JSON.parse(`"${str}"`);
            } catch {
              return str.replace(/\\u0026/g, '&').replace(/\\/g, '');
            }
          };

          const rawHd = unescapeJSON(hdMatch?.[1]);
          const rawSd = unescapeJSON(sdMatch?.[1]);

          if (rawHd) {
            videoUrl = rawHd;
            quality = 'HD 720p/1080p';
          } else if (rawSd) {
            videoUrl = rawSd;
            quality = 'SD';
          } else {
            // Cek meta og:video
            const ogMatch = html.match(/<meta property="og:video:secure_url" content="([^"]+)"/i) ||
                            html.match(/<meta property="og:video" content="([^"]+)"/i);
            if (ogMatch) {
              videoUrl = ogMatch[1].replace(/&amp;/g, '&');
              quality = 'Standard';
            }
          }

          // Cek judul postingan jika ada
          const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
          if (titleMatch && !titleMatch[1].toLowerCase().includes('facebook')) {
            title = titleMatch[1].trim();
          }
        }
      } catch (scrapeErr) {
        console.warn('[FB_SCRAPE_FALLBACK]', scrapeErr?.message || scrapeErr);
      }

      // Metode 2: Public Scraper API (Fallback jika IP VPS terkena login-wall Facebook)
      if (!videoUrl) {
        try {
          const apiEndpoints = [
            `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(inputUrl)}`,
            `https://skizo.tech/api/facebook?url=${encodeURIComponent(inputUrl)}`,
          ];

          for (const ep of apiEndpoints) {
            try {
              const apiRes = await fetch(ep, { signal: AbortSignal.timeout(8000) });
              if (apiRes.ok) {
                const apiData = await apiRes.json();
                const cand =
                  apiData?.video_hd ||
                  apiData?.video_sd ||
                  apiData?.data?.hd ||
                  apiData?.data?.sd ||
                  apiData?.result?.hd ||
                  apiData?.url;
                if (cand) {
                  videoUrl = cand;
                  if (apiData?.title || apiData?.data?.title) {
                    title = apiData.title || apiData.data.title;
                  }
                  break;
                }
              }
            } catch {}
          }
        } catch {}
      }

      if (!videoUrl) {
        throw new Error('Gagal mengekstrak video. Pastikan video bersifat publik (bukan di dalam grup privat / akun terkunci).');
      }

      await safeReply(
        sock,
        remoteJid,
        `⏳ Mengirim video Facebook (${quality})...\n• *Judul:* ${title.slice(0, 60)}`,
        msg,
        sentByBotIds
      );

      // Cek ukuran video
      let isLarge = false;
      try {
        const head = await fetch(videoUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        const len = Number(head.headers.get('content-length') || 0);
        if (len > 16 * 1024 * 1024) isLarge = true; // Di atas 16MB dikirim sebagai dokumen
      } catch {}

      if (isLarge) {
        await sock.sendMessage(
          remoteJid,
          {
            document: { url: videoUrl },
            mimetype: 'video/mp4',
            fileName: `${title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.mp4`,
            caption: `🎬 *${title}*\n_Kualitas: ${quality} (Ukuran > 16MB dikirim sebagai dokumen)_\n_Dihasilkan via Facebook Downloader_`,
          },
          { quoted: msg }
        );
      } else {
        await sock.sendMessage(
          remoteJid,
          {
            video: { url: videoUrl },
            caption: `🎬 *${title}*\n_Kualitas: ${quality}_\n_Dihasilkan via Facebook Downloader (Tanpa Watermark)_`,
          },
          { quoted: msg }
        );
      }
    } catch (err) {
      await safeReply(
        sock,
        remoteJid,
        `❌ Gagal mengunduh Facebook: ${err?.message || err}\n_Catatan: Bot hanya dapat mengunduh video yang disetel Publik._`,
        msg,
        sentByBotIds
      );
    } finally {
      await stopTyping();
    }
  },
};
