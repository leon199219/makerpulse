import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as cn } from "./utils-Doej6DeN.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { c as connectCreator, d as loadDashboard, g as testTelegram, i as Route$5, m as saveSettings, p as resetTracking, u as exportCsv } from "./router-C37G1GfP.mjs";
import { a as CardTitle, i as CardHeader, n as Card, r as CardContent, t as AppShell } from "./card-DXOW0Rys.mjs";
import { t as Input } from "./input-Be01Swi1.mjs";
import { t as Button } from "./button-Cqu6VQ3z.mjs";
import { t as ConnectCreator } from "./connect-creator-DVNe4M4g.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/@radix-ui/react-switch+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-B5ZroXq3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-sm font-medium text-foreground", className),
		...props
	});
}
function Switch({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
		className: cn("peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-border bg-secondary transition-colors data-[state=checked]:bg-primary", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: "pointer-events-none block size-5 translate-x-0.5 rounded-full bg-foreground shadow-sm transition-transform data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-primary-foreground" })
	});
}
function SettingsPage() {
	const qc = useQueryClient();
	const initial = Route$5.useLoaderData();
	const settings = useQuery({
		queryKey: ["dashboard", "7d"],
		queryFn: () => loadDashboard({ data: { period: "7d" } }),
		initialData: initial
	}).data?.settings;
	const [poll, setPoll] = (0, import_react.useState)(30);
	const [enabled, setEnabled] = (0, import_react.useState)(false);
	const [token, setToken] = (0, import_react.useState)("");
	const [chat, setChat] = (0, import_react.useState)("");
	const [cadence, setCadence] = (0, import_react.useState)("daily");
	const [onChange, setOnChange] = (0, import_react.useState)(true);
	const [includeModels, setIncludeModels] = (0, import_react.useState)(true);
	const [status, setStatus] = (0, import_react.useState)(null);
	const [confirmReset, setConfirmReset] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!settings) return;
		setPoll(settings.pollIntervalMinutes);
		setEnabled(settings.telegramEnabled);
		setChat(settings.telegramChatId);
		setCadence(settings.telegramCadence);
		setOnChange(settings.telegramOnChange);
		setIncludeModels(settings.telegramIncludeModels);
	}, [settings]);
	const connect = useMutation({
		mutationFn: (input) => connectCreator({ data: { input } }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] })
	});
	const save = useMutation({
		mutationFn: () => saveSettings({ data: {
			pollIntervalMinutes: poll,
			telegramEnabled: enabled,
			telegramBotToken: token,
			telegramChatId: chat,
			telegramCadence: cadence,
			telegramOnChange: onChange,
			telegramIncludeModels: includeModels
		} }),
		onSuccess: () => {
			setToken("");
			setStatus("Settings saved.");
			qc.invalidateQueries({ queryKey: ["dashboard"] });
		},
		onError: (err) => setStatus(err instanceof Error ? err.message : "Save failed")
	});
	const test = useMutation({
		mutationFn: () => testTelegram(),
		onSuccess: () => setStatus("Test message sent."),
		onError: (err) => setStatus(err instanceof Error ? err.message : "Telegram test failed")
	});
	const csv = useMutation({
		mutationFn: () => exportCsv(),
		onSuccess: (data) => {
			const blob = new Blob([data.csv], { type: "text/csv;charset=utf-8" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "makerpulse-snapshots.csv";
			a.click();
			URL.revokeObjectURL(url);
		}
	});
	const reset = useMutation({
		mutationFn: () => resetTracking(),
		onSuccess: () => {
			setConfirmReset(false);
			setStatus("Tracking data reset. Fresh baseline synced.");
			qc.invalidateQueries({ queryKey: ["dashboard"] });
		},
		onError: (err) => setStatus(err instanceof Error ? err.message : "Reset failed")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-medium tracking-tight",
			children: "Settings"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Creator, polling, Telegram, export, and reset."
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectCreator, {
			onSubmit: (input) => connect.mutate(input),
			pending: connect.isPending,
			error: connect.error instanceof Error ? connect.error.message : null
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-foreground",
			children: "Polling"
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex max-w-md flex-col gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "interval",
					children: "Interval (minutes)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "interval",
					type: "number",
					min: 5,
					max: 1440,
					value: poll,
					onChange: (e) => setPoll(Number(e.target.value))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "MakerPulse checks MakerWorld on this cadence and whenever you press Sync now."
				})
			]
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-foreground",
			children: "Telegram bot"
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex max-w-lg flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Enable updates"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Periodic summaries and optional change alerts."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: enabled,
						onCheckedChange: setEnabled
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "token",
						children: "Bot token"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "token",
						type: "password",
						value: token,
						onChange: (e) => setToken(e.target.value),
						placeholder: settings?.telegramConfigured ? "Saved · paste to replace" : "123456:ABC…",
						autoComplete: "off"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "chat",
						children: "Chat ID"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "chat",
						value: chat,
						onChange: (e) => setChat(e.target.value),
						placeholder: "-100…"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "cadence",
						children: "Summary cadence"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						id: "cadence",
						value: cadence,
						onChange: (e) => setCadence(e.target.value),
						className: "h-11 rounded-md border border-input bg-secondary px-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "hourly",
								children: "Hourly"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "every_6h",
								children: "Every 6 hours"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "daily",
								children: "Daily"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "weekly",
								children: "Weekly"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: "Send when stats change"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: onChange,
						onCheckedChange: setOnChange
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: "Include per-model details"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: includeModels,
						onCheckedChange: setIncludeModels
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						onClick: () => save.mutate(),
						disabled: save.isPending,
						children: "Save"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						onClick: () => test.mutate(),
						disabled: test.isPending,
						children: "Send test"
					})]
				})
			]
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-foreground",
			children: "Export"
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "secondary",
			onClick: () => csv.mutate(),
			disabled: csv.isPending,
			children: "Download CSV"
		}) })] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-foreground",
			children: "Reset data"
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex max-w-lg flex-col gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Clears snapshots, models, and activity — including leftover demo results — then syncs a fresh baseline for the connected creator. Telegram settings stay as they are."
			}), confirmReset ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-foreground",
					children: "This cannot be undone. History from the demo creator and mixed totals will be deleted."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "destructive",
						onClick: () => reset.mutate(),
						disabled: reset.isPending,
						children: reset.isPending ? "Resetting…" : "Yes, reset"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						onClick: () => setConfirmReset(false),
						disabled: reset.isPending,
						children: "Cancel"
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "destructive",
				onClick: () => setConfirmReset(true),
				children: "Reset tracking data"
			})]
		})] }),
		status ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: status
		}) : null
	] });
}
//#endregion
export { SettingsPage as component };
