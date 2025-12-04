# IntegrateWise Site

Marketing + technical documentation for IntegrateWise. Brand pillars: **Normalize once. Render anywhere.** and **Connect. Automate. Elevate.**

## Live URL
- Production: `https://integratewise.co/` (set repository homepage to this URL).

## Local development
1. Clone the repo and install dependencies (none beyond a static server).
2. Serve the site locally, e.g. `npx serve .` or `python -m http.server 8787`.
3. Visit `http://localhost:8787` to browse marketing pages and `/docs/index.html` for the docs hub.

## Cloudflare Wrangler deploy
The site is configured as a static asset deploy via `wrangler.jsonc`.
1. Login: `npx wrangler login`.
2. Publish: `npx wrangler deploy --env production` (assets directory `./`).
3. Verify: `npx wrangler deploy --env production --dry-run` before promoting.

### Environments
- `production` (default in `wrangler.jsonc`).

### Environment variables
- None required for the static site. CDN/analytics keys can be added via Cloudflare secrets if introduced later.

## Sitemap
- Update `sitemap.xml` when adding pages, including `/docs/*` entries.
- `robots.txt` references the sitemap for crawlers.

## Branch protection and releases
- Protect the `main` branch: require PR reviews and passing checks (link checks/HTML validation recommended).
- Tag releases with semantic versions; initial tag: `site-v1.0.0`.

## Optional CI
- HTML validation (e.g., `html-validate`), link checking, and sitemap verification are recommended before deploys.
