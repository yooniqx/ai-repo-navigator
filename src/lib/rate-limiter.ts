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
    const data = (await this.state.storage.get(key)) as
      | { count: number; resetAt: number }
      | undefined;

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

// In-memory fallback for development/testing
const inMemoryStore = new Map<
  string,
  { count: number; resetAt: number }
>();

// Helper function to check rate limit using Durable Object
export async function checkDistributedRateLimit(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  env: { RATE_LIMITER?: any },
  clientIP: string,
  limit: number,
  window: number,
): Promise<{ allowed: boolean; remaining: number; resetAt?: number }> {
  // Use in-memory fallback if Durable Object not available (development/testing)
  if (!env.RATE_LIMITER) {
    console.warn(
      "Durable Object not available, using in-memory rate limiting (development mode)",
    );
    return checkInMemoryRateLimit(clientIP, limit, window);
  }

  try {
    // Get Durable Object instance
    const id = env.RATE_LIMITER.idFromName("rate-limiter");
    const stub = env.RATE_LIMITER.get(id);

    // Call the Durable Object with timeout
    const url = new URL("https://rate-limiter.internal");
    url.searchParams.set("ip", clientIP);
    url.searchParams.set("limit", limit.toString());
    url.searchParams.set("window", window.toString());

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await stub.fetch(url.toString(), {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Rate limiter returned ${response.status}`);
      }

      const result = (await response.json()) as {
        allowed: boolean;
        remaining: number;
        resetAt: number;
      };

      return result;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    // Log the error for monitoring
    console.error("Rate limiter Durable Object error:", error);

    // Fallback to in-memory rate limiting instead of failing open completely
    console.warn(
      "Falling back to in-memory rate limiting due to Durable Object error",
    );
    return checkInMemoryRateLimit(clientIP, limit, window);
  }
}

// In-memory rate limiting fallback
function checkInMemoryRateLimit(
  clientIP: string,
  limit: number,
  window: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = `ratelimit:${clientIP}`;
  const record = inMemoryStore.get(key);

  if (!record || now > record.resetAt) {
    // Reset or initialize
    const resetAt = now + window;
    inMemoryStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (record.count >= limit) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  // Increment counter
  record.count++;
  inMemoryStore.set(key, record);
  return {
    allowed: true,
    remaining: limit - record.count,
    resetAt: record.resetAt,
  };
}

// Cleanup old entries periodically (prevent memory leak)
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, value] of inMemoryStore.entries()) {
        if (now > value.resetAt) {
          inMemoryStore.delete(key);
        }
      }
    },
    5 * 60 * 1000,
  ); // Clean up every 5 minutes
}

// Made with Bob
