import { Search } from "lucide-react";
import { METRICS, METRIC_LABELS, type Metric } from "@/lib/metrics";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type ActivityScope = "all" | "account" | "models";
export type ActivityDirection = "all" | "up" | "down";

export type ActivityFilterState = {
  query: string;
  metric: Metric | "all";
  scope: ActivityScope;
  direction: ActivityDirection;
};

export const EMPTY_ACTIVITY_FILTERS: ActivityFilterState = {
  query: "",
  metric: "all",
  scope: "all",
  direction: "all",
};

const SCOPES: { key: ActivityScope; label: string }[] = [
  { key: "all", label: "All" },
  { key: "account", label: "Account" },
  { key: "models", label: "Models" },
];

const DIRECTIONS: { key: ActivityDirection; label: string }[] = [
  { key: "all", label: "All" },
  { key: "up", label: "Gains" },
  { key: "down", label: "Drops" },
];

function ChipRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={cn(
              "inline-flex h-11 min-w-11 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors",
              value === option.key
                ? "bg-secondary text-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ActivityFilters({
  value,
  onChange,
}: {
  value: ActivityFilterState;
  onChange: (next: ActivityFilterState) => void;
}) {
  const active =
    value.query.trim() !== "" ||
    value.metric !== "all" ||
    value.scope !== "all" ||
    value.direction !== "all";

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          placeholder="Filter by model or account"
          aria-label="Filter by model or account"
          className="pl-10"
        />
      </div>
      <ChipRow
        label="Scope"
        options={SCOPES}
        value={value.scope}
        onChange={(scope) => onChange({ ...value, scope })}
      />
      <ChipRow
        label="Metric"
        options={[{ key: "all" as const, label: "All" }, ...METRICS.map((key) => ({ key, label: METRIC_LABELS[key] }))]}
        value={value.metric}
        onChange={(metric) => onChange({ ...value, metric })}
      />
      <ChipRow
        label="Change"
        options={DIRECTIONS}
        value={value.direction}
        onChange={(direction) => onChange({ ...value, direction })}
      />
      {active ? (
        <div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(EMPTY_ACTIVITY_FILTERS)}>
            Clear filters
          </Button>
        </div>
      ) : null}
    </div>
  );
}
