import { formatDistanceToNow } from "date-fns";
import { METRIC_LABELS } from "@/lib/metrics";
import { asDate, cn, formatDelta, formatExact } from "@/lib/utils";
import type { EventRow } from "@/lib/dashboard-types";

export function ActivityList({
  events,
  size = "sm",
}: {
  events: EventRow[];
  size?: "sm" | "lg";
}) {
  const large = size === "lg";
  if (events.length === 0) {
    return (
      <p className={cn("text-muted-foreground", large ? "py-16 text-base" : "py-8 text-sm")}>
        No changes in this period. Sync again after MakerWorld numbers move.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {events.map((event) => (
        <li
          key={event.id}
          className={cn("flex items-start justify-between gap-4", large ? "py-5" : "py-3")}
        >
          <div className="min-w-0">
            <p className={cn("truncate font-medium", large ? "text-base" : "text-sm")}>
              {event.title ?? "Account"} · {METRIC_LABELS[event.metric]}
            </p>
            <p className={cn("mt-1 text-muted-foreground", large ? "text-sm" : "text-xs")}>
              {formatExact(event.previous)} → {formatExact(event.current)} ·{" "}
              {formatDistanceToNow(asDate(event.detectedAt), { addSuffix: true })}
            </p>
          </div>
          <span
            className={cn(
              "font-mono tabular-nums",
              large ? "text-lg" : "text-sm",
              event.delta > 0
                ? "text-success"
                : event.delta < 0
                  ? "text-destructive"
                  : "text-muted-foreground",
            )}
          >
            {formatDelta(event.delta)}
          </span>
        </li>
      ))}
    </ul>
  );
}
