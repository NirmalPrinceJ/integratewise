#!/usr/bin/env node

/**
 * IntegrateWise Automation Workflow Testing Script
 * 
 * Tests individual automation workflows to ensure they're working correctly
 */

const axios = require('axios');
require('dotenv').config();

const WORKFLOWS = {
  'todoist-grok': {
    name: 'Todoist → Grok Prioritization',
    test: async () => {
      // Test Todoist API
      const todoistRes = await axios.get('https://api.todoist.com/rest/v2/projects', {
        headers: { 'Authorization': `Bearer ${process.env.TODOIST_API_KEY}` }
      });
      
      // Test Grok API
      const grokRes = await axios.post(
        'https://api.x.ai/v1/chat/completions',
        {
          model: 'grok-beta',
          messages: [{ role: 'user', content: 'Test' }],
          max_tokens: 5
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return { success: true, message: 'Both APIs accessible' };
    }
  },
  'coda-sync': {
    name: 'Coda Synchronization',
    test: async () => {
      const res = await axios.get(
        `https://coda.io/apis/v1/docs/${process.env.CODA_DOC_ID}`,
        {
          headers: { 'Authorization': `Bearer ${process.env.CODA_API_TOKEN}` }
        }
      );
      return { success: true, message: 'Coda API accessible' };
    }
  }
};

async function testWorkflow(name) {
  const workflow = WORKFLOWS[name];
  if (!workflow) {
    throw new Error(`Workflow ${name} not found`);
  }
  
  try {
    console.log(`Testing: ${workflow.name}...`);
    const result = await workflow.test();
    console.log(`✅ ${workflow.name}: ${result.message}`);
    return true;
  } catch (error) {
    console.log(`❌ ${workflow.name}: ${error.message}`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Available workflows:');
    Object.keys(WORKFLOWS).forEach(key => {
      console.log(`  - ${key}: ${WORKFLOWS[key].name}`);
    });
    console.log('\nUsage: node test-workflows.js <workflow-name>');
    return;
  }
  
  const workflowName = args[0];
  const success = await testWorkflow(workflowName);
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testWorkflow, WORKFLOWS };

