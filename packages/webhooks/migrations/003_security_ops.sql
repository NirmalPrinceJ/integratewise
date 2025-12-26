-- IntegrateWise Security & Operations Migration
-- Version: 3.0.0-secure
-- Purpose: Add security, DLQ, and operational tracking capabilities

-- Add security columns to events_log
ALTER TABLE events_log
ADD COLUMN IF NOT EXISTS client_ip VARCHAR(45),
ADD COLUMN IF NOT EXISTS signature_valid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dedupe_hash VARCHAR(64);

-- Create unique index for deduplication
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_dedupe
ON events_log(dedupe_hash)
WHERE dedupe_hash IS NOT NULL;

-- Create index for signature validation queries
CREATE INDEX IF NOT EXISTS idx_events_signature
ON events_log(provider, signature_valid, created_at DESC);

-- Dead Letter Queue for failed events
CREATE TABLE IF NOT EXISTS dlq_events (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(100),
    payload JSONB NOT NULL,
    error_message TEXT,
    client_ip VARCHAR(45),
    retry_count INT DEFAULT 0,
    next_retry_at TIMESTAMP,
    failed_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Create index for DLQ retry queries
CREATE INDEX IF NOT EXISTS idx_dlq_retry
ON dlq_events(provider, next_retry_at, retry_count)
WHERE resolved_at IS NULL;

-- Provider status tracking
CREATE TABLE IF NOT EXISTS provider_status (
    provider VARCHAR(50) PRIMARY KEY,
    domain VARCHAR(20) NOT NULL,
    last_event_at TIMESTAMP,
    total_events BIGINT DEFAULT 0,
    failed_events BIGINT DEFAULT 0,
    success_rate DECIMAL(5,2),
    avg_processing_ms INT,
    status VARCHAR(20) DEFAULT 'active',
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Operational summaries (hourly rollup)
CREATE TABLE IF NOT EXISTS ops_summaries (
    id SERIAL PRIMARY KEY,
    summary_hour TIMESTAMP NOT NULL,
    provider VARCHAR(50) NOT NULL,
    domain VARCHAR(20) NOT NULL,
    total_events INT DEFAULT 0,
    signature_failures INT DEFAULT 0,
    dlq_events INT DEFAULT 0,
    avg_processing_ms INT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(summary_hour, provider, domain)
);

-- Create index for time-series queries
CREATE INDEX IF NOT EXISTS idx_ops_summaries_time
ON ops_summaries(summary_hour DESC, provider);

-- Seed provider status for .online domain
INSERT INTO provider_status (provider, domain, status) VALUES
    ('canva', 'online', 'active'),
    ('github', 'online', 'active'),
    ('vercel', 'online', 'active'),
    ('todoist', 'online', 'active'),
    ('notion', 'online', 'active'),
    ('ai_relay', 'online', 'active'),
    ('razorpay', 'online', 'disabled'),
    ('stripe', 'online', 'disabled'),
    ('meta', 'online', 'disabled'),
    ('whatsapp', 'online', 'disabled')
ON CONFLICT (provider) DO NOTHING;

-- Seed provider status for .xyz domain
INSERT INTO provider_status (provider, domain, status) VALUES
    ('hubspot', 'xyz', 'active'),
    ('linkedin', 'xyz', 'active'),
    ('salesforce', 'xyz', 'disabled'),
    ('pipedrive', 'xyz', 'disabled'),
    ('google_ads', 'xyz', 'disabled')
ON CONFLICT (provider) DO NOTHING;

-- Verification queries (uncomment to run)
-- SELECT COUNT(*) as events_with_ip FROM events_log WHERE client_ip IS NOT NULL;
-- SELECT COUNT(*) as dlq_count FROM dlq_events WHERE resolved_at IS NULL;
-- SELECT provider, domain, status, success_rate FROM provider_status ORDER BY domain, provider;
