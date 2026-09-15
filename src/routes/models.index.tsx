import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
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
    return sortModels(filtered, sortKey, sortDir);
  }, [dash.data, q, sortKey, sortDir]);

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
        <div className="flex rounded-lg bg-secondary p-1">
          <button
            type="button"
            onClick={() => sortByPublished("desc")}
            className={cn(
              "inline-flex h-11 flex-1 items-center justify-center rounded-md px-3 text-xs font-medium sm:flex-none",
              sortKey === "published" && sortDir === "desc"
                ? "bg-background text-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Newest first
          </button>
          <button
            type="button"
            onClick={() => sortByPublished("asc")}
            className={cn(
              "inline-flex h-11 flex-1 items-center justify-center rounded-md px-3 text-xs font-medium sm:flex-none",
              sortKey === "published" && sortDir === "asc"
                ? "bg-background text-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                : "text-muted-foreground hover:text-foreground",
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
          <ModelTable models={models} sortKey={sortKey} sortDir={sortDir} onSort={sortByMetric} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
