import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as cn } from "./utils-Doej6DeN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-BKlZ4KWU.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, tone = "neutral", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums", tone === "neutral" && "bg-secondary text-muted-foreground", tone === "up" && "bg-success/15 text-success", tone === "down" && "bg-destructive/15 text-destructive", tone === "accent" && "bg-primary/15 text-primary", className),
		...props
	});
}
//#endregion
export { Badge as t };
