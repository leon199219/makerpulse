import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { c as periodStart, n as METRICS, o as PERIOD_KEYS, t as EMPTY_STATS } from "./metrics-jlkn7fzI.mjs";
import { a as object, i as number, n as boolean, o as string, t as _enum } from "../_libs/zod.mjs";
import { n as asIso } from "./utils-Doej6DeN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-CVHvjMe5.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function publicSettings(row) {
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
		lastTelegramAt: asIso(row.last_telegram_at)
	};
}
function toStats(row) {
	return {
		likes: Number(row.likes) || 0,
		collections: Number(row.collections) || 0,
		prints: Number(row.prints) || 0,
		downloads: Number(row.downloads) || 0,
		comments: Number(row.comments) || 0,
		boosts: Number(row.boosts) || 0,
		followers: Number(row.followers) || 0,
		points: Number(row.points) || 0
	};
}
function subtract(a, b) {
	const out = { ...EMPTY_STATS };
	for (const metric of METRICS) out[metric] = a[metric] - b[metric];
	return out;
}
function takenIso(value) {
	return asIso(value) ?? (/* @__PURE__ */ new Date()).toISOString();
}
var periodSchema = object({ period: _enum(PERIOD_KEYS).default("7d") });
var bootstrapApp_createServerFn_handler = createServerRpc({
	id: "ee3319ce50fb6ca88b23721a8cea32d68c1b3e725debe846f3dd05739e896cca",
	name: "bootstrapApp",
	filename: "src/lib/dashboard.ts"
}, (opts) => bootstrapApp.__executeServer(opts));
var bootstrapApp = createServerFn({ method: "POST" }).handler(bootstrapApp_createServerFn_handler, async () => {
	const { ensurePoller } = await import("./poller.server-xi2ILzpV.mjs");
	await ensurePoller();
	return { ok: true };
});
var loadDashboard_createServerFn_handler = createServerRpc({
	id: "8b5558b51c5624e6b25161f4c3b8efd1c389fccf11f6bdbba506dca195fa226b",
	name: "loadDashboard",
	filename: "src/lib/dashboard.ts"
}, (opts) => loadDashboard.__executeServer(opts));
var loadDashboard = createServerFn({ method: "POST" }).validator((d) => periodSchema.parse(d ?? {})).handler(loadDashboard_createServerFn_handler, async ({ data }) => {
	const { ensurePoller, getSettings } = await import("./poller.server-xi2ILzpV.mjs");
	const { getSql } = await import("./db-Wq2lblm1.mjs");
	await ensurePoller();
	const sql = await getSql();
	const settings = publicSettings(await getSettings());
	const startIso = periodStart(data.period)?.toISOString();
	const currentRows = await sql`
      select * from mp_snapshots
      where design_id is null
      order by taken_at desc
      limit 1
    `;
	const current = currentRows[0] ? toStats(currentRows[0]) : { ...EMPTY_STATS };
	const firstOrBase = startIso ? await sql`
          select * from mp_snapshots
          where design_id is null and taken_at <= ${startIso}
          order by taken_at desc
          limit 1
        ` : [];
	const firstEver = await sql`
      select * from mp_snapshots
      where design_id is null
      order by taken_at asc
      limit 1
    `;
	const baselineRow = firstOrBase[0] ?? firstEver[0];
	const deltas = subtract(current, baselineRow ? toStats(baselineRow) : { ...EMPTY_STATS });
	const seriesRows = startIso ? await sql`
          select taken_at, likes, collections, prints, downloads, comments, boosts, followers, points
          from mp_snapshots
          where design_id is null and taken_at >= ${startIso}
          order by taken_at asc
        ` : await sql`
          select taken_at, likes, collections, prints, downloads, comments, boosts, followers, points
          from mp_snapshots
          where design_id is null
          order by taken_at asc
        `;
	const series = {};
	for (const metric of METRICS) series[metric] = [];
	for (const row of seriesRows) {
		const stats = toStats(row);
		const t = takenIso(row.taken_at);
		for (const metric of METRICS) series[metric].push({
			t,
			value: stats[metric]
		});
	}
	const modelMeta = await sql`select design_id, title, slug, cover_url, is_exclusive, published_at from mp_models`;
	const latestModel = await sql`
      select distinct on (design_id) design_id, likes, collections, prints, downloads, comments, boosts, followers, points
      from mp_snapshots
      where design_id is not null
      order by design_id, taken_at desc
    `;
	const firstModel = await sql`
      select distinct on (design_id) design_id, likes, collections, prints, downloads, comments, boosts, followers, points
      from mp_snapshots
      where design_id is not null
      order by design_id, taken_at asc
    `;
	const baseModel = startIso ? await sql`
          select distinct on (design_id) design_id, likes, collections, prints, downloads, comments, boosts, followers, points
          from mp_snapshots
          where design_id is not null and taken_at <= ${startIso}
          order by design_id, taken_at desc
        ` : [];
	const latestMap = new Map(latestModel.map((r) => [r.design_id, toStats(r)]));
	const firstMap = new Map(firstModel.map((r) => [r.design_id, toStats(r)]));
	const baseMap = new Map(baseModel.map((r) => [r.design_id, toStats(r)]));
	const models = modelMeta.map((meta) => {
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
			deltas: subtract(stats, modelBaseline)
		};
	});
	models.sort((a, b) => b.stats.downloads - a.stats.downloads);
	return {
		settings,
		current,
		deltas,
		series,
		models,
		events: (startIso ? await sql`
          select e.id, e.detected_at, e.design_id, e.metric, e.previous, e.current, e.delta, m.title
          from mp_events e
          left join mp_models m on m.design_id = e.design_id
          where e.detected_at >= ${startIso}
          order by e.detected_at desc
          limit 500
        ` : await sql`
          select e.id, e.detected_at, e.design_id, e.metric, e.previous, e.current, e.delta, m.title
          from mp_events e
          left join mp_models m on m.design_id = e.design_id
          order by e.detected_at desc
          limit 500
        `).map((row) => ({
			id: Number(row.id),
			detectedAt: takenIso(row.detected_at),
			designId: row.design_id,
			title: row.title,
			metric: row.metric,
			previous: Number(row.previous) || 0,
			current: Number(row.current) || 0,
			delta: Number(row.delta) || 0
		})),
		modelCount: models.length
	};
});
var loadModel_createServerFn_handler = createServerRpc({
	id: "65b0102c9fa4770bebc48f4f781351483fa53310008ec6e4083bcff87cf68b4c",
	name: "loadModel",
	filename: "src/lib/dashboard.ts"
}, (opts) => loadModel.__executeServer(opts));
var loadModel = createServerFn({ method: "POST" }).validator((d) => object({
	designId: string(),
	period: _enum(PERIOD_KEYS)
}).parse(d)).handler(loadModel_createServerFn_handler, async ({ data }) => {
	const { ensurePoller } = await import("./poller.server-xi2ILzpV.mjs");
	const { getSql } = await import("./db-Wq2lblm1.mjs");
	await ensurePoller();
	const sql = await getSql();
	const meta = await sql`select * from mp_models where design_id = ${data.designId}`;
	if (!meta[0]) throw new Error("Model not found.");
	const startIso = periodStart(data.period)?.toISOString();
	const seriesRows = startIso ? await sql`
          select taken_at, likes, collections, prints, downloads, comments, boosts, followers, points
          from mp_snapshots
          where design_id = ${data.designId} and taken_at >= ${startIso}
          order by taken_at asc
        ` : await sql`
          select taken_at, likes, collections, prints, downloads, comments, boosts, followers, points
          from mp_snapshots
          where design_id = ${data.designId}
          order by taken_at asc
        `;
	const series = {};
	for (const metric of METRICS) series[metric] = [];
	for (const row of seriesRows) {
		const stats = toStats(row);
		const t = takenIso(row.taken_at);
		for (const metric of METRICS) series[metric].push({
			t,
			value: stats[metric]
		});
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
		series
	};
});
var connectCreator_createServerFn_handler = createServerRpc({
	id: "735691fc252f0c2182c52cb3abda244d3ede7eec4e3ade25ccb1c2bfdcb76b14",
	name: "connectCreator",
	filename: "src/lib/dashboard.ts"
}, (opts) => connectCreator.__executeServer(opts));
var connectCreator = createServerFn({ method: "POST" }).validator((d) => object({ input: string().min(1) }).parse(d)).handler(connectCreator_createServerFn_handler, async ({ data }) => {
	const { setCreator } = await import("./poller.server-xi2ILzpV.mjs");
	return publicSettings(await setCreator(data.input));
});
var syncNow_createServerFn_handler = createServerRpc({
	id: "d8cfa1b8d9602df2340fa7fa3e3b09cf96dbfc4ef415d669cda1a222133368dd",
	name: "syncNow",
	filename: "src/lib/dashboard.ts"
}, (opts) => syncNow.__executeServer(opts));
var syncNow = createServerFn({ method: "POST" }).handler(syncNow_createServerFn_handler, async () => {
	const { runPoll } = await import("./poller.server-xi2ILzpV.mjs");
	return runPoll();
});
var saveSettings_createServerFn_handler = createServerRpc({
	id: "24d0b0a0f8302db9135701b1728ac62b1683586a440235f8cb668f70f909219b",
	name: "saveSettings",
	filename: "src/lib/dashboard.ts"
}, (opts) => saveSettings.__executeServer(opts));
var saveSettings = createServerFn({ method: "POST" }).validator((d) => object({
	pollIntervalMinutes: number().int().min(5).max(1440),
	telegramEnabled: boolean(),
	telegramBotToken: string(),
	telegramChatId: string(),
	telegramCadence: _enum([
		"hourly",
		"every_6h",
		"daily",
		"weekly"
	]),
	telegramOnChange: boolean(),
	telegramIncludeModels: boolean()
}).parse(d)).handler(saveSettings_createServerFn_handler, async ({ data }) => {
	const { getSql } = await import("./db-Wq2lblm1.mjs");
	const { getSettings } = await import("./poller.server-xi2ILzpV.mjs");
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
var testTelegram_createServerFn_handler = createServerRpc({
	id: "0d109b97ee624a2aca9daa2f249debc016f32648d3283ae85da2e1837a514fb8",
	name: "testTelegram",
	filename: "src/lib/dashboard.ts"
}, (opts) => testTelegram.__executeServer(opts));
var testTelegram = createServerFn({ method: "POST" }).handler(testTelegram_createServerFn_handler, async () => {
	const { getSettings } = await import("./poller.server-xi2ILzpV.mjs");
	const { sendTelegramMessage } = await import("./telegram.server-DUwY_WH1.mjs");
	const settings = await getSettings();
	if (!settings.telegram_bot_token || !settings.telegram_chat_id) throw new Error("Add a bot token and chat ID first.");
	const name = settings.creator_name || "your creator";
	await sendTelegramMessage(settings.telegram_bot_token, settings.telegram_chat_id, `<b>MakerPulse</b> is connected.\nTracking ${name}${settings.creator_handle ? ` (@${settings.creator_handle})` : ""}.`);
	return { ok: true };
});
var resetTracking_createServerFn_handler = createServerRpc({
	id: "cd2659a9950994b696f7dbc5d4dfe7ca120e4f499758d0560bcf18898f294725",
	name: "resetTracking",
	filename: "src/lib/dashboard.ts"
}, (opts) => resetTracking.__executeServer(opts));
var resetTracking = createServerFn({ method: "POST" }).handler(resetTracking_createServerFn_handler, async () => {
	const { resetHistory } = await import("./poller.server-xi2ILzpV.mjs");
	return publicSettings(await resetHistory());
});
var exportCsv_createServerFn_handler = createServerRpc({
	id: "521daa461c5bd9bee9105b7cf312684332bcaf5a3ccb44f13e67b843cda78c07",
	name: "exportCsv",
	filename: "src/lib/dashboard.ts"
}, (opts) => exportCsv.__executeServer(opts));
var exportCsv = createServerFn({ method: "POST" }).handler(exportCsv_createServerFn_handler, async () => {
	const { getSql } = await import("./db-Wq2lblm1.mjs");
	return { csv: ["taken_at,scope,design_id,title,likes,collections,prints,downloads,comments,boosts,followers,points", ...(await (await getSql())`
    select s.taken_at, s.design_id, m.title, s.likes, s.collections, s.prints, s.downloads,
           s.comments, s.boosts, s.followers, s.points
    from mp_snapshots s
    left join mp_models m on m.design_id = s.design_id
    order by s.taken_at asc
  `).map((row) => {
		const title = (row.title ?? "Account").replaceAll("\"", "\"\"");
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
			row.points
		].join(",");
	})].join("\n") };
});
//#endregion
export { bootstrapApp_createServerFn_handler, connectCreator_createServerFn_handler, exportCsv_createServerFn_handler, loadDashboard_createServerFn_handler, loadModel_createServerFn_handler, resetTracking_createServerFn_handler, saveSettings_createServerFn_handler, syncNow_createServerFn_handler, testTelegram_createServerFn_handler };
