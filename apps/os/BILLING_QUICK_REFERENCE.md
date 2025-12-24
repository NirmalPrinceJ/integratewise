# Billing System Quick Reference

## 🚀 Quick Start (5 minutes)

\`\`\`bash
# 1. Run migrations
psql $DATABASE_URL < scripts/030_create_billing_schema.sql
psql $DATABASE_URL < scripts/031_seed_billing_plans.sql

# 2. Set env vars
echo "RAZORPAY_WEBHOOK_SECRET=your_secret" >> .env.local
echo "RAZORPAY_KEY_ID=rzp_test_xxxxx" >> .env.local
echo "RAZORPAY_KEY_SECRET=your_secret" >> .env.local

# 3. Start dev server
npm run dev

# 4. Test
curl http://localhost:3000/api/billing/plans
open http://localhost:3000/pricing
\`\`\`

---

## 📋 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/billing/plans` | List all plans |
| POST | `/api/billing/subscribe` | Create subscription |
| GET | `/api/billing/subscription?org_id=xxx` | Get subscription |
| POST | `/api/billing/change-plan` | Change plan |
| POST | `/api/billing/cancel` | Cancel subscription |
| GET | `/api/billing/invoices?org_id=xxx` | Get invoices |
| GET | `/api/billing/entitlements?org_id=xxx` | Get entitlements |
| POST | `/api/billing/webhook/[provider]` | Webhook handler |

---

## 🎨 UI Pages

| URL | Purpose |
|-----|---------|
| `/pricing` | Public pricing page |
| `/account/billing` | User billing dashboard |

---

## 💳 Plans

| Plan | Price | Workflows | Integrations | AI Tokens |
|------|-------|-----------|--------------|-----------|
| **Starter** | ₹0/mo | 5 | 3 | 1K |
| **Pro** | ₹2,999/mo | 50 | Unlimited | 50K |
| **Pro (Yearly)** | ₹28,790/yr | 50 | Unlimited | 50K |
| **Enterprise** | ₹9,999+/mo | Unlimited | Unlimited | Custom |

---

## 🔑 Entitlement Keys

\`\`\`typescript
import { ENTITLEMENT_KEYS } from '@/lib/billing';

ENTITLEMENT_KEYS.MAX_WORKFLOWS           // number
ENTITLEMENT_KEYS.MAX_INTEGRATIONS        // number
ENTITLEMENT_KEYS.RAG_QUOTA_TOKENS_MONTH  // number
ENTITLEMENT_KEYS.ANALYTICS_LEVEL         // string
ENTITLEMENT_KEYS.SUPPORT_SLA             // string
ENTITLEMENT_KEYS.API_ACCESS              // boolean
ENTITLEMENT_KEYS.WEBHOOKS_ENABLED        // boolean
ENTITLEMENT_KEYS.TEAM_COLLABORATION      // boolean
ENTITLEMENT_KEYS.CUSTOM_INTEGRATIONS     // boolean
ENTITLEMENT_KEYS.WHITE_LABEL             // boolean
ENTITLEMENT_KEYS.ON_PREMISE              // boolean
\`\`\`

---

## 🛡️ Server-Side Protection

### Require Entitlement
\`\`\`typescript
import { EntitlementEnforcement, ENTITLEMENT_KEYS } from '@/lib/billing';

await EntitlementEnforcement.requireEntitlement(
  org_id,
  ENTITLEMENT_KEYS.API_ACCESS
);
\`\`\`

### Check Usage Limit
\`\`\`typescript
await EntitlementEnforcement.requireWithinLimit(
  org_id,
  ENTITLEMENT_KEYS.MAX_WORKFLOWS,
  currentCount
);
\`\`\`

### Middleware Helper
\`\`\`typescript
import { withEntitlement, ENTITLEMENT_KEYS } from '@/lib/billing';

return withEntitlement(org_id, ENTITLEMENT_KEYS.API_ACCESS, async () => {
  // Protected handler
  return new Response(JSON.stringify({ success: true }));
});
\`\`\`

---

## ⚛️ React Hooks

### Check Subscription
\`\`\`typescript
import { useSubscription } from '@/lib/billing';

const { subscription, isActive, isTrial, isPastDue } = useSubscription(org_id);
\`\`\`

### Check Entitlement
\`\`\`typescript
import { useEntitlement, ENTITLEMENT_KEYS } from '@/lib/billing';

const { hasEntitlement, value } = useEntitlement(
  org_id,
  ENTITLEMENT_KEYS.API_ACCESS
);
\`\`\`

### Check Limits
\`\`\`typescript
import { useEntitlements, ENTITLEMENT_KEYS } from '@/lib/billing';

const { checkLimit } = useEntitlements(org_id);
const { allowed, limit, usage, percentage } = checkLimit(
  ENTITLEMENT_KEYS.MAX_WORKFLOWS,
  currentUsage
);
\`\`\`

### Subscription Actions
\`\`\`typescript
import { useSubscriptionActions } from '@/lib/billing';

const { changePlan, cancelSubscription, loading } = useSubscriptionActions(org_id);

await changePlan('pro-monthly');
await cancelSubscription(true);
\`\`\`

---

## 🗄️ Database Queries

### Get Subscription
\`\`\`sql
SELECT * FROM org_subscriptions WHERE org_id = 'xxx';
\`\`\`

### Get Entitlements
\`\`\`sql
SELECT * FROM entitlements WHERE org_id = 'xxx';
\`\`\`

### Subscription Health
\`\`\`sql
SELECT status, COUNT(*) FROM org_subscriptions GROUP BY status;
\`\`\`

### MRR Calculation
\`\`\`sql
SELECT SUM(p.price_cents)/100 as mrr
FROM org_subscriptions os
JOIN plans p ON os.plan_id = p.id
WHERE os.status IN ('active', 'trial');
\`\`\`

---

## 🔧 Environment Variables

\`\`\`bash
# Payment Provider (choose one)
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# OR
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
\`\`\`

---

## 🧪 Testing

### Test API
\`\`\`bash
# Get plans
curl http://localhost:3000/api/billing/plans

# Subscribe
curl -X POST http://localhost:3000/api/billing/subscribe \
  -H "Content-Type: application/json" \
  -d '{"org_id":"test-123","plan_code":"starter"}'

# Get subscription
curl "http://localhost:3000/api/billing/subscription?org_id=test-123"
\`\`\`

### Test UI
\`\`\`
http://localhost:3000/pricing
http://localhost:3000/account/billing
\`\`\`

---

## 🐛 Troubleshooting

### Webhook Fails
\`\`\`bash
# Check signature secret matches
echo $RAZORPAY_WEBHOOK_SECRET

# Test webhook endpoint
curl -X POST http://localhost:3000/api/billing/webhook/razorpay
\`\`\`

### No Entitlements
\`\`\`sql
-- Manually sync entitlements
SELECT sync_entitlements_for_subscription('org-id', 'starter');
SELECT * FROM entitlements WHERE org_id = 'org-id';
\`\`\`

### Subscription Not Found
\`\`\`sql
-- Check RLS policies
SELECT * FROM org_subscriptions;

-- Bypass RLS (as superuser)
SET ROLE postgres;
SELECT * FROM org_subscriptions WHERE org_id = 'xxx';
\`\`\`

---

## 📚 Documentation

- **Full Setup**: `BILLING_SETUP.md`
- **Code Examples**: `lib/billing/examples.md`
- **Implementation Summary**: `SUBSCRIPTION_IMPLEMENTATION_SUMMARY.md`
- **This File**: Quick reference for daily use

---

## ✅ Pre-Production Checklist

- [ ] Migrations run on production DB
- [ ] Payment provider configured (live mode)
- [ ] Webhook endpoint accessible
- [ ] Environment variables set
- [ ] SSL certificate active
- [ ] Test payment successful
- [ ] Terms of Service page
- [ ] Privacy Policy page

---

## 📞 Support

**Questions?** Check:
1. `BILLING_SETUP.md` - Detailed setup guide
2. `lib/billing/examples.md` - Code examples
3. Payment provider dashboard - Webhook logs
4. Database logs - Error traces

---

**Quick Reference v1.0** | Last Updated: Dec 18, 2025
