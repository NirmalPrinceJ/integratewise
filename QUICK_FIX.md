# Quick Fix: Update Your Google Apps Script

The error "Script function not found: doGet" means you need to update your Google Apps Script with the new code.

## Copy This Code Into Google Apps Script

1. **Open your Google Sheet**: https://docs.google.com/spreadsheets/d/1T4OCMvL0RkJXiDPUkcIZyie8RfwdOa-CGwfvWK1zpRI/edit

2. **Go to Apps Script**: Extensions → Apps Script

3. **Delete ALL existing code** in the editor

4. **Copy and paste this ENTIRE code block**:

```javascript
/**
 * Google Apps Script for IntegrateWise Contact Form
 */

// Your Google Sheet ID
const SHEET_ID = '1T4OCMvL0RkJXiDPUkcIZyie8RfwdOa-CGwfvWK1zpRI';
const SHEET_NAME = 'Sheet1'; // Change if your sheet tab has a different name

// Handle GET requests (for testing/debugging when accessing URL directly)
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

// Handle POST requests (form submissions)
function doPost(e) {
  try {
    // Parse the JSON data from the form
    const data = JSON.parse(e.postData.contents);
    
    // Open the Google Sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // Append the data to the sheet
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
    
    // Optional: Send email notification
    // Uncomment the lines below to receive email notifications
    /*
    const subject = 'New Contact Form Submission - ' + data.company;
    const body = `
      New contact form submission:
      
      Name: ${data.name}
      Company: ${data.company}
      Email: ${data.email}
      Phone: ${data.phone}
      Source: ${data.source}
      Message: ${data.message}
      Consent: ${data.consent ? 'Yes' : 'No'}
      Page: ${data.page}
      Timestamp: ${data.timestamp}
    `;
    MailApp.sendEmail('connect@integratewise.co', subject, body);
    */
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log error and return error response
    Logger.log('Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function (optional - for testing the script)
function test() {
  const testData = {
    timestamp: new Date().toISOString(),
    name: 'Test User',
    company: 'Test Company',
    email: 'test@example.com',
    phone: '+1 555 123 4567',
    source: 'google',
    message: 'This is a test message',
    consent: true,
    page: 'https://integratewise.co/contact.html'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  doPost(mockEvent);
}
```

5. **Click Save** (Ctrl+S or Cmd+S)

6. **Redeploy the script**:
   - Click **Deploy** → **Manage deployments**
   - Click the **pencil/edit icon** next to your existing deployment
   - Click **Deploy** (or create a new version)
   - **IMPORTANT**: Make sure "Who has access" is set to **Anyone**

7. **Test it**:
   - Visit: https://script.google.com/macros/s/AKfycbzet3mdRXmM46DGwW1gRQXQSbVgBm2MaZ4GioNa9F_9wLLBRfx6CTwzCCRXTNwz4SzG8g/exec
   - You should see a JSON response like: `{"status":"success","message":"IntegrateWise Contact Form Handler is running",...}`

## Why This Happens

When you visit a Google Apps Script Web App URL directly in a browser, it makes a **GET** request. Your script needs a `doGet()` function to handle this. The form submissions use **POST** requests, which are handled by `doPost()`.

Both functions are now included in the code above!

