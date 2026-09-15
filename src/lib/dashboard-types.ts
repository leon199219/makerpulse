import type { Metric, PeriodKey, StatBlock } from "@/lib/metrics";

export type SeriesPoint = { t: string; value: number };

export type ModelRow = {
  designId: string;
  title: string;
  slug: string;
  coverUrl: string;
  exclusive: boolean;
  publishedAt: string | null;
  stats: StatBlock;
  deltas: StatBlock;
};

export type EventRow = {
  id: number;
  detectedAt: string;
  designId: string | null;
  title: string | null;
  metric: Metric;
  previous: number;
  current: number;
  delta: number;
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
  series: Record<Metric, SeriesPoint[]>;
  models: ModelRow[];
  events: EventRow[];
  modelCount: number;
};

export type { PeriodKey };
