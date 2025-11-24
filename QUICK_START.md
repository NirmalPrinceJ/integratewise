# 🚀 Quick Start - Automated Deployment

## Fastest Way to Deploy (3 Steps)

### Step 1: Get FTP Credentials from cPanel



1. Go to: https://server264.web-hosting.com:2083

2. Login with your cPanel credentials

3. Navigate to **FTP Accounts**

4. Create new account or use existing

5. Note down:

   - **Server/Host**: your-domain.com (or IP)

   - **Username**: your_ftp_username

   - **Password**: your_ftp_password

   - **Port**: 21 (FTP) or 22 (SFTP)

### Step 2: Configure Deployment

```bash
# Copy example config
cp env.example .env

# Edit with your credentials
nano .env
# or open in your editor
```

Edit `.env` file:
```env
FTP_HOST=your-domain.com
FTP_USER=your_ftp_username
FTP_PASS=your_ftp_password
FTP_PORT=21
FTP_PATH=/public_html
```

### Step 3: Deploy!

**Option A: Using Node.js (Recommended)**
```bash
npm install
npm run deploy
```

**Option B: Using Shell Script**
```bash
./deploy.sh
```

**Option C: Manual Upload via cPanel**
- Use File Manager in cPanel
- Upload all files to `public_html`

## What Gets Deployed

✅ All HTML pages (6 pages)
✅ CSS and JavaScript files
✅ Logo images
✅ Configuration files (.htaccess)
✅ Complete folder structure

## After Deployment

1. Visit: `http://your-domain.com`
2. Test all pages
3. Verify images load
4. Check mobile responsiveness

## Need Help?

- Check `AUTO_DEPLOY.md` for detailed instructions
- Review `DEPLOYMENT_GUIDE.md` for manual steps
- Check error messages for troubleshooting

## Next Steps

- [ ] Set up SSL certificate
- [ ] Configure email accounts
- [ ] Add Google Analytics
- [ ] Test contact forms
- [ ] Share your website!

---

**That's it! Your website will be live in minutes.** 🎉
