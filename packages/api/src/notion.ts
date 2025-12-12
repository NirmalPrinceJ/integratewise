/**
 * Notion Integration for IntegrateWise Hub
 * Syncs Notion databases/pages to Hub Dashboard
 */

import { Env } from './types';

const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, any>;
  url: string;
}

interface NotionDatabase {
  id: string;
  title: Array<{ plain_text: string }>;
  description: Array<{ plain_text: string }>;
  properties: Record<string, any>;
}

// Notion API request helper
async function notionRequest(
  endpoint: string,
  apiKey: string,
  options: RequestInit = {}
): Promise<any> {
  const response = await fetch(`${NOTION_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Notion API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Get database info
export async function getDatabase(apiKey: string, databaseId: string): Promise<NotionDatabase> {
  return notionRequest(`/databases/${databaseId}`, apiKey);
}

// Query database pages
export async function queryDatabase(
  apiKey: string,
  databaseId: string,
  filter?: Record<string, any>,
  sorts?: Array<{ property: string; direction: 'ascending' | 'descending' }>
): Promise<{ results: NotionPage[]; has_more: boolean; next_cursor: string | null }> {
  return notionRequest(`/databases/${databaseId}/query`, apiKey, {
    method: 'POST',
    body: JSON.stringify({
      filter,
      sorts,
      page_size: 100,
    }),
  });
}

// Get page content
export async function getPage(apiKey: string, pageId: string): Promise<NotionPage> {
  return notionRequest(`/pages/${pageId}`, apiKey);
}

// Get page blocks (content)
export async function getPageBlocks(apiKey: string, pageId: string): Promise<any[]> {
  const response = await notionRequest(`/blocks/${pageId}/children`, apiKey);
  return response.results;
}

// Create page in database
export async function createPage(
  apiKey: string,
  databaseId: string,
  properties: Record<string, any>,
  children?: any[]
): Promise<NotionPage> {
  return notionRequest('/pages', apiKey, {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties,
      children,
    }),
  });
}

// Update page properties
export async function updatePage(
  apiKey: string,
  pageId: string,
  properties: Record<string, any>
): Promise<NotionPage> {
  return notionRequest(`/pages/${pageId}`, apiKey, {
    method: 'PATCH',
    body: JSON.stringify({ properties }),
  });
}

// Search Notion
export async function searchNotion(
  apiKey: string,
  query: string,
  filter?: { property: 'object'; value: 'page' | 'database' }
): Promise<{ results: any[] }> {
  return notionRequest('/search', apiKey, {
    method: 'POST',
    body: JSON.stringify({
      query,
      filter,
      page_size: 20,
    }),
  });
}

// Extract plain text from Notion rich text
export function extractPlainText(richText: Array<{ plain_text: string }>): string {
  return richText?.map(t => t.plain_text).join('') || '';
}

// Convert Notion page to Hub entity format
export function notionPageToEntity(page: NotionPage, type: string = 'document'): any {
  const props = page.properties;

  // Try to extract common fields
  const title = Object.values(props).find((p: any) => p.type === 'title');
  const status = Object.values(props).find((p: any) => p.type === 'status' || p.type === 'select');

  return {
    id: page.id.replace(/-/g, ''),
    type,
    title: title ? extractPlainText(title.title || title.select?.name) : 'Untitled',
    status: status?.status?.name || status?.select?.name || 'active',
    source: 'notion',
    source_id: page.id,
    metadata: {
      notion_url: page.url,
      notion_id: page.id,
      properties: props,
    },
    created_at: page.created_time,
    updated_at: page.last_edited_time,
  };
}

// Sync Notion database to Hub
export async function syncNotionDatabase(
  env: Env,
  databaseId: string,
  entityType: string = 'document'
): Promise<{ synced: number; errors: string[] }> {
  const apiKey = env.NOTION_API_KEY;
  if (!apiKey) {
    throw new Error('NOTION_API_KEY not configured');
  }

  const errors: string[] = [];
  let synced = 0;

  try {
    const { results } = await queryDatabase(apiKey, databaseId);

    for (const page of results) {
      try {
        const entity = notionPageToEntity(page, entityType);

        // Upsert to D1 database
        await env.DB.prepare(`
          INSERT INTO entities (id, type, title, status, source, source_id, metadata, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT (id) DO UPDATE SET
            title = excluded.title,
            status = excluded.status,
            metadata = excluded.metadata,
            updated_at = excluded.updated_at
        `).bind(
          entity.id,
          entity.type,
          entity.title,
          entity.status,
          entity.source,
          entity.source_id,
          JSON.stringify(entity.metadata),
          entity.created_at,
          entity.updated_at
        ).run();

        synced++;
      } catch (err) {
        errors.push(`Page ${page.id}: ${err}`);
      }
    }
  } catch (err) {
    errors.push(`Database query failed: ${err}`);
  }

  return { synced, errors };
}

// Get Notion databases list
export async function listDatabases(apiKey: string): Promise<NotionDatabase[]> {
  const { results } = await searchNotion(apiKey, '', { property: 'object', value: 'database' });
  return results;
}
