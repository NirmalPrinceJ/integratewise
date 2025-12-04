# IntegrateWise Website

The official website for IntegrateWise - Normalize once. Render anywhere.

## Overview

IntegrateWise unifies customer data from CRMs, product usage, and customer operations into a single canonical model. AI agents automate CSM operations including health scoring, churn prevention, integration design, and data governance.

**Live URL:** https://integratewise.co

## Tech Stack

- Static HTML/CSS/JavaScript
- Cloudflare Pages for hosting
- Google Apps Script for form submissions

## Local Development

### Prerequisites

- A local web server (Python, Node.js, or any static file server)

### Running Locally

**Using Python:**
```bash
python3 -m http.server 8000
```

**Using Node.js (http-server):**
```bash
npx http-server -p 8000
```

**Using PHP:**
```bash
php -S localhost:8000
```

Then open http://localhost:8000 in your browser.

## Deployment

### Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: (none - static site)
3. Set output directory: `/`
4. Deploy

### Using Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy . --project-name=integratewise
```

## Environment Variables

No environment variables required for static site. Form submissions use Google Apps Script (configured in `script.js`).

## Site Structure

```
/
├── index.html              # Homepage
├── about/                  # About page
├── agents/                 # AI Agents overview
├── contact/                # Contact page with anchors
├── demo/                   # Demo page
├── docs/                   # Technical documentation
│   ├── index.html          # Docs landing
│   ├── data-model.html     # Data model spec
│   ├── agents/             # Individual agent specs
│   ├── measurement.html    # Measurement methodology
│   ├── security.html       # Security documentation
│   └── architecture.html   # Architecture details
├── platform/               # Platform overview
├── pricing/                # Pricing page
├── privacy/                # Privacy policy
├── resources/              # Resources, case studies, blog
├── services/               # Services overview
├── solutions/              # Solutions page
├── terms/                  # Terms of service
├── styles.css              # Main stylesheet
├── pages.css               # Page-specific styles
├── script.js               # JavaScript functionality
├── sitemap.xml             # Sitemap
└── robots.txt              # Robots file
```

## Key Features

- **Outcome-focused public pages** - Concise, business-focused content
- **Technical documentation** - Full-depth specs in `/docs`
- **Service coverage** - Assessment, Implementation, Managed Ops, SaaS, Outcome-Tied
- **7 AI Agents** - SuccessPilot, ChurnShield, ArchitectIQ, DataSentinel, VaultGuard, TemplateForge, DealDesk
- **Contact anchors** - #demo, #assessment, #implementation, #retainer, #quote

## Contact

- Email: connect@integratewise.co
- Phone: +91 70197 46296
- Address: 235, 13th Cross Rd, Hoysala Nagar, Indiranagar II Stage, Bengaluru, Karnataka 560038, India

## License

© 2024 IntegrateWise LLP. All rights reserved.

