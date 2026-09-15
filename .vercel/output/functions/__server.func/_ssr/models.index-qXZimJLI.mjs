import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as cn } from "./utils-Doej6DeN.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { d as loadDashboard, r as Route$1 } from "./router-C37G1GfP.mjs";
import { a as CardTitle, i as CardHeader, n as Card, r as CardContent, t as AppShell } from "./card-DXOW0Rys.mjs";
import { t as Input } from "./input-Be01Swi1.mjs";
import { t as PeriodPicker } from "./period-picker-fGwNtWUX.mjs";
import { n as sortModels, t as ModelTable } from "./model-table-BuQOR5Wi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/models.index-qXZimJLI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ModelsPage() {
	const [period, setPeriod] = (0, import_react.useState)("7d");
	const [q, setQ] = (0, import_react.useState)("");
	const [sortKey, setSortKey] = (0, import_react.useState)("published");
	const [sortDir, setSortDir] = (0, import_react.useState)("desc");
	const initial = Route$1.useLoaderData();
	const dash = useQuery({
		queryKey: ["dashboard", period],
		queryFn: () => loadDashboard({ data: { period } }),
		initialData: period === "7d" ? initial : void 0
	});
	const models = (0, import_react.useMemo)(() => {
		const list = dash.data?.models ?? [];
		const needle = q.trim().toLowerCase();
		const filtered = needle ? list.filter((m) => m.title.toLowerCase().includes(needle)) : list;
		return sortModels(filtered, sortKey, sortDir);
	}, [
		dash.data,
		q,
		sortKey,
		sortDir
	]);
	function sortByPublished(dir) {
		setSortKey("published");
		setSortDir(dir);
	}
	function sortByMetric(metric) {
		if (sortKey === metric) {
			setSortDir((dir) => dir === "desc" ? "asc" : "desc");
			return;
		}
		setSortKey(metric);
		setSortDir("desc");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-medium tracking-tight",
				children: "Models"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Per-model stats and change over the selected period."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeriodPicker, {
				value: period,
				onChange: setPeriod
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Filter models",
				"aria-label": "Filter models",
				className: "sm:max-w-sm"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex rounded-lg bg-secondary p-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => sortByPublished("desc"),
					className: cn("inline-flex h-11 flex-1 items-center justify-center rounded-md px-3 text-xs font-medium sm:flex-none", sortKey === "published" && sortDir === "desc" ? "bg-background text-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" : "text-muted-foreground hover:text-foreground"),
					children: "Newest first"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => sortByPublished("asc"),
					className: cn("inline-flex h-11 flex-1 items-center justify-center rounded-md px-3 text-xs font-medium sm:flex-none", sortKey === "published" && sortDir === "asc" ? "bg-background text-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" : "text-muted-foreground hover:text-foreground"),
					children: "Oldest first"
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "text-foreground",
			children: [models.length, " published"]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelTable, {
			models,
			sortKey,
			sortDir,
			onSort: sortByMetric
		}) })] })
	] });
}
//#endregion
export { ModelsPage as component };
