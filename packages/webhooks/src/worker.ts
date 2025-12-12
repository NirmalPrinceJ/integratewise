/**
 * IntegrateWise Webhook Ingress Worker
 * Cloudflare Worker for receiving webhooks from multiple providers
 */

export interface Env {
  NEON_CONNECTION_STRING: string;
  RAZORPAY_WEBHOOK_SECRET: string;
  STRIPE_ENDPOINT_SECRET: string;
  GITHUB_WEBHOOK_SECRET: string;
  VERCEL_WEBHOOK_SECRET: string;
  AI_RELAY_SECRET: string;
  CODA_API_TOKEN: string;
  // New webhook secrets
  HUBSPOT_CLIENT_SECRET: string;
  LINKEDIN_CLIENT_SECRET: string;
  CANVA_WEBHOOK_SECRET: string;
  SALESFORCE_SECURITY_TOKEN: string;
  PIPEDRIVE_WEBHOOK_TOKEN: string;
  META_VERIFY_TOKEN: string;
  WHATSAPP_VERIFY_TOKEN: string;
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
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'integratewise-webhooks',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        db_configured: !!env.NEON_CONNECTION_STRING
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
