# Google Ads Offline Conversion Setup

Upload WhatsApp conversions to Google Ads so your campaigns optimize for real revenue, not just clicks.

## Prerequisites

- A Google Ads account with active campaigns using Click-to-WhatsApp or website-to-WhatsApp flows
- Campaign URLs must include auto-tagged `gclid` parameters (enabled by default in Google Ads)
- Admin access to your WAO workspace

## Step 1: Create a Google Ads Conversion Action

1. In Google Ads → **Goals** → **Conversions** → **New conversion action**
2. Select **Import** → **Other data sources or CRMs** → **Track conversions from clicks**
3. Configure:
   - **Goal category:** Lead, Purchase, or custom
   - **Conversion name:** `WhatsApp Qualified Lead` (or your preference)
   - **Value:** Choose "Use different values for each conversion" if tracking revenue
   - **Count:** One (for leads) or Every (for purchases)
   - **Click-through window:** 30 days (matches WAO default)
4. Save and note the **Conversion Action ID**

## Step 2: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or use existing)
3. Enable the **Google Ads API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add authorized redirect URI:
   ```
   https://api.yourdomain.com/api/v1/workspaces/YOUR_WORKSPACE_ID/integrations/google-ads/callback
   ```
7. Copy **Client ID** and **Client Secret** to your environment variables:
   - `GOOGLE_ADS_CLIENT_ID`
   - `GOOGLE_ADS_CLIENT_SECRET`

## Step 3: Get a Developer Token

1. In Google Ads → **Tools** → **API Center**
2. Apply for a developer token (Basic access is sufficient)
3. Set `GOOGLE_ADS_DEVELOPER_TOKEN` in your environment

## Step 4: Connect in WAO

1. Go to **Settings** in the WAO dashboard
2. Under **Google Ads**, click **Connect Google Ads**
3. You'll be redirected to Google's OAuth consent screen
4. Authorize access to your Google Ads account
5. You'll be redirected back to WAO Settings with a success message

## Step 5: Set the Conversion Action

After connecting, configure which conversion action to use for uploads:

1. In the WAO dashboard, the connected Google Ads account will show
2. Enter your **Conversion Action ID** from Step 1
3. Save

## How Offline Upload Works

```
Conversation marked as "qualified" or "converted" in WAO
    ↓
Attribution record has GCLID + adPlatform = "google_ads"
    ↓
Record status set to "pending"
    ↓
triggerOfflineUpload() marks records as "queued"
    ↓
BullMQ job picks up queued records
    ↓
Builds UploadClickConversionsRequest:
  - gclid: original click ID
  - conversion_action: your configured action
  - conversion_date_time: timestamp of conversion
  - conversion_value: revenue amount (if tracked)
    ↓
Calls Google Ads API UploadClickConversions
    ↓
Record status updated to "uploaded" with timestamp
    ↓
Google Ads Smart Bidding now optimizes for these conversions
```

## Upload Statuses

| Status | Meaning |
|---|---|
| `pending` | Attribution created, waiting for batch |
| `queued` | Picked up by the upload job |
| `uploaded` | Successfully sent to Google Ads |
| `failed` | Upload failed (retried automatically) |
| `skipped` | No Google Ads connection or missing GCLID |

## Troubleshooting

**Conversions not appearing in Google Ads:**
- Google Ads can take up to 24 hours to process offline conversions
- Check that the GCLID is from within the conversion window (default 30 days)
- Verify the conversion action is set to "Import" type

**OAuth connection failing:**
- Ensure the redirect URI matches exactly (including trailing slashes)
- Check that the Google Ads API is enabled in your Google Cloud project

**Upload errors:**
- `CLICK_NOT_FOUND`: The GCLID is invalid or expired
- `CONVERSION_ACTION_NOT_FOUND`: Check the conversion action ID
- `TOO_RECENT_CLICK`: Wait at least 6 hours after the click before uploading
- `DUPLICATE_CONVERSION`: This click was already uploaded (WAO handles dedup automatically)

## Best Practices

1. **Set up a test conversion action first** — use a separate action for testing before pointing to your real campaign optimization target
2. **Track revenue values** — Smart Bidding works significantly better with real revenue data vs. binary conversion signals
3. **Use the "qualified" status** — upload at the point where a lead is genuinely qualified, not just when they first message
4. **Review the Campaigns page** — check which keywords and campaigns drive actual qualified conversations, then reallocate budget accordingly
