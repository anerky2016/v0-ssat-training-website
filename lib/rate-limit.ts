// Simple in-memory rate limiter for API routes
// In production, consider using Redis or a proper rate limiting service

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 10 * 60 * 1000)

export interface RateLimitConfig {
  maxRequests: number // Maximum number of requests
  windowMs: number    // Time window in milliseconds
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (usually IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and headers info
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 5, windowMs: 60000 } // Default: 5 requests per minute
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  // If no entry or reset time has passed, create new entry
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs
    rateLimitMap.set(identifier, { count: 1, resetTime })
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetTime,
    }
  }

  // If under limit, increment and allow
  if (entry.count < config.maxRequests) {
    entry.count++
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    }
  }

  // Over limit, reject
  return {
    success: false,
    limit: config.maxRequests,
    remaining: 0,
    resetTime: entry.resetTime,
  }
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  // Fallback to a default identifier
  return 'unknown'
}
