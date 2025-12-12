# Git Branching & Deployment Workflow

## Branch Structure

```
main (production)     → Auto-deploys to LIVE
  │
  └── dev (staging)   → Auto-deploys to STAGING
       │
       └── feature/*  → Development work
```

## Branch Rules

| Branch | Purpose | Deploys To | Protection |
|--------|---------|------------|------------|
| `main` | Production code | Live (integratewise.co, webhooks.integratewise.online) | Protected - requires PR |
| `dev` | Staging/testing | Staging environment | Protected - requires PR |
| `feature/*` | New features | Preview deployments | None |

## Workflow

### 1. Start New Work (Checkout from main)

```bash
# Always start from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes & Commit

```bash
# Make your changes
git add .
git commit -m "feat: description of changes"
```

### 3. Push Feature Branch

```bash
git push -u origin feature/your-feature-name
```

### 4. Create Pull Request

1. Go to GitHub → Pull Requests → New
2. Base: `dev` ← Compare: `feature/your-feature-name`
3. Add description and request review
4. Merge after approval

### 5. Promote to Production

After testing on dev:
1. Create PR: Base: `main` ← Compare: `dev`
2. Review and merge
3. Auto-deploys to production

## Branch Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/add-hubspot-webhook` |
| Bug Fix | `fix/description` | `fix/stripe-signature-validation` |
| Hotfix | `hotfix/description` | `hotfix/critical-auth-bug` |
| Release | `release/version` | `release/v1.2.0` |

## Deployment Mapping

| Branch | Hub (Vercel) | Webhooks (Cloudflare) | Website (Cloudflare) |
|--------|--------------|----------------------|---------------------|
| `main` | integratewise-hub.vercel.app | webhooks.integratewise.online | integratewise.co |
| `dev` | integratewise-hub-dev.vercel.app | webhooks-dev.integratewise.online | dev.integratewise.co |
| `feature/*` | Preview URL | Preview URL | Preview URL |

## Quick Commands

```bash
# Start feature from main
git checkout main && git pull && git checkout -b feature/name

# Update feature branch with latest main
git checkout feature/name && git merge main

# Push changes
git push origin feature/name

# After PR merged to dev, promote to main
git checkout main && git merge dev && git push
```

## Hotfix Process (Urgent Production Fixes)

```bash
# Create hotfix from main
git checkout main && git checkout -b hotfix/critical-fix

# Fix and commit
git commit -m "hotfix: description"

# Push and create PR directly to main
git push origin hotfix/critical-fix
# Create PR: main ← hotfix/critical-fix

# After merge, sync to dev
git checkout dev && git merge main && git push
```
