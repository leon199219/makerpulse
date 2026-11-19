import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { loadFollowers } from "@/lib/dashboard";
import type { FollowerListRow, FollowerView } from "@/lib/dashboard-types";
import { asDate, cn } from "@/lib/utils";

export const Route = createFileRoute("/followers")({
  loader: () => loadFollowers({ data: { view: "changes" } }),
  component: FollowersPage,
});

const VIEWS: { key: FollowerView; label: string }[] = [
  { key: "changes", label: "Changes" },
  { key: "following", label: "Following" },
  { key: "lost", label: "Stopped" },
];

function profileUrl(handle: string): string {
  return `https://makerworld.com/en/@${encodeURIComponent(handle)}`;
}

function whenLabel(row: FollowerListRow, view: FollowerView): string {
  if (view === "following" && row.baseline) {
    const seen = row.followedAt ?? row.detectedAt;
    return seen
      ? `Already following · first seen ${formatDistanceToNow(asDate(seen), { addSuffix: true })}`
      : "Already following when tracking started";
  }
  if (view === "changes" && row.action === "unfollow") {
    return row.detectedAt
      ? `Stopped following ${formatDistanceToNow(asDate(row.detectedAt), { addSuffix: true })}`
      : "Stopped following";
  }
  if (view === "lost") {
    return row.lostAt
      ? `Stopped following ${formatDistanceToNow(asDate(row.lostAt), { addSuffix: true })}`
      : "Stopped following";
  }
  const at = row.detectedAt ?? row.followedAt;
  return at
    ? `Started following ${formatDistanceToNow(asDate(at), { addSuffix: true })}`
    : "Started following";
}

function FollowersPage() {
  const [view, setView] = useState<FollowerView>("changes");
  const initial = Route.useLoaderData();
  const page = useQuery({
    queryKey: ["followers", view],
    queryFn: () => loadFollowers({ data: { view } }),
    initialData: view === "changes" ? initial : undefined,
  });
  const data = page.data;
  const countLabel =
    view === "following"
      ? data?.followingCount
      : view === "lost"
        ? data?.lostCount
        : data?.changeCount;

  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Followers</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Who started or stopped following. The time is the sync that first saw it. MakerWorld does
          not publish the real follow time. People who already followed you on the first sync have
          no follow date.
        </p>
      </div>

      {data?.note ? (
        <p className="rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">{data.note}</p>
      ) : null}
      {page.isError ? (
        <p className="text-sm text-destructive">
          {page.error instanceof Error ? page.error.message : "Could not load followers."}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-1.5">
        {VIEWS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setView(item.key)}
            className={cn(
              "inline-flex h-11 items-center rounded-full px-4 text-sm font-medium",
              view === item.key ? "bg-foreground text-background" : "bg-secondary text-foreground/90",
            )}
          >
            {item.label}
            {data && item.key === view && countLabel != null ? (
              <span className="ml-2 font-mono text-xs opacity-70">{countLabel}</span>
            ) : null}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {page.isLoading ? (
            <p className="py-16 text-sm text-muted-foreground">Loading followers…</p>
          ) : !data || data.rows.length === 0 ? (
            <p className="py-16 text-sm text-muted-foreground">
              {view === "changes"
                ? "No follow or unfollow yet. The first sync only records who was already following."
                : view === "lost"
                  ? "Nobody recorded as unfollowed yet."
                  : "No followers recorded yet. Sync after connecting a creator."}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {data.rows.map((row) => (
                <li key={row.id} className="flex items-center gap-3 py-4">
                  {row.avatar ? (
                    <img
                      src={row.avatar}
                      alt=""
                      className="size-10 shrink-0 rounded-full object-cover outline outline-1 -outline-offset-1 outline-white/10"
                    />
                  ) : (
                    <span className="size-10 shrink-0 rounded-full bg-secondary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <a
                      href={profileUrl(row.handle)}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-sm font-medium hover:text-primary"
                    >
                      {row.name}
                    </a>
                    <p className="truncate text-xs text-muted-foreground">@{row.handle}</p>
                  </div>
                  <p className="max-w-[46%] text-right text-xs text-muted-foreground sm:max-w-none sm:text-sm">
                    {whenLabel(row, view)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
