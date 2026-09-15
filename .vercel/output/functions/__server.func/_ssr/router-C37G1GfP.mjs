import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as createRootRoute, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { o as PERIOD_KEYS } from "./metrics-jlkn7fzI.mjs";
import { a as object, i as number, n as boolean, o as string, r as literal, s as union, t as _enum } from "../_libs/zod.mjs";
import { t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-vkAOtgSx.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var dashboard_exports = /* @__PURE__ */ __exportAll({
	connectCreator: () => connectCreator,
	exportCsv: () => exportCsv,
	loadDashboard: () => loadDashboard,
	loadModel: () => loadModel,
	resetTracking: () => resetTracking,
	saveSettings: () => saveSettings,
	syncNow: () => syncNow,
	testTelegram: () => testTelegram
});
var periodSchema = object({ period: _enum(PERIOD_KEYS).default("7d") });
createServerFn({ method: "POST" }).handler(createSsrRpc("ee3319ce50fb6ca88b23721a8cea32d68c1b3e725debe846f3dd05739e896cca"));
var loadDashboard = createServerFn({ method: "POST" }).validator((d) => periodSchema.parse(d ?? {})).handler(createSsrRpc("8b5558b51c5624e6b25161f4c3b8efd1c389fccf11f6bdbba506dca195fa226b"));
var loadModel = createServerFn({ method: "POST" }).validator((d) => object({
	designId: string(),
	period: _enum(PERIOD_KEYS)
}).parse(d)).handler(createSsrRpc("65b0102c9fa4770bebc48f4f781351483fa53310008ec6e4083bcff87cf68b4c"));
var connectCreator = createServerFn({ method: "POST" }).validator((d) => object({ input: string().min(1) }).parse(d)).handler(createSsrRpc("735691fc252f0c2182c52cb3abda244d3ede7eec4e3ade25ccb1c2bfdcb76b14"));
var syncNow = createServerFn({ method: "POST" }).handler(createSsrRpc("d8cfa1b8d9602df2340fa7fa3e3b09cf96dbfc4ef415d669cda1a222133368dd"));
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
}).parse(d)).handler(createSsrRpc("24d0b0a0f8302db9135701b1728ac62b1683586a440235f8cb668f70f909219b"));
var testTelegram = createServerFn({ method: "POST" }).handler(createSsrRpc("0d109b97ee624a2aca9daa2f249debc016f32648d3283ae85da2e1837a514fb8"));
var resetTracking = createServerFn({ method: "POST" }).handler(createSsrRpc("cd2659a9950994b696f7dbc5d4dfe7ca120e4f499758d0560bcf18898f294725"));
var exportCsv = createServerFn({ method: "POST" }).handler(createSsrRpc("521daa461c5bd9bee9105b7cf312684332bcaf5a3ccb44f13e67b843cda78c07"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-C37G1GfP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function QueryProvider({ children }) {
	const [client] = (0, import_react.useState)(() => new QueryClient({ defaultOptions: { queries: {
		staleTime: 2e4,
		refetchOnWindowFocus: false,
		retry: 1
	} } }));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client,
		children
	});
}
var styles_default = "/assets/styles-x39PbDLv.css";
var APP_NAME = "MakerPulse";
var Route$9 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Track MakerWorld likes, prints, downloads, boosts and more — per model and in total."
			},
			{
				name: "theme-color",
				content: "#0c0d0f"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$5 = () => import("./routes-BJG4WViO.mjs");
var Route$8 = createFileRoute("/")({
	loader: () => loadDashboard({ data: { period: "7d" } }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./activity-gRo57HKI.mjs");
var Route$7 = createFileRoute("/activity")({
	loader: () => loadDashboard({ data: { period: "7d" } }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./models-Bvf1CP4j.mjs");
var Route$6 = createFileRoute("/models")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./settings-B5ZroXq3.mjs");
var Route$5 = createFileRoute("/settings")({
	loader: () => loadDashboard({ data: { period: "7d" } }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var Route$4 = createFileRoute("/api/cron")({ server: { handlers: { GET: async ({ request }) => {
	const { env } = await import("./env.server-DRkkE6Ij.mjs");
	const { runPoll, ensurePoller } = await import("./poller.server-xi2ILzpV.mjs");
	const secret = env("CRON_SECRET");
	if (secret) {
		const url = new URL(request.url);
		if ((request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || url.searchParams.get("secret") || "") !== secret) return Response.json({
			ok: false,
			error: "Unauthorized"
		}, { status: 401 });
	}
	await ensurePoller();
	const result = await runPoll();
	return Response.json(result);
} } } });
var Route$3 = createFileRoute("/api/health")({ server: { handlers: { GET: async () => Response.json({
	ok: true,
	service: "makerpulse"
}) } } });
var Route$2 = createFileRoute("/api/stats")({ server: { handlers: { GET: async () => {
	const { loadDashboard } = await import("../_libs/_.mjs").then((n) => n.n);
	const payload = await loadDashboard({ data: { period: "24h" } });
	return Response.json({
		creator: {
			uid: payload.settings.creatorUid,
			handle: payload.settings.creatorHandle,
			name: payload.settings.creatorName
		},
		totals: payload.current,
		deltas_24h: payload.deltas,
		model_count: payload.modelCount,
		last_poll_at: payload.settings.lastPollAt
	});
} } } });
var $$splitComponentImporter$1 = () => import("./models.index-qXZimJLI.mjs");
var Route$1 = createFileRoute("/models/")({
	loader: () => loadDashboard({ data: { period: "7d" } }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./models._designId-4-TDyFKH.mjs");
var Route = createFileRoute("/models/$designId")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$8.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$9
});
var ActivityRoute = Route$7.update({
	id: "/activity",
	path: "/activity",
	getParentRoute: () => Route$9
});
var ModelsRoute = Route$6.update({
	id: "/models",
	path: "/models",
	getParentRoute: () => Route$9
});
var SettingsRoute = Route$5.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$9
});
var ApiCronRoute = Route$4.update({
	id: "/api/cron",
	path: "/api/cron",
	getParentRoute: () => Route$9
});
var ApiHealthRoute = Route$3.update({
	id: "/api/health",
	path: "/api/health",
	getParentRoute: () => Route$9
});
var ApiStatsRoute = Route$2.update({
	id: "/api/stats",
	path: "/api/stats",
	getParentRoute: () => Route$9
});
var ModelsIndexRoute = Route$1.update({
	id: "/",
	path: "/",
	getParentRoute: () => ModelsRoute
});
var ModelsRouteChildren = {
	ModelsDesignIdRoute: Route.update({
		id: "/$designId",
		path: "/$designId",
		getParentRoute: () => ModelsRoute
	}),
	ModelsIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	ActivityRoute,
	ModelsRoute: ModelsRoute._addFileChildren(ModelsRouteChildren),
	SettingsRoute,
	ApiCronRoute,
	ApiHealthRoute,
	ApiStatsRoute
};
var routeTree = Route$9._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Route$7 as a, connectCreator as c, loadDashboard as d, loadModel as f, testTelegram as g, syncNow as h, Route$5 as i, dashboard_exports as l, saveSettings as m, Route as n, Route$8 as o, resetTracking as p, Route$1 as r, __exportAll as s, router_exports as t, exportCsv as u };
