import { createFileRoute } from "@tanstack/react-router";
import { parseRepoUrl } from "@/lib/repo";
import { analyzeRepository, buildChatAnswer } from "@/lib/analyze.server";
import { checkDistributedRateLimit } from "@/lib/rate-limiter";
import { setGitHubEnv } from "@/lib/github.server";

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 requests per minute (higher for chat)

// Maximum payload size (1MB)
const MAX_PAYLOAD_SIZE = 1024 * 1024;

// Maximum message length
const MAX_MESSAGE_LENGTH = 1000;

function getClientIP(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    "unknown"
  );
}

function sanitizeError(error: unknown): string {
  // Never expose raw error messages to clients
  if (error instanceof Error) {
    // Only expose safe, expected error types
    if (
      error.message.includes("rate limit") ||
      error.message.includes("not found") ||
      error.message.includes("Invalid")
    ) {
      return error.message;
    }
  }
  // Generic error for unexpected issues
  return "An error occurred while processing your message. Please try again later.";
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        try {
          // Set GitHub environment context for authenticated requests
          // Access Cloudflare env variables through context
          const env = (context as unknown as { cloudflare?: { env?: { GITHUB_TOKEN?: string } } })?.cloudflare?.env;
          if (env) {
            console.log("[Chat API] Cloudflare env context found, setting GitHub env");
            setGitHubEnv(env);
          } else {
            console.warn("[Chat API] No Cloudflare env context found in request");
          }
          
          // Check payload size
          const contentLength = request.headers.get("content-length");
          if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_SIZE) {
            return Response.json(
              { error: "Request payload too large. Maximum size is 1MB." },
              { status: 413 },
            );
          }

          // Rate limiting (using in-memory implementation)
          const clientIP = getClientIP(request);
          const rateLimit = await checkDistributedRateLimit(
            {},
            clientIP,
            RATE_LIMIT_MAX_REQUESTS,
            RATE_LIMIT_WINDOW,
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
                },
              },
            );
          }

          // Parse and validate request body
          const body = await request.text();
          if (body.length > MAX_PAYLOAD_SIZE) {
            return Response.json(
              { error: "Request payload too large. Maximum size is 1MB." },
              { status: 413 },
            );
          }

          let parsedBody: { repo?: string; message?: string };
          try {
            parsedBody = JSON.parse(body);
          } catch {
            return Response.json({ error: "Invalid JSON in request body" }, { status: 400 });
          }

          const { repo, message } = parsedBody;

          if (!repo || !message) {
            return Response.json({ error: "Missing repo or message" }, { status: 400 });
          }

          // Validate input lengths
          if (typeof repo !== "string" || repo.length > 500) {
            return Response.json({ error: "Invalid repository format" }, { status: 400 });
          }

          if (typeof message !== "string" || message.length > MAX_MESSAGE_LENGTH) {
            return Response.json(
              { error: `Message too long. Maximum length is ${MAX_MESSAGE_LENGTH} characters.` },
              { status: 400 },
            );
          }

          const parsed = parseRepoUrl(repo);
          if (!parsed) {
            return Response.json({ error: "Invalid repository URL" }, { status: 400 });
          }

          const analysis = await analyzeRepository(
            parsed.owner,
            parsed.name,
            `https://github.com/${parsed.owner}/${parsed.name}`,
          );

          return Response.json(
            { answer: buildChatAnswer(analysis, message) },
            {
              headers: {
                "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
                "X-RateLimit-Remaining": rateLimit.remaining.toString(),
              },
            },
          );
        } catch (e) {
          console.error("Chat error:", e); // Log for debugging
          return Response.json({ error: sanitizeError(e) }, { status: 500 });
        }
      },
    },
  },
});
