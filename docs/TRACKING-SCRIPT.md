# Tracking Script Integration Guide

The WhatsApp Attribution OS tracking script captures ad click data from landing page URLs and injects a unique tracking ID into WhatsApp button links.

## Installation

Add this script tag to every landing page that has a WhatsApp CTA button:

```html
<script src="https://api.yourdomain.com/api/v1/script/YOUR_WORKSPACE_ID" async></script>
```

Find your workspace ID in **Settings** → **Tracking Script**.

## What the Script Does

### 1. Captures Click Data

On page load, the script reads these URL parameters:

| Parameter | Source | Purpose |
|---|---|---|
| `gclid` | Google Ads | Google Click Identifier for offline conversion upload |
| `fbclid` | Meta Ads | Facebook Click Identifier |
| `ttclid` | TikTok Ads | TikTok Click Identifier |
| `msclkid` | Microsoft Ads | Microsoft Click Identifier |
| `li_fat_id` | LinkedIn Ads | LinkedIn First-Party Ad Tracking ID |
| `utm_source` | Any | Campaign source |
| `utm_medium` | Any | Campaign medium |
| `utm_campaign` | Any | Campaign name |
| `utm_term` | Any | Keyword |
| `utm_content` | Any | Ad variant |

### 2. Generates a Tracking UID

A unique 6-character alphanumeric ID is generated with the prefix `WAO-` (e.g., `WAO-7X3K9`).

### 3. Sends Click Data to the API

The click data (UID, click IDs, UTM params, user agent, referrer) is sent to the API via `navigator.sendBeacon()` (with `XMLHttpRequest` fallback).

### 4. Modifies WhatsApp Links

The script finds all links on the page that point to `wa.me` or `api.whatsapp.com` and appends `Ref: WAO-7X3K9` to the pre-filled message text.

**Before:**
```
https://wa.me/1234567890?text=Hi%2C%20I%27m%20interested
```

**After:**
```
https://wa.me/1234567890?text=Hi%2C%20I%27m%20interested%0ARef%3A%20WAO-7X3K9
```

### 5. Watches for Dynamic Content

A `MutationObserver` watches for new WhatsApp links added to the DOM (e.g., by React, Vue, or other SPA frameworks) and modifies them automatically.

## Tracking Link Alternative

Instead of the JavaScript snippet, you can use **Tracking Links** — short URLs that redirect through the attribution system:

1. Create a tracking link in the dashboard (e.g., `https://api.yourdomain.com/t/abc123`)
2. Use this link as your WhatsApp CTA button's `href`
3. The click collector captures all parameters, generates a UID, and redirects to your WhatsApp deeplink with the UID injected

This approach works without JavaScript and is ideal for:
- Email campaigns
- SMS campaigns
- QR codes
- Social media bio links

## How Attribution Works

```
User clicks Google Ad
    ↓
Lands on page with ?gclid=abc123&utm_campaign=summer
    ↓
Script captures gclid + UTMs, generates WAO-7X3K9
    ↓
Click data sent to API: { uid: "WAO-7X3K9", gclid: "abc123", ... }
    ↓
User clicks WhatsApp button → message includes "Ref: WAO-7X3K9"
    ↓
WhatsApp Cloud API webhook receives message
    ↓
Backend extracts WAO-7X3K9, looks up the click record
    ↓
Creates conversation + attribution record
    ↓
BullMQ job uploads offline conversion to Google Ads with GCLID
    ↓
Google Ads now knows this click → conversation → revenue
```

## Compatibility

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Works with SPAs (React, Vue, Angular) via MutationObserver
- Works with server-rendered pages
- Script loads asynchronously — zero impact on page speed
- No cookies — uses URL parameters only
- GDPR-friendly — no personal data collected on the landing page (phone numbers are only captured server-side via the WhatsApp webhook and stored hashed)

## Troubleshooting

**Script not loading:**
Check that the workspace ID in the script URL is correct and the API is accessible from the landing page domain.

**WhatsApp links not modified:**
The script looks for `<a>` tags with `href` containing `wa.me` or `api.whatsapp.com`. Ensure your WhatsApp buttons use standard anchor tags.

**UID not appearing in messages:**
Verify the WhatsApp link includes a `text` parameter. If there's no pre-filled text, the script creates one with just the Ref line.

**No attribution data showing:**
1. Check that the WhatsApp Cloud API webhook is configured correctly
2. Verify the webhook URL is receiving events (check API logs)
3. Confirm the phone number ID matches a connected WhatsApp account in Settings
