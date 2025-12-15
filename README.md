# IntegrateWise

Unified business operations platform. Normalize once. Render anywhere.

## 🌟 Overview

IntegrateWise is an **enterprise-grade AI-first automation platform** designed to normalize and orchestrate business operations across 15+ SaaS tools. It eliminates manual integration work through a closed-loop automation system that combines:

- **Multi-AI Intelligence Layer** (Claude, ChatGPT, Gemini, Perplexity, NotebookLM)
- **Real-time Webhook Processing** via Cloudflare Workers
- **Unified Hub Dashboard** for centralized control
- **Bi-directional Sync** with Notion, Box, HubSpot, and more

## 🏛️ Architecture Layers

### 1. **AI Brainstorming Layer**
Multiple AI models work in parallel:
- Claude (Advanced Reasoning)
- ChatGPT (NLP & Generation)
- Gemini (Multimodal)
- NotebookLM (Research Synthesis)
- Perplexity (Web Search & Analysis)

### 2. **Intelligent Processing Layer**
Converts AI outputs into actionable intelligence:
- Deduplicates suggestions across models
- Extracts structured tasks
- Auto-categorizes by priority & urgency

### 3. **Task Management & Execution**
Transforms insights into work:
- Real-time task distribution
- Bi-directional syncing
- Progress tracking

### 4. **Knowledge & Storage**
- **Notion**: Centralized wiki, docs, project tracking
- **Box**: Secure file storage & versioning

### 5. **Vercel Hub Dashboard**
Centralized command center with:
- Control Space (Configuration & Permissions)
- Operating Space (Task Execution)
- Analytics & Reporting

### 6. **Distribution Network**
Automatic content routing to HubSpot, LinkedIn, Canva, GitHub, Slack

### 7. **Webhook Feedback Loop**
Closed-loop automation for continuous learning

## ✨ Key Features

- Multi-Model AI Orchestration across 5 AI services
- 15 Pre-Built Integrations (CRM, Marketing, Payments, Productivity)
- Closed-Loop Learning (Feedback improves outputs)
- Real-Time Webhooks (Instant event processing)
- Enterprise Security (Cloudflare, encrypted secrets)
- Scalable Architecture (Serverless design)
- Monorepo Structure (Unified codebase)

## 📚 How It Works

1. **AI Ideation** - Multiple AI models brainstorm solutions
2. **Processing** - Consolidate & deduplicate suggestions
3. **Task Creation** - Convert insights to actionable tasks
4. **Distribution** - Route tasks to integrated apps
5. **Feedback** - Collect results via webhooks
6. **Learning** - Re-analyze with new data
7. **Iteration** - Generate improved recommendations

## 🛠️ Tech Stack

**Frontend:** Next.js, React, TypeScript (Vercel)  
**Backend:** Hono, Cloudflare Workers, Neon PostgreSQL  
**Integrations:** 15 webhook providers, AI APIs, SaaS connectors


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

- `PIPEDRIVE_WEBHOOK_TOKEN` - Pipedrive API
- `NOTION_WEBHOOK_TOKEN` - Notion database
- `SLACK_WEBHOOK_URL` - Slack webhooks
- `BOX_API_KEY` - Box file storage
- `CLAUDE_API_KEY` - Anthropic AI
- `OPENAI_API_KEY` - OpenAI GPT models
- `GOOGLE_API_KEY` - Google AI services

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Wrangler CLI (`npm install -g wrangler`)
- GitHub account for repo

### Installation

```bash
# Clone repository
git clone https://github.com/NirmalPrinceJ/integratewise.git
cd integratewise

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Development Servers

```bash
# Marketing Site
cd packages/website
wrangler dev

# Hub Dashboard
cd packages/hub
npm install && npm run dev

# API Server  
cd packages/api
npm install && wrangler dev

# Webhooks
cd packages/webhooks
wrangler dev
```

## 📚 Documentation

- [Architecture Overview](#-architecture-layers) - Detailed system design
- [Webhook Providers](#webhook-providers-15-total) - All 15 integrations
- [API Documentation](./packages/api/README.md) - REST API endpoints
- [Deployment Guide](./DEPLOY.md) - Production deployment

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- TypeScript for type safety
- ESLint & Prettier for formatting
- Unit tests for new features
- Clear commit messages

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🔗 Links

- **Live Site**: https://integratewise.co
- **Dashboard**: https://integratewise-hub.vercel.app
- **API**: https://hub-controller-api.workers.dev
- **GitHub**: https://github.com/NirmalPrinceJ/integratewise
- **Issues**: https://github.com/NirmalPrinceJ/integratewise/issues

## 💬 Support

For questions, issues, or suggestions:
- Open an [Issue](https://github.com/NirmalPrinceJ/integratewise/issues)
- Check existing [Discussions](https://github.com/NirmalPrinceJ/integratewise/discussions)
- Contact: hello@integratewise.co

---

**Built with ❤️ by [Nirmal Prince J](https://github.com/NirmalPrinceJ)**

Made with Next.js, Cloudflare Workers, and AI Magic ✨
