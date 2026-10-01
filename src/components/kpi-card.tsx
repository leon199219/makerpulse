import { METRIC_LABELS, type Metric } from "@/lib/metrics";
import { formatDelta, formatExact, formatStars } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function KpiCard({
  metric,
  value,
  delta,
  previous,
  active,
  onClick,
}: {
  metric: Metric;
  value: number;
  delta: number;
  previous?: number | null;
  active?: boolean;
  onClick?: () => void;
}) {
  const tone = delta > 0 ? "up" : delta < 0 ? "down" : "neutral";
  return (
    <button type="button" onClick={onClick} className="text-left">
      <Card
        className={cn(
          "h-full transition-[box-shadow] duration-150",
          active && "ring-2 ring-primary",
        )}
      >
        <CardContent className="flex h-full flex-col gap-3 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">{METRIC_LABELS[metric]}</p>
            <Badge tone={tone}>{formatDelta(delta)}</Badge>
          </div>
          <p className="text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
            {formatExact(value)}
          </p>
          {previous != null ? (
            <p className="text-xs text-muted-foreground">Previous window {formatDelta(previous)}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Previous window —</p>
          )}
        </CardContent>
      </Card>
    </button>
  );
}

export function RatingCard({
  count,
  scoreTotal,
  delta,
  previous,
}: {
  count: number;
  scoreTotal: number;
  delta: number;
  previous?: number | null;
}) {
  const tone = delta > 0 ? "up" : delta < 0 ? "down" : "neutral";
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">Rating</p>
          <Badge tone={tone}>{formatDelta(delta)} ratings</Badge>
        </div>
        <p className="text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
          {formatStars(count, scoreTotal)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatExact(count)} ratings
          {previous != null ? ` · previous window ${formatDelta(previous)}` : ""}
        </p>
      </CardContent>
    </Card>
  );
}