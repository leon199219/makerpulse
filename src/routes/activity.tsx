import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { ActivityList } from "@/components/activity-list";
import {
  ActivityFilters,
  EMPTY_ACTIVITY_FILTERS,
  type ActivityFilterState,
} from "@/components/activity-filters";
import { PeriodPicker } from "@/components/period-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadDashboard } from "@/lib/dashboard";
import type { EventRow } from "@/lib/dashboard-types";
import type { PeriodKey } from "@/lib/metrics";

export const Route = createFileRoute("/activity")({
  loader: () => loadDashboard({ data: { period: "7d" } }),
  component: ActivityPage,
});

function matchesFilters(event: EventRow, filters: ActivityFilterState): boolean {
  const query = filters.query.trim().toLowerCase();
  if (query) {
    const hay = `${event.title ?? "Account"} ${event.designId ?? ""}`.toLowerCase();
    if (!hay.includes(query)) return false;
  }
  if (filters.metric !== "all" && event.metric !== filters.metric) return false;
  if (filters.scope === "account" && event.designId) return false;
  if (filters.scope === "models" && !event.designId) return false;
  if (filters.direction === "up" && event.delta <= 0) return false;
  if (filters.direction === "down" && event.delta >= 0) return false;
  return true;
}

function ActivityPage() {
  const [period, setPeriod] = useState<PeriodKey>("7d");
  const [filters, setFilters] = useState<ActivityFilterState>(EMPTY_ACTIVITY_FILTERS);
  const initial = Route.useLoaderData();
  const dash = useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => loadDashboard({ data: { period } }),
    initialData: period === "7d" ? initial : undefined,
  });
  const events = dash.data?.events ?? [];
  const visible = useMemo(() => events.filter((event) => matchesFilters(event, filters)), [events, filters]);

  return (
    <AppShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Activity</h1>
          <p className="text-sm text-muted-foreground">Every detected change across the account and each model.</p>
        </div>
        <PeriodPicker value={period} onChange={setPeriod} />
      </div>
      <ActivityFilters value={filters} onChange={setFilters} />
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">
            Change log
            {events.length > 0 ? (
              <span className="ml-2 font-normal text-muted-foreground">
                {visible.length === events.length
                  ? `${events.length}`
                  : `${visible.length} of ${events.length}`}
              </span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length > 0 && visible.length === 0 ? (
            <p className="py-16 text-base text-muted-foreground">No changes match these filters.</p>
          ) : (
            <ActivityList events={visible} size="lg" />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
