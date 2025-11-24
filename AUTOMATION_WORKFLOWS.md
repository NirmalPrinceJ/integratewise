# Comprehensive Automation Workflows - IntegrateWise

Complete automation suite for your productivity stack: Todoist, Coda, Airtable, Box, HubSpot/Vercel, Salesforce, and no-code tools (Zapier/Make.com/n8n).

## Table of Contents

1. [Task Management & Prioritization (Todoist-Centric)](#1-task-management--prioritization-todoist-centric)
2. [File & Document Management (Box-Centric)](#2-file--document-management-box-centric)
3. [CRM & Client Ops (Salesforce/HubSpot-Centric)](#3-crm--client-ops-salesforcehubspot-centric)
4. [Dev & Deployment (Cursor/Vercel-Centric)](#4-dev--deployment-cursorvercel-centric)
5. [Finance & Ops (Zoho/Stripe-Centric)](#5-finance--ops-zohostripe-centric)
6. [Personal & Deep Work (Cross-Tool)](#6-personal--deep-work-cross-tool)

---

## 1. Task Management & Prioritization (Todoist-Centric)

### Workflow 1.1: New Todoist Task → Grok Analysis & Update

**Platform:** Zapier or Make.com  
**Priority:** High (Core workflow)

#### Trigger
- **App:** Todoist
- **Event:** New Task Created
- **Filters:** 
  - Label contains `@urgent` OR `@csm` OR `@integratewise`
  - OR Project is "Salesforce CSM" OR "IntegrateWise"

#### Actions

**Step 1: Send to Grok API**
- **App:** Webhooks by Zapier (HTTP Request)
- **Method:** POST
- **URL:** `https://api.x.ai/v1/chat/completions`
- **Headers:**
  ```json
  {
    "Authorization": "Bearer {{XAI_API_KEY}}",
    "Content-Type": "application/json"
  }
  ```
- **Body:**
  ```json
  {
    "model": "grok-beta",
    "messages": [
      {
        "role": "system",
        "content": "You are a task prioritization assistant. Analyze tasks and suggest: 1) Priority level (p1-p4), 2) Subtasks (if needed), 3) Labels (@next, @deepwork, @waiting), 4) Estimated time. Format response as JSON."
      },
      {
        "role": "user",
        "content": "Task: {{Task Content}}\nDue Date: {{Due Date}}\nLabels: {{Labels}}\nProject: {{Project Name}}\n\nPrioritize and suggest improvements."
      }
    ],
    "temperature": 0.7
  }
  ```

**Step 2: Parse Grok Response**
- **App:** Code by Zapier (JavaScript)
- **Code:**
  ```javascript
  const response = JSON.parse(inputData.grok_response);
  const analysis = JSON.parse(response.choices[0].message.content);
  
  return {
    priority: analysis.priority || 'p2',
    subtasks: analysis.subtasks || [],
    labels: analysis.labels || [],
    estimated_time: analysis.estimated_time || '30m',
    notes: analysis.notes || ''
  };
  ```

**Step 3: Update Todoist Task**
- **App:** Todoist
- **Action:** Update Task
- **Task ID:** {{Task ID}}
- **Updates:**
  - Add Labels: {{labels}}
  - Update Priority: {{priority}}
  - Add to Description: `Estimated: {{estimated_time}}\n\n{{notes}}`

**Step 4: Create Subtasks (if any)**
- **App:** Todoist (Loop)
- **Action:** Create Task
- **For Each:** {{subtasks}}
- **Parent ID:** {{Task ID}}

#### Setup Instructions
1. Get xAI API Key: https://x.ai/api → Sign up → API Keys
2. Connect Todoist in Zapier: Settings → Integrations → Todoist → Generate Token
3. Test with a sample task labeled `@urgent`

#### Cost Estimate
- Zapier: Free tier (100 tasks/month) or Starter ($19.99/month)
- xAI API: Pay-per-use (~$0.01 per request)

---

### Workflow 1.2: Completed Todoist Task → Coda Update & Weekly Review Log

**Platform:** Zapier  
**Priority:** Medium

#### Trigger
- **App:** Todoist
- **Event:** Task Completed
- **Filters:**
  - Label contains `@integratewise` OR `@revenue` OR `@csm`
  - Project is NOT "Personal"

#### Actions

**Step 1: Get Task Details**
- **App:** Todoist
- **Action:** Get Task
- **Task ID:** {{Task ID}}

**Step 2: Update Coda**
- **App:** Coda
- **Action:** Upsert Row
- **Doc ID:** {{CODA_DOC_ID}}
- **Table:** "Project Health Scores" or "Task Log"
- **Row Data:**
  ```json
  {
    "Task": "{{Task Content}}",
    "Completed Date": "{{Completed Date}}",
    "Project": "{{Project Name}}",
    "Labels": "{{Labels}}",
    "Impact": "{{Extract from description if ₹ mentioned}}"
  }
  ```

**Step 3: Add to Weekly Review (if @weekly label)**
- **App:** Airtable
- **Action:** Create Record
- **Base:** "Weekly Reviews"
- **Table:** "Inbox"
- **Fields:**
  - Task: {{Task Content}}
  - Completed: {{Completed Date}}
  - Category: {{Labels}}

#### Setup Instructions
1. Get Coda API Token: Coda Doc → Settings → API → Generate Token
2. Get Airtable API Key: https://airtable.com/api → Personal Access Tokens
3. Create "Task Log" table in Coda with columns: Task, Completed Date, Project, Labels, Impact

---

### Workflow 1.3: Daily Todoist Digest → Slack/Email Notification

**Platform:** Make.com  
**Priority:** Medium

#### Trigger
- **App:** Schedule
- **Frequency:** Daily at 8:00 AM IST
- **Timezone:** Asia/Calcutta

#### Actions

**Step 1: Fetch Overdue Tasks**
- **App:** Todoist
- **Action:** List Tasks
- **Filter:** `overdue`
- **Sort:** Priority (desc)

**Step 2: Fetch P1 Tasks Due Today**
- **App:** Todoist
- **Action:** List Tasks
- **Filter:** `p1 & today`
- **Sort:** Priority (desc)

**Step 3: Format Digest**
- **App:** Code (JavaScript)
- **Code:**
  ```javascript
  const overdue = inputData.overdue_tasks || [];
  const today = inputData.today_tasks || [];
  
  let message = "📋 *Today's Focus*\n\n";
  
  if (overdue.length > 0) {
    message += "*🚨 Overdue Tasks:*\n";
    overdue.forEach(task => {
      message += `• ${task.content} (${task.priority})\n`;
    });
    message += "\n";
  }
  
  if (today.length > 0) {
    message += "*⭐ Priority Tasks Today:*\n";
    today.forEach(task => {
      message += `• ${task.content} (Due: ${task.due?.date})\n`;
    });
  }
  
  return { message };
  ```

**Step 4: Send to Slack**
- **App:** Slack
- **Action:** Create Message
- **Channel:** #daily-digest (or DM)
- **Text:** {{message}}
- **Format:** Markdown

**Step 5: Send Email (Optional)**
- **App:** Gmail
- **Action:** Send Email
- **To:** {{Your Email}}
- **Subject:** Daily Task Digest - {{Date}}
- **Body:** {{message}}

#### Setup Instructions
1. Create Slack webhook: https://api.slack.com/apps → Create App → Incoming Webhooks
2. Connect Todoist in Make.com
3. Set timezone to IST in Schedule trigger

---

## 2. File & Document Management (Box-Centric)

### Workflow 2.1: New Box File Upload → Todoist Task & Coda Log

**Platform:** Zapier  
**Priority:** Medium

#### Trigger
- **App:** Box
- **Event:** New File in Folder
- **Folder:** "IntegrateWise Assets" or specific folder path
- **Filters:**
  - File Type: PDF, DOCX, XLSX, SVG

#### Actions

**Step 1: Get File Details**
- **App:** Box
- **Action:** Get File Info
- **File ID:** {{File ID}}

**Step 2: Create Todoist Task**
- **App:** Todoist
- **Action:** Create Task
- **Content:** `Review uploaded file: {{File Name}}`
- **Project:** "IntegrateWise Operations"
- **Labels:** `@iw_ops`, `@file_review`
- **Due Date:** Tomorrow
- **Description:** `File: {{File Name}}\nSize: {{File Size}}\nUploaded: {{Upload Date}}\nLink: {{File URL}}`

**Step 3: Add to Coda**
- **App:** Coda
- **Action:** Create Row
- **Doc ID:** {{CODA_DOC_ID}}
- **Table:** "File Log"
- **Row Data:**
  ```json
  {
    "File Name": "{{File Name}}",
    "Upload Date": "{{Upload Date}}",
    "File Type": "{{File Type}}",
    "File Size": "{{File Size}}",
    "Box Link": "{{File URL}}",
    "Status": "Pending Review",
    "Category": "{{Extract from folder name}}"
  }
  ```

#### Setup Instructions
1. Connect Box: https://developer.box.com → Create App → OAuth 2.0
2. Authorize Box in Zapier
3. Create "File Log" table in Coda

---

### Workflow 2.2: Box File Change → Airtable Update & Notification

**Platform:** Make.com  
**Priority:** Low

#### Trigger
- **App:** Box
- **Event:** File Updated
- **Folder:** "Revenue Models" or specific folder

#### Actions

**Step 1: Get Updated File**
- **App:** Box
- **Action:** Get File Info
- **File ID:** {{File ID}}

**Step 2: Check if Revenue-Related**
- **App:** Router
- **Condition:** File name contains "revenue" OR "₹" OR "projection"

**Step 3: Update Airtable**
- **App:** Airtable
- **Action:** Update Record
- **Base:** "91 Projects"
- **Table:** "Project Tracking"
- **Record ID:** {{Lookup by file name}}
- **Fields:**
  - Last Updated: {{Current Date}}
  - File Version: {{File Version}}

**Step 4: Send Notification**
- **App:** Gmail
- **Action:** Send Email
- **To:** {{Your Email}}
- **Subject:** Revenue Model Updated
- **Body:** `File {{File Name}} was updated. Check ₹ projections.`

---

### Workflow 2.3: Scheduled Box Backup → Google Drive/OneDrive

**Platform:** n8n (Self-hosted)  
**Priority:** Low

#### Trigger
- **App:** Cron
- **Schedule:** `0 0 * * 0` (Every Sunday at midnight)

#### Actions

**Step 1: List New/Updated Files**
- **App:** Box
- **Action:** List Files
- **Filter:** Modified in last 7 days

**Step 2: Download File**
- **App:** Box
- **Action:** Download File
- **File ID:** {{File ID}}

**Step 3: Upload to Backup**
- **App:** Google Drive (or OneDrive)
- **Action:** Upload File
- **Folder:** "Box Backup/{{Current Week}}"
- **File:** {{Downloaded File}}

**Step 4: Log Backup**
- **App:** Coda
- **Action:** Create Row
- **Table:** "Backup Log"
- **Row Data:**
  ```json
  {
    "File Name": "{{File Name}}",
    "Backup Date": "{{Current Date}}",
    "Backup Location": "Google Drive",
    "Status": "Success"
  }
  ```

---

## 3. CRM & Client Ops (Salesforce/HubSpot-Centric)

### Workflow 3.1: New Salesforce Opportunity → Todoist Task & Coda Hub

**Platform:** Zapier  
**Priority:** High (CSM Critical)

#### Trigger
- **App:** Salesforce
- **Event:** New Opportunity Created
- **Filters:**
  - Stage contains "Renewal" OR "Expansion"
  - Account Type = "Enterprise"

#### Actions

**Step 1: Get Opportunity Details**
- **App:** Salesforce
- **Action:** Find Record
- **Object:** Opportunity
- **Record ID:** {{Opportunity ID}}

**Step 2: Create Todoist Task**
- **App:** Todoist
- **Action:** Create Task
- **Content:** `Stakeholder mapping for {{Account Name}}`
- **Project:** "Salesforce CSM"
- **Labels:** `@csm`, `@{{Account Name}}`
- **Due Date:** 7 days from now
- **Description:** `Opportunity: {{Opportunity Name}}\nValue: {{Amount}}\nStage: {{Stage}}\nClose Date: {{Close Date}}\n\nTasks:\n- Map stakeholders\n- Review account health\n- Prepare renewal deck`

**Step 3: Add to Coda CSM Hub**
- **App:** Coda
- **Action:** Upsert Row
- **Table:** "CSM Opportunities"
- **Row Data:**
  ```json
  {
    "Account Name": "{{Account Name}}",
    "Opportunity Name": "{{Opportunity Name}}",
    "Amount": "{{Amount}}",
    "Stage": "{{Stage}}",
    "Close Date": "{{Close Date}}",
    "Salesforce ID": "{{Opportunity ID}}",
    "Health Score": "",
    "Status": "Active"
  }
  ```

#### Setup Instructions
1. Connect Salesforce: Setup → App Manager → New Connected App
2. Enable OAuth settings
3. Add to Zapier: Use OAuth connection
4. Create "CSM Opportunities" table in Coda

---

### Workflow 3.2: HubSpot Form Submission → IntegrateWise Pipeline

**Platform:** HubSpot Native + Zapier  
**Priority:** High (Revenue)

#### Trigger
- **App:** HubSpot
- **Event:** Form Submission
- **Form:** "14-Day Trial" or "Contact Us"

#### Actions

**Step 1: Create/Update Contact**
- **App:** HubSpot (Native Workflow)
- **Action:** Create Contact
- **Fields:** Map form fields

**Step 2: Create Airtable Record**
- **App:** Airtable
- **Action:** Create Record
- **Base:** "Client Delivery"
- **Table:** "Leads"
- **Fields:**
  ```json
  {
    "Name": "{{First Name}} {{Last Name}}",
    "Email": "{{Email}}",
    "Company": "{{Company}}",
    "Source": "HubSpot Form",
    "Status": "New Lead",
    "Created": "{{Current Date}}"
  }
  ```

**Step 3: Create Todoist Task**
- **App:** Todoist
- **Action:** Create Task
- **Content:** `Follow up on lead: {{Name}} ({{Company}})`
- **Project:** "IntegrateWise Sales"
- **Labels:** `@revenue_stream`, `@follow_up`
- **Due Date:** Tomorrow
- **Description:** `Email: {{Email}}\nCompany: {{Company}}\nSource: HubSpot\n\nAction: Send welcome email and schedule intro call`

**Step 4: Generate Email with Grok**
- **App:** Webhooks by Zapier
- **Method:** POST
- **URL:** `https://api.x.ai/v1/chat/completions`
- **Body:**
  ```json
  {
    "model": "grok-beta",
    "messages": [
      {
        "role": "system",
        "content": "You are a sales email writer. Write a personalized, professional welcome email for IntegrateWise."
      },
      {
        "role": "user",
        "content": "Lead: {{Name}} from {{Company}}. They signed up for 14-day trial. Write a welcome email."
      }
    ]
  }
  ```

**Step 5: Send Email**
- **App:** Gmail
- **Action:** Send Email
- **To:** {{Email}}
- **Subject:** Welcome to IntegrateWise - Let's Get Started
- **Body:** {{Grok Response}}

#### Setup Instructions
1. Set up HubSpot form on website
2. Create HubSpot workflow for basic actions
3. Connect Zapier for cross-platform sync
4. Get xAI API key for email generation

---

### Workflow 3.3: Salesforce Risk Alert → Urgent Todoist Task

**Platform:** Make.com  
**Priority:** Critical

#### Trigger
- **App:** Webhook (Custom)
- **URL:** `https://hook.make.com/{{WEBHOOK_ID}}`
- **Method:** POST

#### Setup in Salesforce
Create a Flow or Process Builder:
- **Trigger:** Custom field "Risk_Flag" = True
- **Action:** Call Webhook
- **URL:** {{Make.com Webhook URL}}
- **Payload:**
  ```json
  {
    "account_id": "{{Account.Id}}",
    "account_name": "{{Account.Name}}",
    "risk_reason": "{{Risk_Reason__c}}",
    "severity": "{{Severity__c}}"
  }
  ```

#### Actions in Make.com

**Step 1: Receive Webhook**
- **App:** Webhook
- **Event:** Custom Webhook

**Step 2: Create Urgent Todoist Task**
- **App:** Todoist
- **Action:** Create Task
- **Content:** `🚨 RISK ALERT: {{account_name}} - {{risk_reason}}`
- **Priority:** 4 (Highest)
- **Labels:** `@urgent`, `@csm`, `@risk`
- **Due Date:** Today
- **Project:** "Salesforce CSM"

**Step 3: Send Slack Alert**
- **App:** Slack
- **Action:** Create Message
- **Channel:** #csm-alerts
- **Text:** `🚨 *Risk Alert*\n*Account:* {{account_name}}\n*Reason:* {{risk_reason}}\n*Severity:* {{severity}}\n\nAction required immediately.`

**Step 4: Update Coda**
- **App:** Coda
- **Action:** Update Row
- **Table:** "CSM Accounts"
- **Row ID:** {{Lookup by account_name}}
- **Updates:**
  - Risk Status: "Active"
  - Risk Reason: {{risk_reason}}
  - Last Alert: {{Current Date}}

---

## 4. Dev & Deployment (Cursor/Vercel-Centric)

### Workflow 4.1: GitHub Push → Vercel Deploy & Todoist Update

**Platform:** Zapier  
**Priority:** Medium

#### Trigger
- **App:** GitHub
- **Event:** Push to Repository
- **Repository:** {{Your Repo}}
- **Branch:** `main` or `production`

#### Actions

**Step 1: Trigger Vercel Deploy**
- **App:** Vercel (via Webhook)
- **Method:** POST
- **URL:** `https://api.vercel.com/v1/integrations/deployments`
- **Headers:**
  ```json
  {
    "Authorization": "Bearer {{VERCEL_API_TOKEN}}"
  }
  ```
- **Body:**
  ```json
  {
    "name": "{{Repository Name}}",
    "gitSource": {
      "type": "github",
      "repo": "{{Repository Full Name}}",
      "ref": "{{Branch}}"
    }
  }
  ```

**Step 2: Create Todoist Task**
- **App:** Todoist
- **Action:** Create Task
- **Content:** `Test deployed changes: {{Commit Message}}`
- **Project:** "IntegrateWise Dev"
- **Labels:** `@dev_tools`, `@testing`
- **Due Date:** Today
- **Description:** `Commit: {{Commit Message}}\nAuthor: {{Commit Author}}\nDeploy URL: {{Vercel Deploy URL}}\n\nChecklist:\n- [ ] Test homepage\n- [ ] Test forms\n- [ ] Check mobile responsiveness`

**Step 3: Log in Coda**
- **App:** Coda
- **Action:** Create Row
- **Table:** "Deployments"
- **Row Data:**
  ```json
  {
    "Deploy Date": "{{Current Date}}",
    "Commit Message": "{{Commit Message}}",
    "Author": "{{Commit Author}}",
    "Branch": "{{Branch}}",
    "Vercel URL": "{{Deploy URL}}",
    "Status": "Deployed",
    "Test Status": "Pending"
  }
  ```

#### Setup Instructions
1. Get Vercel API Token: Vercel Dashboard → Settings → Tokens
2. Connect GitHub in Zapier
3. Create "Deployments" table in Coda
4. Set up Vercel project if not already done

---

### Workflow 4.2: New Coda Page → Box Archive & Airtable Sync

**Platform:** Zapier  
**Priority:** Low

#### Trigger
- **App:** Coda
- **Event:** New Page Created
- **Doc ID:** {{CODA_DOC_ID}}
- **Filters:**
  - Page name contains "Mission" OR "Vision" OR "Strategy"

#### Actions

**Step 1: Export Page as PDF**
- **App:** Coda
- **Action:** Export Page
- **Format:** PDF
- **Page ID:** {{Page ID}}

**Step 2: Upload to Box**
- **App:** Box
- **Action:** Upload File
- **Folder:** "IntegrateWise Archives/Documents"
- **File:** {{PDF Export}}
- **File Name:** `{{Page Name}} - {{Date}}.pdf`

**Step 3: Update Airtable**
- **App:** Airtable
- **Action:** Create Record
- **Base:** "FlowTrix"
- **Table:** "Artifacts"
- **Fields:**
  ```json
  {
    "Name": "{{Page Name}}",
    "Type": "Document",
    "Source": "Coda",
    "Box Link": "{{Box File URL}}",
    "Created": "{{Current Date}}"
  }
  ```

---

### Workflow 4.3: Tool Comparison Alert → Research Task

**Platform:** n8n  
**Priority:** Low

#### Trigger
- **App:** Schedule
- **Frequency:** Bi-weekly (Every 2 weeks)
- **Day:** Monday

#### Actions

**Step 1: Fetch RSS/API Feeds**
- **App:** HTTP Request
- **Method:** GET
- **URLs:**
  - Make.com changelog RSS
  - Zapier updates API
  - n8n release notes

**Step 2: Parse Updates**
- **App:** Code (JavaScript)
- **Code:**
  ```javascript
  const feeds = inputData.feeds || [];
  const newFeatures = [];
  
  feeds.forEach(feed => {
    feed.items.forEach(item => {
      if (item.title.toLowerCase().includes('feature') || 
          item.title.toLowerCase().includes('update')) {
        newFeatures.push({
          tool: feed.name,
          title: item.title,
          link: item.link,
          date: item.pubDate
        });
      }
    });
  });
  
  return { newFeatures };
  ```

**Step 3: Create Research Task (if new features found)**
- **App:** Todoist
- **Action:** Create Task
- **Content:** `Research: {{tool}} new features - {{title}}`
- **Project:** "Tool Research"
- **Labels:** `@research`, `@automation`
- **Description:** `{{link}}\n\nEvaluate for IntegrateWise workflows.`

---

## 5. Finance & Ops (Zoho/Stripe-Centric)

### Workflow 5.1: Zoho Invoice Created → Todoist Reconciliation Task

**Platform:** Zapier  
**Priority:** Medium

#### Trigger
- **App:** Zoho Books
- **Event:** New Invoice Created
- **Filters:**
  - Status = "Sent" OR "Paid"

#### Actions

**Step 1: Get Invoice Details**
- **App:** Zoho Books
- **Action:** Get Invoice
- **Invoice ID:** {{Invoice ID}}

**Step 2: Create Todoist Task**
- **App:** Todoist
- **Action:** Create Task
- **Content:** `Reconcile GST for Invoice #{{Invoice Number}}`
- **Project:** "IntegrateWise Operations"
- **Labels:** `@iw_ops`, `@finance`, `@gst`
- **Due Date:** End of current month
- **Description:** `Invoice: #{{Invoice Number}}\nCustomer: {{Customer Name}}\nAmount: ₹{{Total Amount}}\nDate: {{Invoice Date}}\n\nTasks:\n- Verify GST calculation\n- Update GST tracker\n- File if due`

**Step 3: Update Coda Revenue Table**
- **App:** Coda
- **Action:** Upsert Row
- **Table:** "Revenue"
- **Row Data:**
  ```json
  {
    "Invoice Number": "{{Invoice Number}}",
    "Customer": "{{Customer Name}}",
    "Amount": "{{Total Amount}}",
    "GST": "{{GST Amount}}",
    "Date": "{{Invoice Date}}",
    "Status": "{{Status}}",
    "Reconciled": false
  }
  ```

#### Setup Instructions
1. Connect Zoho Books: https://books.zoho.com → Settings → API → Generate Token
2. Create "Revenue" table in Coda
3. Set up GST tracking columns

---

### Workflow 5.2: Stripe Payment Received → Revenue Update

**Platform:** Make.com  
**Priority:** High (Revenue Tracking)

#### Trigger
- **App:** Stripe
- **Event:** Payment Succeeded
- **Filters:**
  - Currency = "INR" (or your currency)

#### Actions

**Step 1: Get Payment Details**
- **App:** Stripe
- **Action:** Get Payment
- **Payment ID:** {{Payment ID}}

**Step 2: Update Revenue Spreadsheet**
- **App:** Google Sheets (or Airtable)
- **Action:** Add Row
- **Sheet:** "Revenue Tracker"
- **Row Data:**
  ```json
  {
    "Date": "{{Payment Date}}",
    "Amount": "{{Amount}}",
    "Currency": "{{Currency}}",
    "Customer": "{{Customer Email}}",
    "Source": "Stripe",
    "Type": "{{Product/Service}}"
  }
  ```

**Step 3: Update Projections**
- **App:** Code (JavaScript)
- **Code:**
  ```javascript
  const currentRevenue = inputData.current_revenue || 0;
  const newPayment = inputData.payment_amount || 0;
  const updatedRevenue = currentRevenue + newPayment;
  
  // Calculate if we're on track for ₹5.5Cr annual target
  const annualTarget = 55000000; // ₹5.5Cr
  const monthlyTarget = annualTarget / 12;
  const progress = (updatedRevenue / monthlyTarget) * 100;
  
  return {
    updated_revenue: updatedRevenue,
    monthly_progress: progress,
    on_track: progress >= 100
  };
  ```

**Step 4: Send Notification (if milestone)**
- **App:** Router
- **Condition:** {{updated_revenue}} >= milestone (e.g., ₹10L, ₹50L)

**Then:** Send Email/Slack
- **Subject:** Revenue Milestone Reached!
- **Body:** `Current revenue: ₹{{updated_revenue}}\nProgress: {{monthly_progress}}% of monthly target`

#### Setup Instructions
1. Connect Stripe: Dashboard → Developers → API Keys
2. Create "Revenue Tracker" spreadsheet
3. Set up webhook in Stripe: Dashboard → Webhooks → Add endpoint

---

### Workflow 5.3: Monthly Finance Review → Full Sync

**Platform:** n8n  
**Priority:** Medium

#### Trigger
- **App:** Schedule
- **Frequency:** Monthly
- **Day:** 1st of month
- **Time:** 9:00 AM IST

#### Actions

**Step 1: Pull Zoho Data**
- **App:** Zoho Books
- **Action:** List Invoices
- **Filter:** Created last month

**Step 2: Pull EMI Tracker Data**
- **App:** Google Sheets (or CSV import)
- **Action:** Read Rows
- **Sheet:** "EMI Tracker"

**Step 3: Aggregate Finance Data**
- **App:** Code (JavaScript)
- **Code:**
  ```javascript
  const invoices = inputData.invoices || [];
  const emis = inputData.emis || [];
  
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalEMI = emis.reduce((sum, emi) => sum + emi.amount, 0);
  const netCash = totalRevenue - totalEMI;
  
  // Check for penalties
  const overdueEMIs = emis.filter(emi => 
    new Date(emi.due_date) < new Date() && emi.status !== 'Paid'
  );
  
  return {
    total_revenue: totalRevenue,
    total_emi: totalEMI,
    net_cash: netCash,
    overdue_emis: overdueEMIs.length,
    penalties: overdueEMIs.reduce((sum, emi) => sum + (emi.penalty || 0), 0)
  };
  ```

**Step 4: Update Todoist**
- **App:** Todoist
- **Action:** Create Task
- **Content:** `Monthly Finance Review - {{Month}}`
- **Description:** `Revenue: ₹{{total_revenue}}\nEMI: ₹{{total_emi}}\nNet: ₹{{net_cash}}\n\n⚠️ Overdue EMIs: {{overdue_emis}}\nPenalties: ₹{{penalties}}`

**Step 5: Update Coda**
- **App:** Coda
- **Action:** Create Row
- **Table:** "Monthly Finance"
- **Row Data:** {{finance_summary}}

**Step 6: Update Airtable**
- **App:** Airtable
- **Action:** Create Record
- **Base:** "Finance"
- **Table:** "Monthly Reports"
- **Fields:** {{finance_summary}}

**Step 7: Send Alert (if penalties)**
- **App:** Router
- **Condition:** {{penalties}} > 0

**Then:** Send Email
- **Subject:** ⚠️ Finance Alert: Overdue EMIs Detected
- **Body:** `{{overdue_emis}} EMIs overdue. Total penalties: ₹{{penalties}}`

---

## 6. Personal & Deep Work (Cross-Tool)

### Workflow 6.1: Deep Work Block Start → Focus Mode

**Platform:** Zapier  
**Priority:** Low (Personal Productivity)

#### Trigger
- **App:** Todoist
- **Event:** Task Due
- **Filters:**
  - Label contains `@deepwork`
  - Status = "In Progress" (or manually started)

#### Actions

**Step 1: Send Slack DND**
- **App:** Slack
- **Action:** Update User Status
- **Status:** "In Deep Work"
- **Emoji:** 🧠
- **Duration:** 2 hours (or task estimated time)

**Step 2: Log Session Start**
- **App:** Coda
- **Action:** Create Row
- **Table:** "Deep Work Sessions"
- **Row Data:**
  ```json
  {
    "Task": "{{Task Content}}",
    "Start Time": "{{Current Time}}",
    "Project": "{{Project Name}}",
    "Estimated Duration": "{{Task Estimated Time}}",
    "Status": "Active"
  }
  ```

**Step 3: Set Reminder (Optional)**
- **App:** Todoist
- **Action:** Create Task
- **Content:** `End deep work session: {{Task Content}}`
- **Due Date:** {{Start Time + Estimated Duration}}
- **Labels:** `@reminder`

---

### Workflow 6.2: Weekly Review Trigger → Digest

**Platform:** Make.com  
**Priority:** Medium

#### Trigger
- **App:** Schedule
- **Frequency:** Weekly
- **Day:** Sunday
- **Time:** 6:00 PM IST

**OR**

- **App:** Todoist
- **Event:** Task Completed
- **Filters:**
  - Task contains "Weekly Review"
  - Label contains `@weekly`

#### Actions

**Step 1: Fetch Completed Tasks**
- **App:** Todoist
- **Action:** List Completed Tasks
- **Filter:** Completed in last 7 days
- **Group by:** Project

**Step 2: Compile Digest**
- **App:** Code (JavaScript)
- **Code:**
  ```javascript
  const tasks = inputData.tasks || [];
  const projects = {};
  
  tasks.forEach(task => {
    const project = task.project_name || 'Inbox';
    if (!projects[project]) {
      projects[project] = [];
    }
    projects[project].push({
      content: task.content,
      completed: task.completed_date,
      labels: task.labels
    });
  });
  
  let digest = "# Weekly Review Digest\n\n";
  Object.keys(projects).forEach(project => {
    digest += `## ${project}\n`;
    projects[project].forEach(task => {
      digest += `- ✅ ${task.content} (${task.completed})\n`;
    });
    digest += "\n";
  });
  
  return { digest };
  ```

**Step 3: Send to Grok for Insights**
- **App:** Webhooks
- **Method:** POST
- **URL:** `https://api.x.ai/v1/chat/completions`
- **Body:**
  ```json
  {
    "model": "grok-beta",
    "messages": [
      {
        "role": "system",
        "content": "You are a productivity coach. Analyze weekly task completion and provide insights on: 1) Patterns (what worked well), 2) Areas for improvement, 3) Recommendations for next week. Be concise and actionable."
      },
      {
        "role": "user",
        "content": "{{digest}}\n\nProvide insights and recommendations."
      }
    ]
  }
  ```

**Step 4: Update Health Scores**
- **App:** Coda
- **Action:** Update Row
- **Table:** "Project Health Scores"
- **Row ID:** Current Week
- **Updates:**
  - Tasks Completed: {{Task Count}}
  - Weekly Insights: {{Grok Response}}
  - Review Date: {{Current Date}}

**Step 5: Send Digest Email**
- **App:** Gmail
- **Action:** Send Email
- **To:** {{Your Email}}
- **Subject:** Weekly Review - {{Week Date Range}}
- **Body:** `{{digest}}\n\n---\n\n## Insights\n\n{{Grok Response}}`

---

## Implementation Roadmap

### Phase 1: Core Workflows (Week 1)
**Priority:** Start with 3-5 workflows

1. ✅ **Todoist-Grok Integration** (Workflow 1.1)
   - Setup time: 30 minutes
   - Test: Create task with `@urgent` label

2. ✅ **Daily Todoist Digest** (Workflow 1.3)
   - Setup time: 20 minutes
   - Test: Run manually, verify Slack message

3. ✅ **Salesforce Opportunity → Todoist** (Workflow 3.1)
   - Setup time: 45 minutes
   - Test: Create test opportunity in Salesforce

4. ✅ **HubSpot Form → Pipeline** (Workflow 3.2)
   - Setup time: 30 minutes
   - Test: Submit test form

5. ✅ **GitHub → Vercel Deploy** (Workflow 4.1)
   - Setup time: 20 minutes
   - Test: Push test commit

### Phase 2: File & Finance (Week 2)
- Box file workflows
- Zoho invoice reconciliation
- Stripe revenue tracking

### Phase 3: Advanced (Week 3-4)
- n8n self-hosted workflows
- Custom webhooks
- Advanced branching

---

## Tools & Costs

### Zapier
- **Free Tier:** 100 tasks/month (5 Zaps)
- **Starter:** $19.99/month (750 tasks, 20 Zaps)
- **Professional:** $49/month (2,000 tasks, unlimited Zaps)
- **Best for:** Simple, linear workflows

### Make.com
- **Free Tier:** 1,000 operations/month
- **Core:** $9/month (10,000 operations)
- **Pro:** $29/month (40,000 operations)
- **Best for:** Complex branching, data transformation

### n8n
- **Self-hosted:** Free (unlimited)
- **Cloud:** $20/month (unlimited)
- **Best for:** Advanced workflows, custom logic

### API Costs
- **xAI (Grok):** ~$0.01 per request (pay-per-use)
- **Todoist API:** Free (included with subscription)
- **Coda API:** Free (included)
- **Airtable API:** Free tier (1,200 requests/month)

---

## Security & Compliance

### Best Practices
1. **API Keys:** Store in environment variables, never in code
2. **Webhooks:** Use HTTPS only, validate signatures
3. **PII:** Avoid storing sensitive data in automation logs
4. **Access Control:** Use OAuth where possible, limit API scopes
5. **Audit:** Log all automation executions

### For MCA/GST Filings
- Add manual approval steps before file operations
- Encrypt sensitive documents
- Maintain audit trail in Coda

---

## Monitoring & Maintenance

### Dashboard Setup
Create Coda dashboard:
- **Workflow Health:** Uptime, error rates
- **Execution Logs:** Recent runs, failures
- **Cost Tracking:** API usage, tool costs
- **Performance:** Average execution time

### Error Handling
All workflows should include:
- Retry logic (3 attempts with exponential backoff)
- Error notifications (Slack/Email)
- Fallback actions
- Logging to Coda

---

## Testing Checklist

### Before Going Live
- [ ] Test each workflow individually
- [ ] Verify data synchronization (Coda ↔ Notion ↔ Airtable)
- [ ] Confirm alert delivery (Slack/Email)
- [ ] Check error handling
- [ ] Validate API rate limits
- [ ] Test with real data (small sample)
- [ ] Document any customizations

### Post-Deployment
- [ ] Monitor first 24 hours closely
- [ ] Check for duplicate tasks/records
- [ ] Verify webhook reliability
- [ ] Review costs (API usage)
- [ ] Gather team feedback
- [ ] Adjust filters/rules as needed

---

## Support & Troubleshooting

### Common Issues

**Issue:** Duplicate tasks created
- **Solution:** Add deduplication logic (check existing tasks before creating)

**Issue:** Webhook not triggering
- **Solution:** Verify webhook URL, check firewall, validate payload format

**Issue:** API rate limits exceeded
- **Solution:** Add delays, batch operations, upgrade plan

**Issue:** Data sync conflicts
- **Solution:** Implement conflict resolution (last-write-wins or manual review)

### Getting Help
- Zapier: https://zapier.com/help
- Make.com: https://www.make.com/en/help
- n8n: https://docs.n8n.io
- xAI API: https://x.ai/api/docs

---

## Next Steps

1. **Choose Your Platform:** Start with Zapier (easiest) or Make.com (more powerful)
2. **Set Up Accounts:** Create accounts, get API keys
3. **Start Small:** Implement 3-5 core workflows first
4. **Test Thoroughly:** Use test data before going live
5. **Iterate:** Add more workflows as you get comfortable
6. **Monitor:** Track performance and costs

**Remember:** Start with workflows that solve immediate pain points (renewals, revenue tracking, daily reviews). You can always add more later!

---

*Last Updated: {{Current Date}}*  
*Version: 1.0*
