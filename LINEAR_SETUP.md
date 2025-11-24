# Linear Integration Setup Guide

This guide explains how to set up Linear for issue tracking and project management with this GitHub repository.

## What is Linear?

Linear is a modern issue tracking and project management tool designed for high-performance teams. It provides:
- Fast, keyboard-first interface
- Automatic issue syncing with GitHub
- Powerful project views and roadmaps
- Team collaboration features

## Setup Instructions

### Option 1: Linear GitHub Integration (Recommended)

Linear can automatically sync issues and pull requests between GitHub and Linear.

#### Steps:

1. **Create a Linear Account**
   - Go to [linear.app](https://linear.app)
   - Sign up with your GitHub account (recommended)

2. **Create a Linear Workspace**
   - Create a new workspace for IntegrateWise
   - Choose a workspace URL (e.g., `integratewise.linear.app`)

3. **Connect GitHub Integration**
   - In Linear, go to **Settings** → **Integrations** → **GitHub**
   - Click **Connect GitHub**
   - Authorize Linear to access your GitHub account
   - Select the `integratewise` repository

4. **Configure Sync Settings**
   - Enable "Sync GitHub Issues"
   - Enable "Sync GitHub Pull Requests"
   - Choose sync direction (bidirectional recommended)
   - Set up label mapping if needed

5. **Add Linear API Key to GitHub Secrets** (Optional, for advanced automation)
   - In Linear: **Settings** → **API** → **Personal API keys**
   - Create a new API key
   - Copy the key
   - In GitHub: Go to repository **Settings** → **Secrets and variables** → **Actions**
   - Add new secret: `LINEAR_API_KEY` with your Linear API key

### Option 2: Manual Issue Creation

You can manually create Linear issues and link them to GitHub:

1. Create an issue in Linear
2. Add the GitHub issue URL in the Linear issue description
3. Use Linear issue keys (e.g., `INT-123`) in GitHub commit messages

## Using Linear with This Project

### Creating Issues

**In Linear:**
- Press `I` to create a new issue
- Add title, description, assignee, labels
- Link to GitHub PRs or commits using issue keys

**In GitHub:**
- Create issues normally in GitHub
- They will automatically sync to Linear (if integration is enabled)
- Or manually reference Linear issue keys in GitHub issues

### Issue Key Format

Linear issues have keys like: `INT-123`, `INT-124`, etc.

Use these keys in:
- Commit messages: `fix(INT-123): Fix mobile menu toggle`
- PR titles: `[INT-123] Add user authentication`
- GitHub issue comments: `Related to INT-123`

### Workflow Integration

The GitHub Actions workflow (`.github/workflows/linear-sync.yml`) is configured to:
- Sync GitHub issues to Linear
- Sync pull requests to Linear
- Keep status synchronized

## Linear Workflow States

Linear uses these states by default:
- **Todo** - New issues
- **In Progress** - Active work
- **In Review** - Code review
- **Done** - Completed

These map to GitHub labels/statuses automatically.

## Best Practices

1. **Use Linear for Planning**
   - Create epics and roadmaps in Linear
   - Break down features into Linear issues

2. **Use GitHub for Code**
   - Create PRs in GitHub
   - Link PRs to Linear issues using issue keys

3. **Keep Descriptions Updated**
   - Update Linear issues when PRs are merged
   - Add links between related issues

4. **Use Labels**
   - Create consistent labels in both Linear and GitHub
   - Use labels for filtering and automation

## Troubleshooting

### Issues not syncing
- Check Linear integration settings
- Verify GitHub repository is connected
- Check Linear API key is set correctly (if using API)

### PRs not linking
- Ensure PR description includes Linear issue key
- Check Linear integration has PR sync enabled

### API Rate Limits
- Linear API has rate limits
- Use webhooks instead of polling when possible

## Resources

- [Linear Documentation](https://linear.app/docs)
- [Linear GitHub Integration](https://linear.app/docs/integrations/github)
- [Linear API Documentation](https://developers.linear.app/docs)

## Support

For issues with Linear integration:
1. Check Linear status page
2. Review Linear documentation
3. Contact Linear support

