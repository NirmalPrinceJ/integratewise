# IntegrateWise OS - Architecture Plan

## 🚀 Vision
Transform IntegrateWise OS into a complete business operating system with:
- **Universal Authentication** - Google, Microsoft, Apple, SSO
- **Smart Data Normalization** - Auto-clean and standardize data on first login
- **Accounts & Audit** - Full financial tracking with compliance
- **Global Taxation** - GST (India), VAT (EU), Sales Tax (US), and more

---

## 1. Authentication System

### Provider Options

#### Option A: Auth0 (Recommended for Enterprise)
\`\`\`
Pros:
- Enterprise SSO support (SAML, OIDC)
- Built-in MFA, passwordless
- SOC2 compliant
- Extensive social connections

Cons:
- Cost scales with users
- External dependency
\`\`\`

#### Option B: Stack Auth (Self-hosted alternative)
\`\`\`
Pros:
- Open source, self-hosted
- Full data control
- One-time setup cost

Cons:
- More maintenance
- Less enterprise features
\`\`\`

#### Option C: NextAuth.js + Supabase Auth (Current Stack Extension)
\`\`\`
Pros:
- Already using Supabase
- Lower cost
- Full control

Cons:
- More custom code
- SSO needs extra work
\`\`\`

### Recommended: Hybrid Approach
Use **Supabase Auth** as the foundation with **social providers**:

\`\`\`typescript
// lib/auth/providers.ts
export const authProviders = {
  google: {
    enabled: true,
    scopes: ['email', 'profile', 'https://www.googleapis.com/auth/calendar.readonly']
  },
  microsoft: {
    enabled: true,
    scopes: ['email', 'profile', 'Calendars.Read', 'Mail.Read']
  },
  apple: {
    enabled: true,
    scopes: ['email', 'name']
  },
  // Enterprise SSO via SAML
  saml: {
    enabled: false, // Enable per-org
    providers: []
  }
}
\`\`\`

### Authentication Flow

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                        LOGIN PAGE                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Google  │  │Microsoft │  │  Apple   │  │   SSO    │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
└───────┼─────────────┼─────────────┼─────────────┼───────────────┘
        │             │             │             │
        └─────────────┴──────┬──────┴─────────────┘
                             ▼
              ┌──────────────────────────────┐
              │     SUPABASE AUTH            │
              │  - Create/Update User        │
              │  - Store OAuth Tokens        │
              │  - Set Session Cookie        │
              └──────────────┬───────────────┘
                             ▼
              ┌──────────────────────────────┐
              │   NEW USER CHECK             │
              │  is_onboarding_complete?     │
              └──────────────┬───────────────┘
                             │
            ┌────────────────┴────────────────┐
            │ NO                              │ YES
            ▼                                 ▼
┌───────────────────────┐         ┌────────────────────────┐
│  DATA NORMALIZATION   │         │     DASHBOARD          │
│  ONBOARDING WIZARD    │         │  (Normal App Flow)     │
└───────────────────────┘         └────────────────────────┘
\`\`\`

---

## 2. Data Normalization Flow (Post-Login Onboarding)

### Step-by-Step Wizard

\`\`\`
STEP 1: Company Profile
├── Company Name
├── Industry
├── Country (determines tax system)
├── Currency (primary)
├── Timezone
└── Fiscal Year Start

STEP 2: Connect Data Sources
├── CRM (HubSpot, Salesforce, Pipedrive)
├── Accounting (QuickBooks, Xero, Zoho Books)
├── Calendar (Google, Outlook)
├── Email (Gmail, Outlook)
└── Custom APIs

STEP 3: Data Import & Normalization
├── Import existing contacts
├── Deduplicate entries
├── Standardize fields (phone, address, names)
├── Map custom fields
└── Validate data quality

STEP 4: Tax Configuration
├── Select tax jurisdiction(s)
├── Enter tax IDs (GST, VAT, EIN)
├── Configure tax rates
└── Set compliance requirements

STEP 5: Team Setup (Optional)
├── Invite team members
├── Set roles & permissions
└── Configure notifications
\`\`\`

### Data Normalization Engine

\`\`\`typescript
// lib/normalization/engine.ts
interface NormalizationRule {
  field: string
  type: 'phone' | 'email' | 'address' | 'name' | 'currency' | 'date'
  region?: string
}

const normalizeData = async (data: any[], rules: NormalizationRule[]) => {
  return data.map(record => {
    const normalized = { ...record }

    rules.forEach(rule => {
      switch (rule.type) {
        case 'phone':
          normalized[rule.field] = normalizePhone(record[rule.field], rule.region)
          break
        case 'email':
          normalized[rule.field] = normalizeEmail(record[rule.field])
          break
        case 'address':
          normalized[rule.field] = normalizeAddress(record[rule.field], rule.region)
          break
        case 'name':
          normalized[rule.field] = normalizeName(record[rule.field])
          break
        case 'currency':
          normalized[rule.field] = normalizeCurrency(record[rule.field])
          break
        case 'date':
          normalized[rule.field] = normalizeDate(record[rule.field])
          break
      }
    })

    return normalized
  })
}
\`\`\`

---

## 3. Accounts & Audit Section

### Database Schema

\`\`\`sql
-- Chart of Accounts
CREATE TABLE chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- asset, liability, equity, revenue, expense
  parent_id UUID REFERENCES chart_of_accounts(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  entry_number VARCHAR(50) UNIQUE,
  entry_date DATE NOT NULL,
  description TEXT,
  reference_type VARCHAR(50), -- invoice, payment, expense, manual
  reference_id UUID,
  status VARCHAR(20) DEFAULT 'draft', -- draft, posted, voided
  created_by UUID REFERENCES users(id),
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Lines
CREATE TABLE journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID REFERENCES chart_of_accounts(id),
  description TEXT,
  debit DECIMAL(15,2) DEFAULT 0,
  credit DECIMAL(15,2) DEFAULT 0,
  tax_code VARCHAR(20),
  tax_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- create, update, delete, view, export
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Reports Cache
CREATE TABLE financial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  report_type VARCHAR(50), -- balance_sheet, income_statement, cash_flow, trial_balance
  period_start DATE,
  period_end DATE,
  data JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

### Accounts Features

\`\`\`
📊 ACCOUNTS DASHBOARD
├── 💰 Cash Flow Overview
│   ├── Current Balance
│   ├── Income vs Expenses (chart)
│   └── Cash Flow Forecast
│
├── 📑 Transactions
│   ├── All Transactions
│   ├── Bank Reconciliation
│   ├── Journal Entries
│   └── Import Transactions
│
├── 📈 Reports
│   ├── Profit & Loss
│   ├── Balance Sheet
│   ├── Cash Flow Statement
│   ├── Trial Balance
│   ├── Aged Receivables
│   └── Aged Payables
│
├── 🧾 Invoicing
│   ├── Create Invoice
│   ├── Invoice Templates
│   ├── Recurring Invoices
│   └── Payment Reminders
│
└── 🔍 Audit
    ├── Audit Trail
    ├── User Activity Log
    ├── Data Changes History
    └── Compliance Reports
\`\`\`

---

## 4. Global Taxation System

### Tax Configuration Schema

\`\`\`sql
-- Tax Jurisdictions
CREATE TABLE tax_jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code CHAR(2) NOT NULL,
  name VARCHAR(100) NOT NULL,
  tax_system VARCHAR(50) NOT NULL, -- gst, vat, sales_tax, hst
  tax_id_label VARCHAR(50), -- GSTIN, VAT Number, EIN
  tax_id_format VARCHAR(100), -- regex pattern
  filing_frequency VARCHAR(20)[], -- monthly, quarterly, annually
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tax Rates
CREATE TABLE tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID REFERENCES tax_jurisdictions(id),
  code VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  rate DECIMAL(5,2) NOT NULL,
  category VARCHAR(50), -- standard, reduced, zero, exempt
  applies_to VARCHAR(20)[], -- goods, services, both
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Tax Settings
CREATE TABLE org_tax_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  jurisdiction_id UUID REFERENCES tax_jurisdictions(id),
  tax_id VARCHAR(50), -- The org's tax ID (GSTIN, VAT, etc.)
  registration_date DATE,
  filing_frequency VARCHAR(20),
  is_composition_scheme BOOLEAN DEFAULT false, -- India specific
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tax Transactions
CREATE TABLE tax_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  transaction_type VARCHAR(20), -- sale, purchase, adjustment
  transaction_id UUID,
  tax_rate_id UUID REFERENCES tax_rates(id),
  taxable_amount DECIMAL(15,2),
  tax_amount DECIMAL(15,2),
  transaction_date DATE,
  filing_period VARCHAR(20),
  is_filed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

### India GST System

\`\`\`typescript
// lib/tax/india/gst.ts

interface GSTConfig {
  gstin: string // 15-digit GSTIN
  stateCode: string
  businessType: 'regular' | 'composition' | 'unregistered'
  filingFrequency: 'monthly' | 'quarterly'
}

interface GSTRates {
  CGST: number // Central GST
  SGST: number // State GST (intra-state)
  IGST: number // Integrated GST (inter-state)
}

const GST_SLABS = {
  exempt: { CGST: 0, SGST: 0, IGST: 0 },
  '5%': { CGST: 2.5, SGST: 2.5, IGST: 5 },
  '12%': { CGST: 6, SGST: 6, IGST: 12 },
  '18%': { CGST: 9, SGST: 9, IGST: 18 },
  '28%': { CGST: 14, SGST: 14, IGST: 28 },
}

// GST Returns
const GST_RETURNS = {
  GSTR1: 'Outward supplies (sales)',
  GSTR2A: 'Auto-populated inward supplies',
  GSTR2B: 'Auto-drafted ITC statement',
  GSTR3B: 'Monthly summary return',
  GSTR9: 'Annual return',
  GSTR9C: 'Reconciliation statement'
}

// E-Invoice Integration
interface EInvoiceConfig {
  enabled: boolean
  apiEndpoint: string
  credentials: {
    username: string
    password: string
    clientId: string
    clientSecret: string
  }
}

// E-Way Bill Integration
interface EWayBillConfig {
  enabled: boolean
  threshold: number // Rs. 50,000 default
  apiEndpoint: string
}
\`\`\`

### International Tax Support

\`\`\`typescript
// lib/tax/jurisdictions/index.ts

const TAX_SYSTEMS = {
  // European Union - VAT
  EU: {
    type: 'VAT',
    rates: {
      AT: { standard: 20, reduced: [10, 13] },
      BE: { standard: 21, reduced: [6, 12] },
      DE: { standard: 19, reduced: [7] },
      FR: { standard: 20, reduced: [5.5, 10] },
      // ... more EU countries
    },
    features: ['reverse_charge', 'oss_scheme', 'intrastat']
  },

  // United States - Sales Tax
  US: {
    type: 'SALES_TAX',
    nexus: true, // Economic nexus rules
    rates: 'varies_by_state_and_locality',
    features: ['nexus_tracking', 'exemption_certificates']
  },

  // United Kingdom - VAT
  UK: {
    type: 'VAT',
    rates: { standard: 20, reduced: 5, zero: 0 },
    features: ['making_tax_digital', 'flat_rate_scheme']
  },

  // Canada - GST/HST/PST
  CA: {
    type: 'GST_HST_PST',
    rates: {
      federal_gst: 5,
      hst: { ON: 13, NB: 15, NL: 15, NS: 15, PE: 15 },
      pst: { BC: 7, MB: 7, SK: 6, QC: 9.975 }
    }
  },

  // Australia - GST
  AU: {
    type: 'GST',
    rates: { standard: 10, free: 0 },
    features: ['bas_reporting', 'gst_credits']
  },

  // Singapore - GST
  SG: {
    type: 'GST',
    rates: { standard: 9 }, // Increasing to 9% from 2024
    features: ['input_tax_claims']
  }
}
\`\`\`

---

## 5. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Supabase Auth with Google, Microsoft, Apple
- [ ] Create organizations table and user-org relationships
- [ ] Build basic onboarding wizard UI
- [ ] Implement country/region selection

### Phase 2: Data Normalization (Week 3-4)
- [ ] Build data import connectors
- [ ] Implement normalization engine
- [ ] Create deduplication algorithms
- [ ] Build data quality scoring

### Phase 3: Accounts Module (Week 5-7)
- [ ] Chart of accounts setup
- [ ] Journal entry system
- [ ] Basic financial reports
- [ ] Audit trail implementation

### Phase 4: Taxation - India GST (Week 8-10)
- [ ] GSTIN validation
- [ ] GST rate management
- [ ] Invoice with GST calculations
- [ ] GSTR-1 export format
- [ ] E-Invoice API integration (optional)

### Phase 5: Global Tax Support (Week 11-12)
- [ ] VAT support for EU/UK
- [ ] Sales tax for US (basic)
- [ ] Multi-currency support
- [ ] Tax reporting templates

### Phase 6: Polish & Launch (Week 13-14)
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation

---

## 6. Tech Stack Additions

\`\`\`json
{
  "authentication": "supabase-auth + @supabase/auth-helpers-nextjs",
  "forms": "react-hook-form + zod",
  "state": "zustand (for complex state)",
  "pdf": "@react-pdf/renderer (for invoices)",
  "excel": "exceljs (for tax exports)",
  "charts": "recharts (already installed)",
  "tables": "@tanstack/react-table",
  "dates": "date-fns + date-fns-tz"
}
\`\`\`

---

## Next Steps

1. **Confirm auth provider choice** (Auth0 vs Supabase native)
2. **Define MVP scope** for accounts module
3. **Prioritize tax jurisdictions** (India first, then?)
4. **Design data normalization rules** for your use case

Ready to start building? 🚀
