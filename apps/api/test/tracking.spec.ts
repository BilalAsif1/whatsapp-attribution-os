import { generateUid, extractUidFromMessage, detectAdPlatform } from '@wao/shared';

describe('Tracking Utilities', () => {
  describe('generateUid', () => {
    it('generates a UID with WAO- prefix', () => {
      const uid = generateUid();
      expect(uid).toMatch(/^WAO-[A-Z0-9]{6}$/);
    });

    it('generates unique UIDs', () => {
      const uids = new Set(Array.from({ length: 100 }, () => generateUid()));
      expect(uids.size).toBe(100);
    });
  });

  describe('extractUidFromMessage', () => {
    it('extracts UID from message text', () => {
      const uid = extractUidFromMessage('Hi, I am interested in your product. Ref: WAO-7X3K9');
      expect(uid).toBe('WAO-7X3K9');
    });

    it('extracts UID from multi-line message', () => {
      const uid = extractUidFromMessage('Hello\nI want to know about pricing\nRef: WAO-ABC123');
      expect(uid).toBe('WAO-ABC123');
    });

    it('returns null when no UID present', () => {
      const uid = extractUidFromMessage('Just a regular message');
      expect(uid).toBeNull();
    });

    it('extracts UID without Ref: prefix', () => {
      const uid = extractUidFromMessage('Hello WAO-XYZ789');
      expect(uid).toBe('WAO-XYZ789');
    });
  });

  describe('detectAdPlatform', () => {
    it('detects Google Ads from gclid', () => {
      expect(detectAdPlatform({ gclid: 'abc123' })).toBe('google_ads');
    });

    it('detects Meta Ads from fbclid', () => {
      expect(detectAdPlatform({ fbclid: 'abc123' })).toBe('meta_ads');
    });

    it('detects TikTok from ttclid', () => {
      expect(detectAdPlatform({ ttclid: 'abc123' })).toBe('tiktok_ads');
    });

    it('detects Microsoft Ads from msclkid', () => {
      expect(detectAdPlatform({ msclkid: 'abc123' })).toBe('microsoft_ads');
    });

    it('detects LinkedIn from li_fat_id', () => {
      expect(detectAdPlatform({ li_fat_id: 'abc123' })).toBe('linkedin_ads');
    });

    it('returns null when no click ID', () => {
      expect(detectAdPlatform({})).toBeNull();
    });
  });
});
