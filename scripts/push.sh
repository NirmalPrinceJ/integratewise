#!/bin/bash
# filename: scripts/push.sh

# Prereqs: git installed, repo cloned locally, you are on main branch

# Optional: gh CLI for convenience (not required)

set -euo pipefail

REPO_SLUG="NirmalPrinceJ/integratewise-official-website"

REPO_DIR="integratewise-official-website"

# 1) Clone (skip if already cloned)
if [ ! -d "$REPO_DIR" ]; then
  git clone "https://github.com/${REPO_SLUG}.git" "${REPO_DIR}"
fi

cd "${REPO_DIR}"

# 2) Ensure clean working tree
git status
# Add any new/updated files (e.g., index.html, plan.html, blog.html, assets/)
git add -A

# 3) Commit
git commit -m "Update website content and structure; prepare for Vercel deploy" || echo "No changes to commit."

# 4) Push
git push origin main

echo "Pushed to GitHub: https://github.com/${REPO_SLUG}"
