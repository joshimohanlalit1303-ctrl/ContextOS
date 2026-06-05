import { createAdminClient } from '@/lib/supabase/admin';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { PostHog } from 'posthog-node';

// Initialize PostHog
let posthog: PostHog | null = null;
if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
  });
}

// Initialize Upstash Redis
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Create a new ratelimiter, that allows 600 requests per 1 minute
    ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(600, "1 m"),
      analytics: false,
    });
  } else {
    console.warn("Upstash Redis not configured. Falling back to in-memory caching and rate limiting.");
  }
} catch (error) {
  console.error("Failed to initialize Upstash Redis:", error);
}

// In-memory fallbacks
const fallbackApiKeyCache = new Map<string, { id: string; user_id: string; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds (1 minute)

export async function validateApiKey(apiKey: string) {
  const now = Date.now();

  // Try Redis cache first
  if (redis) {
    try {
      const cachedData = await redis.get<{ id: string; user_id: string }>(`apikey:${apiKey}`);
      if (cachedData) {
        return cachedData;
      }
    } catch (e) {
      console.error("Redis get error:", e);
    }
  } else {
    // In-memory fallback
    const cached = fallbackApiKeyCache.get(apiKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return { id: cached.id, user_id: cached.user_id };
    }
  }

  // Database lookup
  const supabase = createAdminClient();
  const { data: apiKeyData, error: apiKeyError } = await supabase
    .from('api_keys')
    .select('id, user_id')
    .eq('key', apiKey)
    .single();

  if (apiKeyError || !apiKeyData) {
    return null;
  }

  const payload = { id: apiKeyData.id, user_id: apiKeyData.user_id };

  // Save to cache
  if (redis) {
    try {
      await redis.set(`apikey:${apiKey}`, payload, { ex: 60 }); // 60 seconds TTL
    } catch (e) {
      console.error("Redis set error:", e);
    }
  } else {
    fallbackApiKeyCache.set(apiKey, { ...payload, timestamp: now });
  }

  return payload;
}

// In-memory rate limiting fallback
const fallbackRateLimitCache = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 600; // 600 requests per minute
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export async function checkRateLimit(apiKey: string): Promise<boolean> {
  if (ratelimit) {
    try {
      const { success } = await ratelimit.limit(apiKey);
      return success;
    } catch (e) {
      console.error("Upstash Ratelimit error:", e);
      return true; // Fail open if Redis is down
    }
  }

  // In-memory fallback
  const now = Date.now();
  let limitData = fallbackRateLimitCache.get(apiKey);

  if (!limitData || now > limitData.resetAt) {
    limitData = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    fallbackRateLimitCache.set(apiKey, limitData);
    return true;
  }

  if (limitData.count >= RATE_LIMIT_MAX) {
    return false;
  }

  limitData.count += 1;
  return true;
}

export function logSdkError(error: any, context: string, apiKeyId?: string) {
  console.error(`SDK Error [${context}] for API Key ID ${apiKeyId || 'unknown'}:`, error);
  
  if (posthog) {
    posthog.capture({
      distinctId: apiKeyId || 'anonymous_sdk_user',
      event: 'sdk_error',
      properties: {
        context,
        errorMessage: error?.message || String(error),
        errorStack: error?.stack,
        apiKeyId,
      }
    });
  }
}
