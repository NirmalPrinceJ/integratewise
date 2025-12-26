# IntegrateWise Adapter Catalog v1.0

## Overview

IntegrateWise provides pre-built adapters for CRM systems, productivity platforms, and data destinations. All adapters support bi-directional sync with configurable field mappings.

---

## CRM Source Adapters

### Salesforce

| Feature | Details |
|---------|---------|
| **Authentication** | OAuth 2.0 (Web Server Flow) |
| **API Version** | v58.0+ |
| **Objects Supported** | Account, Contact, Opportunity, Task, Event, Custom Objects |
| **Sync Frequency** | Real-time (Change Data Capture) or Scheduled (5min–24hr) |
| **Rate Limits** | Respects Salesforce API limits with exponential backoff |
| **Field Mapping** | Auto-mapped + custom field configuration |

**Normalization Rules:**
- `Account.Id` → `crm_id` (prefix: `sf:`)
- `Account.Name` → `name`
- `Account.Website` → `domain` (extracted)
- `Account.Industry` → `industry` (normalized to standard taxonomy)
- `Account.NumberOfEmployees` → `employee_count` (banded)

---

### HubSpot

| Feature | Details |
|---------|---------|
| **Authentication** | OAuth 2.0 (Private App) |
| **API Version** | v3 |
| **Objects Supported** | Company, Contact, Deal, Engagement, Ticket |
| **Sync Frequency** | Real-time (Webhooks) or Scheduled |
| **Rate Limits** | Adaptive throttling based on tier |
| **Field Mapping** | Auto-mapped + custom properties |

**Normalization Rules:**
- `Company.hs_object_id` → `crm_id` (prefix: `hs:`)
- `Company.name` → `name`
- `Company.domain` → `domain`
- `Company.industry` → `industry` (normalized)
- `Company.numberofemployees` → `employee_count` (banded)

---

### Microsoft Dynamics 365

| Feature | Details |
|---------|---------|
| **Authentication** | OAuth 2.0 (Azure AD) |
| **API Version** | Web API v9.2 |
| **Objects Supported** | Account, Contact, Opportunity, Activity |
| **Sync Frequency** | Scheduled (5min–24hr) |
| **Rate Limits** | Service protection limits honored |
| **Field Mapping** | Auto-mapped + custom entities |

**Normalization Rules:**
- `Account.accountid` → `crm_id` (prefix: `dyn:`)
- `Account.name` → `name`
- `Account.websiteurl` → `domain` (extracted)
- `Account.industrycode` → `industry` (mapped from option set)

---

## Product Usage Adapters

### Segment

| Feature | Details |
|---------|---------|
| **Integration Type** | Destination (receive events) |
| **Event Types** | Track, Identify, Page, Group |
| **Mapping** | `userId` → `contact_id`, `groupId` → `account_id` |
| **Batch Size** | Up to 500 events per request |

---

### Amplitude

| Feature | Details |
|---------|---------|
| **Integration Type** | Export API |
| **Data Exported** | Events, User Properties, Revenue |
| **Sync Frequency** | Daily (batch) or Real-time (webhook) |
| **Cohort Support** | Yes - map cohorts to health signals |

---

### Mixpanel

| Feature | Details |
|---------|---------|
| **Integration Type** | Export API + JQL |
| **Data Exported** | Events, User Profiles, Funnels |
| **Sync Frequency** | Scheduled (hourly/daily) |

---

## Destination Adapters (Read-Only Views)

### Notion

| Feature | Details |
|---------|---------|
| **Integration Type** | Internal Integration (API) |
| **Capabilities** | Create/Update databases, pages, properties |
| **Sync Mode** | One-way (Spine → Notion) |
| **Supported Views** | Table, Board, Calendar, Gallery |
| **Refresh Rate** | Near real-time (< 60s) |

**Pre-built Templates:**
- Account Health Dashboard
- At-Risk Accounts Board
- Renewal Calendar
- Stakeholder Directory

---

### Airtable

| Feature | Details |
|---------|---------|
| **Integration Type** | REST API + Webhooks |
| **Capabilities** | Create/Update bases, tables, records |
| **Sync Mode** | One-way (Spine → Airtable) |
| **Supported Views** | Grid, Kanban, Calendar, Gallery |
| **Refresh Rate** | < 60s |

---

### Google Sheets

| Feature | Details |
|---------|---------|
| **Integration Type** | Sheets API v4 |
| **Capabilities** | Create/Update spreadsheets, sheets, ranges |
| **Sync Mode** | One-way (Spine → Sheets) |
| **Refresh Rate** | Scheduled (5min minimum) |
| **Formatting** | Conditional formatting, data validation |

---

### Coda

| Feature | Details |
|---------|---------|
| **Integration Type** | Coda API + Pack SDK |
| **Capabilities** | Tables, formulas, automations |
| **Sync Mode** | One-way with formula support |
| **Refresh Rate** | < 60s |

---

### Asana

| Feature | Details |
|---------|---------|
| **Integration Type** | REST API |
| **Capabilities** | Projects, Tasks, Custom Fields |
| **Sync Mode** | Bi-directional (initiatives/tasks) |
| **Use Cases** | Success plans, renewal projects, escalation tracking |

---

### ClickUp

| Feature | Details |
|---------|---------|
| **Integration Type** | REST API v2 |
| **Capabilities** | Spaces, Folders, Lists, Tasks, Custom Fields |
| **Sync Mode** | Bi-directional |
| **Use Cases** | Playbook execution, initiative tracking |

---

### Monday.com

| Feature | Details |
|---------|---------|
| **Integration Type** | GraphQL API |
| **Capabilities** | Boards, Items, Columns, Automations |
| **Sync Mode** | Bi-directional |
| **Use Cases** | Account boards, pipeline views |

---

## Communication Adapters

### Slack

| Feature | Details |
|---------|---------|
| **Integration Type** | Slack App (Bot + Events) |
| **Capabilities** | Notifications, Alerts, Commands, Modals |
| **Use Cases** | Risk alerts, health score notifications, daily digests |

---

### Microsoft Teams

| Feature | Details |
|---------|---------|
| **Integration Type** | Graph API + Bot Framework |
| **Capabilities** | Adaptive Cards, Notifications, Tabs |
| **Use Cases** | Risk alerts, renewal reminders |

---

## Data Quality Requirements

### Minimum Data Thresholds

For accurate health scoring, accounts should have:

| Data Point | Minimum Coverage |
|------------|------------------|
| Account Name | 100% |
| Primary Contact | 95% |
| ARR/MRR | 90% |
| Contract Dates | 90% |
| Usage Events (if applicable) | 80% of accounts with >10 events/month |
| Stakeholder Mapping | 70% with ≥2 contacts |

### Data Freshness SLAs

| Data Type | Max Staleness |
|-----------|---------------|
| CRM Core Data | 15 minutes |
| Usage Events | 1 hour |
| Health Scores | 2 minutes (on-demand), 4 hours (batch) |
| Rendered Views | 60 seconds |

---

## Custom Adapter Development

IntegrateWise supports custom adapters for systems not in the standard catalog:

**Development Options:**
1. **Webhook Receiver** - POST events to IntegrateWise endpoint
2. **REST Connector** - Configure custom API endpoints
3. **Custom Adapter** - Full SDK for complex integrations

**Adapter SDK Features:**
- TypeScript/JavaScript runtime
- Built-in retry, rate limiting, error handling
- OAuth 2.0 helper libraries
- Field mapping DSL
- Testing harness

---

## Support & SLAs

| Adapter Tier | Response Time | Support Hours |
|--------------|---------------|---------------|
| Core (SF, HS, Dyn) | 4 hours | 24/7 |
| Standard | 8 hours | Business hours |
| Custom | Per contract | Per contract |

---

*Document Version: 1.0*  
*Last Updated: 2024*  
*Contact: connect@integratewise.co*

