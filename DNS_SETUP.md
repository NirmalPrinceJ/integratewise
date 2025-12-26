# IntegrateWise DNS Setup Reference

## Current Status

| Domain | Subdomain | Service | Status |
|--------|-----------|---------|--------|
| integratewise.online | webhooks | Webhook Worker | LIVE |
| integratewise.xyz | webhooks | Webhook Worker | PENDING DNS |

---

## Domain Architecture

```
integratewise.online (Internal/Dev)
├── webhooks.integratewise.online  → Cloudflare Worker (integratewise-webhooks)
│   ├── /webhooks/github
│   ├── /webhooks/vercel
│   ├── /webhooks/canva
│   ├── /webhooks/todoist
│   ├── /webhooks/notion
│   └── /webhooks/ai-relay

integratewise.xyz (Marketing/CRM)
├── webhooks.integratewise.xyz  → Cloudflare Worker (integratewise-webhooks-xyz)
│   ├── /webhooks/hubspot
│   ├── /webhooks/linkedin
│   ├── /webhooks/salesforce (future)
│   └── /webhooks/pipedrive (future)
```

---

## Cloudflare DNS Records Required

### integratewise.online Zone

| Type | Name | Content | Proxy | TTL | Notes |
|------|------|---------|-------|-----|-------|
| AAAA | webhooks | 100:: | Proxied | Auto | Worker route handles this |

**Note**: When using Cloudflare Workers with routes, you need a placeholder DNS record pointing to `100::` (IPv6 discard prefix). The Worker route intercepts the traffic.

### integratewise.xyz Zone

| Type | Name | Content | Proxy | TTL | Notes |
|------|------|---------|-------|-----|-------|
| AAAA | webhooks | 100:: | Proxied | Auto | Worker route handles this |

---

## Step-by-Step DNS Setup in Cloudflare

### For integratewise.online (Already configured)

The DNS is already working. Current setup:
```
webhooks.integratewise.online → Cloudflare Worker
```

### For integratewise.xyz (Needs setup)

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Select `integratewise.xyz` zone

2. **Add DNS Record**
   - Click "DNS" → "Records" → "Add record"
   - Type: `AAAA`
   - Name: `webhooks`
   - IPv6 address: `100::`
   - Proxy status: **Proxied** (orange cloud ON)
   - TTL: Auto
   - Click "Save"

3. **Deploy Worker with Route**
   ```bash
   cd packages/webhooks
   wrangler deploy --env production_xyz
   ```

4. **Add Secrets for .xyz environment**
   ```bash
   wrangler secret put INTERNAL_API_KEY --env production_xyz
   wrangler secret put NEON_CONNECTION_STRING --env production_xyz
   wrangler secret put HUBSPOT_CLIENT_SECRET --env production_xyz
   wrangler secret put LINKEDIN_CLIENT_SECRET --env production_xyz
   ```

---

## Worker Route Configuration

### .online domain (env.production)
```toml
routes = [
  { pattern = "webhooks.integratewise.online/*", zone_name = "integratewise.online" }
]
```

### .xyz domain (env.production_xyz)
```toml
routes = [
  { pattern = "webhooks.integratewise.xyz/*", zone_name = "integratewise.xyz" }
]
```

---

## Verification Commands

### Test .online webhooks
```bash
# Health check
curl -s -H "X-IntegrateWise-Internal-Key: YOUR_KEY" \
  https://webhooks.integratewise.online/health | jq

# List providers
curl -s -H "X-IntegrateWise-Internal-Key: YOUR_KEY" \
  https://webhooks.integratewise.online/providers | jq
```

### Test .xyz webhooks (after DNS setup)
```bash
# Health check
curl -s -H "X-IntegrateWise-Internal-Key: YOUR_KEY" \
  https://webhooks.integratewise.xyz/health | jq

# List providers
curl -s -H "X-IntegrateWise-Internal-Key: YOUR_KEY" \
  https://webhooks.integratewise.xyz/providers | jq
```

---

## Provider Webhook URLs

### .online Domain (Internal/Dev Tools)

| Provider | Webhook URL | Setup Location |
|----------|-------------|----------------|
| GitHub | `https://webhooks.integratewise.online/webhooks/github` | Repo Settings → Webhooks |
| Vercel | `https://webhooks.integratewise.online/webhooks/vercel` | Project Settings → Webhooks |
| Canva | `https://webhooks.integratewise.online/webhooks/canva` | App Settings → Webhooks |
| Todoist | `https://webhooks.integratewise.online/webhooks/todoist` | App Console → Webhooks |
| Notion | `https://webhooks.integratewise.online/webhooks/notion` | Integration Settings |

### .xyz Domain (CRM/Marketing)

| Provider | Webhook URL | Setup Location |
|----------|-------------|----------------|
| HubSpot | `https://webhooks.integratewise.xyz/webhooks/hubspot` | Developer Portal → App → Webhooks |
| LinkedIn | `https://webhooks.integratewise.xyz/webhooks/linkedin` | Developer Portal → Webhooks |
| Salesforce | `https://webhooks.integratewise.xyz/webhooks/salesforce` | Setup → Outbound Messages |
| Pipedrive | `https://webhooks.integratewise.xyz/webhooks/pipedrive` | Settings → Webhooks |

---

## SSL/TLS Configuration

Both domains use Cloudflare's Universal SSL. Ensure these settings in Cloudflare:

1. **SSL/TLS** → **Overview**
   - Mode: `Full (strict)`

2. **SSL/TLS** → **Edge Certificates**
   - Always Use HTTPS: `ON`
   - Automatic HTTPS Rewrites: `ON`
   - Minimum TLS Version: `TLS 1.2`

3. **Security** → **Settings**
   - Security Level: `Medium` or `High`

---

## Troubleshooting

### DNS not resolving
```bash
# Check DNS propagation
dig webhooks.integratewise.xyz +short
dig webhooks.integratewise.online +short

# Should return Cloudflare IPs if proxied
```

### Worker not responding
```bash
# Check worker deployment
wrangler deployments list --env production
wrangler deployments list --env production_xyz
```

### 522/524 errors
- Ensure DNS record is proxied (orange cloud)
- Verify Worker route is correctly configured
- Check Worker logs: `wrangler tail --env production`

---

## Quick Reference: Deploy Commands

```bash
# Deploy to .online (internal/dev)
cd packages/webhooks
wrangler deploy --env production

# Deploy to .xyz (marketing/CRM)
wrangler deploy --env production_xyz

# View logs
wrangler tail --env production
wrangler tail --env production_xyz
```

---

## Security Headers (Configured in Worker)

The worker automatically adds these security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## Contact

For DNS issues related to Cloudflare zones, check:
- Cloudflare Dashboard → Analytics & Logs → Security Events
- Worker errors: `wrangler tail --env [environment]`
