/**
 * Modul Pencarian Informasi Real-Time & Pengetahuan
 * Menggunakan Wikipedia API, Open-Meteo & wttr.in Fallback (100% Gratis, Tanpa API Key)
 */

/**
 * Cari artikel di Wikipedia Bahasa Indonesia
 * @param {string} query
 * @returns {Promise<string|null>}
 */
export async function searchWikipedia(query) {
  if (!query) return null;
  try {
    const url = `https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&utf8=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'WhatsAppAIBot/2.0' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const items = data.query?.search?.slice(0, 3);
    if (!items || items.length === 0) return null;

    return items
      .map((item, idx) => {
        const cleanSnippet = item.snippet.replace(/<[^>]+>/g, '').trim();
        return `[Hasil ${idx + 1}: ${item.title}]\n${cleanSnippet}...`;
      })
      .join('\n\n');
  } catch (err) {
    console.error('[WIKI_ERROR]', err?.message || err);
    return null;
  }
}

// Pemetaan Kode Cuaca WMO (Open-Meteo) ke Bahasa Indonesia
const WMO_CODES = {
  0: 'Cerah ☀️',
  1: 'Sebagian Besar Cerah 🌤️',
  2: 'Sebagian Berawan ⛅',
  3: 'Berawan / Mendung ☁️',
  45: 'Berkabut 🌫️',
  48: 'Kabut Tebal 🌫️',
  51: 'Gerimis Ringan 🌦️',
  53: 'Gerimis Sedang 🌦️',
  55: 'Gerimis Lebat 🌧️',
  56: 'Gerimis Membeku 🌨️',
  57: 'Gerimis Membeku Lebat 🌨️',
  61: 'Hujan Ringan 🌧️',
  63: 'Hujan Sedang 🌧️',
  65: 'Hujan Lebat 🌧️',
  66: 'Hujan Membeku 🌨️',
  67: 'Hujan Membeku Lebat 🌨️',
  71: 'Salju Ringan 🌨️',
  73: 'Salju Sedang 🌨️',
  75: 'Salju Lebat 🌨️',
  77: 'Hujan Butiran Es 🌨️',
  80: 'Hujan Rintik-Rintik 🌦️',
  81: 'Hujan Deras 🌧️',
  82: 'Hujan Sangat Deras / Badai ⛈️',
  85: 'Hujan Salju Ringan 🌨️',
  86: 'Hujan Salju Lebat 🌨️',
  95: 'Badai Petir ⛈️',
  96: 'Badai Petir Disertai Es ⛈️',
  99: 'Badai Petir Hebat ⛈️',
};

// Pemetaan Deskripsi Cuaca wttr.in ke Bahasa Indonesia
const WTTR_TRANSLATIONS = {
  'sunny': 'Cerah ☀️',
  'clear': 'Cerah ☀️',
  'partly cloudy': 'Sebagian Berawan ⛅',
  'cloudy': 'Berawan ☁️',
  'overcast': 'Mendung Tebal ☁️',
  'mist': 'Berkabut Tipis 🌫️',
  'fog': 'Kabut 🌫️',
  'freezing fog': 'Kabut Dingin Beku 🌫️',
  'patchy rain nearby': 'Potensi Hujan Rintik 🌦️',
  'patchy light drizzle': 'Gerimis Rintik 🌦️',
  'light drizzle': 'Gerimis Ringan 🌦️',
  'freezing drizzle': 'Gerimis Membeku 🌨️',
  'heavy freezing drizzle': 'Gerimis Beku Lebat 🌨️',
  'patchy light rain': 'Hujan Rintik Ringan 🌦️',
  'light rain': 'Hujan Ringan 🌧️',
  'moderate rain at times': 'Hujan Sedang Terkadang 🌧️',
  'moderate rain': 'Hujan Sedang 🌧️',
  'heavy rain at times': 'Hujan Lebat Terkadang 🌧️',
  'heavy rain': 'Hujan Deras 🌧️',
  'light freezing rain': 'Hujan Beku Ringan 🌨️',
  'moderate or heavy freezing rain': 'Hujan Beku Lebat 🌨️',
  'light rain shower': 'Guyuran Hujan Ringan 🌦️',
  'moderate or heavy rain shower': 'Guyuran Hujan Deras 🌧️',
  'torrential rain shower': 'Guyuran Hujan Sangat Lebat ⛈️',
  'light sleet showers': 'Hujan Es Ringan 🌨️',
  'moderate or heavy sleet showers': 'Hujan Es Lebat 🌨️',
  'light snow showers': 'Hujan Salju Ringan 🌨️',
  'moderate or heavy snow showers': 'Hujan Salju Lebat 🌨️',
  'thundery outbreaks nearby': 'Potensi Badai Petir ⛈️',
  'patchy light rain with thunder': 'Hujan Ringan Disertai Petir ⛈️',
  'moderate or heavy rain with thunder': 'Hujan Deras Disertai Petir ⛈️',
  'patchy light snow with thunder': 'Salju Ringan Disertai Petir ⛈️',
  'moderate or heavy snow with thunder': 'Salju Lebat Disertai Petir ⛈️',
};

/**
 * Membersihkan awalan administratif Indonesia agar geocoding akurat
 * @param {string} query
 * @returns {string}
 */
export function cleanCityQuery(query) {
  if (!query) return '';
  return query
    .trim()
    .replace(/^(kabupaten|kab\.|kota|kecamatan|kec\.|provinsi|prov\.|daerah|wilayah)\s+/i, '')
    .trim();
}

/**
 * Cek Cuaca Real-time berdasarkan nama kota
 * Menggunakan Tier 1: Open-Meteo dengan Geocoding cerdas
 * Fallback Tier 2: wttr.in jika Open-Meteo tidak menemukan hasil atau timeout
 * @param {string} cityName
 * @returns {Promise<string|null>}
 */
export async function getWeather(cityName) {
  if (!cityName) return null;

  const rawQuery = cityName.trim();
  const cleanQuery = cleanCityQuery(rawQuery);

  // --- TIER 1: Open-Meteo Geocoding & Forecast ---
  try {
    // Cari lokasi dengan nama bersih terlebih dahulu, lalu nama asli jika berbeda
    const searchCandidates = cleanQuery && cleanQuery !== rawQuery 
      ? [cleanQuery, rawQuery] 
      : [rawQuery];

    let location = null;
    for (const q of searchCandidates) {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=id&format=json`;
      const geoRes = await fetch(geoUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WhatsAppBot/2.0' },
        signal: AbortSignal.timeout(5000),
      });

      if (!geoRes.ok) continue;

      const geoData = await geoRes.json();
      if (geoData.results && geoData.results.length > 0) {
        location = geoData.results[0];
        break;
      }
    }

    if (location) {
      const { latitude, longitude, name, admin1, country } = location;
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
      
      const weatherRes = await fetch(weatherUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WhatsAppBot/2.0' },
        signal: AbortSignal.timeout(5000),
      });

      if (weatherRes.ok) {
        const weatherData = await weatherRes.json();
        const current = weatherData.current;
        const condition = WMO_CODES[current.weather_code] || 'Berawan';
        const locDisplay = `${name}${admin1 ? ', ' + admin1 : ''}${country ? ', ' + country : ''}`;
        const feelsLike = current.apparent_temperature != null ? ` (Terasa: ${current.apparent_temperature}°C)` : '';

        return `📍 *Lokasi*: ${locDisplay}\n` +
          `🌤️ *Kondisi*: ${condition}\n` +
          `🌡️ *Suhu*: ${current.temperature_2m}°C${feelsLike}\n` +
          `💧 *Kelembapan*: ${current.relative_humidity_2m}%\n` +
          `💨 *Kecepatan Angin*: ${current.wind_speed_10m} km/jam`;
      }
    }
  } catch (err) {
    console.warn('[OPEN_METEO_FALLBACK] Beralih ke wttr.in:', err?.message || err);
  }

  // --- TIER 2: Fallback ke wttr.in ---
  try {
    const targetQuery = cleanQuery || rawQuery;
    const wttrUrl = `https://wttr.in/${encodeURIComponent(targetQuery)}?format=j1`;
    const wttrRes = await fetch(wttrUrl, {
      headers: { 'User-Agent': 'curl/7.68.0' },
      signal: AbortSignal.timeout(6000),
    });

    if (wttrRes.ok) {
      const data = await wttrRes.json();
      const area = data.nearest_area?.[0];
      const cur = data.current_condition?.[0];

      if (cur && area) {
        const descEn = (cur.weatherDesc?.[0]?.value || '').trim();
        const descId = WTTR_TRANSLATIONS[descEn.toLowerCase()] || descEn;
        const locName = area.areaName?.[0]?.value || targetQuery;
        const region = area.region?.[0]?.value;
        const country = area.country?.[0]?.value || 'Indonesia';
        const locDisplay = `${locName}${region ? ', ' + region : ''}, ${country}`;
        const feelsLike = cur.FeelsLikeC ? ` (Terasa: ${cur.FeelsLikeC}°C)` : '';

        return `📍 *Lokasi*: ${locDisplay}\n` +
          `🌤️ *Kondisi*: ${descId}\n` +
          `🌡️ *Suhu*: ${cur.temp_C}°C${feelsLike}\n` +
          `💧 *Kelembapan*: ${cur.humidity}%\n` +
          `💨 *Kecepatan Angin*: ${cur.windspeedKmph} km/jam`;
      }
    }
  } catch (err) {
    console.error('[WTTR_ERROR]', err?.message || err);
  }

  return null;
}
