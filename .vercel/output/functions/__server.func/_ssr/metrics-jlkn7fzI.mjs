//#region node_modules/.nitro/vite/services/ssr/assets/metrics-jlkn7fzI.js
var METRICS = [
	"likes",
	"collections",
	"prints",
	"downloads",
	"comments",
	"boosts",
	"followers",
	"points"
];
var METRIC_LABELS = {
	likes: "Likes",
	collections: "Collections",
	prints: "Prints",
	downloads: "Downloads",
	comments: "Comments",
	boosts: "Boosts",
	followers: "Followers",
	points: "Est. points"
};
[...METRICS];
var MODEL_METRICS = [
	"likes",
	"collections",
	"prints",
	"downloads",
	"comments",
	"boosts",
	"points"
];
var PERIOD_KEYS = [
	"1h",
	"4h",
	"8h",
	"24h",
	"7d",
	"30d",
	"90d",
	"all"
];
var PERIODS = [
	{
		key: "1h",
		label: "1h",
		hours: 1
	},
	{
		key: "4h",
		label: "4h",
		hours: 4
	},
	{
		key: "8h",
		label: "8h",
		hours: 8
	},
	{
		key: "24h",
		label: "24h",
		hours: 24
	},
	{
		key: "7d",
		label: "7D",
		hours: 168
	},
	{
		key: "30d",
		label: "30D",
		hours: 720
	},
	{
		key: "90d",
		label: "90D",
		hours: 2160
	},
	{
		key: "all",
		label: "All",
		hours: null
	}
];
function periodStart(period, now = /* @__PURE__ */ new Date()) {
	const match = PERIODS.find((p) => p.key === period);
	if (!match || match.hours == null) return null;
	return /* @__PURE__ */ new Date(now.getTime() - match.hours * 60 * 60 * 1e3);
}
var EMPTY_STATS = {
	likes: 0,
	collections: 0,
	prints: 0,
	downloads: 0,
	comments: 0,
	boosts: 0,
	followers: 0,
	points: 0
};
function estimatePoints(input) {
	const base = input.prints * 2 + input.boosts;
	return Math.round(input.exclusive ? base * 1.25 : base);
}
//#endregion
export { PERIODS as a, periodStart as c, MODEL_METRICS as i, METRICS as n, PERIOD_KEYS as o, METRIC_LABELS as r, estimatePoints as s, EMPTY_STATS as t };
