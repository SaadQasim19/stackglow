import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory cache for sliding-window rate tracking
const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup expired records every 5 minutes to prevent memory growth
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Extracts client IP safely from request headers
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return "anonymous-client";
}

/**
 * Sliding-window rate limiter per client IP
 *
 * @param req NextRequest instance
 * @param limit Maximum allowed requests within the window (default: 120)
 * @param windowMs Duration of the rate limiting window in ms (default: 60,000 ms / 1 minute)
 */
export function checkRateLimit(
  req: NextRequest,
  limit: number = 120,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; reset: number } {
  const ip = getClientIp(req);
  const now = Date.now();

  const currentRecord = rateLimitMap.get(ip);

  if (!currentRecord || now > currentRecord.resetTime) {
    // Window expired or new IP: create fresh window
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitMap.set(ip, newRecord);
    return {
      allowed: true,
      remaining: limit - 1,
      reset: Math.ceil((newRecord.resetTime - now) / 1000),
    };
  }

  // Active window
  currentRecord.count += 1;
  const remaining = Math.max(0, limit - currentRecord.count);
  const resetSeconds = Math.ceil((currentRecord.resetTime - now) / 1000);

  if (currentRecord.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      reset: resetSeconds,
    };
  }

  return {
    allowed: true,
    remaining,
    reset: resetSeconds,
  };
}
