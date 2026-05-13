/**
 * Rate limiting helper — Upstash Redis (counter-based fixed window).
 *
 * We deliberately avoid `@upstash/ratelimit` to keep the dependency footprint
 * small. The fixed-window counter is enough for protecting auth actions
 * (signIn / signUp / resetPassword) against credential stuffing and abuse.
 *
 * Strategy:
 *   - Key = `rl:{namespace}:{identifier}`
 *   - On each call: INCR; if new count == 1, set EXPIRE = windowSeconds.
 *   - If count > limit → rate limited.
 *
 * Fails OPEN (allows the request) when Redis is unreachable or env is missing.
 * This is the safer trade-off for a public SaaS: we never lock real users out
 * because of an Upstash incident. Auth itself remains protected by Supabase.
 */
import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'

let _redis: Redis | null = null

function getRedis(): Redis | null {
  if (_redis) return _redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  _redis = new Redis({ url, token })
  return _redis
}

export interface RateLimitResult {
  /** true = caller is within budget; false = rate limited */
  success: boolean
  /** remaining requests in the current window (>= 0) */
  remaining: number
  /** limit configured for this namespace */
  limit: number
}

export interface RateLimitOptions {
  /** logical bucket name (e.g. 'auth:signIn') */
  namespace: string
  /** unique identifier per caller (email, IP, user id, …) */
  identifier: string
  /** max allowed requests in the window */
  limit: number
  /** window length in seconds */
  windowSeconds: number
}

/**
 * Check (and increment) a rate-limit counter for `{namespace, identifier}`.
 * Returns success=true and increments the counter when below the limit.
 * Returns success=false WITHOUT incrementing further when already over the
 * limit (we still call INCR, but the EXPIRE makes this self-healing).
 *
 * Fails open: returns { success: true } if Redis is not configured or errors.
 */
export async function checkRateLimit(
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  const { namespace, identifier, limit, windowSeconds } = opts
  const redis = getRedis()
  if (!redis) {
    return { success: true, remaining: limit, limit }
  }

  const key = `rl:${namespace}:${identifier}`

  try {
    const count = await redis.incr(key)
    if (count === 1) {
      // First hit in this window — set TTL.
      await redis.expire(key, windowSeconds)
    }
    if (count > limit) {
      return { success: false, remaining: 0, limit }
    }
    return { success: true, remaining: Math.max(0, limit - count), limit }
  } catch {
    // Network / Redis failure → fail open.
    return { success: true, remaining: limit, limit }
  }
}

/**
 * Best-effort client IP extraction for server actions / route handlers.
 *
 * Order of preference:
 *   1. `x-forwarded-for` (first hop) — set by Vercel and most proxies.
 *   2. `x-real-ip`                   — set by some reverse proxies.
 *   3. `'unknown'`                   — last resort (still produces a usable
 *      rate-limit key, just shared across callers without an IP header).
 */
export async function getClientIp(): Promise<string> {
  const h = await headers()
  const xff = h.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  const real = h.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}
