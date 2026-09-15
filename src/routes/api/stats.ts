import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/stats")({
  server: {
    handlers: {
      GET: async () => {
        const { loadDashboard } = await import("@/lib/dashboard");
        const payload = await loadDashboard({ data: { period: "24h" } });
        return Response.json({
          creator: {
            uid: payload.settings.creatorUid,
            handle: payload.settings.creatorHandle,
            name: payload.settings.creatorName,
          },
          totals: payload.current,
          deltas_24h: payload.deltas,
          model_count: payload.modelCount,
          last_poll_at: payload.settings.lastPollAt,
        });
      },
    },
  },
});
