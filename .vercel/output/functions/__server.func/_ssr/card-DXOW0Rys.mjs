import "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { d as useRouterState, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as cn } from "./utils-Doej6DeN.mjs";
import { a as LayoutDashboard, d as Activity, n as Settings2, o as Boxes } from "../_libs/lucide-react.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var NAV = [
	{
		to: "/",
		label: "Overview",
		icon: LayoutDashboard
	},
	{
		to: "/models",
		label: "Models",
		icon: Boxes
	},
	{
		to: "/activity",
		label: "Activity",
		icon: Activity
	},
	{
		to: "/settings",
		label: "Settings",
		icon: Settings2
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex min-w-0 max-w-6xl flex-col gap-6 px-4 pb-24 pt-6 sm:px-6 lg:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
							viewBox: "0 0 24 24",
							className: "size-5",
							fill: "none",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: "M3 16h3l2-6 2.5 10 2-7 1.5 3H21",
								stroke: "currentColor",
								strokeWidth: "1.8",
								strokeLinecap: "round",
								strokeLinejoin: "round"
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-base font-medium tracking-tight",
						children: "MakerPulse"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-xs text-muted-foreground",
						children: "MakerWorld tracker"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "hidden items-center gap-1 sm:flex",
					children: NAV.map((item) => {
						const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors", active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
						}, item.to);
					})
				})]
			}), children]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur sm:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-4",
				children: NAV.map((item) => {
					const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						className: cn("flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium", active ? "text-primary" : "text-muted-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
					}, item.to);
				})
			})
		})]
	});
}
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-2xl bg-card text-card-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08)]", className),
		...props
	});
}
function CardHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1 p-5 pb-0", className),
		...props
	});
}
function CardTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: cn("text-sm font-medium text-muted-foreground", className),
		...props
	});
}
function CardContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("p-5", className),
		...props
	});
}
//#endregion
export { CardTitle as a, CardHeader as i, Card as n, CardContent as r, AppShell as t };
