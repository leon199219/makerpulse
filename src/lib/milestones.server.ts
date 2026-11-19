import { getSql, type Sql } from "@/lib/db";
import {
  MILESTONE_METRICS,
  MODEL_MILESTONE_METRICS,
  replaySeries,
  thresholdsCrossed,
  thresholdsReached,
  type MilestoneDraft,
  type MilestonePoint,
} from "@/lib/milestones";
import type { Metric, StatBlock } from "@/lib/metrics";

function asBool(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1 || value === "1";
}

async function insertDrafts(sql: Sql, drafts: MilestoneDraft[]): Promise<void> {
  const size = 200;
  for (let index = 0; index < drafts.length; index += size) {
    const slice = drafts.slice(index, index + size);
    await sql.query(
      `insert into mp_milestones (design_id, metric, threshold, value, notified)
       select * from unnest($1::text[], $2::text[], $3::int[], $4::int[], $5::boolean[])
       on conflict (design_id, metric, threshold) do nothing`,
      [
        slice.map((draft) => draft.designId),
        slice.map((draft) => draft.metric),
        slice.map((draft) => draft.threshold),
        slice.map((draft) => draft.value),
        slice.map((draft) => !draft.announce),
      ],
    );
  }
}

export async function milestonesReplayed(): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql<{ milestones_replayed: boolean | string | number }>`
    select milestones_replayed from mp_settings where id = 1
  `;
  return asBool(rows[0]?.milestones_replayed);
}

export async function markMilestonesReplayed(): Promise<void> {
  const sql = await getSql();
  await sql`update mp_settings set milestones_replayed = true where id = 1`;
}

export async function claimMilestones(input: {
  designId: string;
  previous: StatBlock | null;
  next: StatBlock;
  model: boolean;
}): Promise<void> {
  const metrics = input.model ? MODEL_MILESTONE_METRICS : MILESTONE_METRICS;
  const drafts: MilestoneDraft[] = [];
  for (const metric of metrics) {
    const next = input.next[metric] || 0;
    const steps =
      input.previous == null
        ? thresholdsReached(next)
        : thresholdsCrossed(input.previous[metric] || 0, next);
    for (const threshold of steps) {
      drafts.push({
        designId: input.designId,
        metric,
        threshold,
        value: next,
        announce: input.previous != null,
      });
    }
  }
  await insertDrafts(await getSql(), drafts);
}

export async function replayMilestones(): Promise<void> {
  const sql = await getSql();
  const rows = await sql<{
    design_id: string | null;
    likes: number | string;
    collections: number | string;
    prints: number | string;
    downloads: number | string;
    comments: number | string;
    boosts: number | string;
    followers: number | string;
  }>`
    select design_id, likes, collections, prints, downloads, comments, boosts, followers
    from mp_snapshots
    where profile_id is null
    order by design_id nulls first, taken_at asc
  `;
  const groups = new Map<string, MilestonePoint[]>();
  for (const row of rows) {
    const designId = row.design_id ?? "";
    const point: MilestonePoint = {
      stats: {
        likes: Number(row.likes) || 0,
        collections: Number(row.collections) || 0,
        prints: Number(row.prints) || 0,
        downloads: Number(row.downloads) || 0,
        comments: Number(row.comments) || 0,
        boosts: Number(row.boosts) || 0,
        followers: designId === "" ? Number(row.followers) || 0 : 0,
      },
    };
    const list = groups.get(designId) ?? [];
    list.push(point);
    groups.set(designId, list);
  }
  const drafts: MilestoneDraft[] = [];
  for (const [designId, points] of groups) {
    drafts.push(
      ...replaySeries({
        designId,
        metrics: designId === "" ? MILESTONE_METRICS : MODEL_MILESTONE_METRICS,
        points,
      }),
    );
  }
  await insertDrafts(sql, drafts);
}

export type PendingMilestone = {
  id: number;
  designId: string;
  title: string;
  metric: Metric;
  threshold: number;
  value: number;
};

export async function pendingMilestones(): Promise<PendingMilestone[]> {
  const sql = await getSql();
  const rows = await sql<{
    id: number | string;
    design_id: string;
    metric: string;
    threshold: number | string;
    value: number | string;
    title: string | null;
  }>`
    select m.id, m.design_id, m.metric, m.threshold, m.value, models.title
    from mp_milestones m
    left join mp_models models on models.design_id = m.design_id
    where m.notified = false
    order by m.id desc
  `;
  return rows.map((row) => ({
    id: Number(row.id),
    designId: row.design_id,
    title: row.design_id === "" ? "Account" : row.title || "Model",
    metric: row.metric as Metric,
    threshold: Number(row.threshold) || 0,
    value: Number(row.value) || 0,
  }));
}

export async function markMilestonesNotified(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const sql = await getSql();
  await sql.query(`update mp_milestones set notified = true where id = any($1::bigint[])`, [ids]);
}
