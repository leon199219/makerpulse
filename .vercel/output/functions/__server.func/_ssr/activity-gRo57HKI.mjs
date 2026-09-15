import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as METRICS, r as METRIC_LABELS } from "./metrics-jlkn7fzI.mjs";
import { r as cn } from "./utils-Doej6DeN.mjs";
import { r as Search } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as Route$7, d as loadDashboard } from "./router-C37G1GfP.mjs";
import { a as CardTitle, i as CardHeader, n as Card, r as CardContent, t as AppShell } from "./card-DXOW0Rys.mjs";
import { t as ActivityList } from "./activity-list-D53kTdCw.mjs";
import { t as Input } from "./input-Be01Swi1.mjs";
import { t as Button } from "./button-Cqu6VQ3z.mjs";
import { t as PeriodPicker } from "./period-picker-fGwNtWUX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/activity-gRo57HKI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY_ACTIVITY_FILTERS = {
	query: "",
	metric: "all",
	scope: "all",
	direction: "all"
};
var SCOPES = [
	{
		key: "all",
		label: "All"
	},
	{
		key: "account",
		label: "Account"
	},
	{
		key: "models",
		label: "Models"
	}
];
var DIRECTIONS = [
	{
		key: "all",
		label: "All"
	},
	{
		key: "up",
		label: "Gains"
	},
	{
		key: "down",
		label: "Drops"
	}
];
function ChipRow({ label, options, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-1.5",
			children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onChange(option.key),
				className: cn("inline-flex h-11 min-w-11 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors", value === option.key ? "bg-secondary text-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" : "text-muted-foreground hover:bg-accent hover:text-foreground"),
				children: option.label
			}, option.key))
		})]
	});
}
function ActivityFilters({ value, onChange }) {
	const active = value.query.trim() !== "" || value.metric !== "all" || value.scope !== "all" || value.direction !== "all";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: value.query,
					onChange: (e) => onChange({
						...value,
						query: e.target.value
					}),
					placeholder: "Filter by model or account",
					"aria-label": "Filter by model or account",
					className: "pl-10"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChipRow, {
				label: "Scope",
				options: SCOPES,
				value: value.scope,
				onChange: (scope) => onChange({
					...value,
					scope
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChipRow, {
				label: "Metric",
				options: [{
					key: "all",
					label: "All"
				}, ...METRICS.map((key) => ({
					key,
					label: METRIC_LABELS[key]
				}))],
				value: value.metric,
				onChange: (metric) => onChange({
					...value,
					metric
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChipRow, {
				label: "Change",
				options: DIRECTIONS,
				value: value.direction,
				onChange: (direction) => onChange({
					...value,
					direction
				})
			}),
			active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "sm",
				onClick: () => onChange(EMPTY_ACTIVITY_FILTERS),
				children: "Clear filters"
			}) }) : null
		]
	});
}
function matchesFilters(event, filters) {
	const query = filters.query.trim().toLowerCase();
	if (query) {
		if (!`${event.title ?? "Account"} ${event.designId ?? ""}`.toLowerCase().includes(query)) return false;
	}
	if (filters.metric !== "all" && event.metric !== filters.metric) return false;
	if (filters.scope === "account" && event.designId) return false;
	if (filters.scope === "models" && !event.designId) return false;
	if (filters.direction === "up" && event.delta <= 0) return false;
	if (filters.direction === "down" && event.delta >= 0) return false;
	return true;
}
function ActivityPage() {
	const [period, setPeriod] = (0, import_react.useState)("7d");
	const [filters, setFilters] = (0, import_react.useState)(EMPTY_ACTIVITY_FILTERS);
	const initial = Route$7.useLoaderData();
	const events = useQuery({
		queryKey: ["dashboard", period],
		queryFn: () => loadDashboard({ data: { period } }),
		initialData: period === "7d" ? initial : void 0
	}).data?.events ?? [];
	const visible = (0, import_react.useMemo)(() => events.filter((event) => matchesFilters(event, filters)), [events, filters]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-medium tracking-tight",
				children: "Activity"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Every detected change across the account and each model."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeriodPicker, {
				value: period,
				onChange: setPeriod
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityFilters, {
			value: filters,
			onChange: setFilters
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "text-foreground",
			children: ["Change log", events.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-2 font-normal text-muted-foreground",
				children: visible.length === events.length ? `${events.length}` : `${visible.length} of ${events.length}`
			}) : null]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: events.length > 0 && visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-16 text-base text-muted-foreground",
			children: "No changes match these filters."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityList, {
			events: visible,
			size: "lg"
		}) })] })
	] });
}
//#endregion
export { ActivityPage as component };
