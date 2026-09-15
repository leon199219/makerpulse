import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { METRIC_LABELS, type Metric } from "@/lib/metrics";
import { asDate, formatExact } from "@/lib/utils";
import type { SeriesPoint } from "@/lib/dashboard-types";

export function StatsChart({
  metric,
  series,
}: {
  metric: Metric;
  series: SeriesPoint[];
}) {
  const data = series.map((p) => ({
    t: p.t,
    value: p.value,
    label: format(asDate(p.t), series.length > 40 ? "MMM d" : "MMM d HH:mm"),
  }));

  if (data.length < 2) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-secondary/60 px-6 text-center text-sm text-muted-foreground">
        History builds with each sync. Run another sync after stats move, or leave polling on.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="pulseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v: number) => formatExact(v)}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              color: "var(--color-foreground)",
            }}
            formatter={(value) => [formatExact(Number(value ?? 0)), METRIC_LABELS[metric]]}
            labelFormatter={(_, payload) => {
              const t = payload?.[0]?.payload?.t as string | undefined;
              return t ? format(asDate(t), "PPpp") : "";
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#pulseFill)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
