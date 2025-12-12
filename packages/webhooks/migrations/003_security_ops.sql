-- IntegrateWise Webhooks - Security & Operations Tables
-- Migration: 003_security_ops.sql
-- Version: 3.0.0-secure

-- ============================================================================
-- Update events_log table with client_ip
-- ============================================================================
ALTER TABLE events_log ADD COLUMN IF NOT EXISTS client_ip VARCHAR(45);

-- Add index for idempotency checks
CREATE INDEX IF NOT EXISTS idx_events_log_dedupe ON events_log(dedupe_hash);
CREATE INDEX IF NOT EXISTS idx_events_log_provider_type ON events_log(provider, event_type);
CREATE INDEX IF NOT EXISTS idx_events_log_received ON events_log(received_at DESC);

-- ============================================================================
-- Dead Letter Queue (DLQ) for failed events
-- ============================================================================
CREATE TABLE IF NOT EXISTS dlq_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload TEXT,
    error_message TEXT NOT NULL,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 5,
    next_retry_at TIMESTAMPTZ,
    last_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'retrying', 'resolved', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_dlq_status ON dlq_events(status);
CREATE INDEX IF NOT EXISTS idx_dlq_next_retry ON dlq_events(next_retry_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_dlq_provider ON dlq_events(provider, created_at DESC);

-- ============================================================================
-- Provider Status Tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS provider_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT true,
    last_event_at TIMESTAMPTZ,
    last_error_at TIMESTAMPTZ,
    last_error_message TEXT,
    events_today INTEGER DEFAULT 0,
    errors_today INTEGER DEFAULT 0,
    avg_latency_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed provider status
INSERT INTO provider_status (provider, enabled) VALUES
    ('hubspot', true),
    ('linkedin', true),
    ('canva', true),
    ('github', true),
    ('vercel', true),
    ('todoist', true),
    ('notion', true),
    ('ai_relay', true),
    ('razorpay', false),
    ('stripe', false),
    ('salesforce', false),
    ('pipedrive', false),
    ('google_ads', false),
    ('meta', false),
    ('whatsapp', false)
ON CONFLICT (provider) DO NOTHING;

-- ============================================================================
-- Operational Summaries (hourly aggregates)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ops_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_hour TIMESTAMPTZ NOT NULL,
    provider VARCHAR(50) NOT NULL,
    received_count INTEGER DEFAULT 0,
    processed_count INTEGER DEFAULT 0,
    duplicate_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    avg_latency_ms INTEGER,
    min_latency_ms INTEGER,
    max_latency_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (date_hour, provider)
);

CREATE INDEX IF NOT EXISTS idx_ops_summaries_date ON ops_summaries(date_hour DESC);
CREATE INDEX IF NOT EXISTS idx_ops_summaries_provider ON ops_summaries(provider, date_hour DESC);

-- ============================================================================
-- Rate Limiting Tracking (per IP/provider)
-- ============================================================================
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_ip VARCHAR(45) NOT NULL,
    provider VARCHAR(50),
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (client_ip, provider, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON rate_limits(client_ip, window_start DESC);

-- ============================================================================
-- Security Audit Log
-- ============================================================================
CREATE TABLE IF NOT EXISTS security_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    client_ip VARCHAR(45),
    provider VARCHAR(50),
    user_agent TEXT,
    request_path TEXT,
    error_code VARCHAR(20),
    error_message TEXT,
    blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_type ON security_audit(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_ip ON security_audit(client_ip, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_blocked ON security_audit(blocked, created_at DESC) WHERE blocked = true;

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to update provider status on event
CREATE OR REPLACE FUNCTION update_provider_status()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO provider_status (provider, last_event_at, events_today, updated_at)
    VALUES (NEW.provider, NOW(), 1, NOW())
    ON CONFLICT (provider) DO UPDATE SET
        last_event_at = NOW(),
        events_today = provider_status.events_today + 1,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update provider status on new event
DROP TRIGGER IF EXISTS trigger_update_provider_status ON events_log;
CREATE TRIGGER trigger_update_provider_status
    AFTER INSERT ON events_log
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_status();

-- Function to reset daily counters (run at midnight)
CREATE OR REPLACE FUNCTION reset_daily_counters()
RETURNS void AS $$
BEGIN
    UPDATE provider_status SET
        events_today = 0,
        errors_today = 0,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Cleanup old data (retention policy)
-- ============================================================================

-- Function to cleanup old events (keep 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_events()
RETURNS void AS $$
BEGIN
    -- Delete old events_log entries
    DELETE FROM events_log WHERE received_at < NOW() - INTERVAL '30 days';

    -- Delete resolved DLQ entries older than 7 days
    DELETE FROM dlq_events WHERE resolved_at < NOW() - INTERVAL '7 days';

    -- Delete old ops summaries (keep 90 days)
    DELETE FROM ops_summaries WHERE date_hour < NOW() - INTERVAL '90 days';

    -- Delete old security audit logs (keep 30 days)
    DELETE FROM security_audit WHERE created_at < NOW() - INTERVAL '30 days';

    -- Delete old rate limit records (keep 24 hours)
    DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Views for Monitoring
-- ============================================================================

-- Current provider health
CREATE OR REPLACE VIEW v_provider_health AS
SELECT
    p.provider,
    p.enabled,
    p.last_event_at,
    p.events_today,
    p.errors_today,
    CASE
        WHEN p.errors_today > 10 THEN 'critical'
        WHEN p.errors_today > 5 THEN 'warning'
        WHEN p.last_event_at < NOW() - INTERVAL '1 hour' THEN 'stale'
        ELSE 'healthy'
    END as health_status,
    COALESCE(d.pending_dlq, 0) as pending_dlq
FROM provider_status p
LEFT JOIN (
    SELECT provider, COUNT(*) as pending_dlq
    FROM dlq_events
    WHERE status = 'pending'
    GROUP BY provider
) d ON p.provider = d.provider;

-- Hourly summary for last 24 hours
CREATE OR REPLACE VIEW v_hourly_summary AS
SELECT
    date_hour,
    SUM(received_count) as total_received,
    SUM(processed_count) as total_processed,
    SUM(error_count) as total_errors,
    ROUND(AVG(avg_latency_ms)) as avg_latency_ms
FROM ops_summaries
WHERE date_hour > NOW() - INTERVAL '24 hours'
GROUP BY date_hour
ORDER BY date_hour DESC;

-- Comments
COMMENT ON TABLE dlq_events IS 'Dead Letter Queue for failed webhook events';
COMMENT ON TABLE provider_status IS 'Real-time status tracking per webhook provider';
COMMENT ON TABLE ops_summaries IS 'Hourly aggregated metrics for operational monitoring';
COMMENT ON TABLE rate_limits IS 'Rate limiting tracking per client IP and provider';
COMMENT ON TABLE security_audit IS 'Security event audit log for blocked requests and errors';
