import { ArrowDown, ArrowUp, Download, Heart, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { METRIC_LABELS, MODEL_METRICS, type Metric } from "@/lib/metrics";
import { cn, formatDelta, formatExact, formatStars } from "@/lib/utils";
import type { ModelRow } from "@/lib/dashboard-types";

export type ModelSortKey = "published" | Metric;
export type ModelSortDir = "asc" | "desc";

export function sortModels(
  models: ModelRow[],
  sortKey: ModelSortKey,
  sortDir: ModelSortDir,
  byPeriodChange = false,
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
    const value = (model: ModelRow) => (byPeriodChange ? model.deltas[sortKey] : model.stats[sortKey]);
    const cmp = value(a) - value(b);
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
  sortByChange = false,
}: {
  models: ModelRow[];
  sortKey?: ModelSortKey;
  sortDir?: ModelSortDir;
  onSort?: (key: Metric) => void;
  sortByChange?: boolean;
}) {
  if (models.length === 0) {
    return (
      <p className="px-1 py-8 text-sm text-muted-foreground">
        Models appear after the first successful sync.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {onSort ? (
        <div className="flex flex-wrap gap-2">
          {MODEL_METRICS.map((metric) => {
            const active = sortKey === metric;
            return (
              <button
                key={metric}
                type="button"
                onClick={() => onSort(metric)}
                className={cn(
                  "inline-flex h-9 items-center gap-1 rounded-full px-3.5 text-xs font-medium transition-colors",
                  active ? "bg-foreground text-background" : "bg-secondary text-foreground/85 hover:bg-accent",
                )}
                aria-label={`Sort by ${METRIC_LABELS[metric]}`}
              >
                {METRIC_LABELS[metric]}
                {active ? (
                  sortDir === "asc" ? (
                    <ArrowUp className="size-3.5" />
                  ) : (
                    <ArrowDown className="size-3.5" />
                  )
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
      {sortByChange && sortKey && sortKey !== "published" ? (
        <p className="text-xs text-muted-foreground">Ranked by change in this period, not the all-time total.</p>
      ) : null}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {models.map((model) => {
          const focus = sortKey && sortKey !== "published" ? sortKey : "downloads";
          const delta = model.deltas[focus];
          return (
            <Link
              key={model.designId}
              to="/models/$designId"
              params={{ designId: model.designId }}
              className="group min-w-0"
            >
              <div className="relative overflow-hidden rounded-xl bg-secondary">
                {model.coverUrl ? (
                  <img
                    src={model.coverUrl}
                    alt=""
                    className="aspect-[4/3] w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="aspect-[4/3] w-full bg-secondary" />
                )}
                {model.exclusive ? (
                  <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    Exclusive
                  </span>
                ) : null}
              </div>
              <p className="mt-2 truncate text-sm font-medium text-foreground group-hover:text-primary">
                {model.title}
              </p>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Download className="size-3.5" />
                  {formatExact(model.stats.downloads)}
                </span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Heart className="size-3.5" />
                  {formatExact(model.stats.likes)}
                </span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Star className="size-3.5" />
                  {formatStars(model.rating.count, model.rating.scoreTotal)}
                </span>
                <span
                  className={cn(
                    "ml-auto tabular-nums",
                    delta > 0 ? "text-success" : delta < 0 ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {formatDelta(delta)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
