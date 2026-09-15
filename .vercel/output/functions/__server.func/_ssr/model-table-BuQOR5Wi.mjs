import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as MODEL_METRICS, r as METRIC_LABELS } from "./metrics-jlkn7fzI.mjs";
import { a as formatExact, i as formatDelta, r as cn } from "./utils-Doej6DeN.mjs";
import { c as ArrowUpDown, s as ArrowUp, u as ArrowDown } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-BKlZ4KWU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/model-table-BuQOR5Wi.js
var import_jsx_runtime = require_jsx_runtime();
function sortModels(models, sortKey, sortDir) {
	const copy = [...models];
	copy.sort((a, b) => {
		if (sortKey === "published") {
			const at = a.publishedAt ? Date.parse(a.publishedAt) : null;
			const bt = b.publishedAt ? Date.parse(b.publishedAt) : null;
			if (at == null && bt == null) return a.title.localeCompare(b.title);
			if (at == null) return 1;
			if (bt == null) return -1;
			return sortDir === "asc" ? at - bt : bt - at;
		}
		const cmp = a.stats[sortKey] - b.stats[sortKey];
		if (cmp !== 0) return sortDir === "asc" ? cmp : -cmp;
		return a.title.localeCompare(b.title);
	});
	return copy;
}
function ModelTable({ models, sortKey, sortDir, onSort }) {
	if (models.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-1 py-8 text-sm text-muted-foreground",
		children: "Models appear after the first successful sync."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "w-full min-w-0 max-w-full overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[720px] text-left text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "py-3 pr-3 font-medium",
					children: "Model"
				}), MODEL_METRICS.map((metric) => {
					const active = sortKey === metric;
					const label = METRIC_LABELS[metric];
					if (!onSort) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-2 py-3 font-medium",
						children: label
					}, metric);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-1 py-1 font-medium",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onSort(metric),
							className: cn("inline-flex h-11 items-center gap-1 rounded-md px-1 text-xs font-medium hover:text-foreground", active ? "text-foreground" : "text-muted-foreground"),
							"aria-label": `Sort by ${label}`,
							children: [label, active ? sortDir === "asc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "size-3.5 opacity-50" })]
						})
					}, metric);
				})]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: models.map((model) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border/70 last:border-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "py-3 pr-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/models/$designId",
						params: { designId: model.designId },
						className: "flex items-center gap-3 hover:text-primary",
						children: [model.coverUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: model.coverUrl,
							alt: "",
							className: "size-10 rounded-md object-cover outline outline-1 -outline-offset-1 outline-white/10"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-10 rounded-md bg-secondary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate font-medium",
								children: model.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 flex items-center gap-2 text-xs text-muted-foreground",
								children: model.exclusive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "accent",
									children: "Exclusive"
								}) : null
							})]
						})]
					})
				}), MODEL_METRICS.map((metric) => {
					const delta = model.deltas[metric];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "px-2 py-3 align-top",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono tabular-nums",
							children: formatExact(model.stats[metric])
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: delta > 0 ? "text-xs text-success" : delta < 0 ? "text-xs text-destructive" : "text-xs text-muted-foreground",
							children: formatDelta(delta)
						})]
					}, metric);
				})]
			}, model.designId)) })]
		})
	});
}
//#endregion
export { sortModels as n, ModelTable as t };
