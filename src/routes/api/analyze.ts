import { createFileRoute } from "@tanstack/react-router";
import { parseRepoUrl, buildMockAnalysis } from "@/lib/repo";

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { url } = (await request.json()) as { url?: string };
          if (!url) {
            return Response.json({ error: "Missing repository URL" }, { status: 400 });
          }
          const parsed = parseRepoUrl(url);
          if (!parsed) {
            return Response.json({ error: "Invalid GitHub repository URL" }, { status: 400 });
          }
          // Simulate processing latency
          await new Promise((r) => setTimeout(r, 1200));
          const result = buildMockAnalysis(url, parsed.owner, parsed.name);
          return Response.json(result);
        } catch (e) {
          return Response.json({ error: "Failed to analyze repository" }, { status: 500 });
        }
      },
    },
  },
});
