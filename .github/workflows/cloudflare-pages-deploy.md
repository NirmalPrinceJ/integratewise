# Cloudflare Pages Auto-Deployment Setup

## Option 1: Cloudflare Dashboard (Recommended - Easiest)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Pages**
3. Click **Create a project** → **Connect to Git**
4. Select **GitHub** and authorize Cloudflare
5. Choose repository: `NirmalPrinceJ/integratewise`
6. Configure:
   - **Project name**: `integratewise`
   - **Production branch**: `main`
   - **Build command**: (leave empty - static site)
   - **Build output directory**: `.` (root directory)
7. Click **Save and Deploy**

Cloudflare will automatically deploy on every push to `main` branch.

---

## Option 2: GitHub Actions (Current Setup)

The `.github/workflows/deploy.yml` file is configured for GitHub Actions deployment.

### Required Secrets:

Add these secrets to your GitHub repository:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:

**CLOUDFLARE_API_TOKEN:**
- Go to Cloudflare Dashboard → **My Profile** → **API Tokens**
- Click **Create Token**
- Use **Edit Cloudflare Workers** template
- Or create custom token with:
  - Permissions: `Account.Cloudflare Pages:Edit`
  - Account Resources: Include your account

**CLOUDFLARE_ACCOUNT_ID:**
- Found in Cloudflare Dashboard → Right sidebar → **Account ID**

### After adding secrets:
- Push any commit to trigger deployment
- Or manually trigger via **Actions** tab → **Deploy to Cloudflare Pages** → **Run workflow**

---

## Option 3: Wrangler CLI (Manual)

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy . --project-name=integratewise
```

---

## Verification

After setup, verify auto-deployment:
1. Make a small change (e.g., update a comment)
2. Commit and push: `git commit -am "Test deploy" && git push`
3. Check Cloudflare Dashboard → Pages → `integratewise` → **Deployments**
4. Should see new deployment within 1-2 minutes

---

## Troubleshooting

**Deployment fails:**
- Check Cloudflare Dashboard → Pages → Deployments → View logs
- Verify API token has correct permissions
- Ensure account ID is correct

**GitHub Actions fails:**
- Check Actions tab → View workflow run → View logs
- Verify secrets are set correctly
- Check if Cloudflare API token is valid

---

*Last Updated: 2024*

