import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

// Ambil input ID dari argumen CLI
const inputArgs = process.argv.slice(2);
const targetOwners = inputArgs
  .map((s) => s.replace(/[^0-9]/g, ''))
  .filter(Boolean);

if (targetOwners.length === 0) {
  console.log('ℹ️ Penggunaan: node scripts/set-owner.js <nomor1> [nomor2] [nomor3]...');
  console.log('Contoh: node scripts/set-owner.js 628123456789 56376361529480');
  process.exit(1);
}

const ownersStr = targetOwners.join(', ');

// 1. Update file .env
if (fs.existsSync(envPath)) {
  let env = fs.readFileSync(envPath, 'utf8');
  if (/^OWNER_NUMBERS?=/m.test(env)) {
    env = env.replace(/^OWNER_NUMBERS?=.*$/m, `OWNER_NUMBERS="${ownersStr}"`);
  } else {
    env += `\nOWNER_NUMBERS="${ownersStr}"\n`;
  }
  fs.writeFileSync(envPath, env, 'utf8');
  console.log(`[OK] File .env diperbarui dengan Owner: ${ownersStr}`);
} else {
  console.warn('[WARN] File .env belum ditemukan.');
}

// 2. Update data/settings.json (extraOwners)
try {
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  }
  settings.extraOwners = Array.from(new Set([...(settings.extraOwners || []), ...targetOwners]));
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
  console.log('[OK] File data/settings.json diperbarui.');
} catch (err) {
  console.error('[ERR] Gagal memperbarui settings.json:', err.message);
}

console.log('[SUKSES] Seluruh ID Owner berhasil didaftarkan secara permanen.');
