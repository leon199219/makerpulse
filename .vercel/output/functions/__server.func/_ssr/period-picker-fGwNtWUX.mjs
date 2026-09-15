import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as PERIODS } from "./metrics-jlkn7fzI.mjs";
import { r as cn } from "./utils-Doej6DeN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/period-picker-fGwNtWUX.js
var import_jsx_runtime = require_jsx_runtime();
function PeriodPicker({ value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex max-w-full flex-wrap rounded-lg bg-secondary p-1",
		children: PERIODS.map((period) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(period.key),
			className: cn("inline-flex h-11 min-w-11 flex-1 items-center justify-center rounded-md px-2.5 text-xs font-medium transition-colors", value === period.key ? "bg-background text-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" : "text-muted-foreground hover:text-foreground"),
			children: period.label
		}, period.key))
	});
}
//#endregion
export { PeriodPicker as t };
