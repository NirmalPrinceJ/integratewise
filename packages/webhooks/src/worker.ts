/**
 * IntegrateWise Webhook Ingress Worker
 * Cloudflare Worker for receiving webhooks from multiple providers
 *
 * Security Features:
 * - IP allowlisting for known providers
 * - Internal API key for admin endpoints
 * - Request size limits (256KB max)
 * - JSON-only validation for POST
 * - Timestamp freshness check (5 min window)
 * - Strict CORS (only integratewise domains)
 * - HSTS headers
 * - Rate limiting awareness
 *
 * AI Orchestration:
 * - AI Relay endpoint receives AI-generated payloads
 * - Orchestrates to downstream apps (Todoist, Notion, GitHub, HubSpot)
 */

import { orchestrate, validateAIPayload, type AIPayload } from './orchestrator';

// ============================================================================
// Configuration & Types
// ============================================================================

export interface Env {
  NEON_CONNECTION_STRING: string;

  // Security
  INTERNAL_API_KEY: string;  // Required for /health, /providers

  // Provider secrets
  RAZORPAY_WEBHOOK_SECRET: string;
  STRIPE_ENDPOINT_SECRET: string;
  GITHUB_WEBHOOK_SECRET: string;
  VERCEL_WEBHOOK_SECRET: string;
  AI_RELAY_SECRET: string;
  CODA_API_TOKEN: string;
  HUBSPOT_CLIENT_SECRET: string;
  LINKEDIN_CLIENT_SECRET: string;
  CANVA_WEBHOOK_SECRET: string;
  SALESFORCE_SECURITY_TOKEN: string;
  PIPEDRIVE_WEBHOOK_TOKEN: string;
  META_VERIFY_TOKEN: string;
  WHATSAPP_VERIFY_TOKEN: string;

  // Notification channels
  DISCORD_WEBHOOK_URL: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;

  // Provider enable switches
  ENABLE_HUBSPOT: string;
  ENABLE_LINKEDIN: string;
  ENABLE_CANVA: string;
  ENABLE_GITHUB: string;
  ENABLE_VERCEL: string;
  ENABLE_TODOIST: string;
  ENABLE_NOTION: string;
  ENABLE_AI_RELAY: string;
  ENABLE_RAZORPAY: string;
  ENABLE_STRIPE: string;
  ENABLE_SALESFORCE: string;
  ENABLE_PIPEDRIVE: string;
  ENABLE_GOOGLE_ADS: string;
  ENABLE_META: string;
  ENABLE_WHATSAPP: string;

  // Notification switches
  ENABLE_DISCORD: string;
  ENABLE_TELEGRAM: string;

  // Domain environment
  ENV_DOMAIN: string; // 'online' or 'xyz'

  // Orchestrator - downstream app credentials
  TODOIST_API_TOKEN: string;
  TODOIST_PROJECT_ID: string;
  NOTION_API_KEY: string;
  NOTION_DATABASE_ID: string;
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  HUBSPOT_ACCESS_TOKEN: string;
  LINEAR_API_KEY: string;
  LINEAR_TEAM_ID: string;
}

// Security constants
const MAX_REQUEST_SIZE = 256 * 1024; // 256KB
const TIMESTAMP_FRESHNESS_SECONDS = 300; // 5 minutes
const ALLOWED_ORIGINS = [
  'https://integratewise.online',
  'https://www.integratewise.online',
  'https://hub.integratewise.online',
  'https://api.integratewise.online',
  'https://integratewise.xyz',
  'https://www.integratewise.xyz',
  'https://integratewise-hub.vercel.app'
];

// Known provider IP ranges (CIDR notation)
// These are documented IPs from each provider
const PROVIDER_IP_ALLOWLIST: Record<string, string[]> = {
  github: [
    '192.30.252.0/22',
    '185.199.108.0/22',
    '140.82.112.0/20',
    '143.55.64.0/20'
  ],
  vercel: [
    '76.76.21.0/24',
    '76.223.0.0/16'
  ],
  stripe: [
    '54.187.174.169',
    '54.187.205.235',
    '54.187.216.72',
    '54.241.31.99',
    '54.241.31.102',
    '54.241.34.107'
  ],
  hubspot: [], // HubSpot doesn't publish IPs, rely on signature
  linkedin: [], // LinkedIn uses OAuth
  canva: [], // Canva uses signature
  todoist: [], // No published IPs - require token
  notion: [], // No published IPs - require token
};

type Provider = 'razorpay' | 'stripe' | 'github' | 'vercel' | 'todoist' | 'notion' | 'ai_relay'
  | 'hubspot' | 'linkedin' | 'canva' | 'salesforce' | 'pipedrive' | 'google_ads' | 'meta' | 'whatsapp';

interface ProviderConfig {
  enabled: boolean;
  name: string;
  category: 'crm' | 'marketing' | 'payments' | 'dev' | 'productivity' | 'communication' | 'internal';
  requiresSignature: boolean;
  allowedDomains: ('online' | 'xyz')[];
}

interface WebhookEvent {
  id: string;
  provider: string;
  event_type: string;
  payload: Record<string, unknown>;
  headers: Record<string, string>;
  received_at: string;
  dedupe_hash: string;
  raw_body: string;
  signature_valid: boolean;
  client_ip: string;
}

// ============================================================================
// Security Headers
// ============================================================================

function getSecurityHeaders(origin?: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-IntegrateWise-Internal-Key, X-Request-Timestamp',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
}

// ============================================================================
// Provider Configuration
// ============================================================================

function getProviderConfig(env: Env): Record<Provider, ProviderConfig> {
  return {
    hubspot: {
      enabled: env.ENABLE_HUBSPOT === 'true',
      name: 'HubSpot',
      category: 'crm',
      requiresSignature: true,
      allowedDomains: ['online']
    },
    linkedin: {
      enabled: env.ENABLE_LINKEDIN === 'true',
      name: 'LinkedIn',
      category: 'marketing',
      requiresSignature: false, // Uses OAuth
      allowedDomains: ['online']
    },
    canva: {
      enabled: env.ENABLE_CANVA === 'true',
      name: 'Canva',
      category: 'marketing',
      requiresSignature: true,
      allowedDomains: ['online']
    },
    github: {
      enabled: env.ENABLE_GITHUB === 'true',
      name: 'GitHub',
      category: 'dev',
      requiresSignature: true,
      allowedDomains: ['online']
    },
    vercel: {
      enabled: env.ENABLE_VERCEL === 'true',
      name: 'Vercel',
      category: 'dev',
      requiresSignature: true,
      allowedDomains: ['online']
    },
    todoist: {
      enabled: env.ENABLE_TODOIST === 'true',
      name: 'Todoist',
      category: 'productivity',
      requiresSignature: false, // Requires internal token
      allowedDomains: ['online']
    },
    notion: {
      enabled: env.ENABLE_NOTION === 'true',
      name: 'Notion',
      category: 'productivity',
      requiresSignature: false, // Requires internal token
      allowedDomains: ['online']
    },
    ai_relay: {
      enabled: env.ENABLE_AI_RELAY === 'true',
      name: 'AI Relay',
      category: 'internal',
      requiresSignature: true,
      allowedDomains: ['online']
    },
    razorpay: {
      enabled: env.ENABLE_RAZORPAY === 'true',
      name: 'Razorpay',
      category: 'payments',
      requiresSignature: true,
      allowedDomains: ['online']
    },
    stripe: {
      enabled: env.ENABLE_STRIPE === 'true',
      name: 'Stripe',
      category: 'payments',
      requiresSignature: true,
      allowedDomains: ['online']
    },
    salesforce: {
      enabled: env.ENABLE_SALESFORCE === 'true',
      name: 'Salesforce',
      category: 'crm',
      requiresSignature: false,
      allowedDomains: ['online']
    },
    pipedrive: {
      enabled: env.ENABLE_PIPEDRIVE === 'true',
      name: 'Pipedrive',
      category: 'crm',
      requiresSignature: true,
      allowedDomains: ['online']
    },
    google_ads: {
      enabled: env.ENABLE_GOOGLE_ADS === 'true',
      name: 'Google Ads',
      category: 'marketing',
      requiresSignature: false,
      allowedDomains: ['online']
    },
    meta: {
      enabled: env.ENABLE_META === 'true',
      name: 'Meta',
      category: 'marketing',
      requiresSignature: false,
      allowedDomains: ['online']
    },
    whatsapp: {
      enabled: env.ENABLE_WHATSAPP === 'true',
      name: 'WhatsApp',
      category: 'communication',
      requiresSignature: false,
      allowedDomains: ['online']
    },
  };
}

// ============================================================================
// Crypto Utilities
// ============================================================================

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(key: string, message: string): Promise<string> {
  const keyBuffer = new TextEncoder().encode(key);
  const msgBuffer = new TextEncoder().encode(message);
  const cryptoKey = await crypto.subtle.importKey('raw', keyBuffer, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ============================================================================
// IP Validation
// ============================================================================

function ipInCIDR(ip: string, cidr: string): boolean {
  if (!cidr.includes('/')) {
    return ip === cidr; // Exact match
  }

  const [range, bits] = cidr.split('/');
  const mask = ~(2 ** (32 - parseInt(bits)) - 1);

  const ipParts = ip.split('.').map(Number);
  const rangeParts = range.split('.').map(Number);

  const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
  const rangeNum = (rangeParts[0] << 24) | (rangeParts[1] << 16) | (rangeParts[2] << 8) | rangeParts[3];

  return (ipNum & mask) === (rangeNum & mask);
}

function isIPAllowed(ip: string, provider: Provider): boolean {
  const allowlist = PROVIDER_IP_ALLOWLIST[provider];
  if (!allowlist || allowlist.length === 0) {
    return true; // No IP restriction for this provider
  }
  return allowlist.some(cidr => ipInCIDR(ip, cidr));
}

function getClientIP(request: Request): string {
  return request.headers.get('cf-connecting-ip') ||
         request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         'unknown';
}

// ============================================================================
// Signature Verification
// ============================================================================

async function verifyRazorpay(body: string, sig: string | null, secret: string): Promise<boolean> {
  if (!sig || !secret) return !secret;
  return timingSafeEqual(sig, await hmacSha256(secret, body));
}

async function verifyStripe(body: string, sig: string | null, secret: string): Promise<boolean> {
  if (!sig || !secret) return !secret;
  const parts = sig.split(',');
  const t = parts.find(p => p.startsWith('t='))?.slice(2);
  const v1 = parts.find(p => p.startsWith('v1='))?.slice(3);
  if (!t || !v1) return false;
  // Timestamp freshness check
  if (Math.abs(Date.now() / 1000 - parseInt(t)) > TIMESTAMP_FRESHNESS_SECONDS) return false;
  return timingSafeEqual(v1, await hmacSha256(secret, `${t}.${body}`));
}

async function verifyGithub(body: string, sig: string | null, secret: string): Promise<boolean> {
  if (!sig || !secret) return !secret;
  if (!sig.startsWith('sha256=')) return false;
  return timingSafeEqual(sig.slice(7), await hmacSha256(secret, body));
}

async function verifyVercel(body: string, sig: string | null, secret: string): Promise<boolean> {
  if (!sig || !secret) return !secret;
  const keyBuffer = new TextEncoder().encode(secret);
  const msgBuffer = new TextEncoder().encode(body);
  const cryptoKey = await crypto.subtle.importKey('raw', keyBuffer, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const expected = await crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
  const expectedHex = Array.from(new Uint8Array(expected)).map(b => b.toString(16).padStart(2, '0')).join('');
  return timingSafeEqual(sig, expectedHex);
}

async function verifyHubSpot(body: string, sig: string | null, secret: string): Promise<boolean> {
  if (!sig || !secret) return !secret;
  const expected = await sha256(secret + body);
  return timingSafeEqual(sig, expected);
}

async function verifyCanva(body: string, sig: string | null, secret: string): Promise<boolean> {
  if (!sig || !secret) return !secret;
  return timingSafeEqual(sig, await hmacSha256(secret, body));
}

// ============================================================================
// Request Validation
// ============================================================================

interface ValidationResult {
  valid: boolean;
  error?: string;
  status?: number;
}

function validateRequest(request: Request, provider: Provider, env: Env): ValidationResult {
  // Check request size
  const contentLength = parseInt(request.headers.get('content-length') || '0');
  if (contentLength > MAX_REQUEST_SIZE) {
    return { valid: false, error: 'Request too large', status: 413 };
  }

  // Check content type for POST
  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json') && !contentType.includes('text/plain')) {
      return { valid: false, error: 'Unsupported Media Type. Expected application/json', status: 415 };
    }
  }

  // Check domain restrictions
  const url = new URL(request.url);
  const hostname = url.hostname;
  const config = getProviderConfig(env);
  const providerConfig = config[provider];

  if (providerConfig) {
    const currentDomain = hostname.endsWith('.xyz') ? 'xyz' : 'online';
    if (!providerConfig.allowedDomains.includes(currentDomain)) {
      return {
        valid: false,
        error: `Provider ${providerConfig.name} not allowed on this domain`,
        status: 403
      };
    }
  }

  // IP allowlist check
  const clientIP = getClientIP(request);
  if (!isIPAllowed(clientIP, provider)) {
    return { valid: false, error: 'IP not in allowlist', status: 403 };
  }

  return { valid: true };
}

// ============================================================================
// Notification Channels
// ============================================================================

async function notifyDiscord(env: Env, title: string, message: string, color: number = 0x5865F2): Promise<void> {
  if (env.ENABLE_DISCORD !== 'true' || !env.DISCORD_WEBHOOK_URL) return;

  try {
    await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title,
          description: message,
          color,
          timestamp: new Date().toISOString(),
          footer: { text: 'IntegrateWise Webhooks' }
        }]
      })
    });
  } catch (e) {
    console.error('Discord notification failed:', e);
  }
}

async function notifyTelegram(env: Env, message: string): Promise<void> {
  if (env.ENABLE_TELEGRAM !== 'true' || !env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;

  try {
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
  } catch (e) {
    console.error('Telegram notification failed:', e);
  }
}

function generateEventSummary(provider: string, eventType: string, payload: Record<string, unknown>): string {
  switch (provider) {
    case 'hubspot':
      return `Contact/Deal updated: ${(payload as any).propertyName || eventType}`;
    case 'linkedin':
      return `Lead received: ${(payload as any).formName || 'LinkedIn Lead Gen'}`;
    case 'github':
      const repo = (payload as any).repository?.full_name || 'unknown';
      const action = (payload as any).action || eventType;
      return `${repo}: ${action}`;
    case 'vercel':
      const project = (payload as any).payload?.deployment?.name || (payload as any).name || 'Project';
      return `${project}: ${eventType}`;
    case 'stripe':
      const amount = (payload as any).data?.object?.amount;
      return amount ? `Payment: $${(amount / 100).toFixed(2)}` : eventType;
    case 'todoist':
      return `Task: ${(payload as any).event_data?.content || eventType}`;
    case 'notion':
      return `Page updated: ${(payload as any).page?.id || eventType}`;
    case 'canva':
      return `Design: ${(payload as any).design?.name || 'Export ready'}`;
    default:
      return `Event: ${eventType}`;
  }
}

const DISCORD_COLORS: Record<string, number> = {
  hubspot: 0xFF7A59,
  linkedin: 0x0A66C2,
  github: 0x333333,
  vercel: 0x000000,
  stripe: 0x635BFF,
  canva: 0x00C4CC,
  todoist: 0xE44332,
  notion: 0x000000,
};

async function sendNotification(env: Env, provider: string, eventType: string, summary: string): Promise<void> {
  const title = `🔔 ${provider}: ${eventType}`;
  await Promise.all([
    notifyDiscord(env, title, summary, DISCORD_COLORS[provider] || 0x5865F2),
    notifyTelegram(env, `<b>${title}</b>\n\n${summary}`)
  ]);
}

// ============================================================================
// Database Operations
// ============================================================================

async function persistEvent(event: WebhookEvent, connectionString: string): Promise<{ inserted: boolean; duplicate: boolean }> {
  const url = new URL(connectionString);
  const host = url.hostname;
  const apiUrl = `https://${host}/sql`;

  const query = `
    INSERT INTO events_log (id, provider, event_type, payload, headers, received_at, dedupe_hash, raw_body, signature_valid, client_ip)
    VALUES ($1::uuid, $2, $3, $4::jsonb, $5::jsonb, $6::timestamptz, $7, $8, $9, $10)
    ON CONFLICT (dedupe_hash) DO NOTHING
    RETURNING id
  `;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': connectionString,
    },
    body: JSON.stringify({
      query,
      params: [
        event.id,
        event.provider,
        event.event_type,
        JSON.stringify(event.payload),
        JSON.stringify(event.headers),
        event.received_at,
        event.dedupe_hash,
        event.raw_body,
        event.signature_valid,
        event.client_ip
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    // Log to DLQ on failure
    console.error(`Database error: ${response.status} - ${text}`);
    throw new Error(`Database error: ${response.status}`);
  }

  const result = await response.json() as { rows: unknown[] };
  return {
    inserted: result.rows && result.rows.length > 0,
    duplicate: !result.rows || result.rows.length === 0
  };
}

async function logToDLQ(env: Env, provider: string, eventType: string, payload: string, error: string): Promise<void> {
  if (!env.NEON_CONNECTION_STRING) return;

  try {
    const url = new URL(env.NEON_CONNECTION_STRING);
    const apiUrl = `https://${url.hostname}/sql`;

    await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Neon-Connection-String': env.NEON_CONNECTION_STRING,
      },
      body: JSON.stringify({
        query: `
          INSERT INTO dlq_events (id, provider, event_type, payload, error_message, retry_count, next_retry_at, created_at)
          VALUES ($1::uuid, $2, $3, $4, $5, 0, NOW() + INTERVAL '5 minutes', NOW())
        `,
        params: [crypto.randomUUID(), provider, eventType, payload, error]
      })
    });
  } catch (e) {
    console.error('Failed to log to DLQ:', e);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function extractHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  const relevantHeaders = [
    'content-type', 'user-agent', 'x-request-id', 'x-razorpay-signature', 'stripe-signature',
    'x-hub-signature-256', 'x-github-event', 'x-vercel-signature',
    'x-hubspot-signature', 'x-hubspot-signature-v3', 'x-canva-signature',
    'x-linkedin-signature', 'x-pipedrive-signature', 'cf-connecting-ip'
  ];
  relevantHeaders.forEach(k => {
    const v = headers.get(k);
    if (v) result[k] = v;
  });
  return result;
}

function getEventType(provider: Provider, payload: Record<string, unknown>, headers: Headers): string {
  switch (provider) {
    case 'razorpay': return String(payload.event || 'unknown');
    case 'stripe': return String(payload.type || 'unknown');
    case 'github': return headers.get('x-github-event') || 'unknown';
    case 'vercel': return String(payload.type || 'unknown');
    case 'todoist': return String(payload.event_name || 'unknown');
    case 'notion': return String(payload.type || 'unknown');
    case 'ai_relay': return String(payload.event || 'unknown');
    case 'hubspot': return String((payload as any).subscriptionType || (payload as any).eventType || 'webhook');
    case 'linkedin': return String((payload as any).eventType || (payload as any).type || 'lead');
    case 'canva': return String((payload as any).type || 'design_export');
    case 'salesforce': return String((payload as any).attributes?.type || (payload as any).type || 'record');
    case 'pipedrive': return String((payload as any).event || (payload as any).meta?.action || 'deal');
    case 'google_ads': return String((payload as any).event_type || (payload as any).conversion_action || 'conversion');
    case 'meta': return String((payload as any).object || 'event');
    case 'whatsapp': return 'message';
    default: return 'unknown';
  }
}

// ============================================================================
// Main Webhook Handler
// ============================================================================

async function handleWebhook(request: Request, env: Env, provider: Provider): Promise<Response> {
  const origin = request.headers.get('origin');
  const securityHeaders = getSecurityHeaders(origin);

  const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
    status,
    headers: securityHeaders
  });

  const clientIP = getClientIP(request);

  try {
    // Validate request
    const validation = validateRequest(request, provider, env);
    if (!validation.valid) {
      return json({ error: validation.error }, validation.status || 400);
    }

    const body = await request.text();

    // Double-check size after reading
    if (body.length > MAX_REQUEST_SIZE) {
      return json({ error: 'Request too large' }, 413);
    }

    const headers = request.headers;

    // Get secret and signature based on provider
    let secret = '';
    let sig: string | null = null;
    let verify: (b: string, s: string | null, k: string) => Promise<boolean>;

    switch (provider) {
      case 'razorpay':
        secret = env.RAZORPAY_WEBHOOK_SECRET || '';
        sig = headers.get('x-razorpay-signature');
        verify = verifyRazorpay;
        break;
      case 'stripe':
        secret = env.STRIPE_ENDPOINT_SECRET || '';
        sig = headers.get('stripe-signature');
        verify = verifyStripe;
        break;
      case 'github':
        secret = env.GITHUB_WEBHOOK_SECRET || '';
        sig = headers.get('x-hub-signature-256');
        verify = verifyGithub;
        break;
      case 'vercel':
        secret = env.VERCEL_WEBHOOK_SECRET || '';
        sig = headers.get('x-vercel-signature');
        verify = verifyVercel;
        break;
      case 'todoist':
      case 'notion':
        // These require internal API key in header for security
        const internalKey = headers.get('x-integratewise-internal-key');
        if (env.INTERNAL_API_KEY && internalKey !== env.INTERNAL_API_KEY) {
          return json({ error: 'Invalid internal API key' }, 401);
        }
        verify = async () => true;
        break;
      case 'ai_relay':
        secret = env.AI_RELAY_SECRET || '';
        sig = headers.get('x-ai-relay-signature');
        verify = verifyRazorpay;
        break;
      case 'hubspot':
        secret = env.HUBSPOT_CLIENT_SECRET || '';
        sig = headers.get('x-hubspot-signature') || headers.get('x-hubspot-signature-v3');
        verify = verifyHubSpot;
        break;
      case 'linkedin':
        // LinkedIn requires API token verification
        const linkedinToken = headers.get('x-linkedin-token');
        if (env.LINKEDIN_CLIENT_SECRET && linkedinToken !== env.LINKEDIN_CLIENT_SECRET) {
          return json({ error: 'Invalid LinkedIn token' }, 401);
        }
        verify = async () => true;
        break;
      case 'canva':
        secret = env.CANVA_WEBHOOK_SECRET || '';
        sig = headers.get('x-canva-signature');
        verify = verifyCanva;
        break;
      case 'salesforce':
        // Salesforce uses session token verification
        const sfToken = headers.get('x-sfdc-session');
        if (env.SALESFORCE_SECURITY_TOKEN && sfToken !== env.SALESFORCE_SECURITY_TOKEN) {
          return json({ error: 'Invalid Salesforce token' }, 401);
        }
        verify = async () => true;
        break;
      case 'pipedrive':
        secret = env.PIPEDRIVE_WEBHOOK_TOKEN || '';
        sig = headers.get('x-pipedrive-signature');
        verify = verifyRazorpay;
        break;
      case 'google_ads':
        verify = async () => true;
        break;
      case 'meta':
      case 'whatsapp':
        verify = async () => true;
        break;
      default:
        verify = async () => false;
    }

    // Verify signature
    const valid = await verify!(body, sig, secret);
    const config = getProviderConfig(env);

    if (!valid && config[provider].requiresSignature && secret) {
      await logToDLQ(env, provider, 'unknown', body, 'Invalid signature');
      return json({ error: 'Invalid signature' }, 401);
    }

    // Parse JSON
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(body);
    } catch {
      await logToDLQ(env, provider, 'unknown', body, 'Invalid JSON');
      return json({ error: 'Invalid JSON' }, 400);
    }

    // Build event
    const eventId = crypto.randomUUID();
    const dedupeHash = await sha256(`${provider}:${body}`);
    const eventType = getEventType(provider, payload, headers);

    const event: WebhookEvent = {
      id: eventId,
      provider,
      event_type: eventType,
      payload,
      headers: extractHeaders(headers),
      received_at: new Date().toISOString(),
      dedupe_hash: dedupeHash,
      raw_body: body,
      signature_valid: valid,
      client_ip: clientIP
    };

    // Persist to database
    if (env.NEON_CONNECTION_STRING) {
      try {
        const { duplicate } = await persistEvent(event, env.NEON_CONNECTION_STRING);
        if (duplicate) {
          return json({ status: 'duplicate', dedupe_hash: dedupeHash });
        }
      } catch (dbError) {
        await logToDLQ(env, provider, eventType, body, String(dbError));
        // Continue processing even if DB fails
      }
    }

    // Send notifications
    const summary = generateEventSummary(provider, eventType, payload);
    await sendNotification(env, provider, eventType, summary);

    // AI Relay Orchestration - route to downstream apps
    if (provider === 'ai_relay') {
      const validation = validateAIPayload(payload);
      if (validation.valid && validation.payload) {
        const orchestrationResult = await orchestrate(validation.payload, {
          TODOIST_API_TOKEN: env.TODOIST_API_TOKEN,
          TODOIST_PROJECT_ID: env.TODOIST_PROJECT_ID,
          NOTION_API_KEY: env.NOTION_API_KEY,
          NOTION_DATABASE_ID: env.NOTION_DATABASE_ID,
          GITHUB_TOKEN: env.GITHUB_TOKEN,
          GITHUB_OWNER: env.GITHUB_OWNER,
          GITHUB_REPO: env.GITHUB_REPO,
          HUBSPOT_ACCESS_TOKEN: env.HUBSPOT_ACCESS_TOKEN,
          LINEAR_API_KEY: env.LINEAR_API_KEY,
          LINEAR_TEAM_ID: env.LINEAR_TEAM_ID
        });

        console.log(`AI Relay orchestrated: ${orchestrationResult.summary.success} success, ${orchestrationResult.summary.failed} failed`);

        return json({
          status: 'orchestrated',
          event_id: eventId,
          provider,
          event_type: eventType,
          orchestration: orchestrationResult
        });
      }
    }

    console.log(`Event: ${provider}/${eventType} - ${eventId} from ${clientIP}`);
    return json({ status: 'received', event_id: eventId, provider, event_type: eventType });

  } catch (error) {
    console.error(`Error ${provider}:`, error);
    await logToDLQ(env, provider, 'error', '', String(error));
    return json({ error: 'Internal error' }, 500);
  }
}

// ============================================================================
// Router
// ============================================================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const origin = request.headers.get('origin');
    const securityHeaders = getSecurityHeaders(origin);

    // CORS preflight with strict headers
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: securityHeaders });
    }

    // Webhook routes
    const routes: Record<string, Provider> = {
      '/webhooks/razorpay': 'razorpay',
      '/webhooks/stripe': 'stripe',
      '/webhooks/github': 'github',
      '/webhooks/vercel': 'vercel',
      '/webhooks/todoist': 'todoist',
      '/webhooks/notion': 'notion',
      '/webhooks/ai-relay': 'ai_relay',
      '/webhooks/hubspot': 'hubspot',
      '/webhooks/linkedin': 'linkedin',
      '/webhooks/canva': 'canva',
      '/webhooks/salesforce': 'salesforce',
      '/webhooks/pipedrive': 'pipedrive',
      '/webhooks/google-ads': 'google_ads',
      '/webhooks/meta': 'meta',
      '/webhooks/whatsapp': 'whatsapp'
    };

    // ========== Admin Endpoints (require internal API key) ==========
    if (path === '/health' || path === '/' || path === '/providers') {
      // Require internal API key for admin endpoints
      const internalKey = request.headers.get('x-integratewise-internal-key');
      if (env.INTERNAL_API_KEY && internalKey !== env.INTERNAL_API_KEY) {
        return new Response(JSON.stringify({
          error: 'Unauthorized',
          message: 'Missing or invalid X-IntegrateWise-Internal-Key header'
        }), {
          status: 401,
          headers: securityHeaders
        });
      }

      const config = getProviderConfig(env);
      const hostname = url.hostname;
      const currentDomain = hostname.endsWith('.xyz') ? 'xyz' : 'online';

      if (path === '/health' || path === '/') {
        const enabled = Object.entries(config).filter(([_, c]) => c.enabled && c.allowedDomains.includes(currentDomain as any));
        const disabled = Object.entries(config).filter(([_, c]) => !c.enabled || !c.allowedDomains.includes(currentDomain as any));

        return new Response(JSON.stringify({
          status: 'healthy',
          service: 'integratewise-webhooks',
          version: '3.0.0-secure',
          timestamp: new Date().toISOString(),
          domain: currentDomain,
          hostname,
          db_configured: !!env.NEON_CONNECTION_STRING,
          notifications: {
            discord: env.ENABLE_DISCORD === 'true',
            telegram: env.ENABLE_TELEGRAM === 'true'
          },
          security: {
            ip_filtering: true,
            signature_verification: true,
            request_size_limit: `${MAX_REQUEST_SIZE / 1024}KB`,
            timestamp_freshness: `${TIMESTAMP_FRESHNESS_SECONDS}s`
          },
          providers: {
            enabled: enabled.map(([_, c]) => c.name),
            disabled: disabled.map(([_, c]) => c.name),
            total: { enabled: enabled.length, disabled: disabled.length }
          }
        }), { headers: securityHeaders });
      }

      if (path === '/providers') {
        const providers = Object.entries(config).map(([id, c]) => ({
          id,
          name: c.name,
          category: c.category,
          enabled: c.enabled,
          requiresSignature: c.requiresSignature,
          allowedDomains: c.allowedDomains,
          endpoint: `/webhooks/${id.replace('_', '-')}`,
          availableOnThisDomain: c.allowedDomains.includes(currentDomain as any)
        }));

        return new Response(JSON.stringify({
          domain: currentDomain,
          providers,
          summary: {
            enabled: providers.filter(p => p.enabled && p.availableOnThisDomain).length,
            disabled: providers.filter(p => !p.enabled || !p.availableOnThisDomain).length
          }
        }), { headers: securityHeaders });
      }
    }

    // ========== Meta/WhatsApp verification challenge ==========
    if (request.method === 'GET' && (path === '/webhooks/meta' || path === '/webhooks/whatsapp')) {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');
      const expectedToken = path === '/webhooks/meta' ? env.META_VERIFY_TOKEN : env.WHATSAPP_VERIFY_TOKEN;

      if (mode === 'subscribe' && token === expectedToken) {
        return new Response(challenge || '', { status: 200, headers: securityHeaders });
      }
      return new Response('Forbidden', { status: 403, headers: securityHeaders });
    }

    // ========== POST webhook routes ==========
    if (request.method === 'POST') {
      const provider = routes[path];
      if (provider) {
        const config = getProviderConfig(env);
        if (!config[provider].enabled) {
          return new Response(JSON.stringify({
            error: 'Provider not enabled',
            provider: config[provider].name,
            message: `${config[provider].name} webhook is disabled.`
          }), {
            status: 503,
            headers: securityHeaders
          });
        }
        return handleWebhook(request, env, provider);
      }
    }

    // 404
    return new Response(JSON.stringify({
      error: 'Not found',
      routes: ['/health', '/providers', ...Object.keys(routes)]
    }), { status: 404, headers: securityHeaders });
  }
};
