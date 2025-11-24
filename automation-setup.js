/**
 * IntegrateWise Automation Setup Script
 * This script provides the foundation for implementing the automation workflows
 */

const axios = require('axios');
const cron = require('node-cron');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration
const config = require('./automation-config.json');

// API Clients
class AutomationClients {
  constructor() {
    this.initializeClients();
  }

  initializeClients() {
    // Airtable Client
    this.airtable = {
      baseURL: 'https://api.airtable.com/v0',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      baseId: process.env.AIRTABLE_BASE_ID
    };

    // Coda Client
    this.coda = {
      baseURL: 'https://coda.io/apis/v1',
      headers: {
        'Authorization': `Bearer ${process.env.CODA_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      docId: process.env.CODA_DOC_ID
    };

    // Notion Client
    this.notion = {
      baseURL: 'https://api.notion.com/v1',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    };

    // Zoho Books Client
    this.zohoBooks = {
      baseURL: 'https://books.zoho.in/api/v3',
      headers: {
        'Authorization': `Zoho-oauthtoken ${process.env.ZOHO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      organizationId: process.env.ZOHO_ORGANIZATION_ID
    };

    // Gmail Client (requires OAuth2 setup)
    this.gmail = {
      baseURL: 'https://gmail.googleapis.com/gmail/v1',
      headers: {
        'Authorization': `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    // Slack Client
    this.slack = {
      webhookURL: process.env.SLACK_WEBHOOK_URL
    };
  }
}

// Workflow Implementations
class IntegrateWiseWorkflows {
  constructor(clients) {
    this.clients = clients;
  }

  // Lead Capture Workflow
  async handleLeadCapture(leadData) {
    try {
      console.log('Processing new lead:', leadData.email);

      // 1. Parse lead data
      const parsedLead = {
        Name: leadData.name,
        Email: leadData.email,
        Company: leadData.company,
        Interest_Area: leadData.interest_area,
        Source: leadData.source,
        Created_Date: new Date().toISOString()
      };

      // 2. Check if contact exists
      const existingContact = await this.checkExistingContact(parsedLead.Email);

      // 3. Create or update records
      let contactId;
      if (existingContact) {
        contactId = existingContact.id;
        await this.updateContact(contactId, { Last_Interaction: new Date().toISOString() });
      } else {
        contactId = await this.createContact(parsedLead);
      }

      // 4. Create lead record
      const leadId = await this.createLead({
        ...parsedLead,
        Contact: [contactId]
      });

      // 5. Send auto-response email
      await this.sendAutoResponseEmail(parsedLead.Email, parsedLead.Name);

      // 6. Send Slack notification
      await this.sendSlackNotification('#new-leads', {
        text: `New lead received!`,
        attachments: [{
          color: 'good',
          fields: [
            { title: 'Name', value: parsedLead.Name, short: true },
            { title: 'Company', value: parsedLead.Company, short: true },
            { title: 'Interest Area', value: parsedLead.Interest_Area, short: true },
            { title: 'Source', value: parsedLead.Source, short: true }
          ]
        }]
      });

      // 7. Assign lead based on interest area
      const owner = this.getLeadOwner(parsedLead.Interest_Area);
      await this.assignLead(leadId, owner);

      return { success: true, leadId, contactId };
    } catch (error) {
      console.error('Error in lead capture workflow:', error);
      throw error;
    }
  }

  // Client Onboarding Workflow
  async handleClientOnboarding(dealData) {
    try {
      console.log('Starting client onboarding for:', dealData.client_name);

      // 1. Create project in Airtable
      const projectData = {
        Client_Name: dealData.client_name,
        Deal_Value: dealData.deal_value,
        Service_Type: dealData.service_type,
        Start_Date: dealData.start_date,
        Status: 'Kickoff',
        Client: [dealData.client_id],
        Deal: [dealData.deal_id]
      };

      const projectId = await this.createProject(projectData);

      // 2. Generate onboarding checklist in Coda
      const checklist = await this.generateOnboardingChecklist(projectId, dealData.client_name);

      // 3. Send welcome email
      await this.sendWelcomeEmail(dealData.client_email, dealData.client_name, projectData);

      // 4. Create calendar events
      await this.createWeeklyCheckIns(dealData.client_name, dealData.start_date);

      // 5. Set up Box folders
      await this.setupProjectFolders(dealData.client_name, projectId);

      return { success: true, projectId, checklist };
    } catch (error) {
      console.error('Error in client onboarding workflow:', error);
      throw error;
    }
  }

  // Helper methods
  async checkExistingContact(email) {
    const response = await axios.get(
      `${this.clients.airtable.baseURL}/${this.clients.airtable.baseId}/Contacts`,
      {
        headers: this.clients.airtable.headers,
        params: {
          filterByFormula: `{Email}="${email}"`
        }
      }
    );
    return response.data.records[0];
  }

  async createContact(contactData) {
    const response = await axios.post(
      `${this.clients.airtable.baseURL}/${this.clients.airtable.baseId}/Contacts`,
      { fields: contactData },
      { headers: this.clients.airtable.headers }
    );
    return response.data.id;
  }

  async createLead(leadData) {
    const response = await axios.post(
      `${this.clients.airtable.baseURL}/${this.clients.airtable.baseId}/Leads`,
      { fields: leadData },
      { headers: this.clients.airtable.headers }
    );
    return response.data.id;
  }

  async sendAutoResponseEmail(email, name) {
    // Implementation depends on Gmail API setup
    console.log(`Sending auto-response email to ${email}`);
    // Add actual Gmail API implementation
  }

  async sendSlackNotification(channel, message) {
    await axios.post(this.clients.slack.webhookURL, message);
  }

  getLeadOwner(interestArea) {
    const ownerMapping = {
      'MuleSoft': 'nirmal',
      'Salesforce': 'tbd',
      'Low-code': 'tbd'
    };
    return ownerMapping[interestArea] || 'tbd';
  }

  async assignLead(leadId, owner) {
    await axios.patch(
      `${this.clients.airtable.baseURL}/${this.clients.airtable.baseId}/Leads/${leadId}`,
      { fields: { Owner: owner } },
      { headers: this.clients.airtable.headers }
    );
  }

  async createProject(projectData) {
    const response = await axios.post(
      `${this.clients.airtable.baseURL}/${this.clients.airtable.baseId}/Projects`,
      { fields: projectData },
      { headers: this.clients.airtable.headers }
    );
    return response.data.id;
  }

  async generateOnboardingChecklist(projectId, clientName) {
    // Implementation for Coda checklist generation
    console.log(`Generating onboarding checklist for ${clientName}`);
    // Add actual Coda API implementation
    return ['SOW signing', 'Kickoff meeting', 'Access provisioning', 'Baseline documentation'];
  }

  async sendWelcomeEmail(email, clientName, projectData) {
    console.log(`Sending welcome email to ${clientName} at ${email}`);
    // Add actual Gmail API implementation
  }

  async createWeeklyCheckIns(clientName, startDate) {
    console.log(`Creating weekly check-ins for ${clientName} starting ${startDate}`);
    // Add Google Calendar API implementation
  }

  async setupProjectFolders(clientName, projectId) {
    console.log(`Setting up Box folders for ${clientName} - Project ${projectId}`);
    // Add Box API implementation
  }
}

// Personal Finance Workflows
class PersonalFinanceWorkflows {
  constructor(clients) {
    this.clients = clients;
  }

  // EMI Scheduling
  async processEMISchedule() {
    try {
      console.log('Processing monthly EMI schedule...');

      // 1. Get active loans from Coda
      const loans = await this.getActiveLoans();

      // 2. Process each loan
      for (const loan of loans) {
        const emiBreakdown = this.calculateEMI(loan);
        
        // Update outstanding balance
        const newBalance = loan.outstanding_balance - emiBreakdown.principal;
        await this.updateLoanBalance(loan.id, newBalance);

        // Log transaction
        await this.logTransaction({
          loan_id: loan.id,
          amount: emiBreakdown.total,
          principal: emiBreakdown.principal,
          interest: emiBreakdown.interest,
          date: new Date().toISOString()
        });
      }

      // 3. Send reminders
      await this.sendEMIReminders(loans);

      return { success: true, processed: loans.length };
    } catch (error) {
      console.error('Error in EMI scheduling:', error);
      throw error;
    }
  }

  // GST Automation
  async processGSTFiling() {
    try {
      console.log('Processing GST filing for previous month...');

      // 1. Get invoices from Zoho Books
      const invoices = await this.getPreviousMonthInvoices();

      // 2. Calculate GST
      const gstSummary = this.calculateGSTSummary(invoices);

      // 3. Generate GSTR-1 report
      const report = await this.generateGSTR1Report(gstSummary);

      // 4. Send to accountant
      await this.sendGSTReport(report);

      return { success: true, summary: gstSummary };
    } catch (error) {
      console.error('Error in GST automation:', error);
      throw error;
    }
  }

  // Helper methods
  async getActiveLoans() {
    // Coda API call to get loans
    console.log('Fetching active loans from Coda...');
    // Add actual implementation
    return [];
  }

  calculateEMI(loan) {
    const monthlyRate = loan.interest_rate / 12 / 100;
    const emi = loan.principal * monthlyRate * Math.pow(1 + monthlyRate, loan.tenure) / 
                (Math.pow(1 + monthlyRate, loan.tenure) - 1);
    
    const interest = loan.outstanding_balance * monthlyRate;
    const principal = emi - interest;
    
    return {
      total: emi,
      principal: principal,
      interest: interest
    };
  }

  async getPreviousMonthInvoices() {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    // Zoho Books API call
    console.log('Fetching invoices from Zoho Books...');
    // Add actual implementation
    return [];
  }

  calculateGSTSummary(invoices) {
    const summary = {
      total_taxable_value: 0,
      gst_collected: 0,
      gst_by_rate: {
        '5': 0,
        '12': 0,
        '18': 0,
        '28': 0
      }
    };

    invoices.forEach(invoice => {
      summary.total_taxable_value += invoice.sub_total;
      summary.gst_collected += invoice.tax_total;
      summary.gst_by_rate[invoice.tax_percentage] += invoice.tax_total;
    });

    return summary;
  }
}

// Cross-Platform Sync
class CrossPlatformSync {
  constructor(clients) {
    this.clients = clients;
  }

  // Main sync pipeline
  async syncPlatforms() {
    try {
      console.log('Starting cross-platform sync...');

      // 1. Sync Coda Accounts to Airtable Clients
      await this.syncCodaToAirtable('accounts', 'clients');

      // 2. Sync Airtable Projects to Coda
      await this.syncAirtableToCode('projects', 'projects');

      // 3. Sync Coda Tasks to Notion
      await this.syncCodaToNotion('tasks', 'tasks');

      return { success: true, timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('Error in cross-platform sync:', error);
      throw error;
    }
  }

  // Data integrity checks
  async runDataIntegrityChecks() {
    try {
      console.log('Running data integrity checks...');

      const issues = [];

      // Check for orphaned records
      const orphans = await this.findOrphanedRecords();
      issues.push(...orphans);

      // Check for missing required fields
      const missing = await this.findMissingFields();
      issues.push(...missing);

      // Check for duplicates
      const duplicates = await this.findDuplicates();
      issues.push(...duplicates);

      // Auto-fix where possible
      for (const issue of issues) {
        if (issue.autoFixable) {
          await this.autoFixIssue(issue);
        }
      }

      // Send report
      await this.sendIntegrityReport(issues);

      return { success: true, issues: issues.length };
    } catch (error) {
      console.error('Error in data integrity checks:', error);
      throw error;
    }
  }
}

// Scheduler Setup
class AutomationScheduler {
  constructor() {
    this.clients = new AutomationClients();
    this.integrateWise = new IntegrateWiseWorkflows(this.clients);
    this.personalFinance = new PersonalFinanceWorkflows(this.clients);
    this.crossPlatform = new CrossPlatformSync(this.clients);
  }

  setupSchedules() {
    // EMI Scheduling - Monthly on 1st at 7:00 AM IST
    cron.schedule('0 7 1 * *', () => {
      this.personalFinance.processEMISchedule();
    }, {
      timezone: 'Asia/Kolkata'
    });

    // Debt Consolidation - Weekly on Sunday at 8 PM IST
    cron.schedule('0 20 * * 0', () => {
      // Add debt consolidation logic
      console.log('Running debt consolidation tracker...');
    }, {
      timezone: 'Asia/Kolkata'
    });

    // GST Automation - Monthly on 5th
    cron.schedule('0 9 5 * *', () => {
      this.personalFinance.processGSTFiling();
    }, {
      timezone: 'Asia/Kolkata'
    });

    // Zoho Books Sync - Daily at 11 PM IST
    cron.schedule('0 23 * * *', () => {
      // Add Zoho Books sync logic
      console.log('Running Zoho Books sync...');
    }, {
      timezone: 'Asia/Kolkata'
    });

    // Cross-Platform Sync - Every 15 minutes
    cron.schedule('*/15 * * * *', () => {
      this.crossPlatform.syncPlatforms();
    });

    // Data Integrity Checks - Daily at 2 AM IST
    cron.schedule('0 2 * * *', () => {
      this.crossPlatform.runDataIntegrityChecks();
    }, {
      timezone: 'Asia/Kolkata'
    });

    console.log('All schedules set up successfully!');
  }
}

// Express server for webhooks
const express = require('express');
const app = express();
app.use(express.json());

const scheduler = new AutomationScheduler();

// Webhook endpoints
app.post('/webhook/lead-capture', async (req, res) => {
  try {
    const result = await scheduler.integrateWise.handleLeadCapture(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/webhook/deal-closed', async (req, res) => {
  try {
    const result = await scheduler.integrateWise.handleClientOnboarding(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/webhook/sync', async (req, res) => {
  try {
    const result = await scheduler.crossPlatform.syncPlatforms();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    workflows: {
      integratewise: 'active',
      personal_finance: 'active',
      cross_platform_sync: 'active'
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Automation server running on port ${PORT}`);
  scheduler.setupSchedules();
});

module.exports = {
  AutomationClients,
  IntegrateWiseWorkflows,
  PersonalFinanceWorkflows,
  CrossPlatformSync,
  AutomationScheduler
};
