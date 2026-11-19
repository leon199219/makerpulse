import { getSql } from "@/lib/db";
import { env } from "@/lib/env.server";
import { syncFollowers, type FollowerChange } from "@/lib/followers.server";
import {
  collectSnapshot,
  resolveCreator,
  type MwSnapshot,
} from "@/lib/makerworld.server";
import { EMPTY_STATS, METRICS, MODEL_METRICS, estimatePoints, type Metric, type RatingBlock, type StatBlock } from "@/lib/metrics";
import {
  claimMilestones,
  markMilestonesNotified,
  markMilestonesReplayed,
  milestonesReplayed,
  pendingMilestones,
  replayMilestones,
} from "@/lib/milestones.server";
import {
  formatChangeDigest,
  formatMilestones,
  formatPeriodicSummary,
  sendTelegramMessage,
  type MilestoneHit,
  type TelegramEvent,
  type TelegramFollowerChange,
} from "@/lib/telegram.server";

export type SettingsRow = {
  id: number;
  creator_uid: string;
  creator_handle: string;
  creator_name: string;
  creator_avatar: string;
  poll_interval_minutes: number;
  telegram_enabled: boolean;
  telegram_bot_token: string;
  telegram_chat_id: string;
  telegram_cadence: string;
  telegram_on_change: boolean;
  telegram_include_models: boolean;
  last_telegram_at: string | null;
  last_poll_at: string | null;
  last_poll_error: string;
  updated_at: string;
};

type SnapshotRow = StatBlock & {
  id: number;
  taken_at: string;
  design_id: string | null;
  profile_id?: string | null;
};

const g = globalThis as typeof globalThis & {
  __mpPollTimer?: ReturnType<typeof setInterval>;
  __mpPollRunning?: boolean;
};

function asBool(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1 || value === "1";
}

export async function getSettings(): Promise<SettingsRow> {
  const sql = await getSql();
  const rows = await sql<SettingsRow>`select * from mp_settings where id = 1`;
  const row = rows[0];
  if (!row) throw new Error("Settings row missing.");
  return {
    ...row,
    telegram_enabled: asBool(row.telegram_enabled),
    telegram_on_change: asBool(row.telegram_on_change),
    telegram_include_models: asBool(row.telegram_include_models),
    poll_interval_minutes: Number(row.poll_interval_minutes),
  };
}

export async function applyEnvOverrides(): Promise<void> {
  const sql = await getSql();
  const savedRows = await sql<{ preferences_saved: boolean | string | number }>`
    select preferences_saved from mp_settings where id = 1
  `;
  const preferencesSaved = asBool(savedRows[0]?.preferences_saved);
  const uid = env("MAKERWORLD_UID");
  const handle = env("MAKERWORLD_HANDLE");
  const interval = env("POLL_INTERVAL_MINUTES");
  const token = env("TELEGRAM_BOT_TOKEN");
  const chat = env("TELEGRAM_CHAT_ID");
  const cadence = env("TELEGRAM_CADENCE");
  if (uid) {
    await sql`update mp_settings set creator_uid = ${uid}, updated_at = now() where id = 1`;
  }
  if (handle) {
    await sql`update mp_settings set creator_handle = ${handle}, updated_at = now() where id = 1`;
  }
  // Compose defaults (30 min, daily) must not wipe values saved in Settings.
  if (!preferencesSaved && interval && Number(interval) > 0) {
    await sql`update mp_settings set poll_interval_minutes = ${Number(interval)}, updated_at = now() where id = 1`;
  }
  if (token) {
    await sql`update mp_settings set telegram_bot_token = ${token}, telegram_enabled = true, updated_at = now() where id = 1`;
  }
  if (chat) {
    await sql`update mp_settings set telegram_chat_id = ${chat}, updated_at = now() where id = 1`;
  }
  if (!preferencesSaved && cadence) {
    await sql`update mp_settings set telegram_cadence = ${cadence}, updated_at = now() where id = 1`;
  }
}

async function latestSnapshot(designId: string | null): Promise<SnapshotRow | null> {
  const sql = await getSql();
  if (designId == null) {
    const rows = await sql<SnapshotRow>`
      select * from mp_snapshots
      where design_id is null and profile_id is null
      order by taken_at desc
      limit 1
    `;
    return rows[0] ?? null;
  }
  const rows = await sql<SnapshotRow>`
    select * from mp_snapshots
    where design_id = ${designId} and profile_id is null
    order by taken_at desc
    limit 1
  `;
  return rows[0] ?? null;
}

function rowStats(row: SnapshotRow | null): StatBlock {
  if (!row) return { ...EMPTY_STATS };
  return {
    likes: Number(row.likes) || 0,
    collections: Number(row.collections) || 0,
    prints: Number(row.prints) || 0,
    downloads: Number(row.downloads) || 0,
    comments: Number(row.comments) || 0,
    boosts: Number(row.boosts) || 0,
    followers: Number(row.followers) || 0,
    points: Number(row.points) || 0,
  };
}

async function insertSnapshot(
  designId: string | null,
  stats: StatBlock,
  rating: RatingBlock,
): Promise<void> {
  const sql = await getSql();
  await sql`
    insert into mp_snapshots (
      design_id, likes, collections, prints, downloads, comments, boosts, followers, points,
      rating_count, rating_score_total
    ) values (
      ${designId}, ${stats.likes}, ${stats.collections}, ${stats.prints}, ${stats.downloads},
      ${stats.comments}, ${stats.boosts}, ${stats.followers}, ${stats.points},
      ${rating.count}, ${rating.scoreTotal}
    )
  `;
}

async function recordEvents(
  designId: string | null,
  previous: StatBlock,
  next: StatBlock,
  metrics: readonly Metric[],
  profileId: string | null = null,
): Promise<TelegramEvent[]> {
  const sql = await getSql();
  const events: TelegramEvent[] = [];
  for (const metric of metrics) {
    const delta = next[metric] - previous[metric];
    if (delta === 0) continue;
    await sql`
      insert into mp_events (design_id, profile_id, metric, previous, current, delta)
      values (${designId}, ${profileId}, ${metric}, ${previous[metric]}, ${next[metric]}, ${delta})
    `;
    events.push({
      designTitle: null,
      metric,
      previous: previous[metric],
      current: next[metric],
      delta,
    });
  }
  return events;
}

function cadenceMs(cadence: string): number {
  switch (cadence) {
    case "hourly":
      return 60 * 60 * 1000;
    case "every_6h":
      return 6 * 60 * 60 * 1000;
    case "weekly":
      return 7 * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
}

function cadenceWindowLabel(cadence: string): string {
  switch (cadence) {
    case "hourly":
      return "the last hour";
    case "every_6h":
      return "the last 6 hours";
    case "weekly":
      return "the last 7 days";
    default:
      return "the last 24 hours";
  }
}

async function baselinesForWindow(at: Date): Promise<Map<string, SnapshotRow>> {
  const sql = await getSql();
  const before = await sql<SnapshotRow>`
    select distinct on (design_id) *
    from mp_snapshots
    where taken_at <= ${at.toISOString()} and profile_id is null
    order by design_id nulls first, taken_at desc
  `;
  const map = new Map<string, SnapshotRow>();
  for (const row of before) map.set(row.design_id ?? "", row);
  const earliest = await sql<SnapshotRow>`
    select distinct on (design_id) *
    from mp_snapshots
    where profile_id is null
    order by design_id nulls first, taken_at asc
  `;
  for (const row of earliest) {
    const key = row.design_id ?? "";
    if (!map.has(key)) map.set(key, row);
  }
  return map;
}

function toTelegramFollowers(changes: FollowerChange[]): TelegramFollowerChange[] {
  return changes.map((change) => ({
    name: change.name,
    handle: change.handle,
    action: change.action,
  }));
}

async function maybeTelegram(
  settings: SettingsRow,
  snapshot: MwSnapshot,
  events: TelegramEvent[],
  followerChanges: FollowerChange[],
  catchUp: boolean,
): Promise<void> {
  const pending = await pendingMilestones();
  const hidden = pending.filter((hit) => hit.designId !== "" && !settings.telegram_include_models);
  await markMilestonesNotified(hidden.map((hit) => hit.id));
  const visible = pending.filter((hit) => hit.designId === "" || settings.telegram_include_models);
  if (!settings.telegram_enabled || !settings.telegram_bot_token || !settings.telegram_chat_id) {
    await markMilestonesNotified(visible.map((hit) => hit.id));
    if (catchUp) await markMilestonesReplayed();
    return;
  }
  const batch = visible.slice(0, 80);
  const hits: MilestoneHit[] = batch.map((hit) => ({
    id: hit.id,
    title: hit.title,
    metric: hit.metric,
    threshold: hit.threshold,
    value: hit.value,
  }));
  const messages = formatMilestones({
    creatorName: snapshot.profile.name,
    handle: snapshot.profile.handle,
    hits,
    catchUp,
    more: visible.length - hits.length,
  });
  for (let index = 0; index < messages.length; index += 1) {
    const html = messages[index];
    if (!html) continue;
    await sendTelegramMessage(settings.telegram_bot_token, settings.telegram_chat_id, html);
    await markMilestonesNotified(hits.slice(index * 20, index * 20 + 20).map((hit) => hit.id));
  }
  if (catchUp) await markMilestonesReplayed();

  const now = Date.now();
  const last = settings.last_telegram_at ? new Date(settings.last_telegram_at).getTime() : 0;
  const due = now - last >= cadenceMs(settings.telegram_cadence);
  const sql = await getSql();

  if (settings.telegram_on_change && (events.length || followerChanges.length)) {
    const html = formatChangeDigest({
      creatorName: snapshot.profile.name,
      handle: snapshot.profile.handle,
      events,
      includeModels: settings.telegram_include_models,
      followerChanges: toTelegramFollowers(followerChanges),
    });
    await sendTelegramMessage(settings.telegram_bot_token, settings.telegram_chat_id, html);
  }

  if (!due) return;

  const windowStart = last
    ? new Date(last)
    : new Date(now - cadenceMs(settings.telegram_cadence));
  const baselines = await baselinesForWindow(windowStart);
  const accountBase = rowStats(baselines.get("") ?? null);
  const deltas: StatBlock = { ...EMPTY_STATS };
  for (const metric of METRICS) {
    deltas[metric] = snapshot.totals[metric] - accountBase[metric];
  }

  const modelChanges: { title: string; changes: { metric: Metric; delta: number }[] }[] = [];
  if (settings.telegram_include_models) {
    for (const model of snapshot.models) {
      const base = baselines.get(model.designId);
      if (!base) continue;
      const current: StatBlock = {
        likes: model.likes,
        collections: model.collections,
        prints: model.prints,
        downloads: model.downloads,
        comments: model.comments,
        boosts: model.boosts,
        followers: 0,
        points: model.points,
      };
      const changes = MODEL_METRICS.map((metric) => ({
        metric,
        delta: current[metric] - (Number(base[metric]) || 0),
      })).filter((change) => change.delta !== 0);
      if (changes.length) modelChanges.push({ title: model.title, changes });
    }
    modelChanges.sort((a, b) => {
      const score = (list: { delta: number }[]) =>
        list.reduce((sum, change) => sum + Math.abs(change.delta), 0);
      return score(b.changes) - score(a.changes);
    });
  }

  const namedRows = await sql<{ name: string; handle: string; action: "follow" | "unfollow" }>`
    select name, handle, action
    from mp_follower_events
    where detected_at >= ${windowStart.toISOString()}
    order by detected_at desc
    limit 40
  `;

  const html = formatPeriodicSummary({
    creatorName: snapshot.profile.name,
    handle: snapshot.profile.handle,
    totals: snapshot.totals,
    deltas,
    modelCount: snapshot.models.length,
    windowLabel: cadenceWindowLabel(settings.telegram_cadence),
    modelChanges,
    followerChanges: namedRows.map((row) => ({
      name: row.name,
      handle: row.handle,
      action: row.action,
    })),
  });
  await sendTelegramMessage(settings.telegram_bot_token, settings.telegram_chat_id, html);
  await sql`update mp_settings set last_telegram_at = now() where id = 1`;
}

export async function runPoll(): Promise<{ ok: boolean; error?: string; events: number }> {
  if (g.__mpPollRunning) return { ok: true, events: 0 };
  g.__mpPollRunning = true;
  const sql = await getSql();
  try {
    const settings = await getSettings();
    if (!settings.creator_uid) {
      return { ok: false, error: "No creator configured.", events: 0 };
    }
    const snapshot = await collectSnapshot(settings.creator_uid);
    await sql`
      update mp_settings
      set creator_handle = ${snapshot.profile.handle},
          creator_name = ${snapshot.profile.name},
          creator_avatar = ${snapshot.profile.avatar},
          last_poll_at = now(),
          last_poll_error = '',
          updated_at = now()
      where id = 1
    `;

    const prevAccountRow = await latestSnapshot(null);
    const prevAccount = rowStats(prevAccountRow);
    await insertSnapshot(null, snapshot.totals, snapshot.rating);
    const accountEvents = prevAccountRow
      ? await recordEvents(null, prevAccount, snapshot.totals, METRICS)
      : [];
    const replayed = await milestonesReplayed();
    if (replayed) {
      await claimMilestones({
        designId: "",
        previous: prevAccountRow ? prevAccount : null,
        next: snapshot.totals,
        model: false,
      });
    }

    const allEvents: TelegramEvent[] = [...accountEvents];
    for (const model of snapshot.models) {
      await sql`
        insert into mp_models (design_id, title, slug, cover_url, is_exclusive, published_at, last_seen_at)
        values (
          ${model.designId}, ${model.title}, ${model.slug}, ${model.coverUrl},
          ${model.exclusive}, ${model.publishedAt}, now()
        )
        on conflict (design_id) do update set
          title = excluded.title,
          slug = excluded.slug,
          cover_url = excluded.cover_url,
          is_exclusive = excluded.is_exclusive,
          published_at = coalesce(excluded.published_at, mp_models.published_at),
          last_seen_at = now(),
          removed_at = null
      `;
      const stats: StatBlock = {
        likes: model.likes,
        collections: model.collections,
        prints: model.prints,
        downloads: model.downloads,
        comments: model.comments,
        boosts: model.boosts,
        followers: 0,
        points: model.points,
      };
      const rating: RatingBlock = {
        count: model.ratingCount,
        scoreTotal: model.ratingScoreTotal,
      };
      const prevRow = await latestSnapshot(model.designId);
      const prev = rowStats(prevRow);
      await insertSnapshot(model.designId, stats, rating);
      if (replayed) {
        await claimMilestones({
          designId: model.designId,
          previous: prevRow ? prev : null,
          next: stats,
          model: true,
        });
      }
      if (!prevRow) continue;
      const modelEvents = await recordEvents(
        model.designId,
        prev,
        stats,
        ["likes", "collections", "prints", "downloads", "comments", "boosts", "points"],
      );
      for (const event of modelEvents) {
        allEvents.push({ ...event, designTitle: model.title });
      }
    }

    const liveIds = new Set(snapshot.models.map((model) => model.designId));
    if (liveIds.size > 0 || snapshot.profile.designCount === 0) {
      const stored = await sql<{ design_id: string }>`
        select design_id from mp_models where removed_at is null
      `;
      for (const row of stored) {
        if (liveIds.has(row.design_id)) continue;
        await sql`update mp_models set removed_at = now() where design_id = ${row.design_id}`;
      }
    }

    const seenProfiles = new Set<string>();
    const loadedDesigns = new Set(
      snapshot.models.filter((model) => model.profilesLoaded).map((model) => model.designId),
    );
    for (const model of snapshot.models) {
      if (!model.profilesLoaded) continue;
      for (const profile of model.profiles) {
        seenProfiles.add(profile.profileId);
        await sql`
          insert into mp_profiles (
            profile_id, design_id, title, model_title, cover_url, is_exclusive, published_at, last_seen_at
          ) values (
            ${profile.profileId}, ${profile.designId}, ${profile.title}, ${profile.modelTitle},
            ${profile.coverUrl}, ${profile.exclusive}, ${profile.publishedAt}, now()
          )
          on conflict (profile_id) do update set
            design_id = excluded.design_id,
            title = excluded.title,
            model_title = excluded.model_title,
            cover_url = excluded.cover_url,
            is_exclusive = excluded.is_exclusive,
            published_at = coalesce(excluded.published_at, mp_profiles.published_at),
            last_seen_at = now(),
            removed_at = null
        `;
        const stats: StatBlock = {
          likes: 0,
          collections: 0,
          prints: profile.prints,
          downloads: profile.downloads,
          comments: 0,
          boosts: 0,
          followers: 0,
          points: estimatePoints({ prints: profile.prints, boosts: 0, exclusive: profile.exclusive }),
        };
        const rating: RatingBlock = {
          count: profile.ratingCount,
          scoreTotal: profile.ratingScoreTotal,
        };
        const prevProfile = await sql<SnapshotRow>`
          select * from mp_snapshots
          where profile_id = ${profile.profileId}
          order by taken_at desc
          limit 1
        `;
        await sql`
          insert into mp_snapshots (
            design_id, profile_id, likes, collections, prints, downloads, comments, boosts, followers, points,
            rating_count, rating_score_total
          ) values (
            ${profile.designId}, ${profile.profileId}, ${stats.likes}, ${stats.collections}, ${stats.prints},
            ${stats.downloads}, ${stats.comments}, ${stats.boosts}, ${stats.followers}, ${stats.points},
            ${rating.count}, ${rating.scoreTotal}
          )
        `;
        const prevRow = prevProfile[0] ?? null;
        if (!prevRow) continue;
        await recordEvents(
          profile.designId,
          rowStats(prevRow),
          stats,
          ["prints", "downloads", "points"],
          profile.profileId,
        );
      }
    }
    if (loadedDesigns.size > 0) {
      const storedProfiles = await sql<{ profile_id: string; design_id: string }>`
        select profile_id, design_id from mp_profiles where removed_at is null
      `;
      for (const row of storedProfiles) {
        if (!loadedDesigns.has(row.design_id) || seenProfiles.has(row.profile_id)) continue;
        await sql`update mp_profiles set removed_at = now() where profile_id = ${row.profile_id}`;
      }
    }

    let followerChanges: FollowerChange[] = [];
    try {
      const synced = await syncFollowers(settings.creator_uid, snapshot.profile.followers);
      followerChanges = synced.changes;
    } catch (err) {
      console.error("[makerpulse] follower sync failed", err);
    }

    if (!replayed) await replayMilestones();

    await maybeTelegram(settings, snapshot, allEvents, followerChanges, !replayed);
    return { ok: true, events: allEvents.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await sql`update mp_settings set last_poll_error = ${message}, last_poll_at = now() where id = 1`;
    return { ok: false, error: message, events: 0 };
  } finally {
    g.__mpPollRunning = false;
  }
}

export async function ensurePoller(): Promise<void> {
  await applyEnvOverrides();
  if (g.__mpPollTimer) return;
  const tick = async () => {
    try {
      const settings = await getSettings();
      if (!settings.creator_uid) return;
      const intervalMs = Math.max(5, settings.poll_interval_minutes) * 60 * 1000;
      const last = settings.last_poll_at ? new Date(settings.last_poll_at).getTime() : 0;
      if (Date.now() - last >= intervalMs) await runPoll();
    } catch (err) {
      console.error("[makerpulse] poll tick failed", err);
    }
  };
  await tick();
  g.__mpPollTimer = setInterval(() => {
    void tick();
  }, 60 * 1000);
}

export async function clearHistory(): Promise<void> {
  const sql = await getSql();
  await sql`delete from mp_events`;
  await sql`delete from mp_follower_events`;
  await sql`delete from mp_followers`;
  await sql`delete from mp_follower_sync`;
  await sql`delete from mp_snapshots`;
  await sql`delete from mp_profiles`;
  await sql`delete from mp_models`;
  await sql`delete from mp_milestones`;
  await sql`
    update mp_settings
    set last_poll_at = null,
        last_poll_error = '',
        last_telegram_at = null,
        updated_at = now()
    where id = 1
  `;
}

async function waitForPollIdle(): Promise<void> {
  for (let i = 0; i < 40 && g.__mpPollRunning; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export async function resetHistory(): Promise<SettingsRow> {
  await waitForPollIdle();
  await clearHistory();
  const settings = await getSettings();
  if (settings.creator_uid) await runPoll();
  return getSettings();
}

export async function setCreator(input: string): Promise<SettingsRow> {
  const resolved = await resolveCreator(input);
  const current = await getSettings();
  await waitForPollIdle();
  if (current.creator_uid !== resolved.uid) {
    await clearHistory();
  }
  const sql = await getSql();
  await sql`
    update mp_settings
    set creator_uid = ${resolved.uid},
        creator_handle = ${resolved.handle},
        creator_name = ${current.creator_uid === resolved.uid ? current.creator_name : ""},
        creator_avatar = ${current.creator_uid === resolved.uid ? current.creator_avatar : ""},
        last_poll_error = '',
        updated_at = now()
    where id = 1
  `;
  await runPoll();
  return getSettings();
}
