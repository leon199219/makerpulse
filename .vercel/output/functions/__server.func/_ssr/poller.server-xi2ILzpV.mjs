import { n as METRICS, s as estimatePoints, t as EMPTY_STATS } from "./metrics-jlkn7fzI.mjs";
import { getSql } from "./db-Wq2lblm1.mjs";
import { env } from "./env.server-DRkkE6Ij.mjs";
import { formatChangeDigest, formatPeriodicSummary, sendTelegramMessage } from "./telegram.server-DUwY_WH1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/poller.server-xi2ILzpV.js
var API_BASES = ["https://api.bambulab.com/v1", "https://makerworld.com/api/v1"];
function num(value) {
	if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
	if (typeof value === "string" && value.trim()) {
		const n = Number(value);
		if (Number.isFinite(n)) return Math.round(n);
	}
	return 0;
}
function str(value) {
	return typeof value === "string" ? value : value == null ? "" : String(value);
}
async function mwGet(path) {
	let lastError = "MakerWorld request failed";
	for (const base of API_BASES) try {
		const res = await fetch(`${base}${path}`, {
			headers: {
				Accept: "application/json",
				"User-Agent": "MakerPulse/1.0 (self-hosted creator stats)"
			},
			signal: AbortSignal.timeout(2e4)
		});
		const text = await res.text();
		if (!res.ok) {
			lastError = `MakerWorld ${res.status}: ${text.slice(0, 180)}`;
			if (res.status >= 500) continue;
			throw new Error(lastError);
		}
		return JSON.parse(text);
	} catch (err) {
		lastError = err instanceof Error ? err.message : String(err);
	}
	throw new Error(lastError);
}
function parseCreatorInput(raw) {
	const trimmed = raw.trim();
	const modelMatch = trimmed.match(/makerworld\.com\/(?:[a-z]{2}\/)?models\/(\d+)/i);
	if (modelMatch?.[1]) return {
		kind: "model",
		value: modelMatch[1]
	};
	const uidInUser = trimmed.match(/(?:^|\/)user[_-]?(\d{6,})/i);
	if (uidInUser?.[1]) return {
		kind: "uid",
		value: uidInUser[1]
	};
	const profileHandle = trimmed.match(/makerworld\.com\/(?:[a-z]{2}\/)?@([A-Za-z0-9._-]+)/i);
	if (profileHandle?.[1]) {
		const handle = profileHandle[1];
		const nested = handle.match(/^user[_-]?(\d{6,})$/i);
		if (nested?.[1]) return {
			kind: "uid",
			value: nested[1]
		};
		return {
			kind: "handle",
			value: handle
		};
	}
	if (/^\d{6,}$/.test(trimmed)) return {
		kind: "uid",
		value: trimmed
	};
	const handle = trimmed.replace(/^@/, "");
	const nested = handle.match(/^user[_-]?(\d{6,})$/i);
	if (nested?.[1]) return {
		kind: "uid",
		value: nested[1]
	};
	return {
		kind: "handle",
		value: handle
	};
}
function mapProfile(raw) {
	const mw = raw.MWCount ?? {};
	return {
		uid: str(raw.uid),
		name: str(raw.name) || str(raw.handle) || str(raw.uid),
		handle: str(raw.handle),
		avatar: str(raw.avatar),
		followers: num(raw.fanCount),
		likes: num(raw.likeCount),
		collections: num(raw.collectionCount),
		downloads: num(raw.downloadCount),
		boosts: num(raw.boostGained),
		prints: num(mw.myDesignPrintCount),
		designCount: num(mw.designCount)
	};
}
function mapModel(raw) {
	const prints = num(raw.printCount);
	const boosts = num(raw.boostCnt ?? raw.boostCount);
	const exclusive = Boolean(raw.isExclusive);
	return {
		designId: str(raw.id),
		title: str(raw.title) || `Model ${str(raw.id)}`,
		slug: str(raw.slug),
		coverUrl: str(raw.coverUrl ?? raw.cover),
		exclusive,
		publishedAt: str(raw.publishTime || raw.createTime) || null,
		likes: num(raw.likeCount),
		collections: num(raw.collectionCount),
		prints,
		downloads: num(raw.downloadCount),
		comments: num(raw.commentCount),
		boosts,
		points: estimatePoints({
			prints,
			boosts,
			exclusive
		})
	};
}
async function fetchProfile(uid) {
	const raw = await mwGet(`/design-user-service/user/profile/${uid}`);
	if (!raw?.uid) throw new Error("Creator profile not found.");
	return mapProfile(raw);
}
async function fetchDesign(designId) {
	return await mwGet(`/design-service/design/${designId}`);
}
async function fetchPublishedModels(uid) {
	const models = [];
	const limit = 20;
	let offset = 0;
	let total = Infinity;
	while (offset < total && models.length < 500) {
		const raw = await mwGet(`/design-service/publisheddesigns/${uid}?offset=${offset}&limit=${limit}&type=ALL`);
		const hits = Array.isArray(raw.hits) ? raw.hits : [];
		total = num(raw.total) || offset + hits.length;
		for (const hit of hits) models.push(mapModel(hit));
		if (hits.length === 0) break;
		offset += limit;
	}
	return models;
}
async function resolveCreator(input) {
	const parsed = parseCreatorInput(input);
	if (parsed.kind === "uid") {
		const profile = await fetchProfile(parsed.value);
		return {
			uid: profile.uid,
			handle: profile.handle
		};
	}
	if (parsed.kind === "model") {
		const uid = str(((await fetchDesign(parsed.value)).designCreator ?? {}).uid);
		if (!uid) throw new Error("Could not read the creator from that model.");
		const profile = await fetchProfile(uid);
		return {
			uid: profile.uid,
			handle: profile.handle
		};
	}
	throw new Error("This handle cannot be resolved from the public API. Paste a numeric user ID or any published model URL from the creator (makerworld.com/en/models/…).");
}
async function collectSnapshot(uid) {
	const [profile, models] = await Promise.all([fetchProfile(uid), fetchPublishedModels(uid)]);
	const comments = models.reduce((sum, m) => sum + m.comments, 0);
	const modelPrints = models.reduce((sum, m) => sum + m.prints, 0);
	const modelBoosts = models.reduce((sum, m) => sum + m.boosts, 0);
	const prints = profile.prints || modelPrints;
	const boosts = profile.boosts || modelBoosts;
	return {
		profile,
		models,
		totals: {
			likes: profile.likes,
			collections: profile.collections,
			prints,
			downloads: profile.downloads,
			comments,
			boosts,
			followers: profile.followers,
			points: estimatePoints({
				prints,
				boosts
			})
		}
	};
}
var g = globalThis;
function asBool(value) {
	return value === true || value === "t" || value === "true" || value === 1 || value === "1";
}
async function getSettings() {
	const row = (await (await getSql())`select * from mp_settings where id = 1`)[0];
	if (!row) throw new Error("Settings row missing.");
	return {
		...row,
		telegram_enabled: asBool(row.telegram_enabled),
		telegram_on_change: asBool(row.telegram_on_change),
		telegram_include_models: asBool(row.telegram_include_models),
		poll_interval_minutes: Number(row.poll_interval_minutes)
	};
}
async function applyEnvOverrides() {
	const sql = await getSql();
	const uid = env("MAKERWORLD_UID");
	const handle = env("MAKERWORLD_HANDLE");
	const interval = env("POLL_INTERVAL_MINUTES");
	const token = env("TELEGRAM_BOT_TOKEN");
	const chat = env("TELEGRAM_CHAT_ID");
	const cadence = env("TELEGRAM_CADENCE");
	if (uid) await sql`update mp_settings set creator_uid = ${uid}, updated_at = now() where id = 1`;
	if (handle) await sql`update mp_settings set creator_handle = ${handle}, updated_at = now() where id = 1`;
	if (interval && Number(interval) > 0) await sql`update mp_settings set poll_interval_minutes = ${Number(interval)}, updated_at = now() where id = 1`;
	if (token) await sql`update mp_settings set telegram_bot_token = ${token}, telegram_enabled = true, updated_at = now() where id = 1`;
	if (chat) await sql`update mp_settings set telegram_chat_id = ${chat}, updated_at = now() where id = 1`;
	if (cadence) await sql`update mp_settings set telegram_cadence = ${cadence}, updated_at = now() where id = 1`;
}
async function latestSnapshot(designId) {
	const sql = await getSql();
	if (designId == null) return (await sql`
      select * from mp_snapshots
      where design_id is null
      order by taken_at desc
      limit 1
    `)[0] ?? null;
	return (await sql`
    select * from mp_snapshots
    where design_id = ${designId}
    order by taken_at desc
    limit 1
  `)[0] ?? null;
}
function rowStats(row) {
	if (!row) return { ...EMPTY_STATS };
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
async function insertSnapshot(designId, stats) {
	await (await getSql())`
    insert into mp_snapshots (
      design_id, likes, collections, prints, downloads, comments, boosts, followers, points
    ) values (
      ${designId}, ${stats.likes}, ${stats.collections}, ${stats.prints}, ${stats.downloads},
      ${stats.comments}, ${stats.boosts}, ${stats.followers}, ${stats.points}
    )
  `;
}
async function recordEvents(designId, previous, next, metrics) {
	const sql = await getSql();
	const events = [];
	for (const metric of metrics) {
		const delta = next[metric] - previous[metric];
		if (delta === 0) continue;
		await sql`
      insert into mp_events (design_id, metric, previous, current, delta)
      values (${designId}, ${metric}, ${previous[metric]}, ${next[metric]}, ${delta})
    `;
		events.push({
			designTitle: null,
			metric,
			previous: previous[metric],
			current: next[metric],
			delta
		});
	}
	return events;
}
function cadenceMs(cadence) {
	switch (cadence) {
		case "hourly": return 36e5;
		case "every_6h": return 216e5;
		case "weekly": return 6048e5;
		default: return 864e5;
	}
}
async function maybeTelegram(settings, snapshot, events, periodDeltas) {
	if (!settings.telegram_enabled || !settings.telegram_bot_token || !settings.telegram_chat_id) return;
	const due = Date.now() - (settings.last_telegram_at ? new Date(settings.last_telegram_at).getTime() : 0) >= cadenceMs(settings.telegram_cadence);
	const sql = await getSql();
	if (settings.telegram_on_change && events.length) {
		const html = formatChangeDigest({
			creatorName: snapshot.profile.name,
			handle: snapshot.profile.handle,
			events,
			includeModels: settings.telegram_include_models
		});
		await sendTelegramMessage(settings.telegram_bot_token, settings.telegram_chat_id, html);
		await sql`update mp_settings set last_telegram_at = now() where id = 1`;
		return;
	}
	if (due) {
		const html = formatPeriodicSummary({
			creatorName: snapshot.profile.name,
			handle: snapshot.profile.handle,
			totals: snapshot.totals,
			deltas: periodDeltas,
			modelCount: snapshot.models.length
		});
		await sendTelegramMessage(settings.telegram_bot_token, settings.telegram_chat_id, html);
		await sql`update mp_settings set last_telegram_at = now() where id = 1`;
	}
}
async function runPoll() {
	if (g.__mpPollRunning) return {
		ok: true,
		events: 0
	};
	g.__mpPollRunning = true;
	const sql = await getSql();
	try {
		const settings = await getSettings();
		if (!settings.creator_uid) return {
			ok: false,
			error: "No creator configured.",
			events: 0
		};
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
		await insertSnapshot(null, snapshot.totals);
		const allEvents = [...prevAccountRow ? await recordEvents(null, prevAccount, snapshot.totals, METRICS) : []];
		const titles = /* @__PURE__ */ new Map();
		for (const model of snapshot.models) {
			titles.set(model.designId, model.title);
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
          last_seen_at = now()
      `;
			const stats = {
				likes: model.likes,
				collections: model.collections,
				prints: model.prints,
				downloads: model.downloads,
				comments: model.comments,
				boosts: model.boosts,
				followers: 0,
				points: model.points
			};
			const prevRow = await latestSnapshot(model.designId);
			const prev = rowStats(prevRow);
			await insertSnapshot(model.designId, stats);
			if (!prevRow) continue;
			const modelEvents = await recordEvents(model.designId, prev, stats, [
				"likes",
				"collections",
				"prints",
				"downloads",
				"comments",
				"boosts",
				"points"
			]);
			for (const event of modelEvents) allEvents.push({
				...event,
				designTitle: model.title
			});
		}
		const periodDeltas = { ...EMPTY_STATS };
		for (const metric of METRICS) periodDeltas[metric] = snapshot.totals[metric] - prevAccount[metric];
		await maybeTelegram(settings, snapshot, allEvents, periodDeltas);
		return {
			ok: true,
			events: allEvents.length
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		await sql`update mp_settings set last_poll_error = ${message}, last_poll_at = now() where id = 1`;
		return {
			ok: false,
			error: message,
			events: 0
		};
	} finally {
		g.__mpPollRunning = false;
	}
}
async function ensurePoller() {
	await applyEnvOverrides();
	if (g.__mpPollTimer) return;
	const tick = async () => {
		try {
			const settings = await getSettings();
			if (!settings.creator_uid) return;
			const intervalMs = Math.max(5, settings.poll_interval_minutes) * 60 * 1e3;
			const last = settings.last_poll_at ? new Date(settings.last_poll_at).getTime() : 0;
			if (Date.now() - last >= intervalMs) await runPoll();
		} catch (err) {
			console.error("[makerpulse] poll tick failed", err);
		}
	};
	await tick();
	g.__mpPollTimer = setInterval(() => {
		tick();
	}, 6e4);
}
async function clearHistory() {
	const sql = await getSql();
	await sql`delete from mp_events`;
	await sql`delete from mp_snapshots`;
	await sql`delete from mp_models`;
	await sql`
    update mp_settings
    set last_poll_at = null,
        last_poll_error = '',
        last_telegram_at = null,
        updated_at = now()
    where id = 1
  `;
}
async function waitForPollIdle() {
	for (let i = 0; i < 40 && g.__mpPollRunning; i += 1) await new Promise((resolve) => setTimeout(resolve, 100));
}
async function resetHistory() {
	await waitForPollIdle();
	await clearHistory();
	if ((await getSettings()).creator_uid) await runPoll();
	return getSettings();
}
async function setCreator(input) {
	const resolved = await resolveCreator(input);
	const current = await getSettings();
	await waitForPollIdle();
	if (current.creator_uid !== resolved.uid) await clearHistory();
	await (await getSql())`
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
//#endregion
export { ensurePoller, getSettings, resetHistory, runPoll, setCreator };
