import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(filename) {
  return path.join(DATA_DIR, filename);
}

function readJSON(filename, defaultVal = {}) {
  try {
    const p = getFilePath(filename);
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  } catch {}
  return defaultVal;
}

function writeJSON(filename, data) {
  try {
    const p = getFilePath(filename);
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`[STORAGE_WRITE_ERROR: ${filename}]`, err);
  }
}

// 1. Settings Grup & Bot
export const dbSettings = {
  get: () => readJSON('settings.json', {
    disabledAIGroups: [],
    antiLinkGroups: [],
    antiSpamGroups: [],
    bannedUsers: [],
    aiRateLimit: 50,
    menuStyle: 'default',
    customSystemPrompt: '',
    elevenlabsKey: '',
    elevenlabsVoice: '',
  }),
  save: (data) => writeJSON('settings.json', data),
};

// 2. Data AFK (User Away from Keyboard)
export const dbAFK = {
  get: () => readJSON('afk.json', {}),
  set: (jid, reason) => {
    const data = readJSON('afk.json', {});
    data[jid] = { time: Date.now(), reason };
    writeJSON('afk.json', data);
  },
  remove: (jid) => {
    const data = readJSON('afk.json', {});
    delete data[jid];
    writeJSON('afk.json', data);
  },
};

// 3. Data Peringatan Grup (Warns)
export const dbWarns = {
  get: () => readJSON('warns.json', {}),
  add: (groupJid, userJid) => {
    const data = readJSON('warns.json', {});
    if (!data[groupJid]) data[groupJid] = {};
    const count = (data[groupJid][userJid] || 0) + 1;
    data[groupJid][userJid] = count;
    writeJSON('warns.json', data);
    return count;
  },
  reset: (groupJid, userJid) => {
    const data = readJSON('warns.json', {});
    if (data[groupJid] && data[groupJid][userJid]) {
      delete data[groupJid][userJid];
      writeJSON('warns.json', data);
    }
  },
};

// 4. Kata Terlarang (Banned Words)
export const dbBannedWords = {
  get: (groupJid) => {
    const data = readJSON('banned_words.json', {});
    return data[groupJid] || [];
  },
  add: (groupJid, word) => {
    const data = readJSON('banned_words.json', {});
    if (!data[groupJid]) data[groupJid] = [];
    if (!data[groupJid].includes(word.toLowerCase())) {
      data[groupJid].push(word.toLowerCase());
      writeJSON('banned_words.json', data);
    }
  },
  remove: (groupJid, word) => {
    const data = readJSON('banned_words.json', {});
    if (data[groupJid]) {
      data[groupJid] = data[groupJid].filter((w) => w !== word.toLowerCase());
      writeJSON('banned_words.json', data);
    }
  },
};

// 5. Pesan Sambutan & Perpisahan (Welcome & Bye)
export const dbGreetings = {
  get: (groupJid) => {
    const data = readJSON('greetings.json', {});
    return data[groupJid] || { welcome: '', bye: '' };
  },
  setWelcome: (groupJid, text) => {
    const data = readJSON('greetings.json', {});
    if (!data[groupJid]) data[groupJid] = {};
    data[groupJid].welcome = text;
    writeJSON('greetings.json', data);
  },
  setBye: (groupJid, text) => {
    const data = readJSON('greetings.json', {});
    if (!data[groupJid]) data[groupJid] = {};
    data[groupJid].bye = text;
    writeJSON('greetings.json', data);
  },
};

// 6. Respon Otomatis Kata Kunci (Setrespon)
export const dbResponses = {
  get: (groupJid) => {
    const data = readJSON('responses.json', {});
    return data[groupJid] || {};
  },
  set: (groupJid, keyword, answer) => {
    const data = readJSON('responses.json', {});
    if (!data[groupJid]) data[groupJid] = {};
    data[groupJid][keyword.toLowerCase()] = answer;
    writeJSON('responses.json', data);
  },
  delete: (groupJid, keyword) => {
    const data = readJSON('responses.json', {});
    if (data[groupJid] && data[groupJid][keyword.toLowerCase()]) {
      delete data[groupJid][keyword.toLowerCase()];
      writeJSON('responses.json', data);
    }
  },
};

// 7. Pengguna Terdaftar (Daftar)
export const dbUsers = {
  get: () => readJSON('users.json', {}),
  register: (userJid, name, age) => {
    const data = readJSON('users.json', {});
    data[userJid] = { name, age, registeredAt: Date.now() };
    writeJSON('users.json', data);
  },
};

// 8. Katalog Toko (Store)
export const dbStore = {
  get: () => readJSON('store.json', {
    name: 'Toko Resmi Bot',
    payment: 'QRIS / DANA / Transfer Bank\nSilakan hubungi Owner untuk transfer.',
    products: [
      { id: '1', name: 'Akses VIP Bot 1 Bulan', price: 'Rp 15.000', desc: 'Akses penuh tanpa limit harian' },
      { id: '2', name: 'Sewa Bot Masuk Grup 1 Bulan', price: 'Rp 25.000', desc: 'Bot aktif di grup Anda 24/7' },
    ],
  }),
  save: (data) => writeJSON('store.json', data),
};
