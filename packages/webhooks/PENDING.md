# IntegrateWise Webhooks - Status & Pending Items

**Last Updated:** 2025-12-13

---

## Completed

### Webhook Infrastructure
- [x] Cloudflare Worker deployed at `webhooks.integratewise.online`
- [x] Neon PostgreSQL (Spine database) connected
- [x] Security hardening (IP allowlist, CORS, HSTS)
- [x] AI Orchestrator for routing to downstream apps

### Provider Webhooks Configured
| Provider | Status | Notes |
|----------|--------|-------|
| GitHub | ✅ Done | No secret (signature verification disabled) |
| AI Relay | ✅ Done | Routes to Todoist, Notion, GitHub, HubSpot, Linear |

### Secrets Configured (Cloudflare)
- INTERNAL_API_KEY
- NEON_CONNECTION_STRING
- TODOIST_API_TOKEN
- NOTION_API_KEY
- NOTION_DATABASE_ID
- HUBSPOT_ACCESS_TOKEN
- HUBSPOT_CLIENT_SECRET
- CODA_API_TOKEN
- GITHUB_OWNER
- GITHUB_REPO
- VERCEL_WEBHOOK_SECRET
- ANTHROPIC_API_KEY

---

## Pending / Not Configured

### Provider Webhooks
| Provider | Status | Reason |
|----------|--------|--------|
| Vercel | ⏭️ Skipped | Requires Pro subscription |
| HubSpot | ⏸️ Pending | Need to configure in HubSpot Developer Portal |
| Todoist | ⏸️ Pending | Need to configure in Todoist App Console |
| Notion | ⏸️ Pending | Notion doesn't have traditional webhooks (polling only) |
| Canva | ⏸️ Pending | Need CANVA_WEBHOOK_SECRET + configure in Canva |
| LinkedIn | ⏸️ Pending | Need to configure in LinkedIn Developer Portal |
| Meta | ⏸️ Pending | Need META_VERIFY_TOKEN + configure in Meta |

### Missing Secrets
```bash
# Run these when ready:
wrangler secret put CANVA_WEBHOOK_SECRET --env production
wrangler secret put META_VERIFY_TOKEN --env production
wrangler secret put LINEAR_API_KEY --env production
wrangler secret put LINEAR_TEAM_ID --env production
```

### Database Migrations
- [ ] Run `migrations/003_security_ops.sql` on Neon (DLQ, provider status tables)

---

## Alternative: Vercel Deployment Tracking

Since Vercel webhooks require Pro, use this workaround:

**Option 1:** Manual logging to Notion/Coda after deployments

**Option 2:** v0-generated script to push to AI Relay:
```bash
curl -X POST https://webhooks.integratewise.online/webhooks/ai-relay \
  -H "Content-Type: application/json" \
  -d '{
    "type": "task",
    "source": "custom",
    "content": {
      "title": "Deployment: integratewise-hub",
      "body": "Status: success, Commit: abc123"
    },
    "route_to": ["notion"]
  }'
```

---

## Webhook URLs Reference

| Provider | URL |
|----------|-----|
| GitHub | `https://webhooks.integratewise.online/webhooks/github` |
| HubSpot | `https://webhooks.integratewise.online/webhooks/hubspot` |
| Canva | `https://webhooks.integratewise.online/webhooks/canva` |
| Todoist | `https://webhooks.integratewise.online/webhooks/todoist` |
| AI Relay | `https://webhooks.integratewise.online/webhooks/ai-relay` |
| Meta | `https://webhooks.integratewise.online/webhooks/meta` |
| LinkedIn | `https://webhooks.integratewise.online/webhooks/linkedin` |

---

## Auth System

**Current:** Custom JWT-based auth in Hub API
- Email/password signup & login
- PBKDF2 password hashing
- 7-day token expiry

**Decision:** Keep custom auth (Stack Auth not implemented)

---

## Next Steps (When Resuming)

1. Configure HubSpot webhook in Developer Portal
2. Configure Canva webhook (add secret first)
3. Run database migration for DLQ/ops tables
4. Test AI Relay → downstream app routing end-to-end
5. Set up monitoring/alerts for failed webhooks
