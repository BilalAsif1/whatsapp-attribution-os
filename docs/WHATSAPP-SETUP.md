# WhatsApp Cloud API Setup Guide

Connect your WhatsApp Business API to receive messages and enable attribution tracking.

## Prerequisites

- A Meta Business Account
- A Meta Developer Account
- A WhatsApp Business Account (WABA)
- A phone number verified with WhatsApp Business Platform

## Step 1: Create a Meta App

1. Go to [Meta Developer Console](https://developers.facebook.com/)
2. Click **Create App** → Select **Business** type
3. Enter app name and connect your Business Account
4. Add the **WhatsApp** product to your app

## Step 2: Get Your Credentials

### Phone Number ID

1. In your app → **WhatsApp** → **Getting Started**
2. Note the **Phone Number ID** (e.g., `123456789012345`)

### Permanent Access Token

1. Go to **Business Settings** → **System Users**
2. Create a system user with **Admin** role
3. Add the WhatsApp app and assign permissions:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
4. Generate a token — this is your permanent access token

### App Secret

1. In your app → **Settings** → **Basic**
2. Copy the **App Secret** — this is used for webhook signature verification
3. Set it as `WHATSAPP_APP_SECRET` in your environment

## Step 3: Configure the Webhook

1. In your app → **WhatsApp** → **Configuration**
2. Click **Edit** on the Webhook section
3. Set:
   - **Callback URL:** `https://api.yourdomain.com/api/v1/webhooks/whatsapp`
   - **Verify Token:** Same value as your `WHATSAPP_VERIFY_TOKEN` env var
4. Click **Verify and Save**
5. Subscribe to the **messages** webhook field

## Step 4: Connect in WAO

1. Log in to WhatsApp Attribution OS
2. Go to **Settings**
3. Under **WhatsApp Business API**, enter:
   - **Phone Number ID:** From Step 2
   - **Access Token:** The permanent token from Step 2
4. Click **Connect WhatsApp**

## Step 5: Test the Connection

1. Create a Tracking Link in the dashboard
2. Open the tracking link in a browser
3. Send the pre-filled WhatsApp message (it should include `Ref: WAO-XXXXXX`)
4. Check the **Conversations** page — a new conversation should appear within seconds
5. The conversation should show the attribution source (ad platform, campaign, etc.)

## Security Notes

- Access tokens are encrypted at rest using AES-256 before storage
- Webhook payloads are verified using HMAC-SHA256 signature checking
- Phone numbers are hashed with SHA-256 + salt before storage — plaintext numbers are encrypted separately
- All webhook endpoints return `200 OK` immediately and process asynchronously to prevent timeouts
- Message deduplication via Redis prevents duplicate processing

## Webhook Payload Flow

```
Meta sends POST to /webhooks/whatsapp
    ↓
1. Verify X-Hub-Signature-256 header (HMAC-SHA256)
2. Return 200 OK immediately
3. Parse entry[].changes[].value
4. Extract messages (skip statuses, reactions, etc.)
5. Check message dedup via Redis (wamid-based, 24h TTL)
6. Extract UID from message text via regex
7. Look up click record by UID
8. Create conversation + attribution record
9. If GCLID present → mark for offline upload
```

## Rate Limits

WhatsApp Cloud API has its own rate limits based on your business tier:
- **Unverified:** 250 business-initiated messages/24h
- **Tier 1:** 1,000/24h
- **Tier 2:** 10,000/24h
- **Tier 3:** 100,000/24h

These limits apply to outbound messages only. Inbound webhook events (which WAO processes) are not rate-limited by Meta.
