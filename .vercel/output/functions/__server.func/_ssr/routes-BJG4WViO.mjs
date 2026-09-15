import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as METRICS } from "./metrics-jlkn7fzI.mjs";
import { n as formatDistanceToNow } from "../_libs/date-fns.mjs";
import { t as asDate } from "./utils-Doej6DeN.mjs";
import { i as RefreshCw } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { c as connectCreator, d as loadDashboard, h as syncNow, o as Route$8 } from "./router-C37G1GfP.mjs";
import { a as CardTitle, i as CardHeader, n as Card, r as CardContent, t as AppShell } from "./card-DXOW0Rys.mjs";
import { t as ActivityList } from "./activity-list-D53kTdCw.mjs";
import { t as Button } from "./button-Cqu6VQ3z.mjs";
import { t as PeriodPicker } from "./period-picker-fGwNtWUX.mjs";
import { n as StatsChart, t as KpiCard } from "./stats-chart-BzPz6w3r.mjs";
import { t as ModelTable } from "./model-table-BuQOR5Wi.mjs";
import { t as ConnectCreator } from "./connect-creator-DVNe4M4g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BJG4WViO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const [period, setPeriod] = (0, import_react.useState)("7d");
	const [metric, setMetric] = (0, import_react.useState)("downloads");
	const qc = useQueryClient();
	const initial = Route$8.useLoaderData();
	const dash = useQuery({
		queryKey: ["dashboard", period],
		queryFn: () => loadDashboard({ data: { period } }),
		initialData: period === "7d" ? initial : void 0
	});
	const connect = useMutation({
		mutationFn: (input) => connectCreator({ data: { input } }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] })
	});
	const sync = useMutation({
		mutationFn: () => syncNow(),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] })
	});
	const data = dash.data;
	const movers = (0, import_react.useMemo)(() => {
		if (!data) return [];
		return [...data.models].map((m) => ({
			...m,
			move: METRICS.reduce((sum, key) => sum + Math.abs(m.deltas[key]), 0)
		})).filter((m) => m.move > 0).sort((a, b) => b.move - a.move).slice(0, 6);
	}, [data]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		dash.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-destructive",
			children: dash.error instanceof Error ? dash.error.message : "Could not load dashboard."
		}) : null,
		dash.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
			children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 animate-pulse rounded-2xl bg-card" }, i))
		}) : null,
		data && !data.settings.creatorUid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectCreator, {
			onSubmit: (input) => connect.mutate(input),
			pending: connect.isPending,
			error: connect.error instanceof Error ? connect.error.message : null
		}) : null,
		data?.settings.creatorUid ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-3",
					children: [data.settings.creatorAvatar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: data.settings.creatorAvatar,
						alt: "",
						className: "size-12 rounded-full object-cover outline outline-1 -outline-offset-1 outline-white/10"
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-medium tracking-tight",
						children: data.settings.creatorName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"@",
							data.settings.creatorHandle,
							" · ",
							data.modelCount,
							" models",
							data.settings.lastPollAt ? ` · synced ${formatDistanceToNow(asDate(data.settings.lastPollAt), { addSuffix: true })}` : null
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2 sm:items-end",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeriodPicker, {
						value: period,
						onChange: setPeriod
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						size: "sm",
						onClick: () => sync.mutate(),
						disabled: sync.isPending,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: sync.isPending ? "animate-spin" : "" }), sync.isPending ? "Syncing" : "Sync now"]
					})]
				})]
			}),
			data.settings.lastPollError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-destructive",
				children: data.settings.lastPollError
			}) : null,
			connect.error instanceof Error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-destructive",
				children: connect.error.message
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: METRICS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
					metric: key,
					value: data.current[key],
					delta: data.deltas[key],
					active: metric === key,
					onClick: () => setMetric(key)
				}, key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					"Print conversion",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono tabular-nums text-foreground",
						children: data.current.downloads > 0 ? `${Math.round(data.current.prints / data.current.downloads * 1e3) / 10}%` : "—"
					}),
					" ",
					"· estimated points use public prints × 2 + boosts (exclusive models +25%)"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "flex-row items-center justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-foreground",
					children: "Trend"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsChart, {
				metric,
				series: data.series[metric]
			}) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-foreground",
					children: "Top movers"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: movers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Movers appear once a later sync sees a change."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-3",
					children: movers.map((model) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/models/$designId",
						params: { designId: model.designId },
						className: "flex items-center gap-3 hover:text-primary",
						children: [model.coverUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: model.coverUrl,
							alt: "",
							className: "size-10 rounded-md object-cover outline outline-1 -outline-offset-1 outline-white/10"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-10 rounded-md bg-secondary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate text-sm font-medium",
							children: model.title
						})]
					}) }, model.designId))
				}) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex-row items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-foreground",
						children: "Recent changes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/activity",
						className: "text-xs text-muted-foreground hover:text-foreground",
						children: "View all"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityList, { events: data.events.slice(0, 8) }) })] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex-row items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-foreground",
					children: "Models"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/models",
					className: "text-xs text-muted-foreground hover:text-foreground",
					children: "Open table"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelTable, { models: data.models.slice(0, 8) }) })] })
		] }) : null
	] });
}
//#endregion
export { Home as component };
