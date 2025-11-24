# Integratewise - Coda Control Layer Schema

**Role:** Operational OS ("The Control Center").
**Data Source:** Synced from Notion via Zapier.
**Primary Users:** Founder, Partners, Freelancers.

## 1. Doc Structure (Pages & Views)

### A. "Command Center" (Dashboard)
*   **KPI Cards:**
    *   Active Projects (Count)
    *   Revenue this Month (Sum from Projects)
    *   Pipeline Value (Sum from CRM Leads)
    *   *Partnership %* (Formula: Partner-led revenue / Total revenue)
*   **My Tasks:** Filtered view of [Tasks] where `Assignee` = CurrentUser.
*   **Overdue:** High-priority alerts.

### B. Sales & CRM (View Only)
*   *Data synced from Notion CRM.*
*   **Pipeline View:** Kanban board of Deals by Stage.
*   **Action:** Button "Create Proposal" -> Triggers a Coda automation to generate a Google Doc proposal from a template using client data.

### C. Project Management (The Engine)
*   **All Projects Table:** Master list.
    *   *Columns:* Name, Client, Status, Progress (%), Budget, Lead Partner.
    *   *Sub-table:* Linked Tasks.
*   **Gantt View:** Visual timeline of projects.
*   **Workload View:** Group Tasks by `Assignee` to see if any Partner is overloaded.

### D. Academy Management
*   **Cohorts Table:** Active batches.
*   **Student Tracker:**
    *   *Columns:* Name, Payment Status, Attendance, Assignment Scores.
    *   *Action:* "Send Reminder" button -> Gmail Pack integration.

## 2. Tables & Schema

### Table: Projects_Sync
*   `Name` (Text)
*   `Status` (Select)
*   `Notion_ID` (Text, Hidden) - *Link to Notion*
*   `Zapier_Trigger` (Button) - *Push updates back to Notion*

### Table: Tasks_Sync
*   `Task Name` (Text)
*   `Status` (Select: To Do, In Progress, Done)
*   `Assignee` (People)
*   `Notion_ID` (Text, Hidden)
*   `Project_Link` (Lookup -> Projects_Sync)

## 3. Automations (Coda Native)

1.  **Daily Briefing:** Every morning at 8 AM, email the Founder a summary of "Due Today" tasks and "New Leads".
2.  **Stale Lead Alert:** If a Lead in "Qualification" hasn't been updated in 7 days, post a message to Slack.
3.  **Proposal Generator:** On click of "Generate Proposal", use the Coda Google Docs Pack to duplicate a template and fill in Client Name, Fee, and Date.

## 4. Controls (The "Write Back" Logic)

Since Coda is the **Control Layer**, we need buttons that trigger Zaps or updates.
*   **"Mark Done" Button:**
    1.  Sets Coda row status to "Done".
    2.  Triggers Zapier Webhook.
    3.  Zapier finds Notion Page by `Notion_ID` and updates Status to "Done".

