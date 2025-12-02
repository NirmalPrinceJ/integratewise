# Step-by-Step Fix: Update Google Apps Script

## The Problem
Your Google Apps Script is missing the `doGet()` function, which is needed when you visit the URL directly.

## Solution: Update and Redeploy

### Step 1: Open Your Google Sheet
Go to: https://docs.google.com/spreadsheets/d/1T4OCMvL0RkJXiDPUkcIZyie8RfwdOa-CGwfvWK1zpRI/edit

### Step 2: Open Apps Script Editor
- Click **Extensions** in the menu bar
- Click **Apps Script**
- A new tab will open with the Apps Script editor

### Step 3: Delete Old Code
- Select ALL code in the editor (Ctrl+A or Cmd+A)
- Press **Delete**

### Step 4: Copy This Complete Code

Copy the ENTIRE code block below:

```javascript
const SHEET_ID = '1T4OCMvL0RkJXiDPUkcIZyie8RfwdOa-CGwfvWK1zpRI';
const SHEET_NAME = 'Sheet1';

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'success',
      message: 'IntegrateWise Contact Form Handler is running',
      method: 'GET',
      timestamp: new Date().toISOString(),
      note: 'This endpoint accepts POST requests from the contact form'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.company || '',
      data.email || '',
      data.phone || '',
      data.source || '',
      data.message || '',
      data.consent ? 'Yes' : 'No',
      data.page || ''
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Step 5: Paste and Save
- Paste the code into the editor
- Click **Save** (💾 icon or Ctrl+S / Cmd+S)
- Give it a name like "IntegrateWise Form Handler" if prompted

### Step 6: Create NEW Deployment (Important!)

**Option A: Create New Deployment (Recommended)**
1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Fill in:
   - **Description**: "Contact Form Handler v2"
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** ⚠️ (This is critical!)
5. Click **Deploy**
6. **Copy the NEW Web App URL** that appears
7. Update `script.js` with this new URL if it's different

**Option B: Update Existing Deployment**
1. Click **Deploy** → **Manage deployments**
2. Click the **pencil/edit icon** ✏️ next to your deployment
3. Click **New version** (important!)
4. Make sure "Who has access" is **Anyone**
5. Click **Deploy**

### Step 7: Test
Visit your URL: https://script.google.com/macros/s/AKfycbzet3mdRXmM46DGwW1gRQXQSbVgBm2MaZ4GioNa9F_9wLLBRfx6CTwzCCRXTNwz4SzG8g/exec

You should see:
```json
{
  "status": "success",
  "message": "IntegrateWise Contact Form Handler is running",
  "method": "GET",
  "timestamp": "2024-...",
  "note": "This endpoint accepts POST requests from the contact form"
}
```

## Troubleshooting

### Still getting "doGet not found"?
1. **Make sure you saved the script** (check for unsaved changes indicator)
2. **Create a NEW deployment** instead of editing the old one
3. **Wait 1-2 minutes** after deploying (Google needs time to propagate)
4. **Check the script editor** - make sure `doGet` function is visible in the code

### Can't see Extensions menu?
- Make sure you're viewing the Google Sheet (not just the URL)
- Try refreshing the page
- Make sure you have edit access to the sheet

### Permission errors?
- Make sure "Who has access" is set to **Anyone** (not "Only myself")
- Redeploy after changing permissions

## Verify Your Sheet Headers

Make sure Row 1 in your Google Sheet has these headers:
```
Timestamp | Name | Company | Email | Phone | Source | Message | Consent | Page URL
```

If not, add them now before testing the form!

