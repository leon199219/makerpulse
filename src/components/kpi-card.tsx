import { METRIC_LABELS, type Metric } from "@/lib/metrics";
import { formatDelta, formatExact } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function KpiCard({
  metric,
  value,
  delta,
  active,
  onClick,
}: {
  metric: Metric;
  value: number;
  delta: number;
  active?: boolean;
  onClick?: () => void;
}) {
  const tone = delta > 0 ? "up" : delta < 0 ? "down" : "neutral";
  return (
    <button type="button" onClick={onClick} className="text-left">
      <Card
        className={cn(
          "transition-[box-shadow] duration-150",
          active && "shadow-[0_0_0_1px_var(--color-primary)]",
        )}
      >
        <CardContent className="flex flex-col gap-3 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">{METRIC_LABELS[metric]}</p>
            <Badge tone={tone}>{formatDelta(delta)}</Badge>
          </div>
          <p className="font-mono text-2xl font-medium tabular-nums tracking-tight sm:text-3xl">
            {formatExact(value)}
          </p>
        </CardContent>
      </Card>
    </button>
  );
}
