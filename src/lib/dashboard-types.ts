import type { Metric, PeriodKey, RatingBlock, StatBlock } from "@/lib/metrics";

export type SeriesPoint = { t: string; value: number };

export type ModelRow = {
  designId: string;
  title: string;
  slug: string;
  coverUrl: string;
  exclusive: boolean;
  publishedAt: string | null;
  removedAt: string | null;
  stats: StatBlock;
  deltas: StatBlock;
  rating: RatingBlock;
  ratingDelta: number;
  modelDesignId?: string | null;
};

export type EventRow = {
  id: number;
  detectedAt: string;
  designId: string | null;
  profileId: string | null;
  title: string | null;
  metric: Metric;
  previous: number;
  current: number;
  delta: number;
  followerUid: string | null;
  followerHandle: string | null;
  followerAction: "follow" | "unfollow" | null;
};

export type PublicSettings = {
  creatorUid: string;
  creatorHandle: string;
  creatorName: string;
  creatorAvatar: string;
  pollIntervalMinutes: number;
  telegramEnabled: boolean;
  telegramChatId: string;
  telegramCadence: string;
  telegramOnChange: boolean;
  telegramIncludeModels: boolean;
  telegramConfigured: boolean;
  lastPollAt: string | null;
  lastPollError: string;
  lastTelegramAt: string | null;
};

export type DashboardPayload = {
  settings: PublicSettings;
  current: StatBlock;
  deltas: StatBlock;
  previous: StatBlock | null;
  rating: RatingBlock;
  ratingDelta: number;
  previousRatingDelta: number | null;
  series: Record<Metric, SeriesPoint[]>;
  models: ModelRow[];
  removedModels: ModelRow[];
  profiles: ModelRow[];
  removedProfiles: ModelRow[];
  events: EventRow[];
  modelCount: number;
};

export type FollowerView = "changes" | "following" | "lost";

export type FollowerListRow = {
  id: string;
  uid: string;
  name: string;
  handle: string;
  avatar: string;
  baseline: boolean;
  followedAt: string | null;
  lostAt: string | null;
  action: "follow" | "unfollow" | null;
  detectedAt: string | null;
};

export type FollowerPage = {
  view: FollowerView;
  note: string;
  complete: boolean;
  scannedAt: string | null;
  totalReported: number;
  followingCount: number;
  lostCount: number;
  changeCount: number;
  rows: FollowerListRow[];
};

export type { PeriodKey };
