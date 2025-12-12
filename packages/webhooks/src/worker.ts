/**
 * IntegrateWise Webhook Ingress Worker
 * Cloudflare Worker for receiving webhooks from multiple providers
 */

export interface Env {
  NEON_CONNECTION_STRING: string;

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

  // Provider enable switches (set to "true" to enable)
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

  // Notification channel switches
  ENABLE_DISCORD: string;
  ENABLE_TELEGRAM: string;
}

// Provider configuration
interface ProviderConfig {
  enabled: boolean;
  name: string;
  category: 'crm' | 'marketing' | 'payments' | 'dev' | 'productivity' | 'communication' | 'internal';
}

function getProviderConfig(env: Env): Record<Provider, ProviderConfig> {
  return {
    hubspot: { enabled: env.ENABLE_HUBSPOT === 'true', name: 'HubSpot', category: 'crm' },
    linkedin: { enabled: env.ENABLE_LINKEDIN === 'true', name: 'LinkedIn', category: 'marketing' },
    canva: { enabled: env.ENABLE_CANVA === 'true', name: 'Canva', category: 'marketing' },
    github: { enabled: env.ENABLE_GITHUB === 'true', name: 'GitHub', category: 'dev' },
    vercel: { enabled: env.ENABLE_VERCEL === 'true', name: 'Vercel', category: 'dev' },
    todoist: { enabled: env.ENABLE_TODOIST === 'true', name: 'Todoist', category: 'productivity' },
    notion: { enabled: env.ENABLE_NOTION === 'true', name: 'Notion', category: 'productivity' },
    ai_relay: { enabled: env.ENABLE_AI_RELAY === 'true', name: 'AI Relay', category: 'internal' },
    razorpay: { enabled: env.ENABLE_RAZORPAY === 'true', name: 'Razorpay', category: 'payments' },
    stripe: { enabled: env.ENABLE_STRIPE === 'true', name: 'Stripe', category: 'payments' },
    salesforce: { enabled: env.ENABLE_SALESFORCE === 'true', name: 'Salesforce', category: 'crm' },
    pipedrive: { enabled: env.ENABLE_PIPEDRIVE === 'true', name: 'Pipedrive', category: 'crm' },
    google_ads: { enabled: env.ENABLE_GOOGLE_ADS === 'true', name: 'Google Ads', category: 'marketing' },
    meta: { enabled: env.ENABLE_META === 'true', name: 'Meta', category: 'marketing' },
    whatsapp: { enabled: env.ENABLE_WHATSAPP === 'true', name: 'WhatsApp', category: 'communication' },
  };
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
}

type Provider = 'razorpay' | 'stripe' | 'github' | 'vercel' | 'todoist' | 'notion' | 'ai_relay'
  | 'hubspot' | 'linkedin' | 'canva' | 'salesforce' | 'pipedrive' | 'google_ads' | 'meta' | 'whatsapp';

// Crypto utilities
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

// Signature verification
async function verifyRazorpay(body: string, sig: string | null, secret: string): Promise<boolean> {
  if (!sig || !secret) return !secret; // Pass if no secret configured
  return timingSafeEqual(sig, await hmacSha256(secret, body));
}

async function verifyStripe(body: string, sig: string | null, secret: string): Promise<boolean> {
  if (!sig || !secret) return !secret;
  const parts = sig.split(',');
  const t = parts.find(p => p.startsWith('t='))?.slice(2);
  const v1 = parts.find(p => p.startsWith('v1='))?.slice(3);
  if (!t || !v1) return false;
  if (Math.abs(Date.now() / 1000 - parseInt(t)) > 300) return false;
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

// HubSpot uses clientSecret + body for v1 signatures
async function verifyHubSpot(body: string, sig: string | null, secret: string): Promise<boolean> {
  if (!sig || !secret) return !secret;
  const expected = await sha256(secret + body);
  return timingSafeEqual(sig, expected);
}

// Canva uses HMAC-SHA256
async function verifyCanva(body: string, sig: string | null, secret: string): Promise<boolean> {
  if (!sig || !secret) return !secret;
  return timingSafeEqual(sig, await hmacSha256(secret, body));
}

// ============ Notification Channels ============

// Send notification to Discord
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

// Send notification to Telegram
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

// Generate human-readable summary for notifications
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

// Unified notification sender
async function sendNotification(env: Env, provider: string, eventType: string, summary: string): Promise<void> {
  const title = `🔔 ${provider}: ${eventType}`;
  const discordColors: Record<string, number> = {
    hubspot: 0xFF7A59,
    linkedin: 0x0A66C2,
    github: 0x333333,
    vercel: 0x000000,
    stripe: 0x635BFF,
    canva: 0x00C4CC,
    todoist: 0xE44332,
    notion: 0x000000,
  };

  // Send to both channels in parallel
  await Promise.all([
    notifyDiscord(env, title, summary, discordColors[provider] || 0x5865F2),
    notifyTelegram(env, `<b>${title}</b>\n\n${summary}`)
  ]);
}

// Database - using Neon HTTP API
async function persistEvent(event: WebhookEvent, connectionString: string): Promise<{ inserted: boolean; duplicate: boolean }> {
  // Parse connection string
  const url = new URL(connectionString);
  const host = url.hostname;
  const database = url.pathname.slice(1);
  const user = url.username;
  const password = url.password;

  const apiUrl = `https://${host}/sql`;

  const query = `
    INSERT INTO events_log (id, provider, event_type, payload, headers, received_at, dedupe_hash, raw_body, signature_valid)
    VALUES ($1::uuid, $2, $3, $4::jsonb, $5::jsonb, $6::timestamptz, $7, $8, $9)
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
        event.signature_valid
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Database error: ${response.status} - ${text}`);
  }

  const result = await response.json() as { rows: unknown[] };
  return {
    inserted: result.rows && result.rows.length > 0,
    duplicate: !result.rows || result.rows.length === 0
  };
}

function extractHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  ['content-type', 'user-agent', 'x-request-id', 'x-razorpay-signature', 'stripe-signature',
   'x-hub-signature-256', 'x-github-event', 'x-vercel-signature',
   'x-hubspot-signature', 'x-hubspot-signature-v3', 'x-canva-signature',
   'x-linkedin-signature', 'x-pipedrive-signature'].forEach(k => {
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
    // New providers
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

// Main handler
async function handleWebhook(request: Request, env: Env, provider: Provider): Promise<Response> {
  const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });

  try {
    const body = await request.text();
    const headers = request.headers;

    // Get secret and signature
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
        verify = async () => true;
        break;
      case 'ai_relay':
        secret = env.AI_RELAY_SECRET || '';
        sig = headers.get('x-ai-relay-signature');
        verify = verifyRazorpay; // Same HMAC-SHA256
        break;
      // New providers
      case 'hubspot':
        secret = env.HUBSPOT_CLIENT_SECRET || '';
        sig = headers.get('x-hubspot-signature') || headers.get('x-hubspot-signature-v3');
        verify = verifyHubSpot;
        break;
      case 'linkedin':
        verify = async () => true; // LinkedIn uses OAuth, verify via API
        break;
      case 'canva':
        secret = env.CANVA_WEBHOOK_SECRET || '';
        sig = headers.get('x-canva-signature');
        verify = verifyCanva;
        break;
      case 'salesforce':
        verify = async () => true; // Salesforce uses outbound messages
        break;
      case 'pipedrive':
        secret = env.PIPEDRIVE_WEBHOOK_TOKEN || '';
        sig = headers.get('x-pipedrive-signature');
        verify = verifyRazorpay; // HMAC-SHA256
        break;
      case 'google_ads':
        verify = async () => true; // Google Ads uses OAuth
        break;
      case 'meta':
      case 'whatsapp':
        verify = async () => true; // Meta/WhatsApp verify via challenge
        break;
    }

    // Verify
    const valid = await verify!(body, sig, secret);
    if (!valid && secret) {
      return json({ error: 'Invalid signature' }, 401);
    }

    // Parse
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(body);
    } catch {
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
      signature_valid: valid
    };

    // Persist
    if (env.NEON_CONNECTION_STRING) {
      const { duplicate } = await persistEvent(event, env.NEON_CONNECTION_STRING);
      if (duplicate) {
        return json({ status: 'duplicate', dedupe_hash: dedupeHash });
      }
    }

    // Send notifications to Discord/Telegram
    const summary = generateEventSummary(provider, eventType, payload);
    await sendNotification(env, provider, eventType, summary);

    console.log(`Event: ${provider}/${eventType} - ${eventId}`);
    return json({ status: 'received', event_id: eventId, provider, event_type: eventType });

  } catch (error) {
    console.error(`Error ${provider}:`, error);
    return json({ error: 'Internal error', message: String(error) }, 500);
  }
}

// Router
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*'
        }
      });
    }

    // Health check
    if (path === '/health' || path === '/') {
      const config = getProviderConfig(env);
      const enabled = Object.entries(config).filter(([_, c]) => c.enabled).map(([k, c]) => ({ id: k, ...c }));
      const disabled = Object.entries(config).filter(([_, c]) => !c.enabled).map(([k, c]) => ({ id: k, ...c }));

      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'integratewise-webhooks',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        db_configured: !!env.NEON_CONNECTION_STRING,
        providers: {
          enabled: enabled.map(p => p.name),
          disabled: disabled.map(p => p.name),
          total: { enabled: enabled.length, disabled: disabled.length }
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Providers status endpoint
    if (path === '/providers') {
      const config = getProviderConfig(env);
      const providers = Object.entries(config).map(([id, c]) => ({
        id,
        name: c.name,
        category: c.category,
        enabled: c.enabled,
        endpoint: `/webhooks/${id.replace('_', '-')}`
      }));

      return new Response(JSON.stringify({
        providers,
        summary: {
          enabled: providers.filter(p => p.enabled).length,
          disabled: providers.filter(p => !p.enabled).length
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // All webhook routes
    const routes: Record<string, Provider> = {
      '/webhooks/razorpay': 'razorpay',
      '/webhooks/stripe': 'stripe',
      '/webhooks/github': 'github',
      '/webhooks/vercel': 'vercel',
      '/webhooks/todoist': 'todoist',
      '/webhooks/notion': 'notion',
      '/webhooks/ai-relay': 'ai_relay',
      // New providers
      '/webhooks/hubspot': 'hubspot',
      '/webhooks/linkedin': 'linkedin',
      '/webhooks/canva': 'canva',
      '/webhooks/salesforce': 'salesforce',
      '/webhooks/pipedrive': 'pipedrive',
      '/webhooks/google-ads': 'google_ads',
      '/webhooks/meta': 'meta',
      '/webhooks/whatsapp': 'whatsapp'
    };

    // Meta/WhatsApp GET for verification challenge
    if (request.method === 'GET' && (path === '/webhooks/meta' || path === '/webhooks/whatsapp')) {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');
      const expectedToken = path === '/webhooks/meta' ? env.META_VERIFY_TOKEN : env.WHATSAPP_VERIFY_TOKEN;

      if (mode === 'subscribe' && token === expectedToken) {
        return new Response(challenge || '', { status: 200 });
      }
      return new Response('Forbidden', { status: 403 });
    }

    // POST webhook routes
    if (request.method === 'POST') {
      const provider = routes[path];
      if (provider) {
        // Check if provider is enabled
        const config = getProviderConfig(env);
        if (!config[provider].enabled) {
          return new Response(JSON.stringify({
            error: 'Provider not enabled',
            provider: config[provider].name,
            message: `${config[provider].name} webhook is currently disabled. Enable it by setting ENABLE_${provider.toUpperCase()} to "true" in environment variables.`
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return handleWebhook(request, env, provider);
      }
    }

    return new Response(JSON.stringify({
      error: 'Not found',
      providers: Object.keys(routes).map(r => r.replace('/webhooks/', '')),
      routes: ['/health', ...Object.keys(routes)]
    }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }
};
