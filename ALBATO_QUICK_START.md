# Albato CSM Automation - Quick Start Guide

## 🚀 5-Minute Setup

### Prerequisites
```bash
# Check Node.js version (need 18+)
node --version

# Install dependencies
npm install express axios dotenv
```

### Step 1: Configure Environment
```bash
# Copy environment template
cp .env.albato .env

# Edit .env with your credentials
nano .env
```

### Step 2: Run Automated Setup
```bash
# Make setup script executable
chmod +x setup-albato.js

# Run setup wizard
node setup-albato.js
```

### Step 3: Manual Albato Configuration

1. **Login to Albato**
   - Go to [app.albato.com](https://app.albato.com)
   - Create workspace: "IntegrateWise CSM"

2. **Connect Apps**
   ```
   Apps → Add Connection:
   - Coda (OAuth2)
   - Slack (Webhook)
   - Gmail (OAuth2)
   ```

3. **Import Bundles**
   - Click "Create Bundle"
   - Choose "Import from JSON"
   - Upload each bundle from `albato-bundles.json`

### Step 4: Coda Setup

1. **Enable API Access**
   ```
   Coda Doc → Settings → API
   Generate Token with scopes:
   - doc:read
   - doc:write
   - webhook:create
   ```

2. **Add Webhook Automations**
   ```formula
   // In Meetings table
   When: Row Added
   Then: RunActions(
     Webhook.Post(
       "https://webhook.albato.com/wh/YOUR_BUNDLE_ID/meeting-logged",
       thisRow.ToJSON()
     )
   )
   ```

3. **Add External ID Columns**
   - Add `Albato_ID` text column to all synced tables
   - Hide these columns from regular view

### Step 5: Deploy Webhooks

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Note the deployment URL
# Update WEBHOOK_BASE_URL in .env
```

#### Option B: Local Testing
```bash
# Start webhook server
npm start

# Use ngrok for public URL
ngrok http 3000
```

### Step 6: Test Workflows

#### Test Health Score Calculator
```bash
curl -X POST https://api.albato.com/v1/bundles/execute \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"bundle_id": "csm_health_score_calculator"}'
```

#### Test Meeting Follow-up
1. Add a test meeting in Coda Meetings table
2. Check Slack for notification
3. Verify follow-up email sent

#### Test Renewal Tracker
```bash
# Trigger manually
curl -X POST YOUR_WEBHOOK_URL/webhook/scheduled/renewal_check
```

## 📊 Monitoring Dashboard

### Albato Dashboard
- Bundle execution history
- Error logs
- API usage metrics

### Custom Monitoring
```javascript
// Add to your webhook endpoints
app.get('/status', (req, res) => {
  res.json({
    bundles: {
      health_score: lastHealthScoreRun,
      renewals: lastRenewalRun,
      followups: followupCount
    },
    health: 'operational'
  });
});
```

## 🔧 Common Issues & Solutions

### Issue: Webhook not receiving data
**Solution:**
```bash
# Check webhook URL
curl -X POST YOUR_WEBHOOK_URL/health

# Verify Coda automation
# Test with simple webhook.site first
```

### Issue: Health scores not updating
**Solution:**
```javascript
// Debug in Albato Code block
console.log('Input data:', inputData);
console.log('Calculated scores:', scores);
return { debug: true, scores };
```

### Issue: Slack messages not sending
**Solution:**
```bash
# Test Slack webhook directly
curl -X POST YOUR_SLACK_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test message"}'
```

## 📈 Performance Optimization

### Batch Processing
```javascript
// Process multiple accounts in parallel
const results = await Promise.all(
  accounts.map(account => calculateHealthScore(account))
);
```

### Caching Strategy
```javascript
// Cache frequently accessed data
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}
```

### Rate Limiting
```javascript
// Implement rate limiting for API calls
const RateLimiter = require('limiter').RateLimiter;
const limiter = new RateLimiter(100, 'minute');

async function makeAPICall() {
  await new Promise(resolve => limiter.removeTokens(1, resolve));
  // Make API call
}
```

## 🎯 Success Metrics

Monitor these KPIs after deployment:

| Metric | Target | Measure |
|--------|--------|---------|
| Automation Success Rate | >95% | Albato dashboard |
| Health Score Coverage | 100% | Accounts with scores |
| Renewal Alert Lead Time | 30+ days | Average days before renewal |
| Follow-up Send Rate | <2 hours | Time from meeting to email |
| System Uptime | 99.9% | Monitoring service |

## 📚 Additional Resources

- **Albato API Docs**: [docs.albato.com](https://docs.albato.com)
- **Coda API Reference**: [coda.io/developers/apis](https://coda.io/developers/apis)
- **Webhook Testing**: [webhook.site](https://webhook.site)
- **Support**: csm-automation@integratewise.com

## ✅ Go-Live Checklist

- [ ] All environment variables configured
- [ ] Albato bundles created and tested
- [ ] Coda automations active
- [ ] Webhook endpoints deployed
- [ ] Slack channels configured
- [ ] Gmail authentication complete
- [ ] Initial data imported
- [ ] Team members trained
- [ ] Monitoring alerts set up
- [ ] Documentation shared

**You're ready to automate! 🎉**
