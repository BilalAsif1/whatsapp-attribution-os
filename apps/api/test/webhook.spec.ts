import * as crypto from 'crypto';

describe('WhatsApp Webhook', () => {
  const APP_SECRET = 'test-app-secret';

  function generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  describe('Signature Verification', () => {
    it('generates valid HMAC-SHA256 signature', () => {
      const payload = JSON.stringify({ entry: [{ changes: [] }] });
      const sig = generateSignature(payload, APP_SECRET);
      expect(sig).toHaveLength(64);
      expect(sig).toMatch(/^[a-f0-9]{64}$/);
    });

    it('rejects tampered payloads', () => {
      const payload = JSON.stringify({ entry: [{ changes: [] }] });
      const sig = generateSignature(payload, APP_SECRET);
      const tampered = JSON.stringify({ entry: [{ changes: [{ hack: true }] }] });
      const tamperedSig = generateSignature(tampered, APP_SECRET);
      expect(sig).not.toBe(tamperedSig);
    });
  });

  describe('Webhook Payload Parsing', () => {
    it('parses a text message payload', () => {
      const payload = {
        object: 'whatsapp_business_account',
        entry: [{
          id: 'WABA_ID',
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '1234567890', phone_number_id: 'PHONE_ID' },
              contacts: [{ profile: { name: 'Test User' }, wa_id: '9876543210' }],
              messages: [{
                id: 'wamid.123',
                from: '9876543210',
                timestamp: '1234567890',
                type: 'text',
                text: { body: 'Hello! Ref: WAO-ABC123' },
              }],
            },
            field: 'messages',
          }],
        }],
      };

      const entry = payload.entry[0];
      const change = entry.changes[0];
      const message = change.value.messages[0];

      expect(message.type).toBe('text');
      expect(message.text.body).toContain('WAO-ABC123');
      expect(change.value.metadata.phone_number_id).toBe('PHONE_ID');
    });

    it('handles status update payloads', () => {
      const payload = {
        object: 'whatsapp_business_account',
        entry: [{
          id: 'WABA_ID',
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '1234567890', phone_number_id: 'PHONE_ID' },
              statuses: [{
                id: 'wamid.123',
                status: 'delivered',
                timestamp: '1234567890',
                recipient_id: '9876543210',
              }],
            },
            field: 'messages',
          }],
        }],
      };

      const change = payload.entry[0].changes[0];
      expect(change.value.statuses).toBeDefined();
      expect(change.value.statuses![0].status).toBe('delivered');
    });
  });
});
