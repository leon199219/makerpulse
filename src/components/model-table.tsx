import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { METRIC_LABELS, MODEL_METRICS, type Metric } from "@/lib/metrics";
import { cn, formatDelta, formatExact } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ModelRow } from "@/lib/dashboard-types";

export type ModelSortKey = "published" | Metric;
export type ModelSortDir = "asc" | "desc";

export function sortModels(
  models: ModelRow[],
  sortKey: ModelSortKey,
  sortDir: ModelSortDir,
): ModelRow[] {
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

export function ModelTable({
  models,
  sortKey,
  sortDir,
  onSort,
}: {
  models: ModelRow[];
  sortKey?: ModelSortKey;
  sortDir?: ModelSortDir;
  onSort?: (key: Metric) => void;
}) {
  if (models.length === 0) {
    return (
      <p className="px-1 py-8 text-sm text-muted-foreground">
        Models appear after the first successful sync.
      </p>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="py-3 pr-3 font-medium">Model</th>
            {MODEL_METRICS.map((metric) => {
              const active = sortKey === metric;
              const label = METRIC_LABELS[metric];
              if (!onSort) {
                return (
                  <th key={metric} className="px-2 py-3 font-medium">
                    {label}
                  </th>
                );
              }
              return (
                <th key={metric} className="px-1 py-1 font-medium">
                  <button
                    type="button"
                    onClick={() => onSort(metric)}
                    className={cn(
                      "inline-flex h-11 items-center gap-1 rounded-md px-1 text-xs font-medium hover:text-foreground",
                      active ? "text-foreground" : "text-muted-foreground",
                    )}
                    aria-label={`Sort by ${label}`}
                  >
                    {label}
                    {active ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="size-3.5" />
                      ) : (
                        <ArrowDown className="size-3.5" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3.5 opacity-50" />
                    )}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr key={model.designId} className="border-b border-border/70 last:border-0">
              <td className="py-3 pr-3">
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
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{model.title}</span>
                    <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      {model.exclusive ? <Badge tone="accent">Exclusive</Badge> : null}
                    </span>
                  </span>
                </Link>
              </td>
              {MODEL_METRICS.map((metric) => {
                const delta = model.deltas[metric];
                return (
                  <td key={metric} className="px-2 py-3 align-top">
                    <div className="font-mono tabular-nums">{formatExact(model.stats[metric])}</div>
                    <div
                      className={
                        delta > 0
                          ? "text-xs text-success"
                          : delta < 0
                            ? "text-xs text-destructive"
                            : "text-xs text-muted-foreground"
                      }
                    >
                      {formatDelta(delta)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
