# IntegrateWise Webhooks - Production Deployment

## Live Endpoints

**Base URL:** `https://webhooks.integratewise.online`

### Available Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/health` | GET | Health check endpoint |
| `/webhooks/razorpay` | POST | Razorpay payment webhooks |
| `/webhooks/stripe` | POST | Stripe payment webhooks |
| `/webhooks/github` | POST | GitHub repository webhooks |
| `/webhooks/vercel` | POST | Vercel deployment webhooks |
| `/webhooks/todoist` | POST | Todoist task webhooks |
| `/webhooks/notion` | POST | Notion database webhooks |
| `/webhooks/ai-relay` | POST | Internal AI relay messages |

## Infrastructure

- **Worker:** Cloudflare Workers (Edge)
- **Database:** Neon Postgres (Serverless)
- **DNS:** Cloudflare (172.67.140.246, 104.21.9.19)

## Secrets Configuration

Set via `wrangler secret put --env production`:

```bash
wrangler secret put NEON_CONNECTION_STRING --env production
wrangler secret put RAZORPAY_WEBHOOK_SECRET --env production
wrangler secret put STRIPE_ENDPOINT_SECRET --env production
wrangler secret put GITHUB_WEBHOOK_SECRET --env production
wrangler secret put VERCEL_WEBHOOK_SECRET --env production
wrangler secret put AI_RELAY_SECRET --env production
wrangler secret put CODA_API_TOKEN --env production
```

## Deployment

### Manual Deploy
```bash
npm run deploy:prod
```

### CI/CD
Push to `main` branch triggers automatic deployment via GitHub Actions.

## Monitoring

```bash
# View real-time logs
npm run tail

# Or directly
npx wrangler tail --env production
```

## Database Tables

- `events_log` - All incoming webhook events
- `retries` - Failed events for retry
- `dlq` - Dead letter queue (exhausted retries)
- `ai_messages` - AI-specific message processing
- `provider_config` - Provider settings

## Verify Production

```bash
# Health check
curl https://webhooks.integratewise.online/health

# Test webhook
curl -X POST https://webhooks.integratewise.online/webhooks/notion \
  -H "Content-Type: application/json" \
  -d '{"type":"test","data":{}}'
```
