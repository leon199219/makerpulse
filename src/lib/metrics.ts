export const METRICS = [
  "likes",
  "collections",
  "prints",
  "downloads",
  "comments",
  "boosts",
  "followers",
  "points",
] as const;

export type Metric = (typeof METRICS)[number];

export const METRIC_LABELS: Record<Metric, string> = {
  likes: "Likes",
  collections: "Collections",
  prints: "Prints",
  downloads: "Downloads",
  comments: "Comments",
  boosts: "Boosts",
  followers: "Followers",
  points: "Est. points",
};

export const ACCOUNT_METRICS: Metric[] = [...METRICS];
export const MODEL_METRICS: Metric[] = [
  "likes",
  "collections",
  "prints",
  "downloads",
  "comments",
  "boosts",
  "points",
];

export const PERIOD_KEYS = ["1h", "4h", "8h", "24h", "7d", "30d", "90d", "all"] as const;
export type PeriodKey = (typeof PERIOD_KEYS)[number];

export const PERIODS: { key: PeriodKey; label: string; hours: number | null }[] = [
  { key: "1h", label: "1h", hours: 1 },
  { key: "4h", label: "4h", hours: 4 },
  { key: "8h", label: "8h", hours: 8 },
  { key: "24h", label: "24h", hours: 24 },
  { key: "7d", label: "7D", hours: 7 * 24 },
  { key: "30d", label: "30D", hours: 30 * 24 },
  { key: "90d", label: "90D", hours: 90 * 24 },
  { key: "all", label: "All", hours: null },
];

export function periodStart(period: PeriodKey, now = new Date()): Date | null {
  const match = PERIODS.find((p) => p.key === period);
  if (!match || match.hours == null) return null;
  return new Date(now.getTime() - match.hours * 60 * 60 * 1000);
}

export type StatBlock = Record<Metric, number>;

export const EMPTY_STATS: StatBlock = {
  likes: 0,
  collections: 0,
  prints: 0,
  downloads: 0,
  comments: 0,
  boosts: 0,
  followers: 0,
  points: 0,
};

export function estimatePoints(input: {
  prints: number;
  boosts: number;
  exclusive?: boolean;
}): number {
  const base = input.prints * 2 + input.boosts;
  return Math.round(input.exclusive ? base * 1.25 : base);
}
