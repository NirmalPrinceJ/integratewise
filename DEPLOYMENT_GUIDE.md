# IntegrateWise Website Deployment Guide

## Quick Deployment to cPanel

### Option 1: Using cPanel File Manager (Easiest)

1. **Log into cPanel**
   - Go to: https://server264.web-hosting.com:2083
   - Use your cPanel username and password (from Welcome Email)

2. **Navigate to File Manager**
   - Find "File Manager" in cPanel dashboard
   - Click to open

3. **Go to public_html**
   - Navigate to `public_html` folder (this is your website root)
   - If you have a subdomain, use the appropriate folder

4. **Upload Files**
   - Click "Upload" button in File Manager
   - Select ALL files from your website folder:
     - index.html
     - about.html
     - services.html
     - case-studies.html
     - resources.html
     - contact.html
     - business-plan.html
     - styles.css
     - script.js
     - README.md
   - Upload the entire `images` folder (with logo subfolder)

5. **Verify Structure**
   Your `public_html` should look like:
   ```
   public_html/
   ├── index.html
   ├── about.html
   ├── services.html
   ├── case-studies.html
   ├── resources.html
   ├── contact.html
   ├── business-plan.html
   ├── styles.css
   ├── script.js
   └── images/
       └── logo/
           ├── integratewise-logo.svg
           ├── integratewise-icon.svg
           └── favicon.svg
   ```

6. **Set Permissions**
   - Right-click on files → Change Permissions
   - HTML/CSS/JS files: 644
   - Folders: 755

### Option 2: Using WebDAV (Advanced)

1. **Enable WebDAV in cPanel**
   - Go to cPanel → WebDAV
   - Enable WebDAV access
   - Note your WebDAV URL

2. **Connect via WebDAV Client**
   - macOS: Finder → Go → Connect to Server
   - Windows: Map Network Drive
   - Use your WebDAV URL and credentials

3. **Copy Files**
   - Drag and drop all files to WebDAV folder
   - Ensure folder structure is maintained

### Option 3: Using FTP (Recommended for Large Files)

1. **Get FTP Credentials**
   - cPanel → FTP Accounts
   - Create or use existing FTP account
   - Note: Host, Username, Password, Port (usually 21)

2. **Connect with FTP Client**
   - Use FileZilla, Cyberduck, or similar
   - Connect to your FTP server
   - Navigate to `public_html`

3. **Upload Files**
   - Upload all HTML, CSS, JS files
   - Upload `images` folder with all contents
   - Maintain folder structure

## Post-Deployment Checklist

### 1. Test Your Website
- Visit your domain: `http://yourdomain.com`
- Check all pages load correctly
- Test navigation links
- Verify images display

### 2. Update Contact Information
- Replace placeholder phone: `+91 99999 99999`
- Update email: `info@integratewise.com`
- Add your actual contact details

### 3. Set Up Email
- cPanel → Email Accounts
- Create: info@yourdomain.com
- Forward emails if needed

### 4. SSL Certificate
- cPanel → SSL/TLS Status
- Install free Let's Encrypt certificate
- Force HTTPS redirect

### 5. Domain Configuration
- If using subdomain, point it to correct folder
- Update DNS if needed
- Wait for DNS propagation (up to 48 hours)

### 6. Test Forms
- Contact forms need backend integration
- Options:
  - Use Formspree.io (free)
  - Use Netlify Forms
  - Set up PHP form handler
  - Integrate with your CRM

### 7. Analytics
- Add Google Analytics tracking code
- Set up Google Search Console
- Monitor website performance

## File Structure for Upload

```
public_html/
├── index.html              (Homepage)
├── about.html              (About page)
├── services.html           (Services page)
├── case-studies.html       (Case studies)
├── resources.html          (Resources)
├── contact.html            (Contact)
├── business-plan.html      (Business plan)
├── styles.css              (All styles)
├── script.js               (All JavaScript)
├── README.md               (Documentation)
└── images/
    └── logo/
        ├── integratewise-logo.svg
        ├── integratewise-icon.svg
        └── favicon.svg
```

## Troubleshooting

### Images Not Loading
- Check file paths are correct
- Verify `images` folder uploaded
- Check file permissions (644 for files, 755 for folders)

### CSS Not Working
- Verify `styles.css` is in root directory
- Check file permissions
- Clear browser cache

### JavaScript Not Working
- Verify `script.js` is in root directory
- Check browser console for errors
- Ensure file permissions are correct

### 404 Errors
- Verify all HTML files uploaded
- Check file names match exactly (case-sensitive)
- Ensure files are in `public_html` not subfolder

### SSL Issues
- Install SSL certificate in cPanel
- Force HTTPS redirect
- Update internal links to use HTTPS

## Quick Commands (if SSH access available)

```bash
# Navigate to public_html
cd ~/public_html

# Set permissions
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;

# Verify files
ls -la
```

## Support

If you encounter issues:
1. Check cPanel error logs
2. Verify file permissions
3. Test with different browser
4. Contact Namecheap support

## Next Steps After Deployment

1. **SEO Setup**
   - Submit sitemap to Google
   - Set up Google Business Profile
   - Add meta descriptions

2. **Performance**
   - Enable GZIP compression in cPanel
   - Optimize images
   - Enable caching

3. **Security**
   - Set up .htaccess for security
   - Enable firewall
   - Regular backups

4. **Marketing**
   - Share on LinkedIn
   - Update social media profiles
   - Start content marketing

Your website should be live once files are uploaded to `public_html`!
