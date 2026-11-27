import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const EXPORT_DIR = path.join(ROOT_DIR, 'dist-shareable');

const ALLOWED_FILES = [
  'index.js',
  'package.json',
  '.env.example',
  '.gitignore',
  'README.md',
  'setup.bat',
  'start.bat',
  'setup.sh',
  'ecosystem.config.cjs',
  'Dockerfile',
  '.dockerignore',
  'DEPLOYMENT.md',
];

const ALLOWED_DIRS = [
  'src',
  'data',
];

// File dan folder yang DILARANG KERAS ikut terbagikan
const FORBIDDEN_PATTERNS = [
  '.env',
  'auth_info_baileys',
  'node_modules',
  '.git',
  'logs',
  'dist-shareable',
];

function copyFolderRecursive(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const items = fs.readdirSync(source);
  for (const item of items) {
    const srcPath = path.join(source, item);
    const destPath = path.join(target, item);

    if (FORBIDDEN_PATTERNS.some((p) => item.startsWith(p))) {
      continue;
    }

    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyFolderRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('📦 Menyiapkan paket bot bersih untuk dibagikan...');

if (fs.existsSync(EXPORT_DIR)) {
  fs.rmSync(EXPORT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(EXPORT_DIR, { recursive: true });

// Copy file root
for (const file of ALLOWED_FILES) {
  const src = path.join(ROOT_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(EXPORT_DIR, file));
    console.log(`  ✓ Menyalin ${file}`);
  }
}

// Copy direktori
for (const dir of ALLOWED_DIRS) {
  const src = path.join(ROOT_DIR, dir);
  if (fs.existsSync(src)) {
    copyFolderRecursive(src, path.join(EXPORT_DIR, dir));
    console.log(`  ✓ Menyalin folder ${dir}/`);
  }
}

console.log('\n======================================================');
console.log('✅ SELESAI! Folder paket bersih ada di: /dist-shareable');
console.log('🔒 Terverifikasi AMAN:');
console.log('   - File .env TIDAK disertakan.');
console.log('   - Sesi auth_info_baileys TIDAK disertakan.');
console.log('   - Folder node_modules TIDAK disertakan.');
console.log('   - Dilengkapi setup.bat, start.bat, dan setup.sh.');
console.log('Anda bisa langsung zip atau bagikan folder "dist-shareable" ini.');
console.log('======================================================\n');
