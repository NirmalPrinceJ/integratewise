# GitHub Actions Workflows

This directory contains GitHub Actions workflow files. Due to GitHub security restrictions, these files need to be added manually through the GitHub web interface.

## Adding Workflows Manually

### Option 1: Via GitHub Web Interface (Recommended)

1. Go to your repository: https://github.com/NirmalPrinceJ/integratewise
2. Click on the **Actions** tab
3. Click **New workflow**
4. Click **set up a workflow yourself**
5. Copy the contents from the workflow files in this directory:
   - `test.yml` - Runs tests on push/PR
   - `linear-sync.yml` - Syncs issues with Linear

### Option 2: Update GitHub Token Permissions

To push workflow files directly via git:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with `workflow` scope
3. Update your git credentials:
   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/NirmalPrinceJ/integratewise.git
   ```

### Option 3: Use GitHub CLI

```bash
gh workflow create .github/workflows/test.yml
gh workflow create .github/workflows/linear-sync.yml
```

## Workflow Files

- **test.yml** - Automated testing on push and pull requests
- **linear-sync.yml** - Integration with Linear for issue tracking

