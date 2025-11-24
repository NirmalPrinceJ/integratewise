# Automated Deployment Guide

## Quick Start

### Option 1: Node.js Deployment (Recommended)

1. **Install Node.js** (if not already installed)
   ```bash
   # Check if Node.js is installed
   node --version
   
   # If not, install from https://nodejs.org
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Credentials**
   ```bash
   # Copy example file
   cp .env.example .env
   
   # Edit .env with your FTP credentials
   nano .env
   # or
   open .env
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

### Option 2: Shell Script Deployment

1. **Make Script Executable**
   ```bash
   chmod +x deploy.sh
   ```

2. **Configure Credentials**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Run Deployment**
   ```bash
   ./deploy.sh
   ```

### Option 3: RSYNC Deployment (SSH Required)

1. **Configure SSH Access**
   ```bash
   # Add to .env
   SSH_HOST=your-domain.com
   SSH_USER=your_username
   SSH_PATH=/home/username/public_html
   ```

2. **Deploy**
   ```bash
   chmod +x deploy-rsync.sh
   ./deploy-rsync.sh
   ```

## Environment Variables

Create a `.env` file with your credentials:

```env
# FTP Configuration
FTP_HOST=your-domain.com
FTP_USER=your_ftp_username
FTP_PASS=your_ftp_password
FTP_PORT=21
FTP_PATH=/public_html

# Or use SFTP
USE_SFTP=false
SFTP_PORT=22
```

## Getting FTP Credentials from cPanel

1. Log into cPanel: https://server264.web-hosting.com:2083
2. Go to **FTP Accounts**
3. Create a new FTP account or use existing
4. Note down:
   - **Server**: Usually your domain name
   - **Username**: Your FTP username
   - **Password**: Your FTP password
   - **Port**: Usually 21 for FTP, 22 for SFTP

## Deployment Methods

### FTP Deployment
- **Pros**: Works with most hosting providers
- **Cons**: Less secure, slower
- **Use when**: Standard shared hosting

### SFTP Deployment
- **Pros**: More secure, encrypted
- **Cons**: Requires SFTP support
- **Use when**: Security is important

### RSYNC Deployment
- **Pros**: Fast, efficient, incremental
- **Cons**: Requires SSH access
- **Use when**: You have SSH/terminal access

## Automated Deployment Workflow

### One-Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Configure credentials
cp .env.example .env
# Edit .env with your details

# 3. Test deployment
npm run deploy
```

### Regular Deployments
```bash
# Just run this command after making changes
npm run deploy
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Website

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Deploy
        env:
          FTP_HOST: ${{ secrets.FTP_HOST }}
          FTP_USER: ${{ secrets.FTP_USER }}
          FTP_PASS: ${{ secrets.FTP_PASS }}
          FTP_PATH: ${{ secrets.FTP_PATH }}
        run: npm run deploy
```

## Troubleshooting

### Connection Issues
- Verify FTP credentials in `.env`
- Check firewall settings
- Try SFTP instead of FTP
- Verify port numbers

### Permission Errors
- Ensure files have correct permissions (644)
- Check folder permissions (755)
- Verify FTP user has write access

### File Upload Failures
- Check file paths are correct
- Verify files exist locally
- Check disk space on server
- Review FTP logs in cPanel

## Security Best Practices

1. **Never commit `.env` file**
   - Already in `.gitignore`
   - Keep credentials private

2. **Use SFTP when possible**
   - More secure than FTP
   - Encrypted connection

3. **Use API tokens**
   - Instead of passwords
   - Can be revoked easily

4. **Limit FTP access**
   - Use specific FTP accounts
   - Restrict to necessary directories

## Next Steps

After successful deployment:
1. Test website functionality
2. Verify all pages load
3. Check images display correctly
4. Test forms (if configured)
5. Set up SSL certificate
6. Configure domain DNS

## Support

If deployment fails:
1. Check error messages
2. Verify credentials
3. Test FTP connection manually
4. Review cPanel logs
5. Contact hosting support
