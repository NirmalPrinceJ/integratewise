/**
 * Google Apps Script for IntegrateWise Contact Form
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets and create a new spreadsheet
 * 2. Name it "IntegrateWise Contact Form Responses"
 * 3. Add headers in Row 1: Timestamp, Name, Company, Email, Phone, Source, Message, Consent, Page URL
 * 4. Go to Extensions > Apps Script
 * 5. Delete the default code and paste this entire file
 * 6. Replace 'YOUR_SHEET_ID_HERE' with your Google Sheet ID (from the URL)
 * 7. Click Save (Ctrl+S or Cmd+S)
 * 8. Click Deploy > New deployment
 * 9. Select type: Web app
 * 10. Execute as: Me
 * 11. Who has access: Anyone
 * 12. Click Deploy
 * 13. Copy the Web App URL
 * 14. Paste it into script.js replacing 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
 */

// Replace with your Google Sheet ID (found in the Sheet URL)
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


