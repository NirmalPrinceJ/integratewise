# IntegrateWise Operating System - Complete Overview

## 🎯 Architecture Alignment

This OS follows your architecture diagram with:

### Data Sources (Left Side)
- ✅ HubSpot CRM - Webhook integration for contacts, deals
- ✅ Google Sheets - Manual sync capability  
- ✅ Razorpay - Payment tracking
- ✅ Google Analytics - Traffic metrics
- ✅ Asana - Task synchronization
- ✅ LinkedIn - Lead generation tracking
- ⚠️ Pipedrive - Webhook ready (needs API keys)

### Backend Services (Middle)
- ✅ PostgreSQL Database (Supabase) - All data stored
- ✅ API Server - Routes for webhooks, chat, search
- ✅ Vector DB for docs - Documents table with search
- ✅ Real-time sync - Webhook handlers implemented

### Frontend (Right Side)
- ✅ React Dashboard - Full Next.js app
- ✅ Chat Interface - AI assistant integrated
- ✅ Search Engine - Global search across entities
- ✅ Document Viewer - Knowledge hub with viewer

---

## 📊 Complete Module List

### 1. **Home Dashboard** (`/`)
- Health score widget
- AI insights
- KPI cards (MRR, Pipeline, Revenue, Projects)
- Tasks panel with quick actions
- Calendar view with upcoming events
- Email inbox integration
- Recent activity feed
- Drive files preview
- Recent documents

### 2. **Metrics Dashboard** (`/metrics`)
- Revenue metrics by tier
- Lead conversion funnel
- Sales pipeline visualization
- Performance trends
- Product revenue breakdown
- Real-time sync status

### 3. **CRM System**
#### Leads (`/leads`)
- Lead scoring (0-100)
- Source tracking (LinkedIn, HubSpot, Website, etc.)
- Status pipeline (New → Qualified → Proposal → Won/Lost)
- Activity tracking
- LinkedIn profile integration
- HubSpot/Pipedrive sync IDs

#### Campaigns (`/campaigns`)
- Multi-channel campaigns (Email, LinkedIn, Webinar, Product Launch)
- Performance metrics (sent, opened, clicked, converted)
- Budget tracking
- ROI calculation
- Campaign status management

#### Pipeline (`/pipeline`)
- Kanban board view
- Deal stages (Discovery → Proposal → Negotiation → Won/Lost)
- Value tracking
- Probability scoring
- Expected close dates
- Lead association

### 4. **Marketing**
#### Content Library (`/content`)
- All content types (Articles, eBooks, Videos, Guides, Tools)
- Platform tracking (LinkedIn, Website, YouTube, Blog)
- Performance metrics (views, engagement, shares)
- Lead magnet management
- Content status (Draft → Published)
- Search and filter by type/category

#### Campaigns (Shared with CRM)
- Marketing campaign tracking
- Content distribution
- Lead generation campaigns

#### Deals (Shared with CRM)
- Sales opportunities
- Marketing-qualified leads (MQLs)

### 5. **Products** (`/products`)
All 12 IntegrateWise products across 5 tiers:

**TIER 1: Professional Services**
- MuleSoft Consulting (₹50-150L)
- Customer Success Automation (₹10-25L + retainer)

**TIER 2: Recurring Revenue**
- CTO/Advisory Retainer (₹5-10L/month)
- 1:1 Founder Coaching (₹2-5L/month)

**TIER 3: Scalable**
- Corporate Workshops (₹3-5L/program)
- Integration Excellence Certification (₹2L + ₹1L/year)

**TIER 4: Digital Products + SaaS**
- Premium CSM Templates ($299-999)
- AI Agent Suite ($12K/month)
- Template Forge AI (₹8-25L)
- Normalize AI (₹5-15L)
- IntegrateWise.co (referral)

**TIER 5: Community**
- Integration Architects Community (Free + ₹2K/month premium)

### 6. **Services** (`/services`)
Legacy service catalog view (pre-product model)

### 7. **Client Management**
#### All Clients (`/clients`)
- Client directory with health scores
- Revenue tracking
- Industry segmentation
- Status management (Active, Onboarding, Churned)
- NPS scores
- Client detail pages

#### Client Detail Pages (`/clients/[id]`)
**Overview Tab**
- Client information
- Active engagements
- Revenue summary
- Health metrics

**Sessions Tab**
- Discovery sessions
- Training sessions
- Advisory calls
- Coaching sessions
- Feedback ratings
- Session notes and action items

**Projects Tab**
- Active development projects
- MuleSoft implementations
- SaaS development
- Progress tracking (0-100%)
- GitHub integration
- Vercel deployment tracking
- Tech stack visibility
- Budget vs Spent

**Engagements Tab**
- Active contracts
- Retainer agreements
- Hours allocated vs used
- Billing cycles
- Contract values

#### Sessions (`/sessions`)
Global view of all client sessions:
- Scheduled vs Completed
- Session types (Discovery, Training, Advisory, Coaching, Review)
- Feedback ratings
- Action item tracking
- Recording links
- Attendee management
- "Schedule Session" dialog

#### Projects (`/projects`)
Global view of all client projects:
- Project status (Planning, In Progress, Review, Deployed)
- Progress bars
- Tech stack badges
- GitHub repo links
- Staging/Production URLs
- Deployment history
- Milestone tracking
- Budget tracking
- "New Project" dialog

### 8. **Tasks** (`/tasks`)
- Task management with priorities
- Due date tracking
- Status workflow
- Assignment
- Integration with Asana webhooks

### 9. **Knowledge Base** (`/knowledge`)
Fully independent knowledge hub:
- **Create pages** - Markdown editor with title, description, content
- **Categories** - Strategy, Sales, Marketing, Operations, Delivery, Finance
- **Search** - Full-text search across all content
- **Star favorites** - Pin important documents
- **View tracking** - Usage analytics
- **Edit/Delete** - Full CRUD operations
- **Custom icons** - Per-page customization

Category pages:
- `/knowledge/strategy`
- `/knowledge/sales`
- `/knowledge/marketing`
- `/knowledge/operations`
- `/knowledge/delivery`
- `/knowledge/finance`

### 10. **Data Sources** (`/data-sources`)
Integration management:
- HubSpot CRM
- Pipedrive
- Razorpay
- Google Sheets
- Google Analytics
- Asana
- LinkedIn

Features:
- Connection status
- Last sync timestamps
- Sync now buttons
- Sync logs
- Error tracking

### 11. **Integrations** (`/integrations`)
Webhook and API integration settings

### 12. **AI Assistant**
Chat interface with:
- Context-aware responses
- Document search
- Task creation
- Data queries

### 13. **Settings** (`/settings`)
System configuration and preferences

---

## 🗄️ Database Schema

### Core Tables (Already Created)
1. **tasks** - Task management
2. **calendar_events** - Calendar integration
3. **emails** - Email tracking
4. **drive_files** - File management
5. **activities** - Activity feed
6. **metrics** - KPI tracking
7. **documents** - Knowledge base
8. **interactions** - User interactions

### CRM Tables (Created via Migrations)
9. **leads** - Lead management
10. **campaigns** - Marketing campaigns
11. **content_library** - Marketing content
12. **deals** - Sales opportunities

### Business Tables
13. **products** - All 12 IntegrateWise products
14. **services** - Service catalog (legacy)
15. **clients** - Client directory
16. **client_engagements** - Active contracts
17. **sessions** - Client sessions
18. **session_notes** - Session notes & action items
19. **client_projects** - Development projects
20. **deployments** - Deployment tracking
21. **project_milestones** - Project milestones
22. **data_source_sync** - Integration sync logs

---

## 🔗 API Endpoints

### Webhooks
- `POST /api/webhooks/hubspot` - HubSpot contact/deal sync
- `POST /api/webhooks/asana` - Asana task sync
- `POST /api/webhooks/health` - Health check

### Core APIs
- `POST /api/ai/chat` - AI assistant
- `POST /api/search` - Global search
- `POST /api/capture` - Data capture
- `POST /api/data-sync` - Manual sync trigger

---

## 🎨 Design System

### Color Palette
- Primary: Teal accent
- Secondary: Slate/gray tones
- Semantic: Success (emerald), Warning (amber), Error (rose)
- Background: Dark mode optimized

### Typography
- Headings: Geist Sans
- Body: Geist Sans
- Monospace: Geist Mono

### Components
Full shadcn/ui library including:
- Buttons, Cards, Dialogs
- Forms, Inputs, Selects
- Tables, Badges, Avatars
- Charts (Recharts integration)
- Skeletons for loading states

---

## ✅ What's Complete

1. ✅ Full database schema (22 tables)
2. ✅ All frontend views (13 major pages)
3. ✅ Client management system (Sessions, Projects, Engagements)
4. ✅ CRM system (Leads, Campaigns, Pipeline, Deals)
5. ✅ Marketing module (Content, Campaigns)
6. ✅ Products catalog (All 12 products)
7. ✅ Knowledge hub (Independent, full CRUD)
8. ✅ Webhook handlers (HubSpot, Asana)
9. ✅ Data source integrations
10. ✅ Home dashboard with widgets
11. ✅ Metrics dashboard
12. ✅ AI assistant integration
13. ✅ Global search
14. ✅ Task management

---

## 🚧 Optional Enhancements (Future)

1. **Advanced Analytics**
   - Custom report builder
   - Data export (CSV, PDF)
   - Scheduled reports

2. **Collaboration**
   - Team member management
   - Role-based access control (RBAC)
   - Comments on projects/sessions

3. **Automation**
   - Workflow automation builder
   - Email templates
   - Notification system

4. **Mobile**
   - Progressive Web App (PWA)
   - Mobile-optimized views

5. **Integrations**
   - Slack notifications
   - Calendar sync (Google Calendar)
   - Email integration (Gmail)

---

## 🚀 Getting Started

### Run SQL Scripts (In Order)
Execute these in Supabase SQL editor:
1. ✅ `scripts/001-012` - Already run (core tables)
2. ✅ `scripts/013_create_services_schema.sql`
3. ✅ `scripts/014_seed_integratewise_services.sql` (FIXED)
4. ✅ `scripts/015_create_products_table.sql`
5. ✅ `scripts/016_seed_products.sql`
6. ✅ `scripts/017_create_crm_schema.sql` (FIXED)
7. ✅ `scripts/018_seed_crm_data.sql` (FIXED)
8. ✅ Created via migrations: `clients`, `client_engagements`, `sessions`, `session_notes`, `client_projects`, `deployments`, `project_milestones`

### Configure Webhooks
Set up webhooks in external services:

**HubSpot:**
\`\`\`
URL: https://your-domain.vercel.app/api/webhooks/hubspot
Events: contact.creation, contact.propertyChange, deal.creation, deal.propertyChange
\`\`\`

**Asana:**
\`\`\`
URL: https://your-domain.vercel.app/api/webhooks/asana
Events: task.added, task.changed
\`\`\`

### Environment Variables
All set via Supabase integration:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `POSTGRES_URL`

---

## 📈 Success Metrics

Track these in your Metrics Dashboard:
- **MRR Growth** - Monthly recurring revenue
- **Pipeline Value** - Total deal value in pipeline
- **Lead Conversion Rate** - Leads → Clients %
- **Client Health Score** - Average health across clients
- **Project Delivery** - On-time delivery %
- **Content Performance** - Views, engagement, leads generated
- **Campaign ROI** - Revenue per campaign spend

---

## 🎯 Your Business in Numbers

**Products:** 12 offerings across 5 tiers
**Revenue Model:** ₹26L MRR target
**Pipeline:** ₹45L in active deals
**Clients:** 5 active, 10 leads in pipeline
**Projects:** 3 active development projects
**Content:** 12 marketing assets
**Campaigns:** 8 active campaigns

---

**Built by Nirmal Prince J**
*IntegrateWise Operating System v1.0*
