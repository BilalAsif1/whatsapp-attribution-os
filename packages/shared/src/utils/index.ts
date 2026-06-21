import { UID_PREFIX, UID_LENGTH } from '../constants/index.js';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateUid(): string {
  let uid = '';
  for (let i = 0; i < UID_LENGTH; i++) {
    uid += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return `${UID_PREFIX}-${uid}`;
}

export function extractUidFromMessage(text: string): string | null {
  const regex = new RegExp(`${UID_PREFIX}-[A-Z0-9]{${UID_LENGTH}}`, 'i');
  const match = text.match(regex);
  return match ? match[0].toUpperCase() : null;
}

export function detectAdPlatform(clickIds: Record<string, string | undefined>): string | null {
  if (clickIds.gclid) return 'google_ads';
  if (clickIds.fbclid) return 'meta_ads';
  if (clickIds.ttclid) return 'tiktok_ads';
  if (clickIds.msclkid) return 'microsoft_ads';
  if (clickIds.li_fat_id) return 'linkedin_ads';
  return null;
}

export function hashPhone(phone: string, salt: string): string {
  const { createHash } = require('crypto') as typeof import('crypto');
  return createHash('sha256').update(`${phone}:${salt}`).digest('hex');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}
