# IntegrateWise

> Normalize once. Render anywhere.

IntegrateWise is a unified customer hub for mid-market SaaS teams (50–500 employees). Connect Salesforce, HubSpot, Dynamics, or Zoho once and deliver health scores, renewal signals, and playbooks into the tools your team already uses: Notion, Airtable, Asana, ClickUp, Monday, and Google Sheets.

## 🌐 Live Site

**Production:** https://integratewise.co/

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`npm install -g wrangler`)

### Run Locally
```bash
# Install Wrangler if not already installed
npm install -g wrangler

# Serve the site locally
wrangler dev --local
```

The site is static HTML/CSS/JS; `wrangler dev` serves all files from the current directory.

### Deploy
```bash
wrangler deploy
```

> **Note:** For older Wrangler versions, use `wrangler publish` instead of `wrangler deploy`.

Deployment configuration is defined in `wrangler.jsonc`. The site deploys to Cloudflare Workers/Pages.

## 📁 Project Structure

```
integratewise/
├── index.html              # Homepage
├── agents.html             # Agents overview
├── 404.html               # Error page
├── styles.css             # Global styles
├── pages.css              # Page-specific styles
├── script.js              # Client-side JavaScript
├── favicon.svg            # Site favicon
├── sitemap.xml            # SEO sitemap
├── robots.txt             # Search engine directives
├── wrangler.jsonc         # Cloudflare Worker config
├── src/
│   └── index.ts           # Cloudflare Worker handler
├── platform/              # Platform page
├── pricing/               # Pricing page
├── contact/               # Contact page
├── resources/             # Resources page
├── about/                 # About page
├── services/              # Services page
├── solutions/             # Solutions page
├── privacy/               # Privacy policy
├── terms/                 # Terms of service
├── downloads/             # Downloadable assets
├── docs/                  # Technical documentation
│   ├── index.html        # Docs home
│   ├── data-model.html   # Data model reference
│   ├── measurement.html  # Measurement methodology
│   ├── security.html     # Security controls
│   ├── architecture.html # Architecture overview
│   └── agents/           # Agent specifications
│       ├── successpilot.html
│       ├── churnshield.html
│       ├── architectiq.html
│       ├── datasentinel.html
│       ├── vaultguard.html
│       ├── templateforge.html
│       └── dealdesk.html
└── .github/
    └── workflows/        # CI/CD workflows
```

## 🤖 Core Agents

| Agent | Purpose | KPI |
|-------|---------|-----|
| **SuccessPilot** | Health scoring from usage, sentiment, support, contract data | Health compute <120s |
| **ChurnShield** | Churn risk detection with renewal/expansion playbooks | 85%+ signal precision |
| **ArchitectIQ** | Integration pattern governance and validation | Design approvals <48h |
| **DataSentinel** | Pipeline monitoring, deduplication, data quality | 98%+ ingest accuracy |
| **VaultGuard** | Secrets rotation, RBAC audits, policy checks | 100% rotation compliance |
| **TemplateForge** | Runbook publishing to Notion/Airtable/Sheets | Playbook rollout <1 day |
| **DealDesk** | Renewal/expansion approval automation | Approval cycles <6h |

## 🔧 Configuration

### Wrangler Configuration (`wrangler.jsonc`)
```jsonc
{
  "name": "integratewise",
  "compatibility_date": "2025-12-02",
  "main": "src/index.ts",
  "assets": {
    "directory": "./"
  }
}
```

### Environment Variables
No secrets are required for the static build. For optional features:
- **Contact Form:** Uses Google Apps Script (see `google-apps-script.gs`)
- **Analytics:** Add tracking via `wrangler secret put` if needed

## 📊 Outcome Metrics

- **15–25%** Churn reduction
- **30–40%** Efficiency gains
- **3–5x** ROI per engagement
- **90 days** Time to value

## 📄 Documentation

- **[Technical Docs](https://integratewise.co/docs/)** - Data model, agents, architecture
- **[Measurement Policy](MEASUREMENT.md)** - Baselines, attribution, ROI calculation
- **[Security Controls](SECURITY.md)** - Rotation policy, RBAC, compliance

## 🔐 Security

- **Secrets Rotation:** Every 90 days or on incident (VaultGuard enforced)
- **RBAC Roles:** admin, operator, analyst, auditor
- **Audit Retention:** Run/access logs 400 days, webhook logs 30 days
- **Compliance:** SOC2 Type II in progress, GDPR DPA templates available

## 📝 Contributing

1. Create a feature branch from the default branch
2. Make your changes
3. Test locally with `wrangler dev --local`
4. Submit a pull request

## 🏷️ Releases

Tag deployments using semantic versioning:
```bash
git tag site-v1.0.0
git push origin site-v1.0.0
```

## 📧 Contact

- **Website:** https://integratewise.co/
- **Email:** connect@integratewise.co
- **Demo:** [Book a demo](https://integratewise.co/contact/#demo)

---

© 2025 IntegrateWise. All rights reserved.
