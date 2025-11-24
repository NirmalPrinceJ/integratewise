# Integratewise - Zapier Integration Plan (Notion <-> Coda)

## Strategy: The "Data vs. Control" Split
*   **Notion:** The persistent database and document store.
*   **Coda:** The operational "OS" for daily management, views, and automations.
*   **Zapier:** The bridge ensuring they stay in sync.

## Workflow 1: Sales to Project Handoff (Notion -> Coda)
**Trigger:** Notion - CRM Status changed to "Active Client"
**Action:**
1.  **Create Folder/Section in Coda:** Create a new collaborative workspace for the client.
2.  **Create Project Row in Coda:** Sync the Project details (Budget, Timeline) to Coda's "Active Projects" table.
3.  **Notify Team:** Send Slack message to #projects channel.

## Workflow 2: Task Synchronization (Two-Way)
*High volume sync. Requires careful "Loop Protection".*

### A. Notion -> Coda (Creation)
**Trigger:** New Item in "Tasks" (Notion)
**Action:** Create Row in "Tasks" (Coda)
*   *Mapping:* Name, Project, Due Date.
*   *Store ID:* Save Notion_ID into Coda's `External_ID` column.

### B. Coda -> Notion (Status & Updates)
**Trigger:** Row Updated in "Tasks" (Coda) - *Specifically "Status" or "Assignee"*
**Action:** Update Database Item in Notion
*   *Lookup:* Find Notion Item by `External_ID`.
*   *Update:* Set Notion Status to match Coda.

## Workflow 3: Training Cohort Registration (Web/Payment -> Notion)
**Trigger:** Razorpay Payment / Web Form Submission (New Student)
**Action:**
1.  **Create Item in CRM:** Tag as "Student".
2.  **Add to Cohort:** Link to the active "Training Academy" batch in Notion.
3.  **Send Email:** Welcome kit via Gmail/ConvertKit.

## Workflow 4: Marketing Calendar Sync (Notion -> Buffer/LinkedIn)
*Optional automation for the Content Engine.*
**Trigger:** Notion Content Status -> "Ready to Publish"
**Action:** Add to Buffer Queue or Create Draft in LinkedIn.

## Technical Requirements for Coda
To support this, the Coda doc needs:
1.  **Tables:** Clients, Projects, Tasks, Team.
2.  **Hidden Columns:** `Notion_ID`, `Notion_Link` in every synced table.
3.  **Packs:** Zapier Pack (or generic Webhooks) enabled.
