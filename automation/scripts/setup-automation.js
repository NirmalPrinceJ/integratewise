#!/usr/bin/env node

/**
 * IntegrateWise Automation Setup Script
 * 
 * This script helps set up automation workflows by:
 * 1. Validating environment variables
 * 2. Testing API connections
 * 3. Creating initial configuration files
 * 4. Setting up webhooks
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const CONFIG_DIR = path.join(__dirname, '../config');
const ENV_TEMPLATE = `# Automation API Keys
# Copy this to .env and fill in your credentials

# xAI (Grok) API
XAI_API_KEY=your_xai_api_key_here

# Todoist API
TODOIST_API_KEY=your_todoist_api_key_here

# Coda API
CODA_DOC_ID=your_coda_doc_id
CODA_API_TOKEN=your_coda_api_token

# Airtable API
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id

# Salesforce API
SALESFORCE_CLIENT_ID=your_salesforce_client_id
SALESFORCE_CLIENT_SECRET=your_salesforce_client_secret
SALESFORCE_USERNAME=your_salesforce_username
SALESFORCE_PASSWORD=your_salesforce_password
SALESFORCE_SECURITY_TOKEN=your_salesforce_security_token

# HubSpot API
HUBSPOT_API_KEY=your_hubspot_api_key

# Box API
BOX_CLIENT_ID=your_box_client_id
BOX_CLIENT_SECRET=your_box_client_secret
BOX_ACCESS_TOKEN=your_box_access_token

# Stripe API
STRIPE_API_KEY=your_stripe_api_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Zoho Books API
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REFRESH_TOKEN=your_zoho_refresh_token

# Slack Webhook
SLACK_WEBHOOK_URL=your_slack_webhook_url

# Vercel API
VERCEL_API_TOKEN=your_vercel_api_token

# GitHub (for webhooks)
GITHUB_TOKEN=your_github_token
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret
`;

const REQUIRED_ENV_VARS = [
  'XAI_API_KEY',
  'TODOIST_API_KEY',
  'CODA_DOC_ID',
  'CODA_API_TOKEN'
];

async function checkEnvFile() {
  const envPath = path.join(__dirname, '../../.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env file not found. Creating template...');
    fs.writeFileSync(envPath, ENV_TEMPLATE);
    console.log('✅ Created .env template. Please fill in your API keys.');
    return false;
  }
  
  require('dotenv').config({ path: envPath });
  return true;
}

async function validateEnvVars() {
  const missing = [];
  
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName] || process.env[varName].includes('your_')) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    console.log('❌ Missing required environment variables:');
    missing.forEach(v => console.log(`   - ${v}`));
    return false;
  }
  
  console.log('✅ All required environment variables are set.');
  return true;
}

async function testTodoistConnection() {
  if (!process.env.TODOIST_API_KEY) {
    console.log('⏭️  Skipping Todoist test (API key not set)');
    return true;
  }
  
  try {
    const response = await axios.get('https://api.todoist.com/rest/v2/projects', {
      headers: {
        'Authorization': `Bearer ${process.env.TODOIST_API_KEY}`
      }
    });
    console.log('✅ Todoist connection successful');
    return true;
  } catch (error) {
    console.log('❌ Todoist connection failed:', error.message);
    return false;
  }
}

async function testCodaConnection() {
  if (!process.env.CODA_API_TOKEN || !process.env.CODA_DOC_ID) {
    console.log('⏭️  Skipping Coda test (API credentials not set)');
    return true;
  }
  
  try {
    const response = await axios.get(
      `https://coda.io/apis/v1/docs/${process.env.CODA_DOC_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CODA_API_TOKEN}`
        }
      }
    );
    console.log('✅ Coda connection successful');
    return true;
  } catch (error) {
    console.log('❌ Coda connection failed:', error.message);
    return false;
  }
}

async function testGrokConnection() {
  if (!process.env.XAI_API_KEY) {
    console.log('⏭️  Skipping Grok test (API key not set)');
    return true;
  }
  
  try {
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        model: 'grok-beta',
        messages: [
          { role: 'user', content: 'Hello, this is a test.' }
        ],
        max_tokens: 10
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Grok (xAI) connection successful');
    return true;
  } catch (error) {
    console.log('❌ Grok connection failed:', error.response?.data?.error?.message || error.message);
    return false;
  }
}

async function createConfigFiles() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  
  console.log('✅ Configuration directory ready');
}

async function main() {
  console.log('\n🚀 IntegrateWise Automation Setup\n');
  console.log('=' .repeat(50));
  
  // Step 1: Check .env file
  console.log('\n📋 Step 1: Checking environment configuration...');
  const envExists = await checkEnvFile();
  
  if (!envExists) {
    console.log('\n⚠️  Please configure your .env file and run this script again.');
    process.exit(1);
  }
  
  // Step 2: Validate environment variables
  console.log('\n🔍 Step 2: Validating environment variables...');
  const envValid = await validateEnvVars();
  
  if (!envValid) {
    console.log('\n⚠️  Please set all required environment variables in .env file.');
    process.exit(1);
  }
  
  // Step 3: Test API connections
  console.log('\n🔌 Step 3: Testing API connections...');
  const results = {
    todoist: await testTodoistConnection(),
    coda: await testCodaConnection(),
    grok: await testGrokConnection()
  };
  
  // Step 4: Create config files
  console.log('\n📁 Step 4: Setting up configuration files...');
  await createConfigFiles();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Setup Summary:\n');
  console.log(`Environment Config: ${envValid ? '✅' : '❌'}`);
  console.log(`Todoist API: ${results.todoist ? '✅' : '❌'}`);
  console.log(`Coda API: ${results.coda ? '✅' : '❌'}`);
  console.log(`Grok API: ${results.grok ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(r => r) && envValid;
  
  if (allPassed) {
    console.log('\n✅ Setup complete! You can now start using automation workflows.');
    console.log('\n📖 Next steps:');
    console.log('   1. Review AUTOMATION_WORKFLOWS.md for workflow details');
    console.log('   2. Import workflows to Zapier/Make.com/n8n');
    console.log('   3. Test each workflow individually');
    console.log('   4. Enable workflows once tested\n');
  } else {
    console.log('\n⚠️  Some connections failed. Please check your API keys and try again.\n');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };

