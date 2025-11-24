# Action Plan: IntegrateWise System Setup

This guide outlines the steps to build your **Notion (Data) + Coda (Control)** operating system.

## Phase 1: Notion Setup (The "Truth" Layer)
*Goal: Create the static database structure.*

1.  **Create the Team Workspace:** Name it `IntegrateWise HQ`.
2.  **Build the Core Databases:**
    *   Create a new page called "Data Backend".
    *   Inside, create 4 Full-Page Databases: `CRM`, `Projects`, `Team`, `Training Academy`.
    *   *Action:* Add the properties listed in `Integratewise_Notion_Schema.md`.
    *   **Crucial:** Add a formula property named `Notion_ID` with the formula `id()` to **every** database.
3.  **Set up Relations:**
    *   Link `Projects` to `CRM`.
    *   Link `Projects` to `Team`.
    *   Link `Training Academy` to `CRM` (or a separate Students table).

## Phase 2: Coda Setup (The "Control" Layer)
*Goal: Create the interactive dashboard.*

1.  **Create a New Doc:** Title it `IntegrateWise OS`.
2.  **Create Base Tables:**
    *   Create tables for `Tasks`, `Projects`, and `CRM` manually first (or wait for Zapier to fill them).
    *   Add the `Notion_ID` column (set column type to Text) and hide it.
3.  **Build Views:**
    *   Create a "Command Center" page.
    *   Add a "My Tasks" view filtered by `User()`.
    *   Add a "Sales Pipeline" board view.

## Phase 3: Zapier Connection (The Bridge)
*Goal: Sync data between the two.*

1.  **Connect Accounts:** Authenticate Notion and Coda in Zapier.
2.  **Build Zap 1 (CRM Sync):**
    *   *Trigger:* Notion "New Database Item" (CRM).
    *   *Action:* Coda "Upsert Row" (Clients Table).
3.  **Build Zap 2 (Task Sync):**
    *   *Trigger:* Coda "Row Updated" (Status changed).
    *   *Action:* Notion "Update Database Item" (Search by `Notion_ID`).
4.  **Test:** Create a dummy client in Notion and watch it appear in Coda.

## Phase 4: Launch & Import
1.  **Import Data:** If you have existing CSVs, import them into Notion first.
2.  **Onboard Team:** Invite Partners/Freelancers to **Coda only** (keep Notion for admin/truth if desired, or give them limited Notion access).
3.  **Go Live:** Start managing daily tasks in Coda.

