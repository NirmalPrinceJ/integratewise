# IntegrateWise

Unified business operations platform. Normalize once. Render anywhere.

## Live Services

| Service | URL | Platform |
|---------|-----|----------|
| Marketing Site | https://integratewise.co | Cloudflare Pages |
| Hub Dashboard | https://integratewise-hub.vercel.app | Vercel |
| Webhook Ingress | https://webhooks.integratewise.online | Cloudflare Workers |
| Hub API | https://hub-controller-api.workers.dev | Cloudflare Workers |

## Monorepo Structure

```
packages/
├── website/      # Marketing site (Cloudflare Pages)
├── hub/          # Hub Dashboard (Next.js on Vercel)
├── api/          # Hub API (Hono on Cloudflare Workers)
└── webhooks/     # Webhook Ingress (Cloudflare Workers)
```

## Webhook Providers (15 total)

| Provider | Endpoint | Category |
|----------|----------|----------|
| HubSpot | `/webhooks/hubspot` | CRM |
| Salesforce | `/webhooks/salesforce` | CRM |
| Pipedrive | `/webhooks/pipedrive` | Sales |
| LinkedIn | `/webhooks/linkedin` | Marketing |
| Canva | `/webhooks/canva` | Design |
| Google Ads | `/webhooks/google-ads` | Marketing |
| Meta | `/webhooks/meta` | Marketing |
| WhatsApp | `/webhooks/whatsapp` | Communication |
| Razorpay | `/webhooks/razorpay` | Payments |
| Stripe | `/webhooks/stripe` | Payments |
| GitHub | `/webhooks/github` | Dev |
| Vercel | `/webhooks/vercel` | Dev |
| Todoist | `/webhooks/todoist` | Productivity |
| Notion | `/webhooks/notion` | Productivity |
| AI Relay | `/webhooks/ai-relay` | Internal |

## Development

```bash
# Website (static)
cd packages/website && wrangler dev

# Hub Dashboard
cd packages/hub && npm install && npm run dev

# API
cd packages/api && npm install && wrangler dev

# Webhooks
cd packages/webhooks && npm install && wrangler dev
```

## Deployment

```bash
# Website
cd packages/website && wrangler publish

# Hub (auto-deploys via Vercel on push)

# API
cd packages/api && wrangler deploy

# Webhooks
cd packages/webhooks && wrangler deploy
```

## Required Secrets

Add via `wrangler secret put SECRET_NAME`:

- `NEON_CONNECTION_STRING` - Postgres database
- `HUBSPOT_CLIENT_SECRET` - HubSpot webhook verification
- `LINKEDIN_CLIENT_SECRET` - LinkedIn API
- `CANVA_WEBHOOK_SECRET` - Canva webhook verification
- `SALESFORCE_SECURITY_TOKEN` - Salesforce API
- `PIPEDRIVE_WEBHOOK_TOKEN` - Pipedrive API
- `META_VERIFY_TOKEN` - Meta/Facebook verification
- `WHATSAPP_VERIFY_TOKEN` - WhatsApp verification
- `RAZORPAY_WEBHOOK_SECRET` - Razorpay payments
- `STRIPE_ENDPOINT_SECRET` - Stripe payments
- `GITHUB_WEBHOOK_SECRET` - GitHub events
- `VERCEL_WEBHOOK_SECRET` - Vercel deployments
