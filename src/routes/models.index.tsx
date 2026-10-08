import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { ModelTable, sortModels, type ModelSortDir, type ModelSortKey } from "@/components/model-table";
import { PeriodPicker } from "@/components/period-picker";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadDashboard } from "@/lib/dashboard";
import type { Metric, PeriodKey } from "@/lib/metrics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/models/")({
  loader: () => loadDashboard({ data: { period: "7d" } }),
  component: ModelsPage,
});

function ModelsPage() {
  const [period, setPeriod] = useState<PeriodKey>("7d");
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<ModelSortKey>("published");
  const [sortDir, setSortDir] = useState<ModelSortDir>("desc");
  const initial = Route.useLoaderData();
  const dash = useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => loadDashboard({ data: { period } }),
    initialData: period === "7d" ? initial : undefined,
  });
  const models = useMemo(() => {
    const list = dash.data?.models ?? [];
    const needle = q.trim().toLowerCase();
    const filtered = needle ? list.filter((m) => m.title.toLowerCase().includes(needle)) : list;
    return sortModels(filtered, sortKey, sortDir, period !== "all");
  }, [dash.data, q, sortKey, sortDir, period]);
  const removed = useMemo(() => {
    const list = dash.data?.removedModels ?? [];
    const needle = q.trim().toLowerCase();
    return needle ? list.filter((m) => m.title.toLowerCase().includes(needle)) : list;
  }, [dash.data, q]);

  function sortByPublished(dir: ModelSortDir) {
    setSortKey("published");
    setSortDir(dir);
  }

  function sortByMetric(metric: Metric) {
    if (sortKey === metric) {
      setSortDir((dir) => (dir === "desc" ? "asc" : "desc"));
      return;
    }
    setSortKey(metric);
    setSortDir("desc");
  }

  return (
    <AppShell>
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Models</h1>
          <p className="text-sm text-muted-foreground">Per-model stats and change over the selected period.</p>
        </div>
        <PeriodPicker value={period} onChange={setPeriod} />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter models"
          aria-label="Filter models"
          className="sm:max-w-sm"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => sortByPublished("desc")}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-full px-3.5 text-xs font-medium",
              sortKey === "published" && sortDir === "desc"
                ? "bg-foreground text-background"
                : "bg-secondary text-foreground/85 hover:bg-accent",
            )}
          >
            Newest first
          </button>
          <button
            type="button"
            onClick={() => sortByPublished("asc")}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-full px-3.5 text-xs font-medium",
              sortKey === "published" && sortDir === "asc"
                ? "bg-foreground text-background"
                : "bg-secondary text-foreground/85 hover:bg-accent",
            )}
          >
            Oldest first
          </button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">{models.length} published</CardTitle>
        </CardHeader>
        <CardContent>
          <ModelTable
            models={models}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={sortByMetric}
            sortByChange={period !== "all"}
          />
        </CardContent>
      </Card>
      {removed.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Removed from MakerWorld</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              These models are no longer published. They stay here with their last recorded stats and are left out of the overview totals.
            </p>
            <ul className="divide-y divide-border">
              {removed.map((model) => (
                <li key={model.designId} className="flex items-center gap-3 py-3">
                  {model.coverUrl ? (
                    <img
                      src={model.coverUrl}
                      alt=""
                      className="size-10 rounded-md object-cover outline outline-1 -outline-offset-1 outline-white/10"
                    />
                  ) : (
                    <span className="size-10 rounded-md bg-secondary" />
                  )}
                  <Link
                    to="/models/$designId"
                    params={{ designId: model.designId }}
                    className="min-w-0 flex-1 truncate text-sm font-medium hover:text-primary"
                  >
                    {model.title}
                  </Link>
                  <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                    {model.stats.comments} comments
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </AppShell>
  );
}
