import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis only if the env vars exist so it doesn't crash local development
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }) 
  : null;

// Create a new ratelimiter, that allows 100 requests per 1 minute
const ratelimit = redis 
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "libro-rate-limit",
    })
  : null;

export async function middleware(request: NextRequest) {
  // We only rate limit the external API routes
  if (request.nextUrl.pathname.startsWith("/api/v1/")) {
    
    // If Redis is not configured, warn but pass through (useful for local dev without env vars)
    if (!ratelimit) {
      console.warn("Upstash Redis is not configured. API Rate limiting is bypassed.");
      return NextResponse.next();
    }

    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. You are limited to 100 requests per minute.",
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          }
        }
      );
    }

    const res = NextResponse.next();
    res.headers.set("X-RateLimit-Limit", limit.toString());
    res.headers.set("X-RateLimit-Remaining", remaining.toString());
    res.headers.set("X-RateLimit-Reset", reset.toString());
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all API v1 routes
     */
    "/api/v1/:path*",
  ],
};
