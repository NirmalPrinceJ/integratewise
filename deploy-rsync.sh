#!/bin/bash

# IntegrateWise Website - RSYNC Deployment Script
# Usage: ./deploy-rsync.sh
# Requires: SSH access to server

set -e

# Load environment variables
if [ -f .env ]; then
    source .env
fi

SSH_HOST=${SSH_HOST:-"your-domain.com"}
SSH_USER=${SSH_USER:-"your_username"}
SSH_PATH=${SSH_PATH:-"/home/${SSH_USER}/public_html"}
LOCAL_PATH="./"

echo "🚀 Deploying IntegrateWise website via RSYNC..."

# Exclude files
rsync -avz --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.env' \
    --exclude='*.md' \
    --exclude='.DS_Store' \
    --exclude='deploy*.sh' \
    --exclude='deploy*.js' \
    --exclude='package.json' \
    --exclude='package-lock.json' \
    "${LOCAL_PATH}" "${SSH_USER}@${SSH_HOST}:${SSH_PATH}/"

echo "✅ Deployment complete!"
echo "🌐 Website: http://${SSH_HOST}"
