import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { loadDashboard } from "@/lib/dashboard";
import type { ModelRow } from "@/lib/dashboard-types";
import type { Metric } from "@/lib/metrics";
import { cn, formatExact } from "@/lib/utils";

const COLUMNS = [
  { key: "likes", label: "Likes" },
  { key: "collections", label: "Collected" },
  { key: "comments", label: "Comments" },
  { key: "boosts", label: "Boosts" },
  { key: "downloads", label: "Downloads" },
  { key: "prints", label: "Prints" },
] as const satisfies ReadonlyArray<{ key: Metric; label: string }>;

type ColumnKey = (typeof COLUMNS)[number]["key"];
type SortKey = ColumnKey | "published";

export const Route = createFileRoute("/statistics")({
  loader: () => loadDashboard({ data: { period: "all" } }),
  component: StatisticsPage,
});

function sortModels(models: ModelRow[], sortKey: SortKey, sortDir: "asc" | "desc") {
  const copy = [...models];
  copy.sort((a, b) => {
    if (sortKey === "published") {
      const at = a.publishedAt ? Date.parse(a.publishedAt) : null;
      const bt = b.publishedAt ? Date.parse(b.publishedAt) : null;
      if (at == null && bt == null) return a.title.localeCompare(b.title);
      if (at == null) return 1;
      if (bt == null) return -1;
      return sortDir === "asc" ? at - bt : bt - at;
    }
    const cmp = a.stats[sortKey] - b.stats[sortKey];
    if (cmp !== 0) return sortDir === "asc" ? cmp : -cmp;
    return a.title.localeCompare(b.title);
  });
  return copy;
}

function StatisticsPage() {
  const initial = Route.useLoaderData();
  const dash = useQuery({
    queryKey: ["dashboard", "all"],
    queryFn: () => loadDashboard({ data: { period: "all" } }),
    initialData: initial,
  });
  const [sortKey, setSortKey] = useState<SortKey>("downloads");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const published = useMemo(() => {
    const list = dash.data?.models ?? [];
    return sortModels(list, sortKey, sortDir);
  }, [dash.data, sortKey, sortDir]);
  const removed = useMemo(() => dash.data?.removedModels ?? [], [dash.data]);

  function sortBy(key: ColumnKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "desc" ? "asc" : "desc"));
      return;
    }
    setSortKey(key);
    setSortDir("desc");
  }

  function sortByPublished(dir: "asc" | "desc") {
    setSortKey("published");
    setSortDir(dir);
  }

  const totals = COLUMNS.map((column) => ({
    ...column,
    value: published.reduce((sum, model) => sum + model.stats[column.key], 0),
  }));

  return (
    <AppShell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Statistics</h1>
          <p className="text-sm text-muted-foreground">Current totals for every model.</p>
        </div>
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
        <CardContent className="p-0 sm:p-2">
          {published.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted-foreground">Models appear after the first successful sync.</p>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Model</th>
                    {COLUMNS.map((column) => {
                      const active = sortKey === column.key;
                      return (
                        <th key={column.key} className="px-2 py-1 text-right font-medium">
                          <button
                            type="button"
                            onClick={() => sortBy(column.key)}
                            className={cn(
                              "inline-flex h-11 items-center gap-1 rounded-md px-1 text-xs font-medium hover:text-foreground",
                              active ? "text-foreground" : "text-muted-foreground",
                            )}
                          >
                            {column.label}
                            {active ? (
                              sortDir === "asc" ? (
                                <ArrowUp className="size-3.5" />
                              ) : (
                                <ArrowDown className="size-3.5" />
                              )
                            ) : null}
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {published.map((model) => (
                    <Row key={model.designId} model={model} showDate={sortKey === "published"} />
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border font-medium">
                    <td className="px-4 py-3 text-foreground">{published.length} models</td>
                    {totals.map((column) => (
                      <td key={column.key} className="px-3 py-3 text-right tabular-nums">
                        {formatExact(column.value)}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      {removed.length > 0 ? (
        <Card>
          <CardContent className="flex flex-col gap-3 pt-6">
            <h2 className="text-base font-medium text-foreground">Removed from MakerWorld</h2>
            <ul className="divide-y divide-border">
              {removed.map((model) => (
                <li key={model.designId}>
                  <Link
                    to="/models/$designId"
                    params={{ designId: model.designId }}
                    className="flex items-center gap-3 py-3 hover:text-primary"
                  >
                    {model.coverUrl ? (
                      <img src={model.coverUrl} alt="" className="size-10 shrink-0 rounded-md object-cover" />
                    ) : (
                      <span className="size-10 shrink-0 rounded-md bg-secondary" />
                    )}
                    <span className="min-w-0 truncate text-sm font-medium">{model.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </AppShell>
  );
}

function Row({ model, showDate }: { model: ModelRow; showDate: boolean }) {
  return (
    <tr className="border-b border-border/70 last:border-0">
      <td className="px-4 py-3">
        <Link
          to="/models/$designId"
          params={{ designId: model.designId }}
          className="flex items-center gap-3 hover:text-primary"
        >
          {model.coverUrl ? (
            <img src={model.coverUrl} alt="" className="size-10 shrink-0 rounded-md object-cover" />
          ) : (
            <span className="size-10 shrink-0 rounded-md bg-secondary" />
          )}
          <span className="min-w-0">
            <span className="block max-w-[280px] truncate font-medium">{model.title}</span>
            {showDate && model.publishedAt ? (
              <span className="block text-xs text-muted-foreground">
                {model.publishedAt.slice(0, 10)}
              </span>
            ) : null}
          </span>
        </Link>
      </td>
      {COLUMNS.map((column) => (
        <td key={column.key} className="px-3 py-3 text-right tabular-nums">
          {formatExact(model.stats[column.key])}
        </td>
      ))}
    </tr>
  );
}
