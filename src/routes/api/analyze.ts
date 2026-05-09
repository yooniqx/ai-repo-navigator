import { createFileRoute } from "@tanstack/react-router";
import { parseRepoUrl } from "@/lib/repo";
import { analyzeRepository } from "@/lib/analyze.server";
import { checkDistributedRateLimit } from "@/lib/rate-limiter";

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

// Maximum payload size (1MB)
const MAX_PAYLOAD_SIZE = 1024 * 1024;

function getClientIP(request: Request): string {
  return request.headers.get("cf-connecting-ip") ||
         request.headers.get("x-forwarded-for")?.split(",")[0] ||
         "unknown";
}

function sanitizeError(error: unknown): string {
  // Never expose raw error messages to clients
  if (error instanceof Error) {
    // Only expose safe, expected error types
    if (error.message.includes("rate limit") ||
        error.message.includes("not found") ||
        error.message.includes("Invalid")) {
      return error.message;
    }
  }
  // Generic error for unexpected issues
  return "An error occurred while analyzing the repository. Please try again later.";
}

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request, context }: { request: Request; context?: any }) => {
        try {
          // Check payload size
          const contentLength = request.headers.get("content-length");
          if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_SIZE) {
            return Response.json(
              { error: "Request payload too large. Maximum size is 1MB." },
              { status: 413 }
            );
          }

          // Distributed rate limiting using Durable Objects
          const clientIP = getClientIP(request);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const env = (context as any)?.cloudflare?.env || {};
          const rateLimit = await checkDistributedRateLimit(
            env,
            clientIP,
            RATE_LIMIT_MAX_REQUESTS,
            RATE_LIMIT_WINDOW
          );
          
          if (!rateLimit.allowed) {
            return Response.json(
              { error: "Rate limit exceeded. Please try again later." },
              {
                status: 429,
                headers: {
                  "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
                  "X-RateLimit-Remaining": "0",
                  "X-RateLimit-Reset": rateLimit.resetAt
                    ? new Date(rateLimit.resetAt).toISOString()
                    : new Date(Date.now() + RATE_LIMIT_WINDOW).toISOString(),
                }
              }
            );
          }

          // Parse and validate request body
          const body = await request.text();
          if (body.length > MAX_PAYLOAD_SIZE) {
            return Response.json(
              { error: "Request payload too large. Maximum size is 1MB." },
              { status: 413 }
            );
          }

          let parsedBody: { url?: string };
          try {
            parsedBody = JSON.parse(body);
          } catch {
            return Response.json(
              { error: "Invalid JSON in request body" },
              { status: 400 }
            );
          }

          const { url } = parsedBody;
          
          if (!url) {
            return Response.json(
              { error: "Missing repository URL" },
              { status: 400 }
            );
          }

          // Validate URL length
          if (typeof url !== "string" || url.length > 500) {
            return Response.json(
              { error: "Invalid repository URL format" },
              { status: 400 }
            );
          }

          const parsed = parseRepoUrl(url);
          if (!parsed) {
            return Response.json(
              { error: "Invalid GitHub repository URL" },
              { status: 400 }
            );
          }

          const result = await analyzeRepository(parsed.owner, parsed.name, url);
          
          return Response.json(result, {
            headers: {
              "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
              "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            }
          });
        } catch (e) {
          console.error("Analysis error:", e); // Log for debugging
          return Response.json(
            { error: sanitizeError(e) },
            { status: 500 }
          );
        }
      },
    },
  },
});
