/**
 * IntegrateWise AI Orchestrator
 * Routes AI-generated payloads to downstream apps
 */

export interface AIPayload {
  type: 'task' | 'doc' | 'issue' | 'contact' | 'design' | 'note';
  source: 'claude' | 'chatgpt' | 'gemini' | 'notebooklm' | 'perplexity' | 'custom';
  content: {
    title: string;
    body?: string;
    priority?: 'high' | 'medium' | 'low';
    due_date?: string;
    labels?: string[];
    assignee?: string;
    project?: string;
  };
  route_to: ('todoist' | 'notion' | 'github' | 'hubspot' | 'canva' | 'linear')[];
  metadata?: Record<string, unknown>;
}

export interface OrchestrationResult {
  success: boolean;
  provider: string;
  result?: unknown;
  error?: string;
}

export interface OrchestratorEnv {
  // Todoist
  TODOIST_API_TOKEN?: string;
  TODOIST_PROJECT_ID?: string;

  // Notion
  NOTION_API_KEY?: string;
  NOTION_DATABASE_ID?: string;

  // GitHub
  GITHUB_TOKEN?: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;

  // HubSpot
  HUBSPOT_ACCESS_TOKEN?: string;

  // Linear
  LINEAR_API_KEY?: string;
  LINEAR_TEAM_ID?: string;
}

// ============================================================================
// Todoist Integration
// ============================================================================

async function createTodoistTask(
  payload: AIPayload,
  env: OrchestratorEnv
): Promise<OrchestrationResult> {
  if (!env.TODOIST_API_TOKEN) {
    return { success: false, provider: 'todoist', error: 'TODOIST_API_TOKEN not configured' };
  }

  const priorityMap = { high: 4, medium: 3, low: 2 };

  try {
    const response = await fetch('https://api.todoist.com/rest/v2/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.TODOIST_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: payload.content.title,
        description: payload.content.body || `Source: ${payload.source}`,
        priority: priorityMap[payload.content.priority || 'medium'],
        due_string: payload.content.due_date,
        project_id: env.TODOIST_PROJECT_ID,
        labels: payload.content.labels || [payload.source, 'ai-generated']
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, provider: 'todoist', error };
    }

    const result = await response.json();
    return { success: true, provider: 'todoist', result };
  } catch (error) {
    return { success: false, provider: 'todoist', error: String(error) };
  }
}

// ============================================================================
// Notion Integration
// ============================================================================

async function createNotionPage(
  payload: AIPayload,
  env: OrchestratorEnv
): Promise<OrchestrationResult> {
  if (!env.NOTION_API_KEY) {
    return { success: false, provider: 'notion', error: 'NOTION_API_KEY not configured' };
  }

  try {
    // Simple page creation with just title and content
    const body: Record<string, unknown> = {
      parent: { database_id: env.NOTION_DATABASE_ID },
      properties: {
        'Doc name': {
          title: [{ text: { content: payload.content.title } }]
        }
      },
      children: [
        {
          object: 'block',
          type: 'callout',
          callout: {
            rich_text: [{ type: 'text', text: { content: `Source: ${payload.source} | Priority: ${payload.content.priority || 'medium'}` } }],
            icon: { emoji: '🤖' }
          }
        },
        ...(payload.content.body ? [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: payload.content.body } }]
            }
          }
        ] : [])
      ]
    };

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, provider: 'notion', error };
    }

    const result = await response.json();
    return { success: true, provider: 'notion', result };
  } catch (error) {
    return { success: false, provider: 'notion', error: String(error) };
  }
}

// ============================================================================
// GitHub Integration
// ============================================================================

async function createGitHubIssue(
  payload: AIPayload,
  env: OrchestratorEnv
): Promise<OrchestrationResult> {
  if (!env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO) {
    return { success: false, provider: 'github', error: 'GitHub credentials not configured' };
  }

  const labelMap: Record<string, string[]> = {
    high: ['priority: high', 'urgent'],
    medium: ['priority: medium'],
    low: ['priority: low']
  };

  try {
    const response = await fetch(
      `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/issues`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
          title: payload.content.title,
          body: `${payload.content.body || ''}\n\n---\n_Generated by ${payload.source} via IntegrateWise AI Relay_`,
          labels: [
            ...(labelMap[payload.content.priority || 'medium'] || []),
            'ai-generated',
            payload.source
          ],
          assignees: payload.content.assignee ? [payload.content.assignee] : []
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, provider: 'github', error };
    }

    const result = await response.json();
    return { success: true, provider: 'github', result };
  } catch (error) {
    return { success: false, provider: 'github', error: String(error) };
  }
}

// ============================================================================
// HubSpot Integration
// ============================================================================

async function createHubSpotContact(
  payload: AIPayload,
  env: OrchestratorEnv
): Promise<OrchestrationResult> {
  if (!env.HUBSPOT_ACCESS_TOKEN) {
    return { success: false, provider: 'hubspot', error: 'HUBSPOT_ACCESS_TOKEN not configured' };
  }

  try {
    // Parse contact info from payload
    const metadata = payload.metadata || {};

    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          firstname: metadata.first_name || payload.content.title.split(' ')[0],
          lastname: metadata.last_name || payload.content.title.split(' ').slice(1).join(' '),
          email: metadata.email,
          phone: metadata.phone,
          company: metadata.company,
          notes_last_contacted: payload.content.body,
          hs_lead_status: 'NEW',
          lifecyclestage: 'lead'
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, provider: 'hubspot', error };
    }

    const result = await response.json();
    return { success: true, provider: 'hubspot', result };
  } catch (error) {
    return { success: false, provider: 'hubspot', error: String(error) };
  }
}

// ============================================================================
// Linear Integration
// ============================================================================

async function createLinearIssue(
  payload: AIPayload,
  env: OrchestratorEnv
): Promise<OrchestrationResult> {
  if (!env.LINEAR_API_KEY || !env.LINEAR_TEAM_ID) {
    return { success: false, provider: 'linear', error: 'Linear credentials not configured' };
  }

  const priorityMap = { high: 1, medium: 2, low: 3 };

  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': env.LINEAR_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          mutation CreateIssue($title: String!, $description: String, $teamId: String!, $priority: Int) {
            issueCreate(input: { title: $title, description: $description, teamId: $teamId, priority: $priority }) {
              success
              issue { id identifier title url }
            }
          }
        `,
        variables: {
          title: payload.content.title,
          description: `${payload.content.body || ''}\n\n---\n_Generated by ${payload.source} via IntegrateWise_`,
          teamId: env.LINEAR_TEAM_ID,
          priority: priorityMap[payload.content.priority || 'medium']
        }
      })
    });

    const result = await response.json();
    if (result.errors) {
      return { success: false, provider: 'linear', error: JSON.stringify(result.errors) };
    }
    return { success: true, provider: 'linear', result: result.data?.issueCreate };
  } catch (error) {
    return { success: false, provider: 'linear', error: String(error) };
  }
}

// ============================================================================
// Main Orchestrator
// ============================================================================

export async function orchestrate(
  payload: AIPayload,
  env: OrchestratorEnv
): Promise<{ results: OrchestrationResult[]; summary: { success: number; failed: number } }> {
  const results: OrchestrationResult[] = [];

  // Route based on type if route_to not specified
  const routes = payload.route_to.length > 0
    ? payload.route_to
    : getDefaultRoutes(payload.type);

  for (const route of routes) {
    let result: OrchestrationResult;

    switch (route) {
      case 'todoist':
        result = await createTodoistTask(payload, env);
        break;
      case 'notion':
        result = await createNotionPage(payload, env);
        break;
      case 'github':
        result = await createGitHubIssue(payload, env);
        break;
      case 'hubspot':
        result = await createHubSpotContact(payload, env);
        break;
      case 'linear':
        result = await createLinearIssue(payload, env);
        break;
      default:
        result = { success: false, provider: route, error: `Unknown route: ${route}` };
    }

    results.push(result);
  }

  return {
    results,
    summary: {
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
  };
}

function getDefaultRoutes(type: AIPayload['type']): AIPayload['route_to'] {
  const routeMap: Record<AIPayload['type'], AIPayload['route_to']> = {
    task: ['todoist'],
    doc: ['notion'],
    issue: ['github', 'linear'],
    contact: ['hubspot'],
    design: ['notion'],
    note: ['notion']
  };
  return routeMap[type] || ['notion'];
}

// ============================================================================
// Validation
// ============================================================================

export function validateAIPayload(data: unknown): { valid: boolean; payload?: AIPayload; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Payload must be an object' };
  }

  const obj = data as Record<string, unknown>;

  if (!obj.type || !['task', 'doc', 'issue', 'contact', 'design', 'note'].includes(obj.type as string)) {
    return { valid: false, error: 'Invalid or missing type' };
  }

  if (!obj.source) {
    return { valid: false, error: 'Missing source' };
  }

  if (!obj.content || typeof obj.content !== 'object') {
    return { valid: false, error: 'Missing or invalid content' };
  }

  const content = obj.content as Record<string, unknown>;
  if (!content.title || typeof content.title !== 'string') {
    return { valid: false, error: 'Missing or invalid content.title' };
  }

  return {
    valid: true,
    payload: {
      type: obj.type as AIPayload['type'],
      source: obj.source as AIPayload['source'],
      content: {
        title: content.title as string,
        body: content.body as string | undefined,
        priority: content.priority as AIPayload['content']['priority'],
        due_date: content.due_date as string | undefined,
        labels: content.labels as string[] | undefined,
        assignee: content.assignee as string | undefined,
        project: content.project as string | undefined
      },
      route_to: (obj.route_to as AIPayload['route_to']) || [],
      metadata: obj.metadata as Record<string, unknown> | undefined
    }
  };
}
