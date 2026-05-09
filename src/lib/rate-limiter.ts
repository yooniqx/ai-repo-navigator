// Cloudflare Durable Object for distributed rate limiting
// This is only used when deployed to Cloudflare Workers with Durable Objects enabled
export class RateLimiter {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    try {
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
    } catch (error) {
      console.error("Durable Object error:", error);
      // Return allowed on error to prevent blocking legitimate requests
      return Response.json({
        allowed: true,
        remaining: 0,
        resetAt: Date.now() + 60000,
      });
    }
  }
}

// Type declaration for Cloudflare Durable Objects
interface DurableObjectState {
  storage: {
    get(key: string): Promise<unknown>;
    put(key: string, value: unknown): Promise<void>;
  };
}

// In-memory rate limiting store (used when Durable Objects not available)
const inMemoryStore = new Map<
  string,
  { count: number; resetAt: number }
>();

// Helper function to check rate limit
export async function checkDistributedRateLimit(
  env: { RATE_LIMITER?: DurableObjectNamespace },
  clientIP: string,
  limit: number,
  window: number,
): Promise<{ allowed: boolean; remaining: number; resetAt?: number }> {
  // Always use in-memory rate limiting for simplicity and compatibility
  // Durable Objects can be enabled later for production scale
  return checkInMemoryRateLimit(clientIP, limit, window);
}

// In-memory rate limiting implementation
function checkInMemoryRateLimit(
  clientIP: string,
  limit: number,
  window: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = `ratelimit:${clientIP}`;
  
  // Periodically cleanup expired entries (every ~100 requests)
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }
  
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

// Cleanup old entries on-demand (prevent memory leak)
// Called during rate limit checks to avoid global setInterval
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, value] of inMemoryStore.entries()) {
    if (now > value.resetAt) {
      inMemoryStore.delete(key);
    }
  }
}

// Type declaration for Cloudflare Durable Object Namespace
interface DurableObjectNamespace {
  idFromName(name: string): DurableObjectId;
  get(id: DurableObjectId): DurableObjectStub;
}

interface DurableObjectId {
  toString(): string;
}

interface DurableObjectStub {
  fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
}

// Made with Bob
