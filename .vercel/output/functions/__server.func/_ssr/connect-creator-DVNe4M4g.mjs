import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as Card, r as CardContent } from "./card-DXOW0Rys.mjs";
import { t as Input } from "./input-Be01Swi1.mjs";
import { t as Button } from "./button-Cqu6VQ3z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/connect-creator-DVNe4M4g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ConnectCreator({ onSubmit, pending, error }) {
	const [value, setValue] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "flex flex-col gap-5 p-6 sm:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-medium tracking-tight sm:text-3xl",
					children: "Track a MakerWorld creator"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Paste a numeric user ID or any published model URL. Profile handles like @name need a model URL because MakerWorld does not expose a public handle lookup."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3 sm:flex-row",
				onSubmit: (e) => {
					e.preventDefault();
					if (value.trim()) onSubmit(value.trim());
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value,
					onChange: (e) => setValue(e.target.value),
					placeholder: "User ID or https://makerworld.com/en/models/…",
					"aria-label": "Creator ID or model URL"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: pending || !value.trim(),
					className: "sm:w-40",
					children: pending ? "Connecting…" : "Start tracking"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "secondary",
					disabled: pending,
					onClick: () => onSubmit("242971666"),
					children: "Load demo creator"
				})
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-destructive",
				children: error
			}) : null
		]
	}) });
}
//#endregion
export { ConnectCreator as t };
