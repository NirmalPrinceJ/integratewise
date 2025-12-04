# IntegrateWise

Normalize once. Render anywhere. IntegrateWise is a static marketing and documentation site for the IntegrateWise platform: a unified customer hub that syncs Salesforce, HubSpot, Dynamics, or Zoho into the tools teams use (Notion, Airtable, Asana, ClickUp, Monday, Google Sheets).

## Live URL
- https://integratewise.co/

## Run locally
```bash
npm install -g wrangler
wrangler dev --local
```
The site is static; `wrangler dev` serves the current directory.

## Deploy (Cloudflare Pages/Workers via Wrangler)
```bash
wrangler publish
```
- Ensure `wrangler.jsonc` uses the correct environment name (default: `integratewise`).
- Set repository homepage to https://integratewise.co/.
- Protect the `main` branch before deploying.

## Environment
- No secrets required for static build.
- Optional analytics or forms can post to your chosen endpoint; add env vars via `wrangler secret put` if used.

## Site map
- Marketing: `index`, `platform`, `agents`, `services`, `solutions`, `pricing`, `resources`, `about`, `contact`, `sitemap.xml`, `robots.txt`
- Docs: `/docs/index.html`, `/docs/data-model.html`, `/docs/agents/*.html`, `/docs/measurement.html`, `/docs/security.html`, `/docs/architecture.html`
- Policy: `MEASUREMENT.md`, `SECURITY.md`

## Release
- Tag deployments with `site-v1.0.0` (created via `git tag site-v1.0.0`).
- Suggested CI checks: HTML validation, link checking, sitemap verification.
