import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as MODEL_METRICS } from "./metrics-jlkn7fzI.mjs";
import { l as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { f as loadModel, n as Route } from "./router-C37G1GfP.mjs";
import { a as CardTitle, i as CardHeader, n as Card, r as CardContent, t as AppShell } from "./card-DXOW0Rys.mjs";
import { t as PeriodPicker } from "./period-picker-fGwNtWUX.mjs";
import { t as Badge } from "./badge-BKlZ4KWU.mjs";
import { n as StatsChart, t as KpiCard } from "./stats-chart-BzPz6w3r.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/models._designId-4-TDyFKH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ModelDetail() {
	const { designId } = Route.useParams();
	const [period, setPeriod] = (0, import_react.useState)("7d");
	const [metric, setMetric] = (0, import_react.useState)("downloads");
	const model = useQuery({
		queryKey: [
			"model",
			designId,
			period
		],
		queryFn: () => loadModel({ data: {
			designId,
			period
		} })
	}).data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/models",
		className: "inline-flex h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "All models"]
	}), model ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-4",
				children: [model.coverUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: model.coverUrl,
					alt: "",
					className: "size-16 rounded-lg object-cover outline outline-1 -outline-offset-1 outline-white/10"
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-medium tracking-tight",
						children: model.title
					}), model.exclusive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "accent",
						children: "Exclusive"
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					className: "text-sm text-muted-foreground hover:text-foreground",
					href: `https://makerworld.com/en/models/${model.designId}`,
					target: "_blank",
					rel: "noreferrer",
					children: "Open on MakerWorld"
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeriodPicker, {
				value: period,
				onChange: setPeriod
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
			children: MODEL_METRICS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
				metric: key,
				value: model.current[key],
				delta: model.deltas[key],
				active: metric === key,
				onClick: () => setMetric(key)
			}, key))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-foreground",
			children: "Trend"
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsChart, {
			metric,
			series: model.series[metric]
		}) })] })
	] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-2xl bg-card" })] });
}
//#endregion
export { ModelDetail as component };
