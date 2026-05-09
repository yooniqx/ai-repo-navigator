// Cloudflare Durable Object for distributed rate limiting
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class RateLimiter {
  private state: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(state: any) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const clientIP = url.searchParams.get("ip") || "unknown";
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const window = parseInt(url.searchParams.get("window") || "60000");

    const key = `ratelimit:${clientIP}`;
    const now = Date.now();

    // Get current rate limit data
    const data = await this.state.storage.get(key) as { count: number; resetAt: number } | undefined;

    if (!data || now > data.resetAt) {
      // Reset or initialize
      await this.state.storage.put(key, {
        count: 1,
        resetAt: now + window,
      });

      return Response.json({
        allowed: true,
        remaining: limit - 1,
        resetAt: now + window,
      });
    }

    if (data.count >= limit) {
      // Rate limit exceeded
      return Response.json({
        allowed: false,
        remaining: 0,
        resetAt: data.resetAt,
      });
    }

    // Increment counter
    data.count++;
    await this.state.storage.put(key, data);

    return Response.json({
      allowed: true,
      remaining: limit - data.count,
      resetAt: data.resetAt,
    });
  }
}

// Helper function to check rate limit using Durable Object
export async function checkDistributedRateLimit(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  env: { RATE_LIMITER?: any },
  clientIP: string,
  limit: number,
  window: number
): Promise<{ allowed: boolean; remaining: number; resetAt?: number }> {
  // Fallback to in-memory if Durable Object not available (development)
  if (!env.RATE_LIMITER) {
    return { allowed: true, remaining: limit - 1 };
  }

  try {
    // Get Durable Object instance
    const id = env.RATE_LIMITER.idFromName("rate-limiter");
    const stub = env.RATE_LIMITER.get(id);

    // Call the Durable Object
    const url = new URL("https://rate-limiter.internal");
    url.searchParams.set("ip", clientIP);
    url.searchParams.set("limit", limit.toString());
    url.searchParams.set("window", window.toString());

    const response = await stub.fetch(url.toString());
    const result = await response.json() as {
      allowed: boolean;
      remaining: number;
      resetAt: number;
    };

    return result;
  } catch (error) {
    console.error("Rate limiter error:", error);
    // Fail open - allow request if rate limiter fails
    return { allowed: true, remaining: limit - 1 };
  }
}

// Made with Bob
