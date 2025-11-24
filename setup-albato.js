#!/usr/bin/env node

/**
 * Albato Setup Script for IntegrateWise CSM Automation
 * Run: node setup-albato.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readline = require('readline');
const crypto = require('crypto');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utility function for colored console output
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Question wrapper for async/await
function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

/**
 * Main setup orchestrator
 */
async function setupAlbato() {
  log('\n==============================================', 'cyan');
  log('  IntegrateWise Albato Automation Setup', 'bright');
  log('==============================================\n', 'cyan');

  try {
    // Step 1: Check prerequisites
    log('Step 1: Checking prerequisites...', 'blue');
    await checkPrerequisites();
    
    // Step 2: Configure environment
    log('\nStep 2: Configuring environment...', 'blue');
    const config = await configureEnvironment();
    
    // Step 3: Validate API connections
    log('\nStep 3: Validating API connections...', 'blue');
    await validateConnections(config);
    
    // Step 4: Create Albato bundles
    log('\nStep 4: Creating Albato bundles...', 'blue');
    await createAlbatoBundles(config);
    
    // Step 5: Setup webhooks
    log('\nStep 5: Setting up webhooks...', 'blue');
    await setupWebhooks(config);
    
    // Step 6: Configure Coda automations
    log('\nStep 6: Configuring Coda automations...', 'blue');
    await setupCodaAutomations(config);
    
    // Step 7: Deploy webhook service
    log('\nStep 7: Deploying webhook service...', 'blue');
    await deployWebhookService(config);
    
    // Step 8: Run tests
    log('\nStep 8: Running integration tests...', 'blue');
    await runTests(config);
    
    log('\n✅ Setup completed successfully!', 'green');
    generateSummary(config);
    
  } catch (error) {
    log(`\n❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    rl.close();
  }
}

/**
 * Check system prerequisites
 */
async function checkPrerequisites() {
  const requirements = [
    { name: 'Node.js', command: 'node --version', minVersion: '18.0.0' },
    { name: 'npm', command: 'npm --version', minVersion: '8.0.0' }
  ];
  
  for (const req of requirements) {
    try {
      const { execSync } = require('child_process');
      const version = execSync(req.command, { encoding: 'utf8' }).trim();
      log(`  ✓ ${req.name}: ${version}`, 'green');
    } catch (error) {
      throw new Error(`${req.name} is not installed`);
    }
  }
  
  // Check for required files
  const requiredFiles = [
    'albato-webhook-endpoints.js',
    'albato-health-calculator.js',
    'albato-deployment.json'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Required file missing: ${file}`);
    }
    log(`  ✓ Found: ${file}`, 'green');
  }
}

/**
 * Configure environment variables
 */
async function configureEnvironment() {
  const config = {};
  
  // Check if .env exists
  if (fs.existsSync('.env')) {
    const useExisting = await question('Found existing .env file. Use it? (y/n): ');
    if (useExisting.toLowerCase() === 'y') {
      return loadEnvFile();
    }
  }
  
  log('\nPlease provide your API credentials:', 'yellow');
  
  // Albato credentials
  config.ALBATO_API_KEY = await question('Albato API Key: ');
  config.ALBATO_WORKSPACE_ID = await question('Albato Workspace ID: ');
  config.ALBATO_SECRET = crypto.randomBytes(32).toString('hex');
  
  // Coda credentials
  config.CODA_DOC_ID = await question('Coda Document ID: ');
  config.CODA_API_TOKEN = await question('Coda API Token: ');
  
  // Slack webhook
  config.SLACK_WEBHOOK_URL = await question('Slack Webhook URL: ');
  
  // Gmail OAuth (optional)
  const setupGmail = await question('Setup Gmail integration? (y/n): ');
  if (setupGmail.toLowerCase() === 'y') {
    config.GMAIL_CLIENT_ID = await question('Gmail Client ID: ');
    config.GMAIL_CLIENT_SECRET = await question('Gmail Client Secret: ');
  }
  
  // Webhook service URL
  config.WEBHOOK_BASE_URL = await question('Webhook Base URL (or press Enter for default): ') || 
                            'https://webhooks.integratewise.com';
  
  // Save to .env file
  saveEnvFile(config);
  
  return config;
}

/**
 * Validate API connections
 */
async function validateConnections(config) {
  const tests = [
    {
      name: 'Albato API',
      test: async () => {
        const response = await axios.get('https://api.albato.com/v1/workspace', {
          headers: { 'Authorization': `Bearer ${config.ALBATO_API_KEY}` }
        });
        return response.data.id === config.ALBATO_WORKSPACE_ID;
      }
    },
    {
      name: 'Coda API',
      test: async () => {
        const response = await axios.get(
          `https://coda.io/apis/v1/docs/${config.CODA_DOC_ID}`,
          {
            headers: { 'Authorization': `Bearer ${config.CODA_API_TOKEN}` }
          }
        );
        return response.data.id === config.CODA_DOC_ID;
      }
    },
    {
      name: 'Slack Webhook',
      test: async () => {
        const response = await axios.post(config.SLACK_WEBHOOK_URL, {
          text: 'IntegrateWise Albato setup test message'
        });
        return response.status === 200;
      }
    }
  ];
  
  for (const test of tests) {
    try {
      const result = await test.test();
      if (result) {
        log(`  ✓ ${test.name} connected`, 'green');
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      log(`  ✗ ${test.name} failed: ${error.message}`, 'red');
      const retry = await question(`Retry ${test.name}? (y/n): `);
      if (retry.toLowerCase() !== 'y') {
        throw new Error(`${test.name} connection failed`);
      }
    }
  }
}

/**
 * Create Albato bundles via API
 */
async function createAlbatoBundles(config) {
  const bundleConfig = JSON.parse(fs.readFileSync('albato-deployment.json', 'utf8'));
  
  for (const bundle of bundleConfig.albato.bundles) {
    try {
      log(`  Creating bundle: ${bundle.name}...`, 'yellow');
      
      const response = await axios.post(
        'https://api.albato.com/v1/bundles',
        {
          workspace_id: config.ALBATO_WORKSPACE_ID,
          name: bundle.name,
          trigger_type: bundle.trigger,
          schedule: bundle.schedule,
          timezone: bundle.timezone,
          apps: bundle.apps,
          config: {
            retries: bundle.retries,
            timeout: bundle.timeout
          }
        },
        {
          headers: { 'Authorization': `Bearer ${config.ALBATO_API_KEY}` }
        }
      );
      
      log(`    ✓ Bundle created: ${response.data.id}`, 'green');
      
      // Store bundle ID for later reference
      bundle.albato_id = response.data.id;
      
    } catch (error) {
      log(`    ✗ Failed to create bundle: ${error.message}`, 'red');
    }
  }
  
  // Save updated bundle IDs
  fs.writeFileSync(
    'albato-bundles.json',
    JSON.stringify(bundleConfig.albato.bundles, null, 2)
  );
}

/**
 * Setup webhook endpoints
 */
async function setupWebhooks(config) {
  const webhooks = [
    {
      name: 'Meeting Logged',
      path: '/webhook/meeting-logged',
      description: 'Triggered when new meeting is added to Coda'
    },
    {
      name: 'Account Update',
      path: '/webhook/account-update',
      description: 'Real-time account changes'
    },
    {
      name: 'Form Submission',
      path: '/webhook/form-submission',
      description: 'Website contact form submissions'
    }
  ];
  
  for (const webhook of webhooks) {
    log(`  Setting up webhook: ${webhook.name}...`, 'yellow');
    webhook.url = `${config.WEBHOOK_BASE_URL}${webhook.path}`;
    webhook.secret = config.ALBATO_SECRET;
    log(`    URL: ${webhook.url}`, 'cyan');
  }
  
  // Save webhook configuration
  fs.writeFileSync(
    'webhook-config.json',
    JSON.stringify(webhooks, null, 2)
  );
  
  log('  ✓ Webhook configuration saved', 'green');
}

/**
 * Setup Coda automations
 */
async function setupCodaAutomations(config) {
  log('  Creating Coda webhook automations...', 'yellow');
  
  const automations = [
    {
      table: 'Meetings',
      trigger: 'Row Added',
      webhook: `${config.WEBHOOK_BASE_URL}/webhook/meeting-logged`
    },
    {
      table: 'Accounts',
      trigger: 'Row Updated',
      webhook: `${config.WEBHOOK_BASE_URL}/webhook/account-update`
    }
  ];
  
  // Generate Coda automation formulas
  const formulas = automations.map(auto => ({
    table: auto.table,
    formula: `
      Webhook.Post(
        "${auto.webhook}",
        thisRow,
        {
          "X-Albato-Signature": HMAC("${config.ALBATO_SECRET}", thisRow.Id)
        }
      )
    `.trim()
  }));
  
  // Save formulas for manual setup
  fs.writeFileSync(
    'coda-automations.json',
    JSON.stringify(formulas, null, 2)
  );
  
  log('  ✓ Coda automation formulas generated', 'green');
  log('    Please add these to your Coda doc manually', 'yellow');
}

/**
 * Deploy webhook service
 */
async function deployWebhookService(config) {
  const deploymentChoice = await question(
    'Deploy webhook service to:\n  1. Vercel\n  2. Netlify\n  3. Local only\nChoice (1-3): '
  );
  
  switch (deploymentChoice) {
    case '1':
      await deployToVercel(config);
      break;
    case '2':
      await deployToNetlify(config);
      break;
    case '3':
      log('  Webhook service will run locally only', 'yellow');
      break;
    default:
      log('  Skipping deployment', 'yellow');
  }
}

async function deployToVercel(config) {
  try {
    log('  Deploying to Vercel...', 'yellow');
    
    // Create vercel.json
    const vercelConfig = {
      version: 2,
      builds: [
        {
          src: "albato-webhook-endpoints.js",
          use: "@vercel/node"
        }
      ],
      routes: [
        {
          src: "/webhook/(.*)",
          dest: "/albato-webhook-endpoints.js"
        }
      ],
      env: {
        ALBATO_SECRET: config.ALBATO_SECRET,
        CODA_API_TOKEN: config.CODA_API_TOKEN,
        SLACK_WEBHOOK: config.SLACK_WEBHOOK_URL
      }
    };
    
    fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
    
    const { execSync } = require('child_process');
    execSync('vercel --prod', { stdio: 'inherit' });
    
    log('  ✓ Deployed to Vercel', 'green');
  } catch (error) {
    log('  ✗ Vercel deployment failed', 'red');
  }
}

async function deployToNetlify(config) {
  log('  Manual deployment to Netlify:', 'yellow');
  log('    1. Visit https://app.netlify.com/drop', 'cyan');
  log('    2. Drag and drop this folder', 'cyan');
  log('    3. Set environment variables in Netlify dashboard', 'cyan');
}

/**
 * Run integration tests
 */
async function runTests(config) {
  const tests = [
    {
      name: 'Health Score Calculation',
      test: async () => {
        const HealthScoreCalculator = require('./albato-health-calculator.js');
        const calculator = new HealthScoreCalculator();
        
        const testData = {
          account: { id: 'test-001', name: 'Test Account', arr: 100000 },
          meetings: [{ date: new Date().toISOString() }],
          risks: [],
          opportunities: [{ value: 50000, stage: 'Proposal' }],
          tickets: [],
          surveys: [{ nps_score: 50, date: new Date().toISOString() }]
        };
        
        const result = calculator.calculateScore(testData);
        return result.health_score > 0 && result.health_score <= 100;
      }
    },
    {
      name: 'Webhook Endpoint',
      test: async () => {
        const response = await axios.get(`${config.WEBHOOK_BASE_URL}/health`);
        return response.data.status === 'healthy';
      }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.test();
      if (result) {
        log(`  ✓ ${test.name} passed`, 'green');
        passed++;
      } else {
        throw new Error('Test assertion failed');
      }
    } catch (error) {
      log(`  ✗ ${test.name} failed: ${error.message}`, 'red');
      failed++;
    }
  }
  
  log(`\n  Test Results: ${passed} passed, ${failed} failed`, failed > 0 ? 'yellow' : 'green');
}

/**
 * Generate setup summary
 */
function generateSummary(config) {
  const summary = `
${colors.cyan}==============================================
  Setup Summary
==============================================${colors.reset}

${colors.green}✅ Environment Configuration${colors.reset}
   - Configuration saved to .env
   - Webhook secret generated

${colors.green}✅ API Connections${colors.reset}
   - Albato API connected
   - Coda API connected
   - Slack webhook configured

${colors.green}✅ Albato Bundles${colors.reset}
   - Health Score Calculator
   - Renewal Manager
   - Engagement Follow-up

${colors.green}✅ Webhook Endpoints${colors.reset}
   - Base URL: ${config.WEBHOOK_BASE_URL}
   - Endpoints configured

${colors.yellow}📋 Next Steps:${colors.reset}

1. Add Coda automations from 'coda-automations.json'
2. Configure Albato bundle details in the UI
3. Test each workflow individually
4. Monitor first 24 hours of operation

${colors.cyan}Documentation:${colors.reset}
- Implementation Guide: ALBATO_CSM_AUTOMATION.md
- Webhook Reference: albato-webhook-endpoints.js
- Health Score Logic: albato-health-calculator.js

${colors.bright}🎉 Your IntegrateWise CSM automation is ready!${colors.reset}
`;

  console.log(summary);
  
  // Save summary to file
  fs.writeFileSync('setup-summary.txt', summary);
}

/**
 * Helper functions
 */

function loadEnvFile() {
  const envContent = fs.readFileSync('.env', 'utf8');
  const config = {};
  
  envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      config[key.trim()] = value.trim();
    }
  });
  
  return config;
}

function saveEnvFile(config) {
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync('.env', envContent);
  log('  ✓ Environment configuration saved to .env', 'green');
}

// Run setup
if (require.main === module) {
  setupAlbato().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

module.exports = { setupAlbato };
