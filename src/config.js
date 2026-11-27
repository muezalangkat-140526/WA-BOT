import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

export const PROVIDER_BASE_URLS = {
  openai: 'https://api.openai.com/v1',
  groq: 'https://api.groq.com/openai/v1',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  deepseek: 'https://api.deepseek.com/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  gutsai: 'https://api.gutsai.id/v1',
  ollama: 'http://localhost:11434/v1',
};

const provider = (process.env.AI_PROVIDER || (process.env.AI_BASE_URL ? 'custom' : 'groq')).toLowerCase();
const baseURL = process.env.AI_BASE_URL || PROVIDER_BASE_URLS[provider] || PROVIDER_BASE_URLS.groq;

const rawOwner = process.env.OWNER_NUMBER || process.env.OWNER_NUMBERS || '';
const ownerNumbers = rawOwner
  .split(/[,;\s]+/)
  .map((s) => s.trim().replace(/[^0-9]/g, ''))
  .filter(Boolean);

export const config = {
  bot: {
    name: process.env.BOT_NAME || 'Smart Bot',
    prefix: process.env.COMMAND_PREFIX || '!',
    requirePrefix: process.env.REQUIRE_PREFIX === 'true',
    ownerNumber: rawOwner,
    ownerNumbers,
    allowGroups: process.env.ALLOW_GROUPS !== 'false',
    pairingNumber: (process.env.PAIRING_NUMBER || '').replace(/[^0-9]/g, ''),
    selfMode: false,
  },
  ai: {
    provider,
    apiKey: process.env.AI_API_KEY || '',
    baseURL,
    model: process.env.AI_MODEL || 'llama-3.3-70b-versatile',
  },
};

/**
 * Memperbarui konfigurasi AI baik di memori maupun file .env secara permanen
 */
export function saveAIConfig({ provider: newProvider, apiKey: newApiKey, model: newModel, baseURL: newBaseURL }) {
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  const updates = {};
  if (newProvider) {
    const provLower = newProvider.toLowerCase();
    config.ai.provider = provLower;
    updates.AI_PROVIDER = provLower;

    if (PROVIDER_BASE_URLS[provLower]) {
      config.ai.baseURL = PROVIDER_BASE_URLS[provLower];
      updates.AI_BASE_URL = PROVIDER_BASE_URLS[provLower];
    }
  }

  if (newApiKey !== undefined) {
    config.ai.apiKey = newApiKey;
    updates.AI_API_KEY = newApiKey;
  }

  if (newModel) {
    config.ai.model = newModel;
    updates.AI_MODEL = newModel;
  }

  if (newBaseURL) {
    config.ai.baseURL = newBaseURL;
    updates.AI_BASE_URL = newBaseURL;
  }

  // Tulis ke file .env secara persisten
  for (const [key, val] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${val}`);
    } else {
      envContent += `\n${key}=${val}`;
    }
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
  return config.ai;
}
