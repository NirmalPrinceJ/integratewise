# Billing & Subscription System Setup Guide

Complete guide to setting up and using the subscription and billing system.

## Table of Contents

1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Payment Provider Configuration](#payment-provider-configuration)
4. [Environment Variables](#environment-variables)
5. [Testing](#testing)
6. [Going Live](#going-live)
7. [Common Use Cases](#common-use-cases)

---

## Overview

The billing system provides:

- **Multi-tier pricing** (Starter, Pro, Enterprise)
- **Flexible billing cycles** (Monthly, Yearly with discounts)
- **Trial periods** (14-day free trial)
- **Usage-based limits** (Workflows, integrations, AI tokens)
- **Entitlement enforcement** (Feature gating)
- **Invoice management** (Generate, track, download)
- **Webhook processing** (Payment success/failure, renewals)
- **Audit logging** (All billing events)

### Architecture

\`\`\`
┌─────────────┐
│   Pricing   │  Public page to view plans
│    Page     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Subscribe  │  Creates subscription + trial
│     API     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Billing   │  Manage subscription, view invoices
│  Dashboard  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Entitlement  │  Gates features across app
│Enforcement  │
└─────────────┘
\`\`\`

---

## Database Setup

### 1. Run Migrations

Execute the SQL scripts in order:

\`\`\`bash
# Connect to your Neon Postgres database
psql "postgresql://user:password@host/database"

# Run billing migrations
\i scripts/030_create_billing_schema.sql
\i scripts/031_seed_billing_plans.sql
\`\`\`

### 2. Verify Tables Created

\`\`\`sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('plans', 'org_subscriptions', 'invoices', 'payments', 'entitlements');

-- Verify plans seeded
SELECT code, name, price_cents, interval FROM plans;
\`\`\`

### 3. Test Helper Functions

\`\`\`sql
-- Test get active subscription (will return empty initially)
SELECT * FROM get_active_subscription('test-org-id');

-- Test entitlement sync function
SELECT sync_entitlements_for_subscription('test-org-id', 'starter');
SELECT * FROM get_org_entitlements('test-org-id');
\`\`\`

---

## Payment Provider Configuration

### Option 1: Razorpay (Recommended for India)

**Why Razorpay?**
- Supports UPI, cards, net banking, wallets
- India-focused with INR as native currency
- Easy integration
- Good documentation

**Setup:**

1. **Create Account**: [razorpay.com](https://razorpay.com)

2. **Get Credentials**:
   - Dashboard → Settings → API Keys
   - Copy Key ID and Key Secret

3. **Configure Webhook**:
   - Dashboard → Settings → Webhooks
   - Webhook URL: `https://your-domain.com/api/billing/webhook/razorpay`
   - Events to subscribe:
     - `payment.authorized`
     - `payment.captured`
     - `payment.failed`
     - `subscription.charged`
   - Copy Webhook Secret

4. **Environment Variables**:
   \`\`\`bash
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=your_secret_key
   \`\`\`

5. **Test Mode**:
   - Use test credentials during development
   - Test cards: [razorpay.com/docs/payment-gateway/test-card-upi-details](https://razorpay.com/docs/payment-gateway/test-card-upi-details)

### Option 2: Stripe (Global)

**Why Stripe?**
- Global payment support
- Extensive features
- Strong developer tools

**Setup:**

1. **Create Account**: [stripe.com](https://stripe.com)

2. **Get Credentials**:
   - Dashboard → Developers → API Keys
   - Copy Publishable and Secret keys

3. **Configure Webhook**:
   - Dashboard → Developers → Webhooks
   - Endpoint URL: `https://your-domain.com/api/billing/webhook/stripe`
   - Events:
     - `charge.succeeded`
     - `charge.failed`
     - `invoice.payment_succeeded`
     - `customer.subscription.updated`
   - Copy Signing Secret

4. **Environment Variables**:
   \`\`\`bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   STRIPE_SECRET_KEY=sk_test_xxxxx
   \`\`\`

### Option 3: Cashfree (India)

Similar setup to Razorpay. Good alternative for Indian merchants.

### Option 4: PhonePe (India - UPI Focus)

Best for UPI-heavy use cases. Setup similar to Razorpay.

---

## Environment Variables

Create a `.env.local` file:

\`\`\`bash
# Database (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Payment Provider (Choose one or multiple)
# Razorpay
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key

# Stripe
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
\`\`\`

---

## Testing

### 1. Test Plans API

\`\`\`bash
curl http://localhost:3000/api/billing/plans
\`\`\`

Expected response:
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "code": "starter",
      "name": "Starter",
      "price_cents": 0,
      "interval": "monthly",
      "features": [...]
    }
  ]
}
\`\`\`

### 2. Test Subscription Creation

\`\`\`bash
curl -X POST http://localhost:3000/api/billing/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "test-org-123",
    "plan_code": "starter",
    "trial_days": 14
  }'
\`\`\`

Expected response:
\`\`\`json
{
  "success": true,
  "data": {
    "subscription_id": "...",
    "status": "trial",
    "trial_end": "2025-01-01T00:00:00Z",
    "current_period_end": "2025-01-01T00:00:00Z"
  }
}
\`\`\`

### 3. Test Entitlements

\`\`\`bash
# Check subscription
curl "http://localhost:3000/api/billing/subscription?org_id=test-org-123"

# Check entitlements
curl "http://localhost:3000/api/billing/entitlements?org_id=test-org-123"
\`\`\`

### 4. Test Pricing Page

Navigate to:
\`\`\`
http://localhost:3000/pricing
\`\`\`

Verify:
- ✅ All 3 plans display (Starter, Pro, Enterprise)
- ✅ Monthly/Yearly toggle works
- ✅ "Most Popular" badge on Pro plan
- ✅ "Start Trial" buttons work
- ✅ Features list displays correctly

### 5. Test Billing Dashboard

1. Create a subscription first (see step 2)
2. Navigate to: `http://localhost:3000/account/billing`
3. Verify:
   - ✅ Current plan displays
   - ✅ Trial status shows
   - ✅ Usage limits display
   - ✅ Invoice history (empty initially)
   - ✅ Active features list

### 6. Test Webhooks

Using Razorpay test mode:

\`\`\`bash
# Simulate payment success webhook
curl -X POST http://localhost:3000/api/billing/webhook/razorpay \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: $(echo -n 'webhook_body' | openssl dgst -sha256 -hmac 'your_webhook_secret' | cut -d' ' -f2)" \
  -d '{
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_test123",
          "amount": 299900,
          "currency": "INR",
          "status": "captured"
        }
      }
    }
  }'
\`\`\`

Or use Razorpay's webhook testing tool in their dashboard.

---

## Going Live

### Pre-Launch Checklist

- [ ] Database migrations run on production
- [ ] Plans seeded correctly
- [ ] Payment provider configured (live mode)
- [ ] Webhook endpoints accessible publicly
- [ ] Environment variables set in production
- [ ] SSL certificate active
- [ ] Terms of Service page created
- [ ] Privacy Policy page created
- [ ] Refund policy defined
- [ ] Support email configured

### Switch to Production Mode

1. **Razorpay**: Switch from test to live keys in dashboard
2. **Update environment variables** with production keys
3. **Test end-to-end** with a real payment (use small amount)
4. **Monitor webhooks** in provider dashboard
5. **Set up alerts** for failed payments

### Production Monitoring

\`\`\`sql
-- Monitor subscriptions
SELECT 
  status, 
  COUNT(*) as count 
FROM org_subscriptions 
GROUP BY status;

-- Recent invoices
SELECT 
  status, 
  SUM(amount_cents)/100 as total_inr,
  COUNT(*) as count
FROM invoices
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY status;

-- Payment success rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM payments
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY status;
\`\`\`

---

## Common Use Cases

### 1. Protect API Route with Entitlement

\`\`\`typescript
// app/api/workflows/create/route.ts
import { EntitlementEnforcement, ENTITLEMENT_KEYS } from '@/lib/billing';

export async function POST(request: Request) {
  const org_id = 'your-org-id';
  
  await EntitlementEnforcement.requireEntitlement(
    org_id,
    ENTITLEMENT_KEYS.API_ACCESS
  );
  
  // Create workflow...
}
\`\`\`

### 2. Check Usage Limits

\`\`\`typescript
import { EntitlementEnforcement, ENTITLEMENT_KEYS } from '@/lib/billing';

const currentCount = await getWorkflowCount(org_id);

await EntitlementEnforcement.requireWithinLimit(
  org_id,
  ENTITLEMENT_KEYS.MAX_WORKFLOWS,
  currentCount
);

// Create new workflow...
\`\`\`

### 3. Display Plan Information

\`\`\`typescript
'use client';
import { useSubscription } from '@/lib/billing';

export function SubscriptionBadge({ org_id }: Props) {
  const { subscription, isActive, isTrial } = useSubscription(org_id);
  
  return (
    <div>
      <span>{subscription?.plan.name}</span>
      {isTrial && <Badge>Trial</Badge>}
    </div>
  );
}
\`\`\`

### 4. Show Upgrade Prompt

\`\`\`typescript
'use client';
import { useEntitlement, ENTITLEMENT_KEYS } from '@/lib/billing';

export function AdvancedFeature({ org_id }: Props) {
  const { hasEntitlement } = useEntitlement(
    org_id,
    ENTITLEMENT_KEYS.CUSTOM_INTEGRATIONS
  );
  
  if (!hasEntitlement) {
    return (
      <Alert>
        Upgrade to Pro to use custom integrations.
        <Button href="/pricing">Upgrade Now</Button>
      </Alert>
    );
  }
  
  return <CustomIntegrationUI />;
}
\`\`\`

---

## Troubleshooting

### Issue: Webhook signature verification fails

**Solution:**
1. Check webhook secret matches in .env
2. Verify payload is not modified
3. Check timestamp tolerance (±5 minutes)
4. Test with provider's webhook testing tool

### Issue: Subscription not showing

**Solution:**
1. Check org_id is correct
2. Verify RLS policies allow access
3. Check subscription status in database
4. Ensure `sync_entitlements_for_subscription` was called

### Issue: Payment recorded but invoice not updated

**Solution:**
1. Check webhook endpoint is accessible
2. Verify webhook signature
3. Look at application logs
4. Check `payments` and `invoices` tables directly

### Issue: Entitlement check returns false incorrectly

**Solution:**
1. Verify entitlements were synced
2. Check `entitlements` table for org_id
3. Ensure entitlement key matches constant
4. Check for expired entitlements

---

## Security Best Practices

1. **Always verify webhook signatures** - Never trust webhook data without verification
2. **Use service role key carefully** - Only in server-side code
3. **Implement rate limiting** - On subscription and payment endpoints
4. **Log all billing events** - To audit_log for compliance
5. **Encrypt sensitive data** - Payment tokens, customer info
6. **Use HTTPS only** - For all payment-related endpoints
7. **Set RLS policies** - Ensure tenant isolation in database
8. **Validate org_id** - Check user has access to org before operations

---

## Support

For billing system issues:

1. Check logs: `app/api/billing/**/*.ts`
2. Review examples: `lib/billing/examples.md`
3. Database queries in this guide
4. Payment provider dashboard for webhook logs

---

## Appendix: Database Schema

### Plans
\`\`\`sql
id, code, name, description, currency, price_cents, interval, 
is_active, features, metadata, created_at, updated_at
\`\`\`

### Org Subscriptions
\`\`\`sql
id, org_id, plan_id, status, trial_end, current_period_start,
current_period_end, cancel_at, canceled_at, metadata, created_at, updated_at
\`\`\`

### Invoices
\`\`\`sql
id, org_id, subscription_id, amount_cents, currency, status,
due_at, paid_at, line_items, corr_id, metadata, created_at
\`\`\`

### Payments
\`\`\`sql
id, invoice_id, provider, provider_payment_id, amount_cents, currency,
status, received_at, metadata, created_at
\`\`\`

### Entitlements
\`\`\`sql
id, org_id, key, value, source, expires_at, metadata, created_at, updated_at
\`\`\`

---

**Next Steps:**

1. ✅ Run database migrations
2. ✅ Configure payment provider
3. ✅ Test locally with test mode
4. ✅ Deploy to staging
5. ✅ Test end-to-end
6. ✅ Go live with production keys

Good luck! 🚀
