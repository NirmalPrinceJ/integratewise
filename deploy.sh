#!/bin/bash

# IntegrateWise Website - Automated Deployment Script
# Usage: ./deploy.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}IntegrateWise Deployment Script${NC}"
echo "=================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cat > .env << EOF
# FTP/SFTP Configuration
FTP_HOST=your-domain.com
FTP_USER=your_ftp_username
FTP_PASS=your_ftp_password
FTP_PORT=21
FTP_PATH=/public_html

# Or use SFTP
USE_SFTP=false
SFTP_PORT=22
EOF
    echo -e "${RED}Please edit .env file with your FTP credentials${NC}"
    exit 1
fi

# Load environment variables
source .env

# Check if lftp is installed (for FTP)
if ! command -v lftp &> /dev/null; then
    echo -e "${YELLOW}Installing lftp...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install lftp
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y lftp
    fi
fi

# Files to upload
FILES=(
    "index.html"
    "about.html"
    "services.html"
    "case-studies.html"
    "resources.html"
    "contact.html"
    "business-plan.html"
    "styles.css"
    "script.js"
    ".htaccess"
)

# Directories to upload
DIRS=(
    "images"
)

echo -e "${GREEN}Starting deployment...${NC}"

if [ "$USE_SFTP" = true ]; then
    echo -e "${YELLOW}Using SFTP...${NC}"
    
    # Create upload script for SFTP
    cat > /tmp/sftp_upload.sh << EOF
cd $FTP_PATH
put index.html
put about.html
put services.html
put case-studies.html
put resources.html
put contact.html
put business-plan.html
put styles.css
put script.js
put .htaccess
mkdir -p images/logo
cd images/logo
lcd images/logo
put integratewise-logo.svg
put integratewise-icon.svg
put favicon.svg
quit
EOF
    
    # Upload via SFTP
    sftp -P ${SFTP_PORT} ${FTP_USER}@${FTP_HOST} < /tmp/sftp_upload.sh
    
else
    echo -e "${YELLOW}Using FTP...${NC}"
    
    # Create FTP upload script
    cat > /tmp/ftp_upload.lftp << EOF
set ftp:ssl-allow no
open -u ${FTP_USER},${FTP_PASS} ${FTP_HOST}:${FTP_PORT}
cd ${FTP_PATH}
mirror -R --delete --verbose --exclude-glob="*.md" --exclude-glob=".git" --exclude-glob="node_modules" .
quit
EOF
    
    # Upload via FTP
    lftp -f /tmp/ftp_upload.lftp
fi

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${YELLOW}Please verify your website at: http://${FTP_HOST}${NC}"

# Cleanup
rm -f /tmp/ftp_upload.lftp /tmp/sftp_upload.sh
