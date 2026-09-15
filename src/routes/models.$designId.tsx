import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { KpiCard } from "@/components/kpi-card";
import { PeriodPicker } from "@/components/period-picker";
import { StatsChart } from "@/components/stats-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadModel } from "@/lib/dashboard";
import { MODEL_METRICS, type Metric, type PeriodKey } from "@/lib/metrics";

export const Route = createFileRoute("/models/$designId")({ component: ModelDetail });

function ModelDetail() {
  const { designId } = Route.useParams();
  const [period, setPeriod] = useState<PeriodKey>("7d");
  const [metric, setMetric] = useState<Metric>("downloads");
  const query = useQuery({
    queryKey: ["model", designId, period],
    queryFn: () => loadModel({ data: { designId, period } }),
  });
  const model = query.data;

  return (
    <AppShell>
      <Link to="/models" className="inline-flex h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        All models
      </Link>
      {model ? (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              {model.coverUrl ? (
                <img
                  src={model.coverUrl}
                  alt=""
                  className="size-16 rounded-lg object-cover outline outline-1 -outline-offset-1 outline-white/10"
                />
              ) : null}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-medium tracking-tight">{model.title}</h1>
                  {model.exclusive ? <Badge tone="accent">Exclusive</Badge> : null}
                </div>
                <a
                  className="text-sm text-muted-foreground hover:text-foreground"
                  href={`https://makerworld.com/en/models/${model.designId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open on MakerWorld
                </a>
              </div>
            </div>
            <PeriodPicker value={period} onChange={setPeriod} />
          </div>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {MODEL_METRICS.map((key) => (
              <KpiCard
                key={key}
                metric={key}
                value={model.current[key]}
                delta={model.deltas[key]}
                active={metric === key}
                onClick={() => setMetric(key)}
              />
            ))}
          </section>
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsChart metric={metric} series={model.series[metric]} />
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="h-40 animate-pulse rounded-2xl bg-card" />
      )}
    </AppShell>
  );
}
