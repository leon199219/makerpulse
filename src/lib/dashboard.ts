import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { EMPTY_STATS, METRICS, PERIOD_KEYS, periodStart, type Metric, type PeriodKey, type StatBlock } from "@/lib/metrics";
import { asIso } from "@/lib/utils";
import type {
  DashboardPayload,
  EventRow,
  ModelRow,
  PublicSettings,
  SeriesPoint,
} from "@/lib/dashboard-types";

export type { DashboardPayload, EventRow, ModelRow, PublicSettings, SeriesPoint };

type SettingsRow = {
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
};

function publicSettings(row: SettingsRow): PublicSettings {
  return {
    creatorUid: row.creator_uid,
    creatorHandle: row.creator_handle,
    creatorName: row.creator_name,
    creatorAvatar: row.creator_avatar,
    pollIntervalMinutes: row.poll_interval_minutes,
    telegramEnabled: row.telegram_enabled,
    telegramChatId: row.telegram_chat_id,
    telegramCadence: row.telegram_cadence,
    telegramOnChange: row.telegram_on_change,
    telegramIncludeModels: row.telegram_include_models,
    telegramConfigured: Boolean(row.telegram_bot_token && row.telegram_chat_id),
    lastPollAt: asIso(row.last_poll_at),
    lastPollError: row.last_poll_error,
    lastTelegramAt: asIso(row.last_telegram_at),
  };
}

function toStats(row: {
  likes: number | string;
  collections: number | string;
  prints: number | string;
  downloads: number | string;
  comments: number | string;
  boosts: number | string;
  followers: number | string;
  points: number | string;
}): StatBlock {
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

function subtract(a: StatBlock, b: StatBlock): StatBlock {
  const out = { ...EMPTY_STATS };
  for (const metric of METRICS) out[metric] = a[metric] - b[metric];
  return out;
}

function takenIso(value: string | Date): string {
  return asIso(value) ?? new Date().toISOString();
}

const periodSchema = z.object({
  period: z.enum(PERIOD_KEYS).default("7d"),
});

export const bootstrapApp = createServerFn({ method: "POST" }).handler(async () => {
  const { ensurePoller } = await import("@/lib/poller.server");
  await ensurePoller();
  return { ok: true as const };
});

export const loadDashboard = createServerFn({ method: "POST" })
  .validator((d: unknown) => periodSchema.parse(d ?? {}))
  .handler(async ({ data }): Promise<DashboardPayload> => {
    const { ensurePoller, getSettings } = await import("@/lib/poller.server");
    const { getSql } = await import("@/lib/db");
    await ensurePoller();
    const sql = await getSql();
    const settings = publicSettings(await getSettings());
    const start = periodStart(data.period as PeriodKey);
    const startIso = start?.toISOString();

    const currentRows = await sql`
      select * from mp_snapshots
      where design_id is null
      order by taken_at desc
      limit 1
    `;
    const current = currentRows[0] ? toStats(currentRows[0] as never) : { ...EMPTY_STATS };

    const firstOrBase = startIso
      ? await sql`
          select * from mp_snapshots
          where design_id is null and taken_at <= ${startIso}
          order by taken_at desc
          limit 1
        `
      : [];
    const firstEver = await sql`
      select * from mp_snapshots
      where design_id is null
      order by taken_at asc
      limit 1
    `;
    const baselineRow = firstOrBase[0] ?? firstEver[0];
    const baseline = baselineRow ? toStats(baselineRow as never) : { ...EMPTY_STATS };
    const deltas = subtract(current, baseline);

    const seriesRows = startIso
      ? await sql<{ taken_at: string } & StatBlock>`
          select taken_at, likes, collections, prints, downloads, comments, boosts, followers, points
          from mp_snapshots
          where design_id is null and taken_at >= ${startIso}
          order by taken_at asc
        `
      : await sql<{ taken_at: string } & StatBlock>`
          select taken_at, likes, collections, prints, downloads, comments, boosts, followers, points
          from mp_snapshots
          where design_id is null
          order by taken_at asc
        `;

    const series = {} as Record<Metric, SeriesPoint[]>;
    for (const metric of METRICS) series[metric] = [];
    for (const row of seriesRows) {
      const stats = toStats(row);
      const t = takenIso(row.taken_at);
      for (const metric of METRICS) series[metric].push({ t, value: stats[metric] });
    }

    const modelMeta = await sql<{
      design_id: string;
      title: string;
      slug: string;
      cover_url: string;
      is_exclusive: boolean | string;
      published_at: string | null;
    }>`select design_id, title, slug, cover_url, is_exclusive, published_at from mp_models`;

    const latestModel = await sql<{ design_id: string } & StatBlock>`
      select distinct on (design_id) design_id, likes, collections, prints, downloads, comments, boosts, followers, points
      from mp_snapshots
      where design_id is not null
      order by design_id, taken_at desc
    `;
    const firstModel = await sql<{ design_id: string } & StatBlock>`
      select distinct on (design_id) design_id, likes, collections, prints, downloads, comments, boosts, followers, points
      from mp_snapshots
      where design_id is not null
      order by design_id, taken_at asc
    `;
    const baseModel = startIso
      ? await sql<{ design_id: string } & StatBlock>`
          select distinct on (design_id) design_id, likes, collections, prints, downloads, comments, boosts, followers, points
          from mp_snapshots
          where design_id is not null and taken_at <= ${startIso}
          order by design_id, taken_at desc
        `
      : [];

    const latestMap = new Map(latestModel.map((r) => [r.design_id, toStats(r)]));
    const firstMap = new Map(firstModel.map((r) => [r.design_id, toStats(r)]));
    const baseMap = new Map(baseModel.map((r) => [r.design_id, toStats(r)]));

    const models: ModelRow[] = modelMeta.map((meta) => {
      const stats = latestMap.get(meta.design_id) ?? { ...EMPTY_STATS };
      const modelBaseline = baseMap.get(meta.design_id) ?? firstMap.get(meta.design_id) ?? { ...EMPTY_STATS };
      return {
        designId: meta.design_id,
        title: meta.title,
        slug: meta.slug,
        coverUrl: meta.cover_url,
        exclusive: meta.is_exclusive === true || meta.is_exclusive === "t",
        publishedAt: asIso(meta.published_at),
        stats,
        deltas: subtract(stats, modelBaseline),
      };
    });
    models.sort((a, b) => b.stats.downloads - a.stats.downloads);

    const eventRows = startIso
      ? await sql<{
          id: number;
          detected_at: string;
          design_id: string | null;
          metric: string;
          previous: number;
          current: number;
          delta: number;
          title: string | null;
        }>`
          select e.id, e.detected_at, e.design_id, e.metric, e.previous, e.current, e.delta, m.title
          from mp_events e
          left join mp_models m on m.design_id = e.design_id
          where e.detected_at >= ${startIso}
          order by e.detected_at desc
          limit 500
        `
      : await sql<{
          id: number;
          detected_at: string;
          design_id: string | null;
          metric: string;
          previous: number;
          current: number;
          delta: number;
          title: string | null;
        }>`
          select e.id, e.detected_at, e.design_id, e.metric, e.previous, e.current, e.delta, m.title
          from mp_events e
          left join mp_models m on m.design_id = e.design_id
          order by e.detected_at desc
          limit 500
        `;

    const events: EventRow[] = eventRows.map((row) => ({
      id: Number(row.id),
      detectedAt: takenIso(row.detected_at),
      designId: row.design_id,
      title: row.title,
      metric: row.metric as Metric,
      previous: Number(row.previous) || 0,
      current: Number(row.current) || 0,
      delta: Number(row.delta) || 0,
    }));

    return {
      settings,
      current,
      deltas,
      series,
      models,
      events,
      modelCount: models.length,
    };
  });

export const loadModel = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({ designId: z.string(), period: z.enum(PERIOD_KEYS) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { ensurePoller } = await import("@/lib/poller.server");
    const { getSql } = await import("@/lib/db");
    await ensurePoller();
    const sql = await getSql();
    const meta = await sql<{
      design_id: string;
      title: string;
      slug: string;
      cover_url: string;
      is_exclusive: boolean | string;
    }>`select * from mp_models where design_id = ${data.designId}`;
    if (!meta[0]) throw new Error("Model not found.");
    const start = periodStart(data.period);
    const startIso = start?.toISOString();
    const seriesRows = startIso
      ? await sql<{ taken_at: string } & StatBlock>`
          select taken_at, likes, collections, prints, downloads, comments, boosts, followers, points
          from mp_snapshots
          where design_id = ${data.designId} and taken_at >= ${startIso}
          order by taken_at asc
        `
      : await sql<{ taken_at: string } & StatBlock>`
          select taken_at, likes, collections, prints, downloads, comments, boosts, followers, points
          from mp_snapshots
          where design_id = ${data.designId}
          order by taken_at asc
        `;
    const series = {} as Record<Metric, SeriesPoint[]>;
    for (const metric of METRICS) series[metric] = [];
    for (const row of seriesRows) {
      const stats = toStats(row);
      const t = takenIso(row.taken_at);
      for (const metric of METRICS) series[metric].push({ t, value: stats[metric] });
    }
    const latest = seriesRows[seriesRows.length - 1];
    const first = seriesRows[0];
    const current = latest ? toStats(latest) : { ...EMPTY_STATS };
    const baseline = first ? toStats(first) : { ...EMPTY_STATS };
    return {
      designId: meta[0].design_id,
      title: meta[0].title,
      slug: meta[0].slug,
      coverUrl: meta[0].cover_url,
      exclusive: meta[0].is_exclusive === true || meta[0].is_exclusive === "t",
      current,
      deltas: subtract(current, baseline),
      series,
    };
  });

export const connectCreator = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ input: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { setCreator } = await import("@/lib/poller.server");
    return publicSettings(await setCreator(data.input));
  });

export const syncNow = createServerFn({ method: "POST" }).handler(async () => {
  const { runPoll } = await import("@/lib/poller.server");
  return runPoll();
});

export const saveSettings = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z
      .object({
        pollIntervalMinutes: z.number().int().min(5).max(1440),
        telegramEnabled: z.boolean(),
        telegramBotToken: z.string(),
        telegramChatId: z.string(),
        telegramCadence: z.enum(["hourly", "every_6h", "daily", "weekly"]),
        telegramOnChange: z.boolean(),
        telegramIncludeModels: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const { getSettings } = await import("@/lib/poller.server");
    const sql = await getSql();
    const current = await getSettings();
    const token = data.telegramBotToken.trim() || current.telegram_bot_token;
    await sql`
      update mp_settings set
        poll_interval_minutes = ${data.pollIntervalMinutes},
        telegram_enabled = ${data.telegramEnabled},
        telegram_bot_token = ${token},
        telegram_chat_id = ${data.telegramChatId.trim()},
        telegram_cadence = ${data.telegramCadence},
        telegram_on_change = ${data.telegramOnChange},
        telegram_include_models = ${data.telegramIncludeModels},
        updated_at = now()
      where id = 1
    `;
    return publicSettings(await getSettings());
  });

export const testTelegram = createServerFn({ method: "POST" }).handler(async () => {
  const { getSettings } = await import("@/lib/poller.server");
  const { sendTelegramMessage } = await import("@/lib/telegram.server");
  const settings = await getSettings();
  if (!settings.telegram_bot_token || !settings.telegram_chat_id) {
    throw new Error("Add a bot token and chat ID first.");
  }
  const name = settings.creator_name || "your creator";
  await sendTelegramMessage(
    settings.telegram_bot_token,
    settings.telegram_chat_id,
    `<b>MakerPulse</b> is connected.\nTracking ${name}${settings.creator_handle ? ` (@${settings.creator_handle})` : ""}.`,
  );
  return { ok: true as const };
});

export const resetTracking = createServerFn({ method: "POST" }).handler(async () => {
  const { resetHistory } = await import("@/lib/poller.server");
  return publicSettings(await resetHistory());
});

export const exportCsv = createServerFn({ method: "POST" }).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{
    taken_at: string;
    design_id: string | null;
    title: string | null;
    likes: number;
    collections: number;
    prints: number;
    downloads: number;
    comments: number;
    boosts: number;
    followers: number;
    points: number;
  }>`
    select s.taken_at, s.design_id, m.title, s.likes, s.collections, s.prints, s.downloads,
           s.comments, s.boosts, s.followers, s.points
    from mp_snapshots s
    left join mp_models m on m.design_id = s.design_id
    order by s.taken_at asc
  `;
  const header =
    "taken_at,scope,design_id,title,likes,collections,prints,downloads,comments,boosts,followers,points";
  const lines = rows.map((row) => {
    const title = (row.title ?? "Account").replaceAll('"', '""');
    return [
      takenIso(row.taken_at),
      row.design_id ? "model" : "account",
      row.design_id ?? "",
      `"${title}"`,
      row.likes,
      row.collections,
      row.prints,
      row.downloads,
      row.comments,
      row.boosts,
      row.followers,
      row.points,
    ].join(",");
  });
  return { csv: [header, ...lines].join("\n") };
});
