# Google Sheets Integration Setup Guide

This guide will help you connect your contact form directly to Google Sheets without using external services.

## Benefits
- ✅ **Free** - No monthly fees
- ✅ **Direct access** - All data in your Google Sheet
- ✅ **No external dependencies** - Everything stays in-house
- ✅ **Easy to export** - Standard Google Sheets format
- ✅ **Email notifications** - Optional automatic alerts

## Step-by-Step Setup

### 1. Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: **"IntegrateWise Contact Form Responses"**
4. In Row 1, add these headers:
   ```
   Timestamp | Name | Company | Email | Phone | Source | Message | Consent | Page URL
   ```

### 2. Get Your Sheet ID

1. Look at your Google Sheet URL:
   ```
   https://docs.google.com/spreadsheets/d/1T4OCMvL0RkJXiDPUkcIZyie8RfwdOa-CGwfvWK1zpRI/edit
   ```
2. Copy the part between `/d/` and `/edit` - this is your Sheet ID

### 3. Set Up Google Apps Script

1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Delete any default code
3. Copy the entire contents of `google-apps-script.js` file
4. Paste it into the Apps Script editor
5. Replace `YOUR_SHEET_ID_HERE` with your actual Sheet ID
6. Click **Save** (Ctrl+S or Cmd+S)
7. Give your project a name (e.g., "IntegrateWise Form Handler")

### 4. Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description**: "Contact Form Handler"
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** (important for public forms)
5. Click **Deploy**
6. **Copy the Web App URL** - you'll need this next!

### 5. Update Your Website

1. Open `script.js` in your project
2. Find this line:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your Web App URL from step 4
4. Save and deploy your website

### 6. Test the Form

1. Go to your contact page
2. Fill out and submit the form
3. Check your Google Sheet - you should see the new row!

## Optional: Email Notifications

To receive email notifications when someone submits the form:

1. In `google-apps-script.js`, find the commented section:
   ```javascript
   // Optional: Send email notification
   // Uncomment the lines below...
   ```
2. Uncomment those lines (remove the `/*` and `*/`)
3. Update the email address if needed
4. Save and redeploy the script

## Troubleshooting

### Form submits but no data appears
- Check that Sheet ID is correct
- Verify sheet name matches (default is "Sheet1")
- Check Apps Script execution logs: **Executions** tab in Apps Script

### "Script URL not configured" error
- Make sure you updated `GOOGLE_SCRIPT_URL` in `script.js`
- Verify the URL is correct (should start with `https://script.google.com`)

### Permission errors
- Make sure "Who has access" is set to **Anyone**
- Redeploy the script if you changed permissions

### CORS errors
- The script uses `no-cors` mode, which is normal
- Form will still submit successfully even if browser shows CORS warning

## Security Notes

- The Web App URL is public but only accepts POST requests
- Consider adding rate limiting or CAPTCHA for production
- Regularly review form submissions for spam

## Need Help?

If you encounter issues:
1. Check Apps Script execution logs
2. Verify Sheet ID and permissions
3. Test with the `test()` function in Apps Script
4. Contact: connect@integratewise.co


