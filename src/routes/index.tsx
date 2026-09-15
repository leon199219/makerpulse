import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ConnectCreator } from "@/components/connect-creator";
import { KpiCard } from "@/components/kpi-card";
import { PeriodPicker } from "@/components/period-picker";
import { StatsChart } from "@/components/stats-chart";
import { ModelTable } from "@/components/model-table";
import { ActivityList } from "@/components/activity-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { connectCreator, loadDashboard, syncNow } from "@/lib/dashboard";
import { METRICS, type Metric, type PeriodKey } from "@/lib/metrics";
import { asDate } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: () => loadDashboard({ data: { period: "7d" } }),
  component: Home,
});

function Home() {
  const [period, setPeriod] = useState<PeriodKey>("7d");
  const [metric, setMetric] = useState<Metric>("downloads");
  const qc = useQueryClient();
  const initial = Route.useLoaderData();
  const dash = useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => loadDashboard({ data: { period } }),
    initialData: period === "7d" ? initial : undefined,
  });
  const connect = useMutation({
    mutationFn: (input: string) => connectCreator({ data: { input } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });
  const sync = useMutation({
    mutationFn: () => syncNow(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });

  const data = dash.data;
  const movers = useMemo(() => {
    if (!data) return [];
    return [...data.models]
      .map((m) => ({
        ...m,
        move: METRICS.reduce((sum, key) => sum + Math.abs(m.deltas[key]), 0),
      }))
      .filter((m) => m.move > 0)
      .sort((a, b) => b.move - a.move)
      .slice(0, 6);
  }, [data]);

  return (
    <AppShell>
      {dash.isError ? (
        <p className="text-sm text-destructive">
          {dash.error instanceof Error ? dash.error.message : "Could not load dashboard."}
        </p>
      ) : null}

      {dash.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
      ) : null}

      {data && !data.settings.creatorUid ? (
        <ConnectCreator
          onSubmit={(input) => connect.mutate(input)}
          pending={connect.isPending}
          error={connect.error instanceof Error ? connect.error.message : null}
        />
      ) : null}

      {data?.settings.creatorUid ? (
        <>
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              {data.settings.creatorAvatar ? (
                <img
                  src={data.settings.creatorAvatar}
                  alt=""
                  className="size-12 rounded-full object-cover outline outline-1 -outline-offset-1 outline-white/10"
                />
              ) : null}
              <div>
                <h1 className="text-2xl font-medium tracking-tight">{data.settings.creatorName}</h1>
                <p className="text-sm text-muted-foreground">
                  @{data.settings.creatorHandle} · {data.modelCount} models
                  {data.settings.lastPollAt
                    ? ` · synced ${formatDistanceToNow(asDate(data.settings.lastPollAt), { addSuffix: true })}`
                    : null}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <PeriodPicker value={period} onChange={setPeriod} />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => sync.mutate()}
                disabled={sync.isPending}
              >
                <RefreshCw className={sync.isPending ? "animate-spin" : ""} />
                {sync.isPending ? "Syncing" : "Sync now"}
              </Button>
            </div>
          </div>

          {data.settings.lastPollError ? (
            <p className="text-sm text-destructive">{data.settings.lastPollError}</p>
          ) : null}
          {connect.error instanceof Error ? (
            <p className="text-sm text-destructive">{connect.error.message}</p>
          ) : null}

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {METRICS.map((key) => (
              <KpiCard
                key={key}
                metric={key}
                value={data.current[key]}
                delta={data.deltas[key]}
                active={metric === key}
                onClick={() => setMetric(key)}
              />
            ))}
          </section>

          <p className="text-sm text-muted-foreground">
            Print conversion{" "}
            <span className="font-mono tabular-nums text-foreground">
              {data.current.downloads > 0
                ? `${Math.round((data.current.prints / data.current.downloads) * 1000) / 10}%`
                : "—"}
            </span>{" "}
            · estimated points use public prints × 2 + boosts (exclusive models +25%)
          </p>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-foreground">Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsChart metric={metric} series={data.series[metric]} />
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Top movers</CardTitle>
              </CardHeader>
              <CardContent>
                {movers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Movers appear once a later sync sees a change.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {movers.map((model) => (
                      <li key={model.designId}>
                        <Link
                          to="/models/$designId"
                          params={{ designId: model.designId }}
                          className="flex items-center gap-3 hover:text-primary"
                        >
                          {model.coverUrl ? (
                            <img
                              src={model.coverUrl}
                              alt=""
                              className="size-10 rounded-md object-cover outline outline-1 -outline-offset-1 outline-white/10"
                            />
                          ) : (
                            <span className="size-10 rounded-md bg-secondary" />
                          )}
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">{model.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-foreground">Recent changes</CardTitle>
                <Link to="/activity" className="text-xs text-muted-foreground hover:text-foreground">
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                <ActivityList events={data.events.slice(0, 8)} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-foreground">Models</CardTitle>
              <Link to="/models" className="text-xs text-muted-foreground hover:text-foreground">
                Open table
              </Link>
            </CardHeader>
            <CardContent>
              <ModelTable models={data.models.slice(0, 8)} />
            </CardContent>
          </Card>
        </>
      ) : null}
    </AppShell>
  );
}
