# n8n AI Collaboration Workflow - Action Plan

**Project:** Multi-AI Topic Analysis & Task Generation  
**Platform:** n8n (Self-Hosted)  
**Status:** Planning Phase  
**Created:** 2024-11-24

---

## 1. Provision Credentials

### 1.1 LLM API Keys

#### Claude (Anthropic)
- **Service:** Anthropic API
- **Scopes:** `messages:write` (minimal required)
- **Storage:** n8n Credentials → New → Anthropic
- **Name:** `Anthropic API - Production`
- **Rotation:** Every 90 days
- **Backup:** Store in Bitwarden vault "n8n-credentials"
- **Documentation:** [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

**Action Items:**
- [ ] Create API key in Anthropic Console
- [ ] Add to n8n Credentials with name "Anthropic API"
- [ ] Test connection with simple message
- [ ] Document key ID and creation date
- [ ] Set calendar reminder for rotation (90 days)

#### OpenAI (GPT-4)
- **Service:** OpenAI API
- **Scopes:** `chat:write` (minimal required)
- **Storage:** n8n Credentials → New → OpenAI
- **Name:** `OpenAI API - Production`
- **Rotation:** Every 90 days
- **Rate Limits:** 10,000 TPM, 500 RPM
- **Documentation:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

**Action Items:**
- [ ] Create API key in OpenAI Platform
- [ ] Add to n8n Credentials with name "OpenAI API"
- [ ] Configure usage limits ($50/month soft limit)
- [ ] Test with GPT-4-turbo-preview model
- [ ] Document key prefix (sk-...) for identification

#### Google Gemini
- **Service:** Google AI Studio
- **Scopes:** `generativelanguage.readonly` (if using OAuth) or API Key
- **Storage:** n8n Credentials → Custom HTTP Header Auth
- **Name:** `Google Gemini API`
- **Rotation:** Every 90 days
- **Documentation:** [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

**Action Items:**
- [ ] Generate API key in Google AI Studio
- [ ] Create custom credential in n8n with header `X-API-Key`
- [ ] Test with gemini-pro model
- [ ] Verify quota limits (60 requests/minute)

#### Perplexity
- **Service:** Perplexity API
- **Scopes:** API Key only
- **Storage:** n8n Credentials → Custom HTTP Header Auth
- **Name:** `Perplexity API`
- **Rotation:** Every 90 days
- **Documentation:** [perplexity.ai/settings/api](https://perplexity.ai/settings/api)

**Action Items:**
- [ ] Generate API key in Perplexity settings
- [ ] Create custom credential with `Authorization: Bearer` header
- [ ] Test with pplx-70b-online model
- [ ] Document rate limits (5 requests/second)

#### Grok (Optional - Future)
- **Service:** xAI API
- **Scopes:** API Key
- **Storage:** n8n Credentials → Custom HTTP
- **Name:** `Grok API - Future`
- **Status:** Pending availability
- **Documentation:** [x.ai/api](https://x.ai/api)

**Action Items:**
- [ ] Monitor xAI API availability
- [ ] Request API access when available
- [ ] Add as 5th AI model option

### 1.2 Data/Systems Credentials

#### Coda
- **Service:** Coda API
- **Scopes:** `doc:read`, `doc:write`, `webhook:create`
- **Storage:** n8n Credentials → New → Coda
- **Name:** `Coda API - IntegrateWise`
- **Token Type:** Personal API Token
- **Rotation:** Every 180 days
- **Documentation:** [coda.io/developers/apis](https://coda.io/developers/apis)

**Action Items:**
- [ ] Generate token in Coda Account Settings → Developer
- [ ] Add to n8n Credentials
- [ ] Test read/write access to target doc
- [ ] Document Doc ID: `d_xxxxxxxxxxxxx`
- [ ] Verify table names: `Tasks`, `AI_Analysis_Sessions`

#### Notion (Optional - Context Retrieval)
- **Service:** Notion API
- **Scopes:** `read`, `update` (minimal)
- **Storage:** n8n Credentials → New → Notion
- **Name:** `Notion API - Context`
- **Token Type:** Internal Integration
- **Rotation:** Every 180 days
- **Documentation:** [developers.notion.com](https://developers.notion.com)

**Action Items:**
- [ ] Create internal integration in Notion
- [ ] Share databases with integration
- [ ] Add to n8n Credentials
- [ ] Test database query access

#### Salesforce (Optional - Enterprise Context)
- **Service:** Salesforce API
- **Scopes:** `api`, `refresh_token`
- **Storage:** n8n Credentials → OAuth2
- **Name:** `Salesforce API - CSM Data`
- **Token Type:** OAuth2 with refresh
- **Rotation:** Automatic via refresh token
- **Documentation:** [developer.salesforce.com](https://developer.salesforce.com)

**Action Items:**
- [ ] Create Connected App in Salesforce
- [ ] Configure OAuth2 callback URL
- [ ] Add to n8n Credentials
- [ ] Test query access to Account/Contact objects

#### Slack
- **Service:** Slack Incoming Webhooks
- **Scopes:** Webhook URL only
- **Storage:** n8n Credentials → Custom HTTP
- **Name:** `Slack Webhook - AI Alerts`
- **Rotation:** Every 90 days (regenerate webhook)
- **Documentation:** [api.slack.com/messaging/webhooks](https://api.slack.com/messaging/webhooks)

**Action Items:**
- [ ] Create webhook in Slack App → Incoming Webhooks
- [ ] Configure channel: `#ai-collaboration-alerts`
- [ ] Add webhook URL to n8n Credentials
- [ ] Test message delivery
- [ ] Document webhook ID for rotation tracking

#### Gmail (Optional - Email Notifications)
- **Service:** Gmail API
- **Scopes:** `gmail.send`, `gmail.compose`
- **Storage:** n8n Credentials → OAuth2
- **Name:** `Gmail API - Notifications`
- **Token Type:** OAuth2 with refresh
- **Rotation:** Automatic
- **Documentation:** [developers.google.com/gmail/api](https://developers.google.com/gmail/api)

**Action Items:**
- [ ] Create OAuth2 credentials in Google Cloud Console
- [ ] Configure OAuth consent screen
- [ ] Add to n8n Credentials
- [ ] Test email send capability

### 1.3 Credential Management Design

**Pattern:** One credential per service per environment

```
Credentials Structure:
├── Production
│   ├── Anthropic API - Production
│   ├── OpenAI API - Production
│   ├── Google Gemini API - Production
│   ├── Perplexity API - Production
│   ├── Coda API - IntegrateWise
│   └── Slack Webhook - AI Alerts
├── Staging
│   ├── Anthropic API - Staging
│   ├── OpenAI API - Staging
│   └── ...
└── Development
    ├── Anthropic API - Dev
    └── ...
```

**Rotation Schedule:**
- LLM APIs: Every 90 days
- Data Systems: Every 180 days
- Webhooks: Every 90 days

**Documentation Template:**
```markdown
## Credential: [Name]
- **Service:** [Service Name]
- **Created:** [Date]
- **Last Rotated:** [Date]
- **Next Rotation:** [Date]
- **Key ID/Prefix:** [Identifier]
- **Stored In:** [Location]
- **Access:** [Who has access]
```

---

## 2. Define Environment Variables

### 2.1 Base Configuration Variables

#### Model Selection
```bash
# Primary Models
VAR_MODEL_GPT4="gpt-4-turbo-preview"
VAR_MODEL_CLAUDE="claude-3-opus-20240229"
VAR_MODEL_GEMINI="gemini-pro"
VAR_MODEL_PERPLEXITY="pplx-70b-online"

# Fallback Models (for cost optimization)
VAR_MODEL_GPT4_FALLBACK="gpt-3.5-turbo"
VAR_MODEL_CLAUDE_FALLBACK="claude-3-sonnet-20240229"
```

#### API Endpoints
```bash
# Base URLs
VAR_OPENAI_BASE_URL="https://api.openai.com/v1"
VAR_ANTHROPIC_BASE_URL="https://api.anthropic.com/v1"
VAR_GEMINI_BASE_URL="https://generativelanguage.googleapis.com/v1"
VAR_PERPLEXITY_BASE_URL="https://api.perplexity.ai"

# Data Systems
VAR_CODA_BASE_URL="https://coda.io/apis/v1"
VAR_CODA_DOC_ID="d_xxxxxxxxxxxxx"
VAR_NOTION_BASE_URL="https://api.notion.com/v1"
VAR_SALESFORCE_BASE_URL="https://yourinstance.salesforce.com/services/data/v58.0"
```

#### Knowledge Base & Context
```bash
# Context Retrieval
VAR_KNOWLEDGE_BASE_URL="https://notion.integratewise.com"
VAR_CONTEXT_WINDOW_SIZE="5000"  # tokens
VAR_MAX_CONTEXT_ITEMS="10"
VAR_CONTEXT_FRESHNESS_DAYS="90"
```

### 2.2 LLM Configuration Variables

#### Temperature & Limits
```bash
# Temperature Settings (0.0 = deterministic, 1.0 = creative)
VAR_TEMPERATURE_ANALYSIS="0.7"      # For analysis tasks
VAR_TEMPERATURE_SYNTHESIS="0.5"     # For synthesis (more deterministic)
VAR_TEMPERATURE_CREATIVE="0.9"      # For creative tasks

# Token Limits
VAR_MAX_TOKENS_GPT4="2000"
VAR_MAX_TOKENS_CLAUDE="2000"
VAR_MAX_TOKENS_GEMINI="1500"
VAR_MAX_TOKENS_PERPLEXITY="1000"

# Response Format
VAR_RESPONSE_FORMAT="json_object"   # For structured output
```

#### Rate Limiting
```bash
# Rate Limit Configuration
VAR_RATE_LIMIT_OPENAI_RPM="500"
VAR_RATE_LIMIT_OPENAI_TPM="10000"
VAR_RATE_LIMIT_ANTHROPIC_RPM="50"
VAR_RATE_LIMIT_GEMINI_RPM="60"
VAR_RATE_LIMIT_PERPLEXITY_RPS="5"

# Retry Configuration
VAR_MAX_RETRIES="3"
VAR_RETRY_DELAY_MS="1000"
VAR_TIMEOUT_MS="30000"
```

### 2.3 Feature Flags

```bash
# Feature Toggles
VAR_ENABLE_GPT4="true"
VAR_ENABLE_CLAUDE="true"
VAR_ENABLE_GEMINI="true"
VAR_ENABLE_PERPLEXITY="true"
VAR_ENABLE_META_ANALYSIS="true"
VAR_ENABLE_TASK_GENERATION="true"
VAR_ENABLE_SLACK_NOTIFICATIONS="true"
VAR_ENABLE_CODA_WRITEBACK="true"
VAR_ENABLE_MONGODB_STORAGE="true"

# Advanced Features
VAR_ENABLE_CACHING="true"
VAR_ENABLE_DEDUPLICATION="true"
VAR_ENABLE_ANALYTICS="true"
VAR_ENABLE_AUTO_RETRY="true"
```

### 2.4 Alert & Notification Channels

```bash
# Alert Configuration
VAR_ALERT_CHANNEL_SLACK="#ai-collaboration-alerts"
VAR_ALERT_CHANNEL_EMAIL="csm-team@integratewise.com"
VAR_ALERT_ON_ERROR="true"
VAR_ALERT_ON_TIMEOUT="true"
VAR_ALERT_ON_RATE_LIMIT="true"
VAR_ALERT_ON_LOW_CONFIDENCE="true"
VAR_CONFIDENCE_THRESHOLD="0.6"
```

### 2.5 Environment-Specific Variables

#### Production
```bash
NODE_ENV="production"
VAR_LOG_LEVEL="info"
VAR_EXECUTION_RETENTION_DAYS="90"
VAR_ENABLE_DETAILED_LOGS="true"
VAR_WEBHOOK_BASE_URL="https://ai-collab.integratewise.com"
```

#### Staging
```bash
NODE_ENV="staging"
VAR_LOG_LEVEL="debug"
VAR_EXECUTION_RETENTION_DAYS="30"
VAR_ENABLE_DETAILED_LOGS="true"
VAR_WEBHOOK_BASE_URL="https://staging-ai-collab.integratewise.com"
```

#### Development
```bash
NODE_ENV="development"
VAR_LOG_LEVEL="debug"
VAR_EXECUTION_RETENTION_DAYS="7"
VAR_ENABLE_DETAILED_LOGS="true"
VAR_WEBHOOK_BASE_URL="http://localhost:5678"
```

### 2.6 Variable Implementation in n8n

**Storage Method:**
1. **Project Settings** → Environment Variables (for sensitive)
2. **Workflow Settings** → Variables (for workflow-specific)
3. **Node Expressions** → `{{ $env.VAR_NAME }}`

**Access Pattern:**
```javascript
// In Code nodes
const modelName = $env.VAR_MODEL_GPT4;
const temperature = parseFloat($env.VAR_TEMPERATURE_ANALYSIS);
const maxTokens = parseInt($env.VAR_MAX_TOKENS_GPT4);
```

**Action Items:**
- [ ] Create environment variable template file
- [ ] Add all variables to n8n Project Settings
- [ ] Document variable purpose and default values
- [ ] Set up environment-specific configurations
- [ ] Test variable access in workflow nodes

---

## 3. Design the Workflow (Agent Loop)

### 3.1 Trigger Design

#### HTTP/Webhook Trigger (Primary)
```yaml
Trigger: HTTP Request
Method: POST
Path: /webhook/ai-collaborate
Authentication: Bearer Token (optional)
Content-Type: application/json

Request Schema:
{
  "topic": "string (required)",
  "context": "string (optional)",
  "depth": "comprehensive|tactical|quick (optional)",
  "priority": "high|medium|low (optional)",
  "requester": "string (optional)",
  "metadata": {}
}
```

**Action Items:**
- [ ] Create HTTP Request node as trigger
- [ ] Configure path: `/webhook/ai-collaborate`
- [ ] Add request validation (JSON schema)
- [ ] Set up authentication (Bearer token or API key)
- [ ] Test with Postman/curl

#### Cron/Schedule Trigger (Optional - Batch Processing)
```yaml
Trigger: Schedule
Frequency: Daily at 9:00 AM IST
Timezone: Asia/Calcutta

Default Topics:
- "Daily CSM insights and recommendations"
- "Weekly competitive analysis"
- "Monthly strategic review"
```

**Action Items:**
- [ ] Create Schedule Trigger node
- [ ] Configure timezone: Asia/Calcutta
- [ ] Set default topic payload
- [ ] Test schedule execution

### 3.2 Workflow Steps (Agent Loop)

#### Step 1: Input Validation
```javascript
// Code Node: Validate Input
const input = $input.first().json;

// Validation rules
const required = ['topic'];
const validations = {
  topic: (t) => typeof t === 'string' && t.length >= 10 && t.length <= 500,
  context: (c) => !c || (typeof c === 'string' && c.length <= 1000),
  depth: (d) => !d || ['comprehensive', 'tactical', 'quick'].includes(d)
};

// Validate
for (const field of required) {
  if (!input[field] || !validations[field](input[field])) {
    throw new Error(`Invalid ${field}: ${input[field]}`);
  }
}

// Enrich with defaults
return {
  ...input,
  depth: input.depth || 'comprehensive',
  priority: input.priority || 'medium',
  session_id: generateSessionId(),
  timestamp: new Date().toISOString()
};
```

**Action Items:**
- [ ] Create validation Code node
- [ ] Implement schema validation
- [ ] Add error handling for invalid inputs
- [ ] Test with various input formats

#### Step 2: Retrieve Context (Notion/Salesforce)
```javascript
// Code Node: Context Retriever
async function retrieveContext(topic, context) {
  const contextItems = [];
  
  // Query Notion for relevant documents
  if ($env.VAR_ENABLE_NOTION_CONTEXT === 'true') {
    const notionResults = await queryNotion({
      query: topic,
      limit: parseInt($env.VAR_MAX_CONTEXT_ITEMS)
    });
    contextItems.push(...notionResults);
  }
  
  // Query Salesforce for account data
  if (context.includes('account') || context.includes('customer')) {
    const sfResults = await querySalesforce({
      object: 'Account',
      filters: { status: 'Active' }
    });
    contextItems.push(...sfResults);
  }
  
  return {
    context_items: contextItems,
    context_summary: summarizeContext(contextItems),
    relevance_score: calculateRelevance(topic, contextItems)
  };
}
```

**Action Items:**
- [ ] Create context retrieval function
- [ ] Integrate Notion API queries
- [ ] Integrate Salesforce API queries (if needed)
- [ ] Implement relevance scoring
- [ ] Add caching for repeated topics

#### Step 3: LLM Reasoning (Parallel Execution)
```yaml
Parallel Branches:
  Branch 1: OpenAI GPT-4
    - Model: {{ $env.VAR_MODEL_GPT4 }}
    - Temperature: {{ $env.VAR_TEMPERATURE_ANALYSIS }}
    - Max Tokens: {{ $env.VAR_MAX_TOKENS_GPT4 }}
    - Prompt: Strategic analysis with implementation steps
    
  Branch 2: Anthropic Claude
    - Model: {{ $env.VAR_MODEL_CLAUDE }}
    - Temperature: {{ $env.VAR_TEMPERATURE_ANALYSIS }}
    - Max Tokens: {{ $env.VAR_MAX_TOKENS_CLAUDE }}
    - Prompt: Human-centered approach with ethical considerations
    
  Branch 3: Google Gemini
    - Model: {{ $env.VAR_MODEL_GEMINI }}
    - Temperature: {{ $env.VAR_TEMPERATURE_ANALYSIS }}
    - Max Tokens: {{ $env.VAR_MAX_TOKENS_GEMINI }}
    - Prompt: Data-driven insights with benchmarks
    
  Branch 4: Perplexity
    - Model: {{ $env.VAR_MODEL_PERPLEXITY }}
    - Temperature: 0.7
    - Max Tokens: {{ $env.VAR_MAX_TOKENS_PERPLEXITY }}
    - Prompt: Current market research with sources
```

**Action Items:**
- [ ] Create 4 parallel LLM nodes
- [ ] Configure each with appropriate model and parameters
- [ ] Implement prompt templates
- [ ] Add timeout handling (30 seconds)
- [ ] Test parallel execution

#### Step 4: Synthesis & Consensus Detection
```javascript
// Code Node: AI Response Synthesizer
function synthesizeResponses(aiResponses, context) {
  // Parse all AI responses
  const parsed = aiResponses.map(r => parseAIResponse(r));
  
  // Find consensus points
  const consensus = findConsensus(parsed);
  
  // Identify unique insights
  const unique = findUniqueInsights(parsed);
  
  // Calculate confidence
  const confidence = calculateConfidence(parsed, consensus);
  
  // Generate synthesis
  return {
    consensus_points: consensus,
    unique_insights: unique,
    confidence_score: confidence,
    ai_contributions: {
      gpt4: parsed[0],
      claude: parsed[1],
      gemini: parsed[2],
      perplexity: parsed[3]
    },
    recommendations: generateRecommendations(consensus, unique)
  };
}
```

**Action Items:**
- [ ] Create synthesis Code node
- [ ] Implement consensus detection algorithm
- [ ] Add confidence scoring logic
- [ ] Test with sample AI responses

#### Step 5: Meta-Analysis (Optional)
```yaml
Meta-Analysis Node:
  - Trigger: If confidence_score < 0.7
  - Model: GPT-4 (higher reasoning)
  - Prompt: "Synthesize these AI responses into executive summary..."
  - Output: Refined insights and recommendations
```

**Action Items:**
- [ ] Create conditional meta-analysis branch
- [ ] Configure GPT-4 for synthesis
- [ ] Test with low-confidence scenarios

#### Step 6: Task Generation
```javascript
// Code Node: Task Generator
function generateTasks(synthesis, metaAnalysis) {
  const tasks = [];
  
  // High-priority tasks from consensus
  synthesis.consensus_points
    .filter(cp => cp.strength === 'strong')
    .forEach((cp, index) => {
      tasks.push({
        title: `Consensus Action ${index + 1}: ${cp.point}`,
        priority: 'high',
        due_date: calculateDueDate('high'),
        category: determineCategory(cp.point),
        source: 'multi-ai-consensus',
        confidence: 0.9
      });
    });
  
  // Medium-priority from recommendations
  synthesis.recommendations
    .filter(r => r.priority === 'medium')
    .forEach(rec => {
      tasks.push({
        title: rec.title,
        priority: 'medium',
        due_date: calculateDueDate('medium'),
        category: rec.category,
        source: 'ai-recommendation',
        confidence: 0.75
      });
    });
  
  return tasks;
}
```

**Action Items:**
- [ ] Create task generation Code node
- [ ] Implement priority assignment logic
- [ ] Add due date calculation
- [ ] Test task creation

#### Step 7: Write-Back (Coda)
```yaml
Coda Write-Back:
  - Table: Tasks
  - Operation: Create Rows (Batch)
  - Mapping:
    - Title → Task Name
    - Priority → Priority
    - Due Date → Due Date
    - Category → Type
    - Source → Source
    - Confidence → Confidence Score
  - Error Handling: Retry 3x, then log to error queue
```

**Action Items:**
- [ ] Create Coda node for task creation
- [ ] Map task fields to Coda columns
- [ ] Implement batch processing
- [ ] Add error handling and retry logic

#### Step 8: Notification (Slack)
```yaml
Slack Notification:
  - Channel: {{ $env.VAR_ALERT_CHANNEL_SLACK }}
  - Format: Rich blocks with:
    - Header: Topic analyzed
    - Fields: Confidence, Tasks created, Consensus points
    - Actions: View in Coda button
  - Conditional: Only if tasks created > 0
```

**Action Items:**
- [ ] Create Slack notification node
- [ ] Design message blocks
- [ ] Add conditional logic
- [ ] Test message formatting

### 3.3 Error Paths

#### Timeout Handling
```javascript
// Code Node: Timeout Handler
if (executionTime > 30000) {
  // Log timeout
  await logError({
    type: 'timeout',
    node: currentNode,
    execution_time: executionTime
  });
  
  // Continue with available responses
  return partialResults;
}
```

#### Rate Limit Handling
```javascript
// Code Node: Rate Limit Handler
if (error.statusCode === 429) {
  // Calculate backoff
  const retryAfter = error.headers['retry-after'] || 60;
  
  // Queue for retry
  await queueForRetry({
    task: currentTask,
    retry_after: retryAfter,
    attempt: attemptCount
  });
  
  // Notify admin
  await sendAlert({
    type: 'rate_limit',
    service: serviceName,
    retry_after: retryAfter
  });
}
```

#### Schema Mismatch Handling
```javascript
// Code Node: Schema Validator
try {
  const parsed = JSON.parse(aiResponse);
  validateSchema(parsed, expectedSchema);
  return parsed;
} catch (error) {
  // Attempt to fix common issues
  const fixed = attemptSchemaFix(aiResponse);
  if (fixed) return fixed;
  
  // Log and use fallback
  await logError({
    type: 'schema_mismatch',
    response: aiResponse,
    error: error.message
  });
  
  return createFallbackResponse();
}
```

**Action Items:**
- [ ] Create error handling branches
- [ ] Implement timeout detection
- [ ] Add rate limit retry logic
- [ ] Create schema validation
- [ ] Test error scenarios

---

## 4. Implement Persistence and Queues

### 4.1 Data Tables

#### Conversation State Table
```sql
CREATE TABLE ai_collaboration_sessions (
  session_id VARCHAR(36) PRIMARY KEY,
  topic TEXT NOT NULL,
  context TEXT,
  depth VARCHAR(20),
  priority VARCHAR(10),
  requester VARCHAR(100),
  status VARCHAR(20), -- pending, processing, completed, failed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  execution_time_ms INTEGER,
  confidence_score DECIMAL(3,2),
  tasks_created INTEGER DEFAULT 0,
  ai_responses JSONB,
  synthesis JSONB,
  metadata JSONB
);

CREATE INDEX idx_sessions_status ON ai_collaboration_sessions(status);
CREATE INDEX idx_sessions_created ON ai_collaboration_sessions(created_at);
CREATE INDEX idx_sessions_requester ON ai_collaboration_sessions(requester);
```

**Action Items:**
- [ ] Create sessions table in PostgreSQL
- [ ] Add indexes for performance
- [ ] Create n8n Data Table node connection
- [ ] Test insert/update operations

#### Deduplication Keys Table
```sql
CREATE TABLE topic_deduplication (
  topic_hash VARCHAR(64) PRIMARY KEY, -- SHA-256 hash of normalized topic
  topic TEXT NOT NULL,
  session_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP, -- Cache expiration (24 hours)
  result_cache JSONB -- Cached synthesis result
);

CREATE INDEX idx_dedup_expires ON topic_deduplication(expires_at);
```

**Action Items:**
- [ ] Create deduplication table
- [ ] Implement topic normalization (lowercase, trim, remove special chars)
- [ ] Add hash generation function
- [ ] Create cache lookup logic
- [ ] Test deduplication flow

#### Retry Queue Table
```sql
CREATE TABLE retry_queue (
  queue_id SERIAL PRIMARY KEY,
  session_id VARCHAR(36),
  node_name VARCHAR(100),
  error_type VARCHAR(50),
  error_message TEXT,
  payload JSONB,
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  next_retry_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) -- pending, processing, completed, failed
);

CREATE INDEX idx_retry_status ON retry_queue(status, next_retry_at);
```

**Action Items:**
- [ ] Create retry queue table
- [ ] Implement queue processing logic
- [ ] Add exponential backoff calculation
- [ ] Create retry worker workflow
- [ ] Test retry mechanism

### 4.2 Scale Rules

#### When to Move to External DB
```yaml
Migration Triggers:
  - Rows > 100,000 in any table
  - ACID transactions required
  - Complex reporting queries needed
  - Multi-region access required
  - Backup/restore requirements

Current Setup:
  - n8n Data Tables: < 10,000 rows (suitable)
  - PostgreSQL: 10,000 - 100,000 rows (suitable)
  - External DB: > 100,000 rows (future)

External DB Options:
  - AWS RDS PostgreSQL
  - Supabase
  - PlanetScale (MySQL)
  - MongoDB Atlas
```

**Action Items:**
- [ ] Monitor table row counts
- [ ] Set up alerts at 80% capacity
- [ ] Document migration plan
- [ ] Test external DB connection

### 4.3 Queue Implementation

#### Retry Queue Worker
```javascript
// Separate n8n Workflow: Retry Queue Processor
// Trigger: Schedule every 5 minutes

// Query pending retries
const pendingRetries = await queryRetryQueue({
  status: 'pending',
  next_retry_at: { $lte: new Date() }
});

// Process each retry
for (const retry of pendingRetries) {
  try {
    // Execute original node logic
    const result = await executeNode(retry.node_name, retry.payload);
    
    // Mark as completed
    await updateRetryQueue(retry.queue_id, {
      status: 'completed',
      completed_at: new Date()
    });
    
    // Resume original workflow
    await resumeWorkflow(retry.session_id, result);
    
  } catch (error) {
    // Increment attempt count
    const newAttempt = retry.attempt_count + 1;
    
    if (newAttempt >= retry.max_attempts) {
      // Mark as failed
      await updateRetryQueue(retry.queue_id, {
        status: 'failed',
        error_message: error.message
      });
      
      // Send alert
      await sendAlert({
        type: 'retry_exhausted',
        queue_id: retry.queue_id,
        error: error.message
      });
    } else {
      // Schedule next retry
      const backoff = calculateBackoff(newAttempt);
      await updateRetryQueue(retry.queue_id, {
        attempt_count: newAttempt,
        next_retry_at: new Date(Date.now() + backoff)
      });
    }
  }
}
```

**Action Items:**
- [ ] Create retry queue worker workflow
- [ ] Implement exponential backoff
- [ ] Add max retry limits
- [ ] Test retry scenarios

---

## 5. Observability & Controls

### 5.1 Execution Logging

#### Enable Detailed Logs
```yaml
n8n Settings:
  - Execution Data: Save all execution data
  - Save Execution Progress: Enabled
  - Save Manual Executions: Enabled
  - Save Data on Error: Enabled
  - Save Data on Success: All entries
  - Save Execution Metrics: Enabled
```

**Action Items:**
- [ ] Enable detailed logging in n8n Settings
- [ ] Configure log retention (90 days production)
- [ ] Set up log rotation
- [ ] Test log access

#### Tag Runs by Requester
```javascript
// Code Node: Add Execution Tags
const tags = [
  `requester:${$json.requester || 'system'}`,
  `topic:${normalizeTopic($json.topic)}`,
  `priority:${$json.priority}`,
  `depth:${$json.depth}`
];

// Add to execution metadata
$execution.metadata.tags = tags;
```

**Action Items:**
- [ ] Implement tagging in workflow
- [ ] Create tag-based filtering
- [ ] Test tag assignment

### 5.2 LLM Node Logging
```javascript
// Code Node: Log LLM Interactions
async function logLLMInteraction(nodeName, prompt, response, metrics) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    node: nodeName,
    model: metrics.model,
    prompt_tokens: metrics.prompt_tokens,
    completion_tokens: metrics.completion_tokens,
    total_tokens: metrics.total_tokens,
    cost: calculateCost(metrics),
    latency_ms: metrics.latency,
    success: metrics.success
  };
  
  // Store in logging system
  await storeLogEntry(logEntry);
  
  // Alert on high cost or latency
  if (logEntry.cost > 0.10 || logEntry.latency_ms > 30000) {
    await sendAlert({
      type: 'llm_anomaly',
      log_entry: logEntry
    });
  }
}
```

**Action Items:**
- [ ] Create LLM logging function
- [ ] Add cost tracking
- [ ] Implement latency monitoring
- [ ] Set up anomaly alerts

### 5.3 I/O Node Logging
```javascript
// Code Node: Log I/O Operations
function logIOOperation(operation, target, data, result) {
  return {
    timestamp: new Date().toISOString(),
    operation: operation, // read, write, update, delete
    target: target, // coda, notion, slack, etc.
    data_size: JSON.stringify(data).length,
    success: result.success,
    latency_ms: result.latency,
    error: result.error
  };
}
```

**Action Items:**
- [ ] Add I/O logging to all external nodes
- [ ] Track data transfer sizes
- [ ] Monitor API quota usage
- [ ] Alert on quota limits

### 5.4 Project Settings

#### Concurrency Caps
```yaml
n8n Project Settings:
  - Max Concurrent Executions: 5
  - Max Execution Time: 300 seconds
  - Queue Mode: LIFO (Last In, First Out)
  - Timezone: Asia/Calcutta
```

**Action Items:**
- [ ] Set concurrency limits
- [ ] Configure execution timeout
- [ ] Set queue mode
- [ ] Test concurrent execution handling

#### Retention Windows
```yaml
Data Retention:
  - Execution Logs: 90 days (production)
  - Execution Logs: 30 days (staging)
  - Execution Logs: 7 days (development)
  - Session Data: 180 days
  - Retry Queue: 30 days
  - Cache: 24 hours
```

**Action Items:**
- [ ] Configure retention policies
- [ ] Set up automated cleanup
- [ ] Test retention enforcement

#### Permissions
```yaml
Role-Based Access:
  - Admin: Full access
  - Developer: Read/Write workflows
  - Operator: Execute workflows, view logs
  - Viewer: Read-only access
```

**Action Items:**
- [ ] Create user roles
- [ ] Assign permissions
- [ ] Test access controls
- [ ] Document access matrix

---

## 6. Test Flows End-to-End

### 6.1 Dry Runs with Synthetic Payloads

#### Test Payload 1: Standard Topic
```json
{
  "topic": "How to improve customer retention in enterprise SaaS",
  "context": "IntegrateWise CSM operations with 50+ accounts",
  "depth": "comprehensive",
  "priority": "high",
  "requester": "nirmal@integratewise.com"
}
```

**Expected Results:**
- ✅ All 4 AI models respond successfully
- ✅ Synthesis completes with confidence > 0.7
- ✅ 5-10 tasks generated
- ✅ Tasks created in Coda
- ✅ Slack notification sent
- ✅ Execution time < 60 seconds

**Action Items:**
- [ ] Create test payloads
- [ ] Run dry run executions
- [ ] Verify schema compliance
- [ ] Check latency targets

#### Test Payload 2: Quick Analysis
```json
{
  "topic": "Best practices for API rate limiting",
  "context": "Technical implementation",
  "depth": "quick",
  "priority": "medium"
}
```

**Expected Results:**
- ✅ Uses faster models (GPT-3.5, Claude Sonnet)
- ✅ Execution time < 30 seconds
- ✅ Reduced token usage
- ✅ Still generates actionable insights

**Action Items:**
- [ ] Test quick analysis mode
- [ ] Verify model selection
- [ ] Check cost optimization

### 6.2 Schema Assertions
```javascript
// Test: Schema Validation
const expectedSchema = {
  synthesis: {
    consensus_points: 'array',
    confidence_score: 'number',
    ai_contributions: 'object'
  },
  tasks: {
    type: 'array',
    items: {
      title: 'string',
      priority: 'string',
      due_date: 'string'
    }
  }
};

function assertSchema(data, schema) {
  // Implement recursive schema validation
  // Throw error if mismatch
}
```

**Action Items:**
- [ ] Create schema validation tests
- [ ] Test with various AI responses
- [ ] Verify error handling for mismatches

### 6.3 Latency Targets
```yaml
Performance Targets:
  - Total Execution: < 60 seconds (comprehensive)
  - Total Execution: < 30 seconds (quick)
  - AI Response Time: < 20 seconds per model
  - Synthesis Time: < 5 seconds
  - Task Creation: < 3 seconds
  - Notification: < 2 seconds
```

**Action Items:**
- [ ] Measure execution times
- [ ] Identify bottlenecks
- [ ] Optimize slow nodes
- [ ] Set up latency alerts

### 6.4 Failure Drills

#### Drill 1: Expired Token
```javascript
// Simulate expired token
const expiredToken = "expired_token_123";

// Expected Behavior:
// - Detect 401 error
// - Log error with context
// - Send alert to admin
// - Queue for retry after token refresh
// - Continue with other AI models
```

**Action Items:**
- [ ] Test with expired tokens
- [ ] Verify error detection
- [ ] Test token refresh flow
- [ ] Confirm graceful degradation

#### Drill 2: Rate Limit (429)
```javascript
// Simulate rate limit
const rateLimitError = {
  statusCode: 429,
  headers: { 'retry-after': '60' }
};

// Expected Behavior:
// - Detect 429 error
// - Calculate backoff time
// - Queue for retry
// - Continue with available models
// - Send alert if all models rate-limited
```

**Action Items:**
- [ ] Test rate limit handling
- [ ] Verify backoff calculation
- [ ] Test retry queue
- [ ] Confirm partial execution

#### Drill 3: Null/Invalid Fields
```json
{
  "topic": null,
  "context": "",
  "depth": "invalid_value"
}
```

**Expected Behavior:**
- ✅ Validation catches errors
- ✅ Returns clear error message
- ✅ Does not proceed to AI calls
- ✅ Logs validation failure

**Action Items:**
- [ ] Test with null values
- [ ] Test with invalid enums
- [ ] Verify validation messages
- [ ] Confirm error logging

#### Drill 4: Timeout Scenario
```javascript
// Simulate slow AI response
const slowResponse = new Promise((resolve) => {
  setTimeout(() => resolve(data), 60000); // 60 seconds
});

// Expected Behavior:
// - Timeout after 30 seconds
// - Log timeout error
// - Continue with other models
// - Generate synthesis with partial data
// - Lower confidence score
```

**Action Items:**
- [ ] Test timeout handling
- [ ] Verify partial execution
- [ ] Check confidence adjustment
- [ ] Confirm error logging

### 6.5 Benchmarks

#### Record Metrics
```javascript
// Code Node: Benchmark Recorder
const benchmarks = {
  execution_id: $execution.id,
  timestamp: new Date().toISOString(),
  
  // Token Usage
  tokens: {
    gpt4: { prompt: 500, completion: 1200, total: 1700 },
    claude: { prompt: 480, completion: 1150, total: 1630 },
    gemini: { prompt: 450, completion: 1000, total: 1450 },
    perplexity: { prompt: 400, completion: 800, total: 1200 },
    total: 5980
  },
  
  // Cost
  cost: {
    gpt4: 0.051, // $0.03 per 1K input, $0.06 per 1K output
    claude: 0.049,
    gemini: 0.015,
    perplexity: 0.012,
    total: 0.127
  },
  
  // Latency
  latency: {
    gpt4_ms: 8500,
    claude_ms: 9200,
    gemini_ms: 6800,
    perplexity_ms: 12000,
    synthesis_ms: 1200,
    total_ms: 38700
  },
  
  // Quality
  quality: {
    confidence_score: 0.82,
    consensus_points: 5,
    tasks_generated: 8,
    tasks_high_priority: 3
  }
};

// Store benchmarks
await storeBenchmark(benchmarks);
```

**Action Items:**
- [ ] Create benchmark recording function
- [ ] Run 10 test executions
- [ ] Calculate averages
- [ ] Document baseline metrics
- [ ] Set up benchmark alerts

---

## 7. Enable and Operate

### 7.1 Activate Workflow

**Current Status:** Inactive

**Activation Steps:**
1. Navigate to Workflow: "AI Collaboration Hub - Multi-Model Analysis"
2. Toggle "Active" switch to ON
3. Verify webhook URL is accessible
4. Test with sample request
5. Monitor first execution

**Action Items:**
- [ ] Review workflow configuration
- [ ] Verify all credentials are valid
- [ ] Check environment variables
- [ ] Toggle workflow to Active
- [ ] Test webhook endpoint
- [ ] Monitor initial executions

### 7.2 Monitor Usage

**Current Trial Status:**
- Executions Used: 0/1000
- Days Remaining: 14
- Efficiency Target: < 100 tokens per execution average

**Monitoring Dashboard:**
```yaml
Key Metrics:
  - Daily Executions: Track count
  - Token Usage: Monitor per execution
  - Cost per Execution: Target < $0.15
  - Success Rate: Target > 95%
  - Average Latency: Target < 45 seconds
```

**Action Items:**
- [ ] Set up usage tracking
- [ ] Create monitoring dashboard
- [ ] Set up daily usage alerts
- [ ] Optimize for efficiency
- [ ] Plan for production limits

### 7.3 Operational Checklist

#### Pre-Launch
- [ ] All credentials provisioned and tested
- [ ] Environment variables configured
- [ ] Workflow tested end-to-end
- [ ] Error handling verified
- [ ] Monitoring enabled
- [ ] Documentation complete

#### Launch Day
- [ ] Activate workflow
- [ ] Send test execution
- [ ] Verify all integrations
- [ ] Check Slack notifications
- [ ] Verify Coda task creation
- [ ] Monitor for 1 hour

#### Post-Launch (Week 1)
- [ ] Review execution logs daily
- [ ] Monitor token usage
- [ ] Check error rates
- [ ] Optimize slow nodes
- [ ] Gather user feedback
- [ ] Adjust as needed

#### Ongoing Operations
- [ ] Weekly usage review
- [ ] Monthly cost analysis
- [ ] Quarterly credential rotation
- [ ] Continuous optimization
- [ ] Feature enhancements

---

## Implementation Timeline

### Week 1: Foundation
- **Day 1-2:** Provision credentials (Section 1)
- **Day 3:** Define environment variables (Section 2)
- **Day 4-5:** Design workflow structure (Section 3.1-3.2)

### Week 2: Development
- **Day 1-3:** Implement workflow steps (Section 3.2)
- **Day 4:** Error handling (Section 3.3)
- **Day 5:** Persistence setup (Section 4)

### Week 3: Testing & Optimization
- **Day 1-2:** Observability setup (Section 5)
- **Day 3-4:** End-to-end testing (Section 6)
- **Day 5:** Performance optimization

### Week 4: Launch
- **Day 1:** Final testing and validation
- **Day 2:** Enable workflow (Section 7)
- **Day 3-5:** Monitor and optimize

---

## Success Criteria

✅ **Technical:**
- All 4 AI models respond successfully > 95% of time
- Average execution time < 60 seconds
- Cost per execution < $0.15
- Zero data loss

✅ **Functional:**
- Tasks created in Coda with correct mapping
- Slack notifications delivered
- Consensus detection accuracy > 80%
- User satisfaction with insights

✅ **Operational:**
- 24/7 uptime (except maintenance)
- Error rate < 5%
- Response to issues < 1 hour
- Documentation complete

---

**Next Step:** Begin with Section 1 - Provision Credentials
