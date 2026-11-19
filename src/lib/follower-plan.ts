export type FanIdentity = {
  uid: string;
  name: string;
  handle: string;
  avatar: string;
};

export type KnownFan = { lost: boolean };

/** Full list is diffed up to this size. Larger accounts only sample the front of the list. */
export const FULL_SCAN_LIMIT = 1000;
export const PREFIX_SCAN = 200;

export function scanCap(total: number): number {
  if (total > FULL_SCAN_LIMIT) return PREFIX_SCAN;
  return Math.min(total, FULL_SCAN_LIMIT);
}

export function classifyFans(input: {
  baseline: boolean;
  complete: boolean;
  fans: FanIdentity[];
  known: Map<string, KnownFan>;
}): {
  fresh: FanIdentity[];
  back: FanIdentity[];
  stay: FanIdentity[];
  gone: string[];
} {
  const fresh: FanIdentity[] = [];
  const back: FanIdentity[] = [];
  const stay: FanIdentity[] = [];
  const seen = new Set<string>();
  for (const fan of input.fans) {
    if (seen.has(fan.uid)) continue;
    seen.add(fan.uid);
    const previous = input.known.get(fan.uid);
    if (!previous) fresh.push(fan);
    else if (previous.lost) back.push(fan);
    else stay.push(fan);
  }
  const gone: string[] = [];
  if (!input.baseline && input.complete) {
    for (const [uid, row] of input.known) {
      if (!row.lost && !seen.has(uid)) gone.push(uid);
    }
  }
  return { fresh, back, stay, gone };
}
