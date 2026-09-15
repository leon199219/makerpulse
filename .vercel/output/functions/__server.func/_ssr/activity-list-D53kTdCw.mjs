import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as METRIC_LABELS } from "./metrics-jlkn7fzI.mjs";
import { n as formatDistanceToNow } from "../_libs/date-fns.mjs";
import { a as formatExact, i as formatDelta, r as cn, t as asDate } from "./utils-Doej6DeN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/activity-list-D53kTdCw.js
var import_jsx_runtime = require_jsx_runtime();
function ActivityList({ events, size = "sm" }) {
	const large = size === "lg";
	if (events.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: cn("text-muted-foreground", large ? "py-16 text-base" : "py-8 text-sm"),
		children: "No changes in this period. Sync again after MakerWorld numbers move."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "divide-y divide-border",
		children: events.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: cn("flex items-start justify-between gap-4", large ? "py-5" : "py-3"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: cn("truncate font-medium", large ? "text-base" : "text-sm"),
					children: [
						event.title ?? "Account",
						" · ",
						METRIC_LABELS[event.metric]
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: cn("mt-1 text-muted-foreground", large ? "text-sm" : "text-xs"),
					children: [
						formatExact(event.previous),
						" → ",
						formatExact(event.current),
						" ·",
						" ",
						formatDistanceToNow(asDate(event.detectedAt), { addSuffix: true })
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("font-mono tabular-nums", large ? "text-lg" : "text-sm", event.delta > 0 ? "text-success" : event.delta < 0 ? "text-destructive" : "text-muted-foreground"),
				children: formatDelta(event.delta)
			})]
		}, event.id))
	});
}
//#endregion
export { ActivityList as t };
