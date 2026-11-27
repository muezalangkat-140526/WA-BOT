import fs from 'fs';
import path from 'path';
import { dbSettings } from './storage.js';
import { config } from './config.js';

const LAST_GEMPA_FILE = path.join(process.cwd(), 'data', 'last_gempa.json');

function getLastGempaDateTime() {
  try {
    if (fs.existsSync(LAST_GEMPA_FILE)) {
      const data = JSON.parse(fs.readFileSync(LAST_GEMPA_FILE, 'utf8'));
      return data.lastDateTime;
    }
  } catch {}
  return null;
}

function saveLastGempaDateTime(dateTime) {
  try {
    fs.writeFileSync(LAST_GEMPA_FILE, JSON.stringify({ lastDateTime: dateTime, updatedAt: Date.now() }, null, 2), 'utf8');
  } catch {}
}

/**
 * Monitor background yang memeriksa data BMKG setiap 60 detik
 */
export function startBMKGMonitor(sock) {
  console.log('[BMKG_MONITOR] Layanan Peringatan Dini Gempa & Tsunami aktif (Interval: 60s)');

  // Jalankan pemeriksaan awal
  checkBMKGUpdate(sock).catch(() => {});

  // Set interval rutin setiap 60 detik
  setInterval(() => {
    checkBMKGUpdate(sock).catch((err) => {
      console.error('[BMKG_POLL_ERROR]', err?.message || err);
    });
  }, 60 * 1000);
}

async function checkBMKGUpdate(sock) {
  try {
    const res = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json', {
      headers: { 'User-Agent': 'WhatsAppBotBMKG/1.0' },
      signal: AbortSignal.timeout(8000), // Timeout 8 detik
    });

    if (!res.ok) return;

    const data = await res.json();
    const g = data?.Infogempa?.gempa;
    if (!g || !g.DateTime) return;

    const lastDateTime = getLastGempaDateTime();

    // Jika bot baru pertama kali menyala, simpan data saat ini agar tidak membroadcast gempa lampau
    if (!lastDateTime) {
      saveLastGempaDateTime(g.DateTime);
      return;
    }

    // Jika waktu gempa sama dengan yang terakhir disiarkan, lewati
    if (g.DateTime === lastDateTime) {
      return;
    }

    // Gempa baru terdeteksi!
    console.log(`[BMKG_ALERT] Gempa baru terdeteksi: M ${g.Magnitude} di ${g.Wilayah}`);
    saveLastGempaDateTime(g.DateTime);

    const isTsunamiPotential = (g.Potensi || '').toLowerCase().includes('berpotensi tsunami');
    const alertHeader = isTsunamiPotential
      ? `🚨🚨🚨 *PERINGATAN DINI TSUNAMI (BMKG)* 🚨🚨🚨`
      : `⚠️ *PERINGATAN DINI GEMPA BUMI (BMKG)* ⚠️`;

    let caption = `${alertHeader}\n`;
    caption += `──────────────────────\n`;
    caption += `• *Waktu Gempa :* ${g.Tanggal} - ${g.Jam}\n`;
    caption += `• *Magnitudo   :* *${g.Magnitude} SR*\n`;
    caption += `• *Kedalaman   :* ${g.Kedalaman}\n`;
    caption += `• *Pusat Gempa :* ${g.Wilayah}\n`;
    caption += `• *Potensi     :* *${g.Potensi}*\n`;
    if (g.Dirasakan) {
      caption += `• *Dirasakan   :* ${g.Dirasakan}\n`;
    }
    caption += `──────────────────────\n`;
    caption += `_Peringatan darurat otomatis dari sistem deteksi BMKG RI._\n`;
    caption += `_Tetap waspada terhadap gempa susulan dan ikuti arahan pihak berwenang._`;

    // Unduh gambar peta guncangan
    let imgBuffer = null;
    try {
      const imgRes = await fetch(`https://data.bmkg.go.id/DataMKG/TEWS/${g.Shakemap}`, {
        signal: AbortSignal.timeout(6000),
      });
      if (imgRes.ok) {
        const arr = await imgRes.arrayBuffer();
        imgBuffer = Buffer.from(arr);
      }
    } catch {}

    // Kumpulkan seluruh target siaran:
    // 1. Grup yang mengaktifkan .peringatandini
    const settings = dbSettings.get();
    const targetGroups = settings.earlyWarningGroups || [];

    // 2. Nomor Owner
    const phoneOwner = config.bot.ownerNumbers.find((n) => n.startsWith('62') && n.length <= 15);
    const allTargets = new Set(targetGroups);
    if (phoneOwner) {
      allTargets.add(`${phoneOwner}@s.whatsapp.net`);
    }

    console.log(`[BMKG_BROADCAST] Menyiarkan peringatan gempa ke ${allTargets.size} kontak/grup...`);

    for (const targetJid of allTargets) {
      try {
        if (imgBuffer) {
          await sock.sendMessage(targetJid, { image: imgBuffer, caption });
        } else {
          await sock.sendMessage(targetJid, { text: caption });
        }
        await new Promise((r) => setTimeout(r, 1200)); // jeda 1.2 detik per grup
      } catch (sendErr) {
        console.error(`[BMKG_SEND_FAIL: ${targetJid}]`, sendErr?.message || sendErr);
      }
    }
  } catch (err) {
    // Abaikan jika server BMKG timeout sesaat
  }
}
