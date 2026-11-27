/**
 * Modul Pencarian Informasi Real-Time & Pengetahuan
 * Menggunakan Wikipedia API & Open-Meteo Weather (100% Gratis, Tanpa API Key)
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
      headers: { 'User-Agent': 'WhatsAppAIBot/1.0' },
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

/**
 * Cek Cuaca Real-time berdasarkan nama kota via Open-Meteo
 * @param {string} cityName
 * @returns {Promise<string|null>}
 */
export async function getWeather(cityName) {
  if (!cityName) return null;
  try {
    // 1. Geocoding
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=id&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) return null;

    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) return null;

    const location = geoData.results[0];
    const { latitude, longitude, name, admin1, country } = location;

    // 2. Fetch current weather
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) return null;

    const weatherData = await weatherRes.json();
    const current = weatherData.current;

    return `Cuaca terkini di ${name}, ${admin1 ? admin1 + ', ' : ''}${country}:\n` +
      `- Suhu: ${current.temperature_2m}°C\n` +
      `- Kelembapan: ${current.relative_humidity_2m}%\n` +
      `- Kecepatan Angin: ${current.wind_speed_10m} km/jam`;
  } catch (err) {
    console.error('[WEATHER_ERROR]', err?.message || err);
    return null;
  }
}
