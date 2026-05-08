import { createFileRoute } from "@tanstack/react-router";
import { parseRepoUrl } from "@/lib/repo";
import { analyzeRepository, buildChatAnswer } from "@/lib/analyze.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { repo, message } = (await request.json()) as { repo?: string; message?: string };
          if (!repo || !message) {
            return Response.json({ error: "Missing repo or message" }, { status: 400 });
          }
          const parsed = parseRepoUrl(repo);
          if (!parsed) {
            return Response.json({ error: "Invalid repo" }, { status: 400 });
          }
          const analysis = await analyzeRepository(parsed.owner, parsed.name, `https://github.com/${parsed.owner}/${parsed.name}`);
          return Response.json({ answer: buildChatAnswer(analysis, message) });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Failed to answer";
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});
