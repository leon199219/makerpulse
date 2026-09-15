import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as METRIC_LABELS } from "./metrics-jlkn7fzI.mjs";
import { r as format } from "../_libs/date-fns.mjs";
import { a as formatExact, i as formatDelta, r as cn, t as asDate } from "./utils-Doej6DeN.mjs";
import { n as Card, r as CardContent } from "./card-DXOW0Rys.mjs";
import { t as Badge } from "./badge-BKlZ4KWU.mjs";
import { a as CartesianGrid, i as Area, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stats-chart-BzPz6w3r.js
var import_jsx_runtime = require_jsx_runtime();
function KpiCard({ metric, value, delta, active, onClick }) {
	const tone = delta > 0 ? "up" : delta < 0 ? "down" : "neutral";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "text-left",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: cn("transition-[box-shadow] duration-150", active && "shadow-[0_0_0_1px_var(--color-primary)]"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex flex-col gap-3 p-4 sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium text-muted-foreground",
						children: METRIC_LABELS[metric]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone,
						children: formatDelta(delta)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-2xl font-medium tabular-nums tracking-tight sm:text-3xl",
					children: formatExact(value)
				})]
			})
		})
	});
}
function StatsChart({ metric, series }) {
	const data = series.map((p) => ({
		t: p.t,
		value: p.value,
		label: format(asDate(p.t), series.length > 40 ? "MMM d" : "MMM d HH:mm")
	}));
	if (data.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-64 items-center justify-center rounded-xl bg-secondary/60 px-6 text-center text-sm text-muted-foreground",
		children: "History builds with each sync. Run another sync after stats move, or leave polling on."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-64 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
				data,
				margin: {
					top: 8,
					right: 8,
					left: 0,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
						id: "pulseFill",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "var(--color-primary)",
							stopOpacity: .28
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "var(--color-primary)",
							stopOpacity: 0
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						stroke: "var(--color-border)",
						vertical: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "label",
						tick: {
							fill: "var(--color-muted-foreground)",
							fontSize: 11
						},
						axisLine: false,
						tickLine: false,
						minTickGap: 28
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						tick: {
							fill: "var(--color-muted-foreground)",
							fontSize: 11
						},
						axisLine: false,
						tickLine: false,
						width: 48,
						tickFormatter: (v) => formatExact(v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						contentStyle: {
							background: "var(--color-popover)",
							border: "1px solid var(--color-border)",
							borderRadius: 12,
							color: "var(--color-foreground)"
						},
						formatter: (value) => [formatExact(Number(value ?? 0)), METRIC_LABELS[metric]],
						labelFormatter: (_, payload) => {
							const t = payload?.[0]?.payload?.t;
							return t ? format(asDate(t), "PPpp") : "";
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						type: "monotone",
						dataKey: "value",
						stroke: "var(--color-primary)",
						strokeWidth: 2,
						fill: "url(#pulseFill)",
						dot: false,
						isAnimationActive: false
					})
				]
			})
		})
	});
}
//#endregion
export { StatsChart as n, KpiCard as t };
