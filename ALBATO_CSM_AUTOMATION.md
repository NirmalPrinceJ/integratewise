# IntegrateWise CSM Automation Suite - Albato Implementation

## Architecture Overview
**Platform:** Albato (Primary orchestration)  
**Data Layer:** Coda (Source of truth)  
**Communication:** Slack, Gmail  
**Timezone:** Asia/Calcutta (IST)  

## Workflow 1: Account Health Scoring

### Albato Bundle Configuration
```yaml
Bundle_Name: CSM_Health_Score_Calculator
Trigger: Schedule - Daily 9:00 AM IST
Apps: 
  - Coda (API v2)
  - Slack (Webhook)
  - Custom Code (Node.js)
```

### Implementation Steps

#### Step 1: Data Aggregation
**App:** Coda  
**Action:** List Records (Multiple Tables)
```json
{
  "tables": [
    {"doc_id": "{{CODA_DOC_ID}}", "table": "Accounts"},
    {"doc_id": "{{CODA_DOC_ID}}", "table": "Meetings"},
    {"doc_id": "{{CODA_DOC_ID}}", "table": "Risks"},
    {"doc_id": "{{CODA_DOC_ID}}", "table": "Opportunities"}
  ]
}
```

#### Step 2: Health Score Calculation
**App:** Code by Albato
```javascript
// Health Score Calculator
const calculateHealthScore = (data) => {
  const { accounts, meetings, risks, opportunities } = data;
  
  const weights = {
    engagement: 0.35,
    risk: 0.30,
    opportunity: 0.35
  };
  
  return accounts.map(account => {
    // Last engagement calculation
    const lastMeeting = meetings
      .filter(m => m.account_id === account.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    
    const daysSinceContact = lastMeeting 
      ? Math.floor((Date.now() - new Date(lastMeeting.date)) / (1000 * 60 * 60 * 24))
      : 90;
    
    // Risk assessment
    const openRisks = risks
      .filter(r => r.account_id === account.id && r.status !== 'Closed')
      .length;
    
    // Opportunity value
    const pipelineValue = opportunities
      .filter(o => o.account_id === account.id)
      .reduce((sum, o) => sum + (o.value || 0), 0);
    
    // Score calculation (0-100 scale)
    const engagementScore = Math.max(0, 100 - daysSinceContact);
    const riskScore = Math.max(0, 100 - (openRisks * 20));
    const opportunityScore = Math.min(100, pipelineValue / 10000);
    
    const totalScore = 
      (weights.engagement * engagementScore) +
      (weights.risk * riskScore) +
      (weights.opportunity * opportunityScore);
    
    const status = 
      totalScore >= 70 ? 'Green' :
      totalScore >= 40 ? 'Amber' : 'Red';
    
    return {
      account_id: account.id,
      account_name: account.name,
      health_score: Math.round(totalScore),
      health_status: status,
      days_since_contact: daysSinceContact,
      open_risks: openRisks,
      pipeline_value: pipelineValue
    };
  });
};

return calculateHealthScore(inputData);
```

#### Step 3: Update Coda Records
**App:** Coda  
**Action:** Update Row (Batch)
```json
{
  "doc_id": "{{CODA_DOC_ID}}",
  "table_id": "Accounts",
  "updates": "{{health_scores}}",
  "key_column": "Account_ID"
}
```

#### Step 4: Alert for Red Accounts
**App:** Filter by Albato  
**Condition:** `health_status == "Red"`

**Then App:** Slack  
**Action:** Send Message
```json
{
  "channel": "#csm-alerts",
  "text": "🚨 Account Health Alert",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*{{account_name}}* health dropped to RED\n*Score:* {{health_score}}/100\n*Days Since Contact:* {{days_since_contact}}\n*Open Risks:* {{open_risks}}"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {"type": "plain_text", "text": "View Account"},
          "url": "https://coda.io/d/{{CODA_DOC_ID}}#Accounts_{{account_id}}"
        }
      ]
    }
  ]
}
```

## Workflow 2: Renewal Tracking

### Albato Bundle Configuration
```yaml
Bundle_Name: CSM_Renewal_Manager
Trigger: Schedule - Weekly Monday 8:00 AM IST
Apps:
  - Coda (API v2)
  - Gmail
  - Slack
  - Custom Code
```

### Implementation Steps

#### Step 1: Query Upcoming Renewals
**App:** Coda  
**Action:** List Records with Formula
```json
{
  "doc_id": "{{CODA_DOC_ID}}",
  "table_id": "Accounts",
  "query": "Renewal_Date >= Today() AND Renewal_Date <= Today() + 90"
}
```

#### Step 2: Process Renewal Tasks
**App:** Code by Albato
```javascript
// Renewal Task Processor
const processRenewals = async (accounts, existingTasks) => {
  const today = new Date();
  const results = {
    tasksToCreate: [],
    renewalSummary: {
      next30Days: [],
      next60Days: [],
      next90Days: []
    },
    urgentAlerts: []
  };
  
  accounts.forEach(account => {
    const renewalDate = new Date(account.renewal_date);
    const daysUntilRenewal = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));
    const taskDueDate = new Date(renewalDate);
    taskDueDate.setDate(taskDueDate.getDate() - 30);
    
    // Categorize by urgency
    if (daysUntilRenewal <= 30) {
      results.next30Days.push(account);
      results.urgentAlerts.push(account);
    } else if (daysUntilRenewal <= 60) {
      results.next60Days.push(account);
    } else {
      results.next90Days.push(account);
    }
    
    // Check for existing renewal task
    const hasTask = existingTasks.some(task => 
      task.account_id === account.id && 
      task.title.includes('renewal') &&
      task.status !== 'Completed'
    );
    
    if (!hasTask && daysUntilRenewal <= 90) {
      results.tasksToCreate.push({
        title: `Prepare renewal proposal for ${account.name}`,
        account_id: account.id,
        assignee: account.account_owner,
        due_date: taskDueDate.toISOString().split('T')[0],
        priority: daysUntilRenewal <= 30 ? 'High' : 'Medium',
        type: 'Renewal',
        status: 'Not Started'
      });
    }
  });
  
  return results;
};

return processRenewals(inputData.accounts, inputData.tasks);
```

#### Step 3: Create Missing Tasks
**App:** Coda  
**Action:** Create Rows (Batch)
```json
{
  "doc_id": "{{CODA_DOC_ID}}",
  "table_id": "Tasks",
  "rows": "{{tasksToCreate}}"
}
```

#### Step 4: Send Weekly Digest
**App:** Gmail  
**Action:** Send Email
```html
{
  "to": "csm-team@integratewise.com",
  "subject": "Weekly Renewal Report - {{current_date}}",
  "html_body": "
    <h2>Renewal Dashboard</h2>
    
    <h3>🔴 Next 30 Days ({{next30Days.length}} accounts)</h3>
    <ul>
      {{#each next30Days}}
      <li><strong>{{name}}</strong> - Renews: {{renewal_date}} | ARR: ₹{{arr}}</li>
      {{/each}}
    </ul>
    
    <h3>🟡 Next 60 Days ({{next60Days.length}} accounts)</h3>
    <ul>
      {{#each next60Days}}
      <li>{{name}} - Renews: {{renewal_date}}</li>
      {{/each}}
    </ul>
    
    <h3>🟢 Next 90 Days ({{next90Days.length}} accounts)</h3>
    <ul>
      {{#each next90Days}}
      <li>{{name}} - Renews: {{renewal_date}}</li>
      {{/each}}
    </ul>
    
    <p><a href='https://coda.io/d/{{CODA_DOC_ID}}#Renewals'>View Full Dashboard</a></p>
  "
}
```

#### Step 5: Urgent Slack Alerts
**App:** Iterator by Albato  
**For Each:** urgentAlerts

**App:** Slack  
**Action:** Send Message
```json
{
  "channel": "#csm-alerts",
  "text": "⚠️ Renewal in {{daysUntilRenewal}} days: {{account_name}} (₹{{arr}} ARR)"
}
```

## Workflow 3: Stakeholder Engagement Automation

### Albato Bundle Configuration
```yaml
Bundle_Name: CSM_Engagement_Followup
Trigger: Webhook - Coda Row Added (Meetings table)
Apps:
  - Coda (Webhook)
  - Gmail
  - Custom Code
  - Coda (API)
```

### Implementation Steps

#### Step 1: Webhook Receiver
**Webhook URL:** `https://webhook.albato.com/wh/{{BUNDLE_ID}}/meeting-logged`

**Coda Automation Setup:**
```formula
// Add to Coda Meetings table automation
When: Row Added
Then: Webhook.Post(
  "https://webhook.albato.com/wh/{{BUNDLE_ID}}/meeting-logged",
  {
    account_id: thisRow.Account_ID,
    meeting_date: thisRow.Meeting_Date,
    attendees: thisRow.Attendees,
    meeting_topic: thisRow.Topic,
    next_steps: thisRow.Next_Steps,
    notes: thisRow.Notes,
    owner_email: thisRow.Account.Owner_Email
  }
)
```

#### Step 2: Generate Follow-up Content
**App:** Code by Albato
```javascript
// Follow-up Email Generator
const generateFollowUp = (meetingData) => {
  const { 
    attendees, 
    meeting_topic, 
    meeting_date, 
    next_steps, 
    notes,
    account_name 
  } = meetingData;
  
  // Parse attendees
  const attendeeList = attendees.split(',').map(a => a.trim());
  
  // Extract key points from notes (AI-like summarization)
  const keyPoints = notes
    .split('\n')
    .filter(line => line.includes('Decision:') || line.includes('Action:'))
    .slice(0, 3);
  
  // Format next steps
  const formattedNextSteps = next_steps
    .split('\n')
    .map((step, i) => `${i + 1}. ${step}`)
    .join('\n');
  
  const emailContent = {
    subject: `Follow-up: ${meeting_topic} - ${new Date(meeting_date).toLocaleDateString('en-IN')}`,
    recipients: attendeeList,
    body: `
Dear Team,

Thank you for taking the time to meet today regarding ${meeting_topic}.

**Key Discussion Points:**
${keyPoints.join('\n')}

**Next Steps:**
${formattedNextSteps}

**Timeline:** We'll reconnect on these action items by ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}.

Please don't hesitate to reach out if you have any questions or need clarification on any points discussed.

Best regards,
IntegrateWise CSM Team
    `,
    shouldCreateTask: next_steps && next_steps.length > 0
  };
  
  return emailContent;
};

return generateFollowUp(inputData);
```

#### Step 3: Send Follow-up Email
**App:** Gmail  
**Action:** Send Email
```json
{
  "to": "{{recipients}}",
  "subject": "{{subject}}",
  "body": "{{body}}",
  "cc": "{{owner_email}}"
}
```

#### Step 4: Update Last Engagement
**App:** Coda  
**Action:** Update Row
```json
{
  "doc_id": "{{CODA_DOC_ID}}",
  "table_id": "Accounts",
  "row_id": "{{account_id}}",
  "updates": {
    "Last_Engagement_Date": "{{meeting_date}}",
    "Last_Engagement_Type": "Meeting",
    "Engagement_Count": "{{current_count + 1}}"
  }
}
```

#### Step 5: Create Follow-up Task
**App:** Router by Albato  
**Condition:** `shouldCreateTask == true`

**Then App:** Coda  
**Action:** Create Row
```json
{
  "doc_id": "{{CODA_DOC_ID}}",
  "table_id": "Tasks",
  "row": {
    "Title": "Follow up on: {{meeting_topic}}",
    "Account_ID": "{{account_id}}",
    "Due_Date": "{{date_plus_7_days}}",
    "Assignee": "{{owner_email}}",
    "Description": "{{next_steps}}",
    "Type": "Follow-up",
    "Status": "Not Started"
  }
}
```

## Global Configuration

### Environment Variables (Albato)
```env
CODA_DOC_ID=d_xxxxxxxxxxxxx
CODA_API_TOKEN={{encrypted_token}}
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
GMAIL_AUTH={{oauth_token}}
TIMEZONE=Asia/Calcutta
```

### Error Handling
All bundles include:
```javascript
// Error Handler Module
try {
  // Main workflow logic
} catch (error) {
  // Log to Albato monitoring
  console.error('Workflow Error:', error);
  
  // Send alert
  await sendSlackAlert({
    channel: '#csm-system-alerts',
    text: `Automation Error in ${bundleName}: ${error.message}`
  });
  
  // Retry logic
  if (retryCount < 3) {
    await delay(5000 * retryCount);
    return retry();
  }
  
  throw error;
}
```

### Rate Limiting
```javascript
// Coda API Rate Limiter
const rateLimiter = {
  maxRequests: 100,
  perMinute: 60,
  queue: [],
  
  async execute(fn) {
    if (this.queue.length >= this.maxRequests) {
      await new Promise(resolve => setTimeout(resolve, 60000 / this.maxRequests));
    }
    return fn();
  }
};
```

## Monitoring Dashboard

### Albato Analytics Integration
- Bundle execution success rate
- Average execution time
- Error frequency by type
- API quota usage

### Custom KPI Tracking
```javascript
// Track automation metrics
const metrics = {
  health_scores_calculated: counter,
  renewals_processed: counter,
  followups_sent: counter,
  tasks_created: counter,
  alerts_triggered: counter
};

// Send to monitoring endpoint
POST https://monitoring.integratewise.com/metrics
```

## Deployment Checklist

1. **Albato Setup**
   - [ ] Create Albato account with Business plan
   - [ ] Set up team workspace
   - [ ] Configure API connections

2. **Coda Configuration**
   - [ ] Enable API access
   - [ ] Create webhook automations
   - [ ] Set up External_ID columns

3. **Communication Channels**
   - [ ] Connect Gmail with OAuth
   - [ ] Create Slack webhooks
   - [ ] Set up #csm-alerts channel

4. **Testing**
   - [ ] Test each workflow individually
   - [ ] Verify data synchronization
   - [ ] Confirm alert delivery

5. **Go Live**
   - [ ] Enable scheduled triggers
   - [ ] Monitor first 24 hours
   - [ ] Document any adjustments
