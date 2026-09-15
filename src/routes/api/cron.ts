import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/cron")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { env } = await import("@/lib/env.server");
        const { runPoll, ensurePoller } = await import("@/lib/poller.server");
        const secret = env("CRON_SECRET");
        if (secret) {
          const url = new URL(request.url);
          const provided =
            request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
            url.searchParams.get("secret") ||
            "";
          if (provided !== secret) {
            return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
          }
        }
        await ensurePoller();
        const result = await runPoll();
        return Response.json(result);
      },
    },
  },
});
