#!/usr/bin/env node
/**
 * Vault Sync Tool - GitHub Integration
 * 
 * Syncs Obsidian vault to GitHub repository
 * - Auto-commits and pushes changes
 * - Uses GitHub token from environment
 * - No secrets hardcoded
 * 
 * Usage:
 *     GITHUB_TOKEN=your_token \
 *     GIT_REPO=https://github.com/integratewise/knowledge.git \
 *     VAULT_PATH=/path/to/vault \
 *     GIT_BRANCH=main \
 *     node vault_sync.ts
 * 
 * Environment Variables:
 *     GITHUB_TOKEN    - GitHub Personal Access Token (required)
 *     GIT_REPO        - Git repository URL (default: integratewise/knowledge)
 *     VAULT_PATH      - Path to vault directory (default: ./vault)
 *     GIT_BRANCH      - Git branch name (default: main)
 *     GIT_USER_NAME   - Git user name for commits (default: IntegrateWise Bot)
 *     GIT_USER_EMAIL  - Git user email for commits (default: bot@integratewise.com)
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Configuration from environment
const config = {
  repo: process.env.GIT_REPO ?? "https://github.com/integratewise/knowledge.git",
  vault: process.env.VAULT_PATH ?? path.resolve(process.cwd(), "vault"),
  branch: process.env.GIT_BRANCH ?? "main",
  userName: process.env.GIT_USER_NAME ?? "IntegrateWise Bot",
  userEmail: process.env.GIT_USER_EMAIL ?? "bot@integratewise.com",
  token: process.env.GITHUB_TOKEN,
};

/**
 * Execute shell command safely
 */
function sh(command: string, cwd?: string): string {
  try {
    return execSync(command, {
      cwd: cwd || process.cwd(),
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch (error: any) {
    console.error(`Command failed: ${command}`);
    console.error(error.stderr || error.message);
    throw error;
  }
}

/**
 * Check if git repository is initialized
 */
function isGitRepo(dir: string): boolean {
  return fs.existsSync(path.join(dir, ".git"));
}

/**
 * Get authenticated repository URL
 */
function getAuthRepo(): string {
  if (!config.token) {
    throw new Error("GITHUB_TOKEN environment variable is required");
  }
  
  // Insert token into HTTPS URL
  const url = new URL(config.repo);
  return `https://${config.token}@${url.host}${url.pathname}`;
}

/**
 * Initialize git repository
 */
function initRepo(): void {
  console.log("Initializing git repository...");
  
  if (!fs.existsSync(config.vault)) {
    fs.mkdirSync(config.vault, { recursive: true });
    console.log(`✓ Created vault directory: ${config.vault}`);
  }
  
  if (!isGitRepo(config.vault)) {
    sh("git init", config.vault);
    console.log("✓ Initialized git repository");
    
    // Configure git user
    sh(`git config user.name "${config.userName}"`, config.vault);
    sh(`git config user.email "${config.userEmail}"`, config.vault);
    console.log("✓ Configured git user");
    
    // Add remote
    const authRepo = getAuthRepo();
    sh(`git remote add origin ${authRepo}`, config.vault);
    console.log("✓ Added remote origin");
    
    // Create and checkout branch
    sh(`git checkout -b ${config.branch}`, config.vault);
    console.log(`✓ Created branch: ${config.branch}`);
  } else {
    console.log("✓ Git repository already initialized");
  }
}

/**
 * Check if there are changes to commit
 */
function hasChanges(): boolean {
  try {
    const status = sh("git status --porcelain", config.vault);
    return status.length > 0;
  } catch {
    return false;
  }
}

/**
 * Sync vault to GitHub
 */
function syncVault(): void {
  console.log("\n=== Syncing Vault to GitHub ===");
  console.log(`Vault: ${config.vault}`);
  console.log(`Branch: ${config.branch}`);
  console.log(`Repository: ${config.repo.replace(/\/\/[^@]+@/, "//***@")}`);
  
  // Initialize if needed
  initRepo();
  
  // Check for changes
  if (!hasChanges()) {
    console.log("\n✓ No changes to sync");
    return;
  }
  
  console.log("\n📝 Changes detected:");
  const status = sh("git status --short", config.vault);
  console.log(status);
  
  try {
    // Stage all changes
    console.log("\n📦 Staging changes...");
    sh("git add -A", config.vault);
    console.log("✓ Staged all changes");
    
    // Commit with timestamp
    const timestamp = new Date().toISOString();
    const commitMessage = `Vault sync: ${timestamp}

Auto-committed by vault_sync.ts
Changes include content updates, new files, and deletions.`;
    
    console.log("\n💾 Committing changes...");
    sh(`git commit -m "${commitMessage.replace(/\n/g, "\\n")}"`, config.vault);
    console.log("✓ Created commit");
    
    // Pull with rebase (in case remote has changes)
    console.log("\n⬇️  Pulling remote changes...");
    try {
      sh(`git pull origin ${config.branch} --rebase`, config.vault);
      console.log("✓ Pulled and rebased");
    } catch (error) {
      console.log("⚠️  No remote branch yet (first push)");
    }
    
    // Push to remote
    console.log("\n⬆️  Pushing to GitHub...");
    sh(`git push -u origin ${config.branch}`, config.vault);
    console.log("✓ Pushed to GitHub");
    
    // Get commit hash
    const commitHash = sh("git rev-parse HEAD", config.vault).slice(0, 7);
    console.log(`\n✅ Sync complete! Commit: ${commitHash}`);
    
  } catch (error: any) {
    console.error("\n❌ Sync failed:");
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Show vault status
 */
function showStatus(): void {
  console.log("\n=== Vault Status ===");
  
  if (!isGitRepo(config.vault)) {
    console.log("⚠️  Not a git repository");
    return;
  }
  
  // Show branch
  const branch = sh("git branch --show-current", config.vault);
  console.log(`Branch: ${branch}`);
  
  // Show remote
  try {
    const remote = sh("git remote get-url origin", config.vault);
    console.log(`Remote: ${remote.replace(/\/\/[^@]+@/, "//***@")}`);
  } catch {
    console.log("Remote: (not set)");
  }
  
  // Show last commit
  try {
    const lastCommit = sh("git log -1 --pretty=format:'%h - %s (%ar)'", config.vault);
    console.log(`Last commit: ${lastCommit}`);
  } catch {
    console.log("Last commit: (none)");
  }
  
  // Show file count
  try {
    const fileCount = sh("git ls-files | wc -l", config.vault);
    console.log(`Tracked files: ${fileCount.trim()}`);
  } catch {
    console.log("Tracked files: 0");
  }
  
  // Show status
  console.log("\nWorking directory:");
  const status = sh("git status --short", config.vault);
  if (status) {
    console.log(status);
  } else {
    console.log("✓ Clean (no changes)");
  }
}

/**
 * Main entry point
 */
function main(): void {
  console.log("🗂️  Obsidian Vault Sync Tool\n");
  
  // Check for required token
  if (!config.token) {
    console.error("❌ Error: GITHUB_TOKEN environment variable is required");
    console.error("\nUsage:");
    console.error("  GITHUB_TOKEN=your_token node vault_sync.ts\n");
    console.error("Optional environment variables:");
    console.error("  GIT_REPO       - Repository URL");
    console.error("  VAULT_PATH     - Vault directory path");
    console.error("  GIT_BRANCH     - Branch name");
    console.error("  GIT_USER_NAME  - Git commit author name");
    console.error("  GIT_USER_EMAIL - Git commit author email");
    process.exit(1);
  }
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0] || "sync";
  
  switch (command) {
    case "sync":
      syncVault();
      break;
    
    case "status":
      showStatus();
      break;
    
    case "init":
      initRepo();
      console.log("\n✅ Repository initialized");
      break;
    
    case "help":
    case "--help":
    case "-h":
      console.log("Commands:");
      console.log("  sync     - Sync vault to GitHub (default)");
      console.log("  status   - Show vault git status");
      console.log("  init     - Initialize git repository");
      console.log("  help     - Show this help message");
      break;
    
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.error("Run 'node vault_sync.ts help' for usage");
      process.exit(1);
  }
}

// Run main function
main();
