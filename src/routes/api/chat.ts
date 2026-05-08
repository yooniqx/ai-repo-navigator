import { createFileRoute } from "@tanstack/react-router";
import { buildMockChatAnswer } from "@/lib/repo";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { repo, message } = (await request.json()) as { repo?: string; message?: string };
          if (!repo || !message) {
            return Response.json({ error: "Missing repo or message" }, { status: 400 });
          }
          await new Promise((r) => setTimeout(r, 700));
          return Response.json({ answer: buildMockChatAnswer(repo, message) });
        } catch {
          return Response.json({ error: "Failed to answer" }, { status: 500 });
        }
      },
    },
  },
});
