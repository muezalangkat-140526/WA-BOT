import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
    this.categories = new Map();
  }

  /**
   * Mengosongkan seluruh command dari memori
   */
  clear() {
    this.commands.clear();
    this.aliases.clear();
    this.categories.clear();
  }

  /**
   * Mendaftarkan perintah baru
   * @param {Object} cmd
   * @param {string} cmd.name - Nama perintah utama (misal: 'menu')
   * @param {string[]} [cmd.aliases] - Alias perintah (misal: ['help', 'bantuan'])
   * @param {string} cmd.category - Kategori (umum, alat, grup, owner, ai)
   * @param {string} cmd.description - Deskripsi singkat
   * @param {string} [cmd.usage] - Format penggunaan
   * @param {boolean} [cmd.isOwnerOnly] - Khusus owner
   * @param {boolean} [cmd.isGroupOnly] - Khusus grup
   * @param {boolean} [cmd.isAdminOnly] - Khusus admin grup
   * @param {Function} cmd.execute - Fungsi eksekutor async ({ sock, msg, remoteJid, sender, isGroup, args, p, safeReply, isOwner, sentByBotIds })
   */
  register(cmd) {
    if (!cmd.name || typeof cmd.execute !== 'function') {
      console.warn(`[REGISTRY_WARN] Command tidak valid:`, cmd);
      return;
    }

    const name = cmd.name.toLowerCase();
    this.commands.set(name, cmd);

    if (!this.categories.has(cmd.category)) {
      this.categories.set(cmd.category, []);
    }
    const catList = this.categories.get(cmd.category);
    const existingIdx = catList.findIndex((c) => c.name.toLowerCase() === name);
    if (existingIdx !== -1) {
      catList[existingIdx] = cmd;
    } else {
      catList.push(cmd);
    }

    if (Array.isArray(cmd.aliases)) {
      for (const alias of cmd.aliases) {
        this.aliases.set(alias.toLowerCase(), name);
      }
    }
  }

  /**
   * Mencari command berdasarkan input kata
   * @param {string} nameOrAlias
   * @returns {Object|null}
   */
  get(nameOrAlias) {
    if (!nameOrAlias) return null;
    const lower = nameOrAlias.toLowerCase();
    if (this.commands.has(lower)) {
      return this.commands.get(lower);
    }
    if (this.aliases.has(lower)) {
      const realName = this.aliases.get(lower);
      return this.commands.get(realName) || null;
    }
    return null;
  }

  /**
   * Mengambil daftar semua perintah per kategori
   */
  getAllByCategory() {
    return this.categories;
  }
}

export const registry = new CommandRegistry();

/**
 * Memuat semua file command dari folder src/commands secara otomatis
 */
export async function loadCommands(baseDir = path.join(__dirname, '..', 'commands')) {
  registry.clear();

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
    return;
  }

  const entries = fs.readdirSync(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = fs.readdirSync(fullPath);
      for (const file of subFiles) {
        if (file.endsWith('.js')) {
          await loadCommandFile(path.join(fullPath, file));
        }
      }
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      await loadCommandFile(fullPath);
    }
  }

  console.log(`[COMMANDS] Berhasil memuat ${registry.commands.size} perintah modular.`);
}

async function loadCommandFile(filePath) {
  try {
    const fileUrl = pathToFileURL(filePath).href;
    const module = await import(fileUrl);
    if (module.default) {
      registry.register(module.default);
    } else if (typeof module.command === 'object') {
      registry.register(module.command);
    }
  } catch (err) {
    console.error(`[COMMAND_LOAD_ERROR] Gagal memuat file ${filePath}:`, err?.message || err);
  }
}
