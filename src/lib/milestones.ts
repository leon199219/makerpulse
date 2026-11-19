export const MILESTONE_METRICS = [
  "likes",
  "collections",
  "prints",
  "downloads",
  "comments",
  "boosts",
  "followers",
] as const;

export type MilestoneMetric = (typeof MILESTONE_METRICS)[number];

export const MODEL_MILESTONE_METRICS: readonly MilestoneMetric[] = [
  "likes",
  "collections",
  "prints",
  "downloads",
  "comments",
  "boosts",
];

const FIXED_STEPS = [1, 5, 10, 25, 50, 100, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000];

/** Every level at or below `value`. After 10k the steps get wider so a big account does not notify every single download. */
export function thresholdsReached(value: number): number[] {
  if (value < 1) return [];
  const steps: number[] = [];
  for (const step of FIXED_STEPS) {
    if (step <= value) steps.push(step);
    else break;
  }
  if (value >= 15000) {
    const end = Math.min(value, 100000);
    for (let step = 15000; step <= end; step += 5000) steps.push(step);
  }
  if (value >= 110000) {
    const end = Math.min(value, 1_000_000);
    for (let step = 110000; step <= end; step += 10000) steps.push(step);
  }
  return steps;
}

/** Levels crossed by moving from `previous` to `next`. Drops do not count. */
export function thresholdsCrossed(previous: number, next: number): number[] {
  if (!(next > previous)) return [];
  return thresholdsReached(next).filter((step) => previous < step);
}

export type MilestonePoint = { stats: Record<MilestoneMetric, number> };

export type MilestoneDraft = {
  designId: string;
  metric: MilestoneMetric;
  threshold: number;
  value: number;
  /** False for levels already reached on the first stored snapshot. */
  announce: boolean;
};

/**
 * Walk one account or model from oldest snapshot to newest.
 * The first snapshot only records a baseline. Later crossings are announced once.
 */
export function replaySeries(input: {
  designId: string;
  metrics: readonly MilestoneMetric[];
  points: MilestonePoint[];
}): MilestoneDraft[] {
  const drafts: MilestoneDraft[] = [];
  const seen = new Set<string>();
  let previous: MilestonePoint | null = null;
  for (const point of input.points) {
    for (const metric of input.metrics) {
      const next = point.stats[metric] || 0;
      const steps =
        previous == null ? thresholdsReached(next) : thresholdsCrossed(previous.stats[metric] || 0, next);
      for (const threshold of steps) {
        const key = `${input.designId}:${metric}:${threshold}`;
        if (seen.has(key)) continue;
        seen.add(key);
        drafts.push({
          designId: input.designId,
          metric,
          threshold,
          value: next,
          announce: previous != null,
        });
      }
    }
    previous = point;
  }
  return drafts;
}
