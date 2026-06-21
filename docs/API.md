# API Reference

Base URL: `https://api.yourdomain.com/api/v1`

All endpoints require authentication unless marked `[Public]`. Include session cookie or pass credentials via `credentials: 'include'`.

---

## Auth

Better Auth handles all authentication. Routes are proxied through the API.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/sign-up/email` | Register with email/password |
| POST | `/api/auth/sign-in/email` | Sign in with email/password |
| POST | `/api/auth/sign-in/social` | OAuth sign in (Google) |
| POST | `/api/auth/sign-out` | Sign out |
| GET | `/api/auth/session` | Get current session |
| POST | `/api/auth/forget-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

---

## Workspaces

| Method | Endpoint | Description |
|---|---|---|
| POST | `/workspaces` | Create workspace |
| GET | `/workspaces` | List user's workspaces |
| GET | `/workspaces/:id` | Get workspace details |
| PATCH | `/workspaces/:id` | Update workspace |
| DELETE | `/workspaces/:id` | Delete workspace (owner only) |

---

## Tracking Links

| Method | Endpoint | Description |
|---|---|---|
| GET | `/workspaces/:wsId/tracking/links` | List tracking links |
| POST | `/workspaces/:wsId/tracking/links` | Create tracking link |
| PATCH | `/workspaces/:wsId/tracking/links/:id` | Update tracking link |
| DELETE | `/workspaces/:wsId/tracking/links/:id` | Delete tracking link |

### Public Tracking Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/t/:shortCode` | `[Public]` Redirect tracking link (captures click data) |
| POST | `/track/click` | `[Public]` AJAX click recording from JS snippet |
| GET | `/script/:workspaceId` | `[Public]` Serve tracking JavaScript snippet |

---

## WhatsApp

| Method | Endpoint | Description |
|---|---|---|
| GET | `/webhooks/whatsapp` | `[Public]` Webhook verification (Meta handshake) |
| POST | `/webhooks/whatsapp` | `[Public]` Receive webhook events |
| POST | `/workspaces/:wsId/whatsapp/accounts` | Connect WhatsApp number |
| GET | `/workspaces/:wsId/whatsapp/accounts` | List connected numbers |
| DELETE | `/workspaces/:wsId/whatsapp/accounts/:id` | Disconnect number |

---

## Conversations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/workspaces/:wsId/conversations` | List conversations (filterable by status, date) |
| GET | `/workspaces/:wsId/conversations/:id` | Get conversation with events + attribution |
| PATCH | `/workspaces/:wsId/conversations/:id` | Update status, revenue, tags |
| POST | `/workspaces/:wsId/conversations/:id/events` | Create conversion event |

### Query Parameters

| Param | Type | Description |
|---|---|---|
| `status` | string | Filter by: `new`, `engaged`, `qualified`, `converted`, `lost` |
| `from` | ISO date | Start date filter |
| `to` | ISO date | End date filter |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 50) |

---

## Attribution

| Method | Endpoint | Description |
|---|---|---|
| GET | `/workspaces/:wsId/attribution` | List attribution records (filterable) |
| GET | `/workspaces/:wsId/attribution/campaigns` | Campaign performance stats |
| GET | `/workspaces/:wsId/attribution/keywords` | Keyword performance stats |
| POST | `/workspaces/:wsId/attribution/upload` | Trigger offline conversion upload |

---

## Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/workspaces/:wsId/dashboard/overview` | KPI overview (clicks, conversations, revenue, rates) |
| GET | `/workspaces/:wsId/dashboard/funnel` | Conversion funnel breakdown by status |
| GET | `/workspaces/:wsId/dashboard/timeseries` | Time series data for charts |

### Query Parameters (Timeseries)

| Param | Type | Description |
|---|---|---|
| `granularity` | string | `hour`, `day`, or `week` (default: `day`) |
| `from` | ISO date | Start date |
| `to` | ISO date | End date |

---

## Google Ads Integration

| Method | Endpoint | Description |
|---|---|---|
| GET | `/workspaces/:wsId/integrations/google-ads/auth-url` | Get OAuth URL (admin only) |
| GET | `/workspaces/:wsId/integrations/google-ads/callback` | `[Public]` OAuth callback |
| GET | `/workspaces/:wsId/integrations/google-ads/accounts` | List connected accounts |
| DELETE | `/workspaces/:wsId/integrations/google-ads/:id` | Disconnect account (admin only) |

---

## Billing

| Method | Endpoint | Description |
|---|---|---|
| GET | `/workspaces/:wsId/billing/subscription` | Get subscription details |
| POST | `/workspaces/:wsId/billing/checkout` | Create Stripe checkout session (owner only) |
| POST | `/workspaces/:wsId/billing/portal` | Create Stripe billing portal session (owner only) |
| POST | `/webhooks/stripe` | `[Public]` Stripe webhook receiver |

### Checkout Request Body

```json
{
  "planId": "growth"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/workspaces"
}
```

| Status | Meaning |
|---|---|
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 429 | Rate limited (20 req/sec short, 200 req/min long) |
| 500 | Internal server error |
