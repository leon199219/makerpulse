import { estimatePoints, type StatBlock } from "@/lib/metrics";

const API_BASES = [
  "https://api.bambulab.com/v1",
  "https://makerworld.com/api/v1",
];

export type MwProfile = {
  uid: string;
  name: string;
  handle: string;
  avatar: string;
  followers: number;
  likes: number;
  collections: number;
  downloads: number;
  boosts: number;
  prints: number;
  designCount: number;
};

export type MwModel = {
  designId: string;
  title: string;
  slug: string;
  coverUrl: string;
  exclusive: boolean;
  publishedAt: string | null;
  likes: number;
  collections: number;
  prints: number;
  downloads: number;
  comments: number;
  boosts: number;
  points: number;
};

export type MwSnapshot = {
  profile: MwProfile;
  models: MwModel[];
  totals: StatBlock;
};

type Json = Record<string, unknown>;

function num(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return Math.round(n);
  }
  return 0;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

async function mwGet(path: string): Promise<unknown> {
  let lastError = "MakerWorld request failed";
  for (const base of API_BASES) {
    try {
      const res = await fetch(`${base}${path}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "MakerPulse/1.0 (self-hosted creator stats)",
        },
        signal: AbortSignal.timeout(20000),
      });
      const text = await res.text();
      if (!res.ok) {
        lastError = `MakerWorld ${res.status}: ${text.slice(0, 180)}`;
        if (res.status >= 500) continue;
        throw new Error(lastError);
      }
      return JSON.parse(text) as unknown;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
  throw new Error(lastError);
}

export function parseCreatorInput(raw: string): {
  kind: "uid" | "handle" | "model";
  value: string;
} {
  const trimmed = raw.trim();
  const modelMatch = trimmed.match(/makerworld\.com\/(?:[a-z]{2}\/)?models\/(\d+)/i);
  if (modelMatch?.[1]) return { kind: "model", value: modelMatch[1] };

  const uidInUser = trimmed.match(/(?:^|\/)user[_-]?(\d{6,})/i);
  if (uidInUser?.[1]) return { kind: "uid", value: uidInUser[1] };

  const profileHandle = trimmed.match(/makerworld\.com\/(?:[a-z]{2}\/)?@([A-Za-z0-9._-]+)/i);
  if (profileHandle?.[1]) {
    const handle = profileHandle[1];
    const nested = handle.match(/^user[_-]?(\d{6,})$/i);
    if (nested?.[1]) return { kind: "uid", value: nested[1] };
    return { kind: "handle", value: handle };
  }

  if (/^\d{6,}$/.test(trimmed)) return { kind: "uid", value: trimmed };

  const handle = trimmed.replace(/^@/, "");
  const nested = handle.match(/^user[_-]?(\d{6,})$/i);
  if (nested?.[1]) return { kind: "uid", value: nested[1] };
  return { kind: "handle", value: handle };
}

function mapProfile(raw: Json): MwProfile {
  const mw = (raw.MWCount as Json | undefined) ?? {};
  return {
    uid: str(raw.uid),
    name: str(raw.name) || str(raw.handle) || str(raw.uid),
    handle: str(raw.handle),
    avatar: str(raw.avatar),
    followers: num(raw.fanCount),
    likes: num(raw.likeCount),
    collections: num(raw.collectionCount),
    downloads: num(raw.downloadCount),
    boosts: num(raw.boostGained),
    prints: num(mw.myDesignPrintCount),
    designCount: num(mw.designCount),
  };
}

function mapModel(raw: Json): MwModel {
  const prints = num(raw.printCount);
  const boosts = num(raw.boostCnt ?? raw.boostCount);
  const exclusive = Boolean(raw.isExclusive);
  return {
    designId: str(raw.id),
    title: str(raw.title) || `Model ${str(raw.id)}`,
    slug: str(raw.slug),
    coverUrl: str(raw.coverUrl ?? raw.cover),
    exclusive,
    publishedAt: str(raw.publishTime || raw.createTime) || null,
    likes: num(raw.likeCount),
    collections: num(raw.collectionCount),
    prints,
    downloads: num(raw.downloadCount),
    comments: num(raw.commentCount),
    boosts,
    points: estimatePoints({ prints, boosts, exclusive }),
  };
}

export async function fetchProfile(uid: string): Promise<MwProfile> {
  const raw = (await mwGet(`/design-user-service/user/profile/${uid}`)) as Json;
  if (!raw?.uid) throw new Error("Creator profile not found.");
  return mapProfile(raw);
}

export async function fetchDesign(designId: string): Promise<Json> {
  return (await mwGet(`/design-service/design/${designId}`)) as Json;
}

export async function fetchPublishedModels(uid: string): Promise<MwModel[]> {
  const models: MwModel[] = [];
  const limit = 20;
  let offset = 0;
  let total = Infinity;
  while (offset < total && models.length < 500) {
    const raw = (await mwGet(
      `/design-service/publisheddesigns/${uid}?offset=${offset}&limit=${limit}&type=ALL`,
    )) as Json;
    const hits = Array.isArray(raw.hits) ? (raw.hits as Json[]) : [];
    total = num(raw.total) || offset + hits.length;
    for (const hit of hits) models.push(mapModel(hit));
    if (hits.length === 0) break;
    offset += limit;
  }
  return models;
}

export async function resolveCreator(input: string): Promise<{ uid: string; handle: string }> {
  const parsed = parseCreatorInput(input);
  if (parsed.kind === "uid") {
    const profile = await fetchProfile(parsed.value);
    return { uid: profile.uid, handle: profile.handle };
  }
  if (parsed.kind === "model") {
    const design = await fetchDesign(parsed.value);
    const creator = (design.designCreator as Json | undefined) ?? {};
    const uid = str(creator.uid);
    if (!uid) throw new Error("Could not read the creator from that model.");
    const profile = await fetchProfile(uid);
    return { uid: profile.uid, handle: profile.handle };
  }
  throw new Error(
    "This handle cannot be resolved from the public API. Paste a numeric user ID or any published model URL from the creator (makerworld.com/en/models/…).",
  );
}

export async function collectSnapshot(uid: string): Promise<MwSnapshot> {
  const [profile, models] = await Promise.all([
    fetchProfile(uid),
    fetchPublishedModels(uid),
  ]);
  const comments = models.reduce((sum, m) => sum + m.comments, 0);
  const modelPrints = models.reduce((sum, m) => sum + m.prints, 0);
  const modelBoosts = models.reduce((sum, m) => sum + m.boosts, 0);
  const prints = profile.prints || modelPrints;
  const boosts = profile.boosts || modelBoosts;
  const totals: StatBlock = {
    likes: profile.likes,
    collections: profile.collections,
    prints,
    downloads: profile.downloads,
    comments,
    boosts,
    followers: profile.followers,
    points: estimatePoints({ prints, boosts }),
  };
  return { profile, models, totals };
}
