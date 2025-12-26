# Webhook Event Reference

## Event Schema

All events are stored in `events_log` with this schema:

```typescript
interface WebhookEvent {
  id: string;           // UUID
  provider: string;     // razorpay, stripe, github, etc.
  event_type: string;   // Provider-specific event type
  payload: object;      // Original JSON payload
  headers: object;      // Relevant request headers
  received_at: string;  // ISO timestamp
  dedupe_hash: string;  // SHA256 for deduplication
  signature_valid: boolean;
}
```

## Provider Reference

### Razorpay

**Endpoint:** `POST /webhooks/razorpay`

**Signature Header:** `x-razorpay-signature`

**Algorithm:** HMAC-SHA256

**Event Types:**
- `payment.captured`
- `payment.failed`
- `payment.authorized`
- `order.paid`
- `subscription.activated`
- `refund.created`

**Example Payload:**
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_xxx",
        "amount": 50000,
        "currency": "INR"
      }
    }
  }
}
```

### Stripe

**Endpoint:** `POST /webhooks/stripe`

**Signature Header:** `stripe-signature`

**Format:** `t=timestamp,v1=signature`

**Algorithm:** HMAC-SHA256

**Event Types:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `checkout.session.completed`
- `customer.subscription.created`
- `invoice.paid`

**Example Payload:**
```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "amount": 2000,
      "currency": "usd"
    }
  }
}
```

### GitHub

**Endpoint:** `POST /webhooks/github`

**Signature Header:** `x-hub-signature-256`

**Format:** `sha256=signature`

**Algorithm:** HMAC-SHA256

**Event Header:** `x-github-event`

**Event Types:**
- `push`
- `pull_request`
- `issues`
- `workflow_run`
- `deployment`
- `release`

**Example Payload:**
```json
{
  "action": "opened",
  "pull_request": {
    "number": 1,
    "title": "Feature"
  },
  "repository": {
    "full_name": "owner/repo"
  }
}
```

### Vercel

**Endpoint:** `POST /webhooks/vercel`

**Signature Header:** `x-vercel-signature`

**Algorithm:** HMAC-SHA1

**Event Types:**
- `deployment.created`
- `deployment.succeeded`
- `deployment.failed`
- `deployment.canceled`

**Example Payload:**
```json
{
  "type": "deployment.succeeded",
  "payload": {
    "deployment": {
      "id": "dpl_xxx",
      "url": "project-xxx.vercel.app"
    }
  }
}
```

### Todoist

**Endpoint:** `POST /webhooks/todoist`

**Signature:** None (User-Agent verification)

**Event Types:**
- `item:added`
- `item:completed`
- `item:updated`
- `item:deleted`
- `project:added`

**Example Payload:**
```json
{
  "event_name": "item:completed",
  "event_data": {
    "id": "123",
    "content": "Task name"
  }
}
```

### Notion

**Endpoint:** `POST /webhooks/notion`

**Signature:** None

**Event Types:**
- `page.created`
- `page.updated`
- `database.updated`

**Example Payload:**
```json
{
  "type": "page.created",
  "page": {
    "id": "xxx-xxx",
    "properties": {}
  }
}
```

### AI Relay (Internal)

**Endpoint:** `POST /webhooks/ai-relay`

**Signature Header:** `x-ai-relay-signature`

**Algorithm:** HMAC-SHA256

**Event Types:**
- Custom internal events

## Deduplication

Events are deduplicated using SHA256 hash of `provider:raw_body`.

Duplicate events return:
```json
{
  "status": "duplicate",
  "dedupe_hash": "abc123..."
}
```

## Error Responses

**401 Unauthorized:**
```json
{"error": "Invalid signature"}
```

**400 Bad Request:**
```json
{"error": "Invalid JSON"}
```

**500 Internal Error:**
```json
{"error": "Internal error", "message": "..."}
```
