import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

// Pastikan folder data ada
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function saveContact(jid) {
  if (!jid || jid === 'status@broadcast') return;
  try {
    let contacts = [];
    if (fs.existsSync(CONTACTS_FILE)) {
      contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8') || '[]');
    }
    if (!contacts.includes(jid)) {
      contacts.push(jid);
      fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
    }
  } catch (err) {
    console.error('[CONTACT_SAVE_ERROR]', err?.message || err);
  }
}

export function getAllContacts() {
  try {
    if (fs.existsSync(CONTACTS_FILE)) {
      return JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8') || '[]');
    }
  } catch (err) {
    console.error('[CONTACT_READ_ERROR]', err?.message || err);
  }
  return [];
}
