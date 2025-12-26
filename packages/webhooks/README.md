# IntegrateWise Webhooks

Production webhook ingress for IntegrateWise - receives webhooks from multiple providers and persists to Neon Postgres.

## Live at
```
https://webhooks.integratewise.online
```

## Supported Providers

| Provider | Endpoint | Signature |
|----------|----------|-----------|
| Razorpay | `/webhooks/razorpay` | HMAC-SHA256 |
| Stripe | `/webhooks/stripe` | HMAC-SHA256 |
| GitHub | `/webhooks/github` | HMAC-SHA256 |
| Vercel | `/webhooks/vercel` | HMAC-SHA1 |
| Todoist | `/webhooks/todoist` | None |
| Notion | `/webhooks/notion` | None |
| AI Relay | `/webhooks/ai-relay` | HMAC-SHA256 |

## Quick Start

```bash
# Install dependencies
npm install

# Deploy to production
npm run deploy:prod

# View logs
npm run tail
```

## Scripts

- `npm run dev` - Local development
- `npm run deploy` - Deploy to default env
- `npm run deploy:prod` - Deploy to production
- `npm run tail` - View production logs

## Architecture

- **Edge:** Cloudflare Workers
- **Database:** Neon Postgres (serverless)
- **Domain:** webhooks.integratewise.online

## Configuration

Secrets are managed via Cloudflare Workers secrets:

```bash
npx wrangler secret put NEON_CONNECTION_STRING --env production
npx wrangler secret put RAZORPAY_WEBHOOK_SECRET --env production
npx wrangler secret put STRIPE_ENDPOINT_SECRET --env production
npx wrangler secret put GITHUB_WEBHOOK_SECRET --env production
npx wrangler secret put VERCEL_WEBHOOK_SECRET --env production
npx wrangler secret put AI_RELAY_SECRET --env production
```

## Test

```bash
# Health check
curl https://webhooks.integratewise.online/health

# Send test webhook
curl -X POST https://webhooks.integratewise.online/webhooks/notion \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}'
```

## Documentation

- [Production Deployment](docs/PRODUCTION_DEPLOYMENT.md)
- [Webhook Events Reference](docs/WEBHOOK_EVENTS.md)
