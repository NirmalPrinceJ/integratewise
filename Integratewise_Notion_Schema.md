# Integratewise - Company Page & Data Layer Schema (Notion)

**Role:** Central Data Layer ("Source of Truth").
**Integration:** Synced to Coda (Control Layer) via Zapier.

## 1. Company Dashboard (Root Page)
**Title:** Integratewise HQ
**Description:** Central hub for integration advisory, delivery network, and training academy.

## 2. Core Databases (The Data Layer)

### A. CRM (Clients & Leads)
*Stores all potential and active business relationships.*
*   **Properties:**
    *   `Name` (Title) - Client Company or Lead Name
    *   `Status` (Select: Lead, Qualification, Proposal Sent, Active Client, Churned, Partner)
    *   `Contact Person` (Text)
    *   `Email` (Email)
    *   `Service Interest` (Multi-select: Health Check, Automation Accelerator, Custom Project, Retainer, Strategy Session, CoE Setup)
    *   `Lead Source` (Select: LinkedIn, Referral, Academy Alumni, Event)
    *   `Total Value` (Number)
    *   `Next Follow-up` (Date)
    *   `Owner` (Person) - Typically Founder for Sales
    *   `Notion_ID` (Formula: `id()`) - *Crucial for Zapier lookups*

### B. Projects (Engagements)
*High-level engagements. Distinguished by service type.*
*   **Properties:**
    *   `Project Name` (Title)
    *   `Client` (Relation -> CRM)
    *   `Service Type` (Select: Custom Implementation, Health Check, Retainer, Workshop)
    *   `Status` (Select: Planned, In Progress, On Hold, Completed)
    *   `Start Date` (Date)
    *   `Due Date` (Date)
    *   `Budget` (Number)
    *   `Delivery Partner` (Relation -> Team & Partners) - *Critical for Partner-led model*
    *   `Architecture Link` (URL) - *Link to technical docs*
    *   `Notion_ID` (Formula: `id()`)

### C. Team & Partners (The Network)
*Registry of Freelancers, Equity Partners, and Juniors. "Success through others".*
*   **Properties:**
    *   `Name` (Title)
    *   `Role` (Select: Equity Partner, Core Freelancer, Junior/Intern, Instructor)
    *   `Skillset` (Multi-select: MuleSoft, Zapier, Salesforce, Coda, QA)
    *   `Hourly Rate/Share` (Number)
    *   `Status` (Select: Active, Bench, Alumni)
    *   `Active Projects` (Relation -> Projects)

### D. Training Academy (Cohorts)
*Management for the "IntegrateWise Academy" revenue stream.*
*   **Properties:**
    *   `Cohort Name` (Title) - e.g., "MuleSoft Bootcamp Jan '26"
    *   `Start Date` (Date)
    *   `Status` (Select: Open for Registration, In Progress, Completed)
    *   `Seats Total` (Number) - *Target 27*
    *   `Seats Filled` (Number)
    *   `Students` (Relation -> Students DB or Sub-table)

### E. Tasks & Actions
*Granular work items. Synced to Coda for daily management.*
*   **Properties:**
    *   `Task Name` (Title)
    *   `Project` (Relation -> Projects)
    *   `Assigned To` (Relation -> Team & Partners)
    *   `Due Date` (Date)
    *   `Status` (Select: To Do, In Progress, Review, Done)
    *   `Priority` (Select: High, Medium, Low)

### F. Content Engine (Marketing)
*Tracking the 9 posts/week strategy.*
*   **Properties:**
    *   `Topic` (Title)
    *   `Channel` (Select: LinkedIn, Blog, Newsletter)
    *   `Status` (Select: Idea, Drafting, Scheduled, Published)
    *   `Publish Date` (Date)
    *   `Content Pillar` (Select: Integration Strategy, Automation, API Economy, Client Wins, Astro-Mindset)

## 3. Data Relationships (Schema)

*   **CRM** 1 <-> ∞ **Projects**
*   **Projects** 1 <-> ∞ **Tasks**
*   **Team** 1 <-> ∞ **Projects** (Lead/Delivery)
*   **Team** 1 <-> ∞ **Tasks** (Assignment)

## 4. Integration Key (Zapier Prep)
*   **Unique ID:** Every database MUST have the `id()` formula property exposed.
*   **Last Edited:** Every database MUST have `Last Edited Time` visible.
