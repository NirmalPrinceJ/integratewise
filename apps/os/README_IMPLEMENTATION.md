# IntegrateWise OS Implementation Guide

## Overview

This document describes the auth-first, zero-dependency architecture implemented for IntegrateWise OS.

## Architecture Principles

1. **Auth-First**: Google/Microsoft/Apple/SSO with role-based capabilities
2. **Zero-Dependency Views**: Client-only pages that work without server keys or database
3. **Progressive Enablement**: Calendar/Mail/Memory require explicit consent
4. **One-Click Templates**: Domain pages unfold after template selection
5. **Content Migration**: Notion/Box → Obsidian vault with stable IDs

## Components Implemented

### 1. Role-Based Access Control (RBAC)

**File**: `lib/feature/capabilities.ts`

Defines 6 roles with granular capabilities:
- `super_admin` - Full access to all features
- `org_admin` - Organization management
- `billing_admin` - Billing and subscription management
- `ops_manager` - Operations and task management
- `member` - Standard user access
- `viewer` - Read-only access

Capabilities include:
- `view.overview`, `view.tasks`, `view.ai_insights`, `view.normalize`, `view.os_pages`
- `integrations.calendar.read`, `integrations.memory.read`

### 2. Proxy Route Gating (Next.js 16+)

**File**: `proxy.ts`

- Uses Next.js 16 proxy API (migrated from middleware.ts)
- Blocks routes based on user capabilities
- Redirects unauthenticated users to login
- Maps legacy routes to new capability system
- No backend calls until capabilities are verified
- Declarative route pattern matching

### 3. Zero-Dependency Pages

All pages work without server keys, database, or external APIs:

#### `/overview` - Dashboard Overview
- Displays today's summary (meetings, tasks, AI status)
- Quick action cards for enabling integrations
- Template selection guidance
- Feature enablement cards for Calendar and Memory

#### `/tasks` - Task Management
- Client-side task list with sample data
- Overdue/Pending/Completed filters
- Priority badges (high/medium/low)
- Stats cards showing task counts
- Checkbox interactions for marking complete

#### `/insights` - AI Insights
- Local text analysis without AI API calls
- Entity extraction (capitalized words)
- Date detection (multiple formats)
- Action verb detection
- Suggestion generation
- Priority-coded insights

#### `/normalize` - Data Normalization
- Natural language to structured data conversion
- Entity extraction and categorization
- Date parsing and normalization
- Action item detection
- Preview-only (no persistence)
- Metadata summary (word count, entity count, etc.)

#### `/os` - Operating System Pages
- Static pipeline visualization
- Metrics placeholders
- Template browser
- Domain page overview
- Quick stats cards

### 4. Optional Integrations (Consent-Based)

#### Calendar Reader Component
**File**: `components/integrations/CalendarReader.tsx`

- Supports Google, Microsoft, and Apple calendars
- Client-side OAuth 2.0 flow (no server keys)
- Mock implementation ready for production APIs
- Event display with time formatting
- Privacy notice: data stays on device

#### Memory Insights Component
**File**: `components/integrations/MemoryInsights.tsx`

- AI-powered task extraction from memory
- Categorized items: overdue, task, insight, reminder
- Priority badges
- On-demand processing
- Consent-based enablement
- Mock implementation ready for Memory Search API

### 5. Content Migration Tools

#### Python Migration Script
**File**: `tools/migrate_content.py`

Features:
- Notion export → Obsidian vault migration
- Box directory → Obsidian vault migration
- Stable ID generation (SHA-256 hash)
- Automatic categorization (17 categories)
- YAML front-matter metadata
- Mapping JSON for source tracking
- Slugified filenames

Categories:
- Credentials, Compliance, Finance, Branding, SaaS, Services, Digital
- Sales, Support, Metrics, Marketing, Innovation, Investor, Misc
- Team, Automations, Business

Usage:
\`\`\`bash
python tools/migrate_content.py \
  --notion-export /path/to/notion/export \
  --box-dir /path/to/box/files \
  --vault /path/to/obsidian/vault \
  --mapping-json /path/to/mapping.json
\`\`\`

#### Node.js Vault Sync Tool
**File**: `tools/vault_sync.ts`

Features:
- Auto-commits and pushes to GitHub
- Uses GITHUB_TOKEN from environment (secure)
- Pull with rebase before push
- Configurable git user/email
- Status command for vault info
- Init command for repository setup

Usage:
\`\`\`bash
GITHUB_TOKEN=your_token \
GIT_REPO=https://github.com/integratewise/knowledge.git \
VAULT_PATH=/path/to/vault \
GIT_BRANCH=main \
node tools/vault_sync.ts
\`\`\`

Commands:
- `sync` - Sync vault to GitHub (default)
- `status` - Show vault git status
- `init` - Initialize git repository
- `help` - Show help message

### 6. Template System Updates

#### Client-Side Template Management
**File**: `lib/templates/client-template.ts`

- Template selection stored in localStorage
- No database writes initially
- Template configuration includes pipeline, currency, fiscal year
- Onboarding status tracking
- Domain page availability based on template
- Easy reset/clear functionality

#### Updated Onboarding Flow
**File**: `app/onboarding/page.tsx`

- Client-only template selection
- Defers DB writes to later phases
- Stores configuration in localStorage
- Smooth progress animation
- Redirects to overview after completion
- Skip option for advanced users

## Environment Variables

Required for production:

\`\`\`bash
# Authentication (replace with actual provider)
AUTH_PROVIDER=clerk  # or auth0, stackauth
AUTH_SECRET=your_secret

# GitHub Integration (for vault sync)
GITHUB_TOKEN=your_personal_access_token
GIT_REPO=https://github.com/integratewise/knowledge.git
GIT_BRANCH=main

# Optional: Git commit configuration
GIT_USER_NAME="IntegrateWise Bot"
GIT_USER_EMAIL="bot@integratewise.com"

# Calendar Integration (client-side, optional)
# GOOGLE_CLIENT_ID=your_google_client_id
# MICROSOFT_CLIENT_ID=your_microsoft_client_id
# APPLE_CLIENT_ID=your_apple_client_id

# Memory/AI Integration (optional)
# MEMORY_API_ENDPOINT=your_memory_api_endpoint
\`\`\`

## Security Considerations

1. **No Hardcoded Secrets**: All credentials via environment variables
2. **Client-Side OAuth**: Calendar integration uses browser flow
3. **Consent-Based**: Optional integrations require explicit user consent
4. **Defense in Depth**: Capabilities checked both client and server
5. **Fail Closed**: Missing credentials prevent access, don't default to open
6. **CSP/HSTS**: Configure strict Content Security Policy and HTTPS

## Deployment Checklist

- [ ] Configure authentication provider (Clerk/Auth0/StackAuth)
- [ ] Set up role assignment in auth provider
- [ ] Configure capability cookies/claims after login
- [ ] Set GITHUB_TOKEN for vault sync (if using)
- [ ] Configure calendar OAuth client IDs (if using)
- [ ] Set up memory/AI API endpoint (if using)
- [ ] Test all five zero-dependency pages
- [ ] Verify middleware route protection
- [ ] Test template selection flow
- [ ] Run content migration scripts
- [ ] Test vault sync to GitHub
- [ ] Configure CSP/HSTS headers
- [ ] Enable analytics (Vercel Analytics already included)

## Next Steps

### Phase 2: Server Integration
- Connect authentication provider
- Implement server-side capability checks
- Store template configurations in database
- Enable real-time sync for Calendar/Memory

### Phase 3: Domain Pages
- Implement template-specific domain pages
- Connect to real data sources
- Build CRUD operations for entities
- Add workflow automation

### Phase 4: Advanced Features
- Multi-org support
- Team collaboration
- Advanced AI features
- Workflow builder
- Custom integrations

## Testing

### Local Testing (Zero-Dependency)

1. Start dev server:
\`\`\`bash
npm run dev
\`\`\`

2. Visit pages:
- http://localhost:3000/overview
- http://localhost:3000/tasks
- http://localhost:3000/insights
- http://localhost:3000/normalize
- http://localhost:3000/os

3. Test template selection:
- http://localhost:3000/onboarding

### Content Migration Testing

1. Prepare test data:
\`\`\`bash
mkdir -p test_data/notion test_data/box
# Add some .md files to test directories
\`\`\`

2. Run migration:
\`\`\`bash
python tools/migrate_content.py \
  --notion-export test_data/notion \
  --box-dir test_data/box \
  --vault test_vault \
  --mapping-json test_mapping.json
\`\`\`

3. Check output in `test_vault/Knowledge/IntegrateWise/`

### Vault Sync Testing

1. Set up test repository:
\`\`\`bash
# Create empty GitHub repo
gh repo create integratewise/knowledge-test --private
\`\`\`

2. Test sync:
\`\`\`bash
GITHUB_TOKEN=$YOUR_TOKEN \
GIT_REPO=https://github.com/integratewise/knowledge-test.git \
VAULT_PATH=test_vault \
node tools/vault_sync.ts init

# Make some changes to test_vault
echo "# Test" > test_vault/test.md

# Sync
GITHUB_TOKEN=$YOUR_TOKEN \
VAULT_PATH=test_vault \
node tools/vault_sync.ts sync
\`\`\`

## File Structure

\`\`\`
/workspace
├── app/
│   ├── overview/page.tsx          # Zero-dependency overview
│   ├── tasks/page.tsx              # Zero-dependency tasks
│   ├── insights/page.tsx           # Zero-dependency insights
│   ├── normalize/page.tsx          # Zero-dependency normalize
│   ├── os/page.tsx                 # Zero-dependency OS pages
│   └── onboarding/page.tsx         # Updated template selector
├── components/
│   └── integrations/
│       ├── CalendarReader.tsx      # Optional calendar integration
│       └── MemoryInsights.tsx      # Optional memory integration
├── lib/
│   ├── feature/
│   │   └── capabilities.ts         # RBAC system
│   └── templates/
│       ├── client-template.ts      # Client-side template management
│       └── industry-templates.ts   # Template definitions
├── proxy.ts                        # Route gating (Next.js 16+)
├── tools/
│   ├── migrate_content.py          # Content migration script
│   └── vault_sync.ts               # GitHub vault sync
├── README_IMPLEMENTATION.md        # This file
└── PROXY_MIGRATION.md              # Middleware→Proxy migration guide
\`\`\`

## Support

For questions or issues with this implementation:
1. Check the inline code documentation
2. Review the example usage in each file
3. Test with mock data first
4. Verify environment variables are set correctly

## License

This implementation is part of the IntegrateWise OS project.
