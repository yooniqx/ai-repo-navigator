import { createFileRoute } from "@tanstack/react-router";
import { parseRepoUrl } from "@/lib/repo";
import { analyzeRepository } from "@/lib/analyze.server";

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
          const result = await analyzeRepository(parsed.owner, parsed.name, url);
          return Response.json(result);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Failed to analyze repository";
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});
