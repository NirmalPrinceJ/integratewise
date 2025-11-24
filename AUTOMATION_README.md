# IntegrateWise Automation Workflows - Implementation Guide

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ installed
- Access to required platforms (Airtable, Coda, Notion, Zoho Books, etc.)
- API keys for all integrations

### Installation

1. **Clone and Install Dependencies**
```bash
npm install
```

2. **Configure Environment Variables**
```bash
cp env.example .env
# Edit .env with your actual API keys and configuration
```

3. **Test Connections**
```bash
npm run test:connections
```

4. **Start Automation Server**
```bash
# Production
npm run start:automation

# Development (with auto-reload)
npm run dev:automation
```

## 📋 Workflow Overview

### IntegrateWise Operations
- **Lead Capture**: Automated lead processing from multiple sources
- **Client Onboarding**: Streamlined onboarding with project setup
- **Project Tracking**: Real-time project status and milestone tracking
- **Invoicing**: Automated invoice generation and payment tracking

### Personal Finance
- **EMI Scheduling**: Monthly loan payment tracking and reminders
- **Debt Consolidation**: Weekly analysis and optimization recommendations
- **GST Automation**: Monthly GST calculation and filing preparation
- **Zoho Books Sync**: Daily transaction categorization and reconciliation

### Cross-Platform Sync
- **Data Pipeline**: Real-time sync between Coda, Notion, and Airtable
- **Data Integrity**: Daily checks for data quality and consistency

## 🔧 Configuration

### API Setup Guide

#### 1. Airtable
1. Go to [Airtable API](https://airtable.com/account)
2. Generate a personal access token
3. Find your base ID in the API documentation
4. Add to `.env`:
   ```
   AIRTABLE_API_KEY=your_key
   AIRTABLE_BASE_ID=your_base_id
   ```

#### 2. Coda
1. Visit [Coda API Settings](https://coda.io/account)
2. Create an API token
3. Get your doc ID from the URL
4. Add to `.env`:
   ```
   CODA_API_TOKEN=your_token
   CODA_DOC_ID=your_doc_id
   ```

#### 3. Notion
1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Share your database with the integration
4. Add to `.env`:
   ```
   NOTION_API_KEY=your_key
   NOTION_DATABASE_ID=your_database_id
   ```

#### 4. Zoho Books
1. Navigate to Zoho API Console
2. Create OAuth2 credentials
3. Generate refresh token
4. Add to `.env`:
   ```
   ZOHO_CLIENT_ID=your_client_id
   ZOHO_CLIENT_SECRET=your_secret
   ZOHO_REFRESH_TOKEN=your_refresh_token
   ```

#### 5. Google APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Gmail and Calendar APIs
3. Create OAuth2 credentials
4. Add to `.env`:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_secret
   ```

#### 6. Slack
1. Create a Slack App at [api.slack.com](https://api.slack.com)
2. Add Incoming Webhooks
3. Install to workspace
4. Add to `.env`:
   ```
   SLACK_WEBHOOK_URL=your_webhook_url
   ```

## 🔄 Webhook Endpoints

The automation server exposes the following endpoints:

| Endpoint | Method | Purpose | Payload Example |
|----------|--------|---------|-----------------|
| `/webhook/lead-capture` | POST | Process new leads | `{name, email, company, interest_area, source}` |
| `/webhook/deal-closed` | POST | Trigger client onboarding | `{client_name, deal_value, service_type}` |
| `/webhook/sync` | POST | Manual sync trigger | `{platforms: ["coda", "airtable"]}` |
| `/health` | GET | Health check | - |

## 📅 Scheduled Jobs

| Job | Schedule | Time (IST) | Description |
|-----|----------|------------|-------------|
| EMI Processing | Monthly, 1st | 7:00 AM | Process loan EMIs and send reminders |
| Debt Analysis | Weekly, Sunday | 8:00 PM | Analyze debt and optimization opportunities |
| GST Filing | Monthly, 5th | 9:00 AM | Process previous month's GST |
| Zoho Sync | Daily | 11:00 PM | Sync and categorize transactions |
| Platform Sync | Every 15 min | - | Sync data across platforms |
| Data Integrity | Daily | 2:00 AM | Check and fix data issues |

## 🗂️ Data Schema

### Airtable Tables

#### Leads Table
```javascript
{
  Name: "Text",
  Email: "Email",
  Company: "Text",
  Interest_Area: "Single Select",
  Source: "Single Select",
  Owner: "Text",
  Status: "Single Select",
  Contact: "Link to Contacts",
  Created_Date: "Date"
}
```

#### Projects Table
```javascript
{
  Project_Name: "Text",
  Client: "Link to Clients",
  Deal: "Link to Deals",
  Status: "Single Select",
  Start_Date: "Date",
  Deal_Value: "Currency",
  Service_Type: "Single Select",
  Progress: "Percent",
  Milestones: "Multiple Select"
}
```

### Coda Tables

#### Loans Table
```javascript
{
  Lender: "Text",
  Principal: "Number",
  Interest_Rate: "Number",
  Outstanding_Balance: "Currency",
  EMI_Amount: "Currency",
  Due_Date: "Date",
  Status: "Select"
}
```

#### Tasks Table
```javascript
{
  Task_Name: "Text",
  Project: "Relation",
  Assignee: "Text",
  Status: "Select",
  Due_Date: "Date",
  Priority: "Select",
  Type: "Select"
}
```

## 🔍 Monitoring

### Health Checks
- Server health: `http://localhost:3000/health`
- Workflow status: Check logs in `./logs/automation.log`
- API rate limits: Monitor in console output

### Error Handling
- All errors are logged to `./logs/error.log`
- Failed syncs are retried with exponential backoff
- Critical failures trigger Slack notifications

## 🚦 Testing

### Test Individual Workflows
```bash
# Test lead capture
curl -X POST http://localhost:3000/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Lead","email":"test@example.com","company":"Test Co","interest_area":"MuleSoft","source":"Website"}'

# Test sync
curl -X POST http://localhost:3000/webhook/sync

# Check health
curl http://localhost:3000/health
```

## 📊 Implementation Phases

### Phase 1 (Current)
✅ Lead Capture
✅ Invoicing
✅ EMI Scheduling
⏳ Zoho Books Sync

### Phase 2 (In Progress)
⏳ Client Onboarding
⏳ Project Tracking
⏳ Coda ↔ Airtable Sync

### Phase 3 (Planned)
- GST Automation
- Debt Consolidation Tracker
- Full Atlas Spine Implementation
- Notion Integration

## 🔐 Security Considerations

1. **API Keys**: Store in environment variables, never commit
2. **Webhooks**: Validate signatures for incoming webhooks
3. **Rate Limiting**: Implemented for all API endpoints
4. **Data Encryption**: Sensitive data encrypted at rest
5. **Access Control**: Role-based permissions for different operations

## 🐛 Troubleshooting

### Common Issues

1. **API Rate Limits**
   - Solution: Implement exponential backoff
   - Check rate limit headers in responses

2. **Sync Conflicts**
   - Solution: Check Last_Modified timestamps
   - Manual resolution through Sync_Errors table

3. **Webhook Failures**
   - Solution: Check webhook secret validation
   - Verify payload structure

4. **Connection Errors**
   - Solution: Verify API credentials
   - Check network connectivity

## 📚 Additional Resources

- [Airtable API Docs](https://airtable.com/api)
- [Coda API Reference](https://coda.io/developers/apis/v1)
- [Notion API Guide](https://developers.notion.com)
- [Zoho Books API](https://www.zoho.com/books/api/v3/)
- [Make.com Documentation](https://www.make.com/en/help/introduction)
- [n8n Docs](https://docs.n8n.io)

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Contact: nirmal@integratewise.com
- Slack: #automation-support

---

**Last Updated**: November 2024
**Version**: 1.0.0
**Status**: Active Development
