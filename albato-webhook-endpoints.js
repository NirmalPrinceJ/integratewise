/**
 * Albato Webhook Endpoints for IntegrateWise CSM Automation
 * Deploy this to Vercel/Netlify for webhook processing
 */

const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
app.use(express.json());

// Environment variables
const ALBATO_SECRET = process.env.ALBATO_SECRET;
const CODA_API_TOKEN = process.env.CODA_API_TOKEN;
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;

/**
 * Verify Albato webhook signature
 */
function verifySignature(req, secret) {
  const signature = req.headers['x-albato-signature'];
  const timestamp = req.headers['x-albato-timestamp'];
  const payload = timestamp + JSON.stringify(req.body);
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}

/**
 * Meeting Logged Webhook
 * Triggered when new meeting is added to Coda
 */
app.post('/webhook/meeting-logged', async (req, res) => {
  try {
    // Verify webhook authenticity
    if (!verifySignature(req, ALBATO_SECRET)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const meetingData = req.body;
    
    // Process meeting data
    const followUpData = await processMeetingFollowUp(meetingData);
    
    // Trigger Albato bundle via API
    const albatorResponse = await axios.post(
      'https://api.albato.com/v1/bundles/trigger',
      {
        bundle_id: 'csm_engagement_followup',
        data: followUpData
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.ALBATO_API_KEY}`
        }
      }
    );
    
    res.json({ 
      success: true, 
      bundle_execution_id: albatorResponse.data.execution_id 
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Send error to Slack
    await sendSlackAlert({
      text: `Webhook Error: ${error.message}`,
      channel: '#csm-system-alerts'
    });
    
    res.status(500).json({ error: 'Processing failed' });
  }
});

/**
 * Account Update Webhook
 * For real-time health score triggers
 */
app.post('/webhook/account-update', async (req, res) => {
  try {
    if (!verifySignature(req, ALBATO_SECRET)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { account_id, field_changed, new_value } = req.body;
    
    // Trigger health score recalculation if critical field changed
    const criticalFields = ['last_engagement_date', 'renewal_date', 'arr', 'status'];
    
    if (criticalFields.includes(field_changed)) {
      await triggerHealthScoreUpdate(account_id);
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Account update webhook error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

/**
 * Form Submission Webhook
 * Handle contact form submissions from website
 */
app.post('/webhook/form-submission', async (req, res) => {
  try {
    const formData = req.body;
    
    // Create lead in Coda CRM
    const leadData = {
      name: formData.name,
      email: formData.email,
      company: formData.company,
      phone: formData.phone,
      source: 'Website',
      status: 'New',
      created_date: new Date().toISOString(),
      inquiry_type: formData.inquiry_type || 'General',
      message: formData.message
    };
    
    // Add to Coda
    const codaResponse = await addToCoda('CRM', leadData);
    
    // Trigger Albato workflow for lead nurturing
    await axios.post(
      'https://api.albato.com/v1/bundles/trigger',
      {
        bundle_id: 'lead_nurture_sequence',
        data: leadData
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.ALBATO_API_KEY}`
        }
      }
    );
    
    // Send Slack notification
    await sendSlackAlert({
      text: `New lead from website: ${formData.name} (${formData.company})`,
      channel: '#sales-alerts'
    });
    
    res.json({ 
      success: true, 
      message: 'Thank you for your inquiry. We will contact you soon.' 
    });
    
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ error: 'Submission failed' });
  }
});

/**
 * Scheduled Task Webhook
 * For cron-based triggers from external services
 */
app.post('/webhook/scheduled/:task', async (req, res) => {
  try {
    const { task } = req.params;
    const validTasks = ['health_score', 'renewal_check', 'weekly_report'];
    
    if (!validTasks.includes(task)) {
      return res.status(400).json({ error: 'Invalid task' });
    }
    
    // Trigger appropriate Albato bundle
    const bundleMap = {
      'health_score': 'csm_health_score_calculator',
      'renewal_check': 'csm_renewal_manager',
      'weekly_report': 'csm_weekly_digest'
    };
    
    const response = await axios.post(
      'https://api.albato.com/v1/bundles/execute',
      {
        bundle_id: bundleMap[task]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.ALBATO_API_KEY}`
        }
      }
    );
    
    res.json({ 
      success: true, 
      execution_id: response.data.execution_id 
    });
    
  } catch (error) {
    console.error('Scheduled task error:', error);
    res.status(500).json({ error: 'Task execution failed' });
  }
});

/**
 * Helper Functions
 */

async function processMeetingFollowUp(meetingData) {
  // Extract and enhance meeting data
  const enhancedData = {
    ...meetingData,
    follow_up_date: calculateFollowUpDate(meetingData.meeting_date),
    priority: determinePriority(meetingData),
    email_template: selectEmailTemplate(meetingData.meeting_type)
  };
  
  return enhancedData;
}

async function triggerHealthScoreUpdate(accountId) {
  // Trigger immediate health score recalculation
  await axios.post(
    'https://api.albato.com/v1/bundles/execute',
    {
      bundle_id: 'csm_health_score_calculator',
      data: { account_id: accountId }
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.ALBATO_API_KEY}`
      }
    }
  );
}

async function addToCoda(table, data) {
  const response = await axios.post(
    `https://coda.io/apis/v1/docs/${process.env.CODA_DOC_ID}/tables/${table}/rows`,
    {
      rows: [{ cells: data }]
    },
    {
      headers: {
        'Authorization': `Bearer ${CODA_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}

async function sendSlackAlert(message) {
  await axios.post(SLACK_WEBHOOK, message);
}

function calculateFollowUpDate(meetingDate) {
  const date = new Date(meetingDate);
  date.setDate(date.getDate() + 7);
  return date.toISOString();
}

function determinePriority(meetingData) {
  if (meetingData.account_tier === 'Enterprise') return 'High';
  if (meetingData.renewal_date && daysBetween(new Date(), new Date(meetingData.renewal_date)) < 60) return 'High';
  return 'Medium';
}

function selectEmailTemplate(meetingType) {
  const templates = {
    'qbr': 'quarterly_business_review',
    'onboarding': 'onboarding_followup',
    'support': 'support_resolution',
    'renewal': 'renewal_discussion',
    'default': 'standard_followup'
  };
  
  return templates[meetingType] || templates.default;
}

function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'IntegrateWise Webhook Service'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook service running on port ${PORT}`);
});

module.exports = app;
