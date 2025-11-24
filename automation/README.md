# IntegrateWise Automation Workflows

Complete automation suite for IntegrateWise productivity stack.

## 📁 Structure

```
automation/
├── config/              # Workflow configuration files
│   ├── zapier-workflows.json
│   └── make-scenarios.json
├── scripts/             # Setup and testing scripts
│   ├── setup-automation.js
│   └── test-workflows.js
└── README.md           # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy example env file
cp env.example .env

# Edit .env with your API keys
nano .env
```

### 3. Run Setup Script

```bash
npm run start:automation
# or
node automation/scripts/setup-automation.js
```

### 4. Test Workflows

```bash
node automation/scripts/test-workflows.js todoist-grok
```

## 📚 Documentation

- **Main Workflows Guide:** See `AUTOMATION_WORKFLOWS.md` in root directory
- **CSM Automation:** See `ALBATO_CSM_AUTOMATION.md`
- **Zapier Integration:** See `Zapier_Integration_Plan.md`

## 🔧 Workflow Categories

1. **Task Management** - Todoist ↔ Grok ↔ Coda
2. **File Management** - Box ↔ Airtable ↔ Coda
3. **CRM Operations** - Salesforce ↔ HubSpot ↔ Todoist
4. **Dev & Deployment** - GitHub ↔ Vercel ↔ Coda
5. **Finance & Ops** - Zoho ↔ Stripe ↔ Revenue Tracking
6. **Personal Productivity** - Deep Work ↔ Weekly Reviews

## 🛠️ Platform Support

- **Zapier** - Simple, linear workflows
- **Make.com** - Complex branching scenarios
- **n8n** - Self-hosted, unlimited workflows

## 📝 API Keys Required

See `.env.example` for all required API keys.

Minimum required for basic workflows:
- `XAI_API_KEY` - Grok AI integration
- `TODOIST_API_KEY` - Task management
- `CODA_API_TOKEN` - System of record
- `CODA_DOC_ID` - Your Coda document ID

## 🧪 Testing

Test individual workflows:

```bash
# Test Todoist-Grok integration
node automation/scripts/test-workflows.js todoist-grok

# Test Coda sync
node automation/scripts/test-workflows.js coda-sync
```

## 📖 Next Steps

1. Review `AUTOMATION_WORKFLOWS.md` for detailed workflow documentation
2. Import workflow configs to your chosen platform (Zapier/Make.com/n8n)
3. Test each workflow with sample data
4. Enable workflows once verified
5. Monitor execution logs in Coda dashboard

## 🔒 Security

- Never commit `.env` file (already in `.gitignore`)
- Rotate API keys regularly
- Use OAuth where possible instead of API keys
- Review webhook security settings

## 📞 Support

For issues or questions:
- Check workflow documentation in `AUTOMATION_WORKFLOWS.md`
- Review platform-specific docs (Zapier/Make.com/n8n)
- Test API connections using setup script

