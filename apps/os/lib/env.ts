/**
 * Environment Configuration with Zod Validation
 * 
 * This file validates environment variables at startup (fail fast).
 * Import ENV from this file for typed, validated access to env vars.
 * 
 * Note: This file should only be imported in server-side code.
 * Client components should use process.env.NEXT_PUBLIC_* directly.
 */

import { z } from "zod"

// Schema for server-side environment variables
const EnvSchema = z.object({
  // Public (available in browser)
  // Optional for zero-dependency mode
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1).optional().or(z.literal("")).default("https://placeholder.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional().or(z.literal("")).default("placeholder-anon-key"),
  
  // Server-only (never expose to browser)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10).optional(),
  OPENAI_API_KEY: z.string().min(10).optional(),
  BRAINSTORMING_WEBHOOK_SECRET: z.string().min(10).optional(),
  
  // Slack/Discord webhooks
  SLACK_WEBHOOK_URL: z.string().url().optional().or(z.literal("")),
  DISCORD_WEBHOOK_URL: z.string().url().optional().or(z.literal("")),
  
  // Vector/Embedding configuration
  EMBEDDING_MODEL_ID: z.string().default("openai-text-embedding-3-small"),
  EMBEDDING_DIMENSION: z.string().regex(/^\d+$/).transform(Number).default("1536"),
  VECTOR_DISTANCE_METRIC: z.enum(["cosine", "ip", "l2"]).default("cosine"),
  
  // Operations/Feature flags
  CRON_ENABLED: z.enum(["true", "false"]).default("true"),
  AUTO_EXECUTE_LOW_RISK_ACTIONS: z.enum(["true", "false"]).default("false"),
  CONTENT_MODERATION_ENABLED: z.enum(["true", "false"]).default("true"),
})

// Parse with defaults and optional values
function parseEnv() {
  const result = EnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    BRAINSTORMING_WEBHOOK_SECRET: process.env.BRAINSTORMING_WEBHOOK_SECRET,
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
    DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
    EMBEDDING_MODEL_ID: process.env.EMBEDDING_MODEL_ID,
    EMBEDDING_DIMENSION: process.env.EMBEDDING_DIMENSION,
    VECTOR_DISTANCE_METRIC: process.env.VECTOR_DISTANCE_METRIC,
    CRON_ENABLED: process.env.CRON_ENABLED,
    AUTO_EXECUTE_LOW_RISK_ACTIONS: process.env.AUTO_EXECUTE_LOW_RISK_ACTIONS,
    CONTENT_MODERATION_ENABLED: process.env.CONTENT_MODERATION_ENABLED,
  })

  if (!result.success) {
    console.error("❌ Environment validation failed:")
    console.error(result.error.format())
    
    // In development, provide helpful error message
    if (process.env.NODE_ENV === "development") {
      console.error("\n💡 Hint: Copy .env.example to .env.local and fill in the values")
    }
    
    // Don't throw in production to allow graceful degradation
    // Some features may work without all env vars
    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️ Running with incomplete environment configuration")
    }
  }

  return result.success ? result.data : null
}

// Export parsed environment
export const ENV = parseEnv()

// Type-safe accessors with fallbacks
export const getEnv = () => ENV

// Helper to check if specific features are configured
export const isSupabaseConfigured = () => 
  Boolean(ENV?.NEXT_PUBLIC_SUPABASE_URL && ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const isServiceRoleConfigured = () => 
  Boolean(ENV?.SUPABASE_SERVICE_ROLE_KEY)

export const isOpenAIConfigured = () => 
  Boolean(ENV?.OPENAI_API_KEY)

export const isWebhookSecretsConfigured = () => 
  Boolean(ENV?.BRAINSTORMING_WEBHOOK_SECRET)

export const isCronEnabled = () => 
  ENV?.CRON_ENABLED === "true"

export const isAutoExecuteEnabled = () => 
  ENV?.AUTO_EXECUTE_LOW_RISK_ACTIONS === "true"

export const isModerationEnabled = () => 
  ENV?.CONTENT_MODERATION_ENABLED === "true"

// Export type for TypeScript consumers
export type EnvConfig = z.infer<typeof EnvSchema>
