export default {
  name: 'capcut',
  aliases: ['cc', 'ccdl'],
  category: 'Unduh',
  description: 'Mengunduh video CapCut tanpa watermark dari tautan template / video',
  usage: '.capcut https://www.capcut.com/t/xxxxxx/ atau .capcut <url_template>',
  async execute({ sock, remoteJid, msg, args, p, safeReply, sentByBotIds, startTyping }) {
    if (!args) {
      await safeReply(
        sock,
        remoteJid,
        `ℹ️ Masukkan link video/template CapCut.\nContoh: *${p}capcut https://www.capcut.com/t/Zs8xxxxxx/*`,
        msg,
        sentByBotIds
      );
      return;
    }

    const inputUrl = args.trim().split(/\s+/)[0];
    if (!inputUrl.includes('capcut.com')) {
      await safeReply(sock, remoteJid, '⚠️ Tautan tidak valid. Masukkan tautan resmi dari CapCut.', msg, sentByBotIds);
      return;
    }

    const stopTyping = startTyping(sock, remoteJid);
    try {
      let videoUrl = null;
      let title = 'Video CapCut';
      let author = 'CapCut Creator';

      // Metode 1: Direct Web Scraping (RENDER_DATA)
      try {
        const pageRes = await fetch(inputUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(10000),
        });

        if (pageRes.ok) {
          const html = await pageRes.text();
          const renderMatch = html.match(/<script id="RENDER_DATA"[^>]*>([\s\S]*?)<\/script>/);

          if (renderMatch) {
            const decoded = decodeURIComponent(renderMatch[1]);
            const data = JSON.parse(decoded);

            // Cari properti video di dalam pohon data RENDER_DATA
            const findKey = (obj, key) => {
              if (!obj || typeof obj !== 'object') return null;
              if (obj[key]) return obj[key];
              for (const k of Object.keys(obj)) {
                const res = findKey(obj[k], key);
                if (res) return res;
              }
              return null;
            };

            const directVideo = findKey(data, 'video_url') || findKey(data, 'play_url');
            const templateTitle = findKey(data, 'title');
            const authorNick = findKey(data, 'author_name') || findKey(data, 'nickname');

            if (directVideo && typeof directVideo === 'string') {
              videoUrl = directVideo;
              if (templateTitle) title = templateTitle;
              if (authorNick) author = authorNick;
            }
          }

          // Fallback Meta OG Video jika RENDER_DATA tidak ada video_url langsung
          if (!videoUrl) {
            const ogMatch = html.match(/<meta property="og:video" content="([^"]+)"/i);
            if (ogMatch) videoUrl = ogMatch[1];
          }
        }
      } catch (scrapeErr) {
        console.warn('[CAPCUT_SCRAPE_FALLBACK]', scrapeErr?.message || scrapeErr);
      }

      // Metode 2: Public Scraper API (Fallback jika scraping langsung diblokir CDN)
      if (!videoUrl) {
        try {
          const apiEndpoints = [
            `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(inputUrl)}`,
            `https://skizo.tech/api/capcut?url=${encodeURIComponent(inputUrl)}`,
          ];

          for (const ep of apiEndpoints) {
            try {
              const apiRes = await fetch(ep, { signal: AbortSignal.timeout(8000) });
              if (apiRes.ok) {
                const apiData = await apiRes.json();
                const cand =
                  apiData?.video_url ||
                  apiData?.data?.video_url ||
                  apiData?.result?.video ||
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
        throw new Error('Gagal mengekstrak video tanpa watermark dari link tersebut. Pastikan template bersifat publik.');
      }

      await safeReply(
        sock,
        remoteJid,
        `⏳ Mengirim video CapCut...\n• *Judul:* ${title.slice(0, 60)}\n• *Creator:* @${author}`,
        msg,
        sentByBotIds
      );

      // Cek ukuran video jika memungkinkan
      let isLarge = false;
      try {
        const head = await fetch(videoUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        const len = Number(head.headers.get('content-length') || 0);
        if (len > 16 * 1024 * 1024) isLarge = true; // Lebih dari 16MB dikirim sebagai dokumen
      } catch {}

      if (isLarge) {
        await sock.sendMessage(
          remoteJid,
          {
            document: { url: videoUrl },
            mimetype: 'video/mp4',
            fileName: `${title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.mp4`,
            caption: `🎬 *${title}*\n_Ukuran video > 16MB (dikirim sebagai file dokumen tanpa watermark)_\n_Creator: @${author}_`,
          },
          { quoted: msg }
        );
      } else {
        await sock.sendMessage(
          remoteJid,
          {
            video: { url: videoUrl },
            caption: `🎬 *${title}*\n_Creator: @${author}_\n_Dihasilkan via CapCut Downloader (Tanpa Watermark)_`,
          },
          { quoted: msg }
        );
      }
    } catch (err) {
      await safeReply(
        sock,
        remoteJid,
        `❌ Gagal mengunduh CapCut: ${err?.message || err}\n_Pastikan tautan dapat dibuka di browser dan tidak diprivat._`,
        msg,
        sentByBotIds
      );
    } finally {
      await stopTyping();
    }
  },
};
