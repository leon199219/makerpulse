import { t as parseISO } from "../_libs/date-fns.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-Doej6DeN.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatNumber(value) {
	if (value == null || Number.isNaN(value)) return "—";
	const abs = Math.abs(value);
	if (abs >= 1e6) return `${(value / 1e6).toFixed(abs >= 1e7 ? 0 : 1)}M`;
	if (abs >= 1e4) return `${(value / 1e3).toFixed(abs >= 1e5 ? 0 : 1)}k`;
	return new Intl.NumberFormat("en-US").format(value);
}
function formatDelta(value) {
	if (value == null || Number.isNaN(value) || value === 0) return "0";
	return `${value > 0 ? "+" : ""}${formatNumber(value)}`;
}
function formatExact(value) {
	if (value == null || Number.isNaN(value)) return "—";
	return new Intl.NumberFormat("en-US").format(value);
}
function asDate(value) {
	return value instanceof Date ? value : parseISO(value);
}
function asIso(value) {
	if (!value) return null;
	if (value instanceof Date) return value.toISOString();
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}
//#endregion
export { formatExact as a, formatDelta as i, asIso as n, cn as r, asDate as t };
