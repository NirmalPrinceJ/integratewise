# IntegrateWise Website

> Platform-Agnostic Integration Advisory - Professional Website & Business Platform

[![Deploy Status](https://img.shields.io/badge/deploy-ready-success)](https://github.com/integratewise/website)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌐 Live Website

**Production**: [https://integratewise.com](https://integratewise.com)

## 📋 Overview

IntegrateWise is a platform-agnostic integration and automation advisory firm serving mid-market enterprises. This repository contains the complete website, business plan, and automation infrastructure.

### Key Features

- ✅ **Professional Website** - Modern, responsive design
- ✅ **Business Plan** - Comprehensive strategy documentation
- ✅ **Automated Deployment** - One-command deployment to cPanel
- ✅ **Automation Infrastructure** - Integration workflows and sync systems
- ✅ **Multi-Platform Support** - MuleSoft, Boomi, Workato, Salesforce, Make, n8n, Zapier

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (for automation scripts)
- FTP/SFTP access to hosting server
- Git (for version control)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/integratewise-website.git
cd integratewise-website

# Install dependencies
npm install

# Configure environment
cp env.example .env
# Edit .env with your credentials
```

### Deployment

```bash
# Automated deployment
npm run deploy

# Or use shell script
./deploy.sh

# Or RSYNC (if SSH available)
./deploy-rsync.sh
```

## 📁 Project Structure

```
integratewise-website/
├── index.html              # Homepage
├── about.html              # About page
├── services.html           # Services page
├── case-studies.html       # Case studies
├── resources.html          # Resources & guides
├── contact.html            # Contact page
├── business-plan.html      # Business plan document
├── styles.css              # Main stylesheet
├── script.js               # JavaScript functionality
├── .htaccess               # Apache configuration
├── images/                 # Image assets
│   └── logo/               # Logo files
├── automation/             # Automation workflows
│   ├── config/             # Workflow configurations
│   │   ├── zapier-workflows.json
│   │   └── make-scenarios.json
│   ├── scripts/            # Setup & testing scripts
│   │   ├── setup-automation.js
│   │   └── test-workflows.js
│   └── README.md           # Automation docs
├── deploy.js               # Node.js deployment script
├── deploy.sh               # Shell deployment script
├── package.json            # Node.js dependencies
├── env.example             # Environment variables template
├── AUTOMATION_WORKFLOWS.md # Complete automation guide
├── ALBATO_CSM_AUTOMATION.md # CSM workflows
├── Zapier_Integration_Plan.md # Integration plan
└── README.md               # This file
```

## 🛠️ Development

### Local Development

```bash
# Start local server (if using Node.js)
npm run dev

# Or use Python's built-in server
python3 -m http.server 8000

# Or use PHP's built-in server
php -S localhost:8000
```

Visit: `http://localhost:8000`

### Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📦 Deployment Options

### Option 1: Automated (Recommended)

```bash
npm run deploy
```

### Option 2: Manual via cPanel

1. Log into cPanel
2. Open File Manager
3. Upload files to `public_html`
4. Set permissions (644 for files, 755 for folders)

### Option 3: CI/CD with GitHub Actions

Push to `main` branch triggers automatic deployment.

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```env
# FTP Configuration
FTP_HOST=your-domain.com
FTP_USER=your_ftp_username
FTP_PASS=your_ftp_password
FTP_PATH=/public_html

# Automation APIs
NOTION_API_KEY=your_key
CODA_API_TOKEN=your_token
# ... see env.example for full list
```

## 🤖 Automation Features

### Comprehensive Automation Workflows
Complete automation suite covering 6 major categories:

1. **Task Management & Prioritization** (Todoist-Centric)
   - Todoist → Grok AI prioritization
   - Completed tasks → Coda sync
   - Daily digest → Slack/Email

2. **File & Document Management** (Box-Centric)
   - Box upload → Todoist review tasks
   - File changes → Airtable updates
   - Scheduled backups → Google Drive

3. **CRM & Client Ops** (Salesforce/HubSpot-Centric)
   - Salesforce opportunities → Todoist tasks
   - HubSpot forms → Pipeline automation
   - Risk alerts → Urgent notifications

4. **Dev & Deployment** (Cursor/Vercel-Centric)
   - GitHub push → Vercel deploy
   - Coda pages → Box archive
   - Tool comparison alerts

5. **Finance & Ops** (Zoho/Stripe-Centric)
   - Zoho invoices → GST reconciliation
   - Stripe payments → Revenue tracking
   - Monthly finance reviews

6. **Personal & Deep Work** (Cross-Tool)
   - Deep work blocks → Focus mode
   - Weekly reviews → AI insights

### Setup Automation

```bash
# Run automation setup script
npm run start:automation

# Test workflows
node automation/scripts/test-workflows.js todoist-grok
```

See [AUTOMATION_WORKFLOWS.md](AUTOMATION_WORKFLOWS.md) for complete documentation.

### Lead Management
- Automated lead capture from website
- Assignment based on platform expertise
- CRM sync (Notion/Coda/Airtable)

### Project Tracking
- Milestone-based invoicing
- Automated reminders
- Weekly reports

### Financial Automation
- Invoice generation
- GST calculation
- Payment tracking
- EMI scheduling

### Data Sync
- Cross-platform synchronization
- Conflict resolution
- Integrity checks

## 📚 Documentation

- [Automation Workflows](AUTOMATION_WORKFLOWS.md) - Complete automation guide (6 categories)
- [CSM Automation](ALBATO_CSM_AUTOMATION.md) - Salesforce CSM workflows
- [Zapier Integration](Zapier_Integration_Plan.md) - Notion ↔ Coda sync
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Manual deployment steps
- [Automation Setup](AUTO_DEPLOY.md) - Automated deployment guide
- [Quick Start](QUICK_START.md) - 3-step deployment
- [Business Plan](business-plan.html) - Complete business strategy

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Full test suite
npm test
```

## 🔒 Security

- Environment variables never committed
- `.env` file in `.gitignore`
- Secure FTP/SFTP connections
- API keys stored securely
- Webhook validation enabled

## 📈 Performance

- Optimized CSS/JS
- Image compression
- Browser caching via `.htaccess`
- GZIP compression enabled
- Lazy loading for images

## 🌍 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

- **Website**: [integratewise.com](https://integratewise.com)
- **Email**: info@integratewise.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/integratewise-website/issues)

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Client portal integration
- [ ] API documentation
- [ ] Mobile app

## 🙏 Acknowledgments

- Built with modern web standards
- Inspired by leading integration advisory firms
- Powered by open-source technologies

---

**Made with ❤️ by IntegrateWise**

For business inquiries: info@integratewise.com