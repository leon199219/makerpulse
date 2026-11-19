import { METRIC_LABELS, type Metric } from "@/lib/metrics";
import { formatDelta, formatExact } from "@/lib/utils";

export type TelegramSettings = {
  enabled: boolean;
  botToken: string;
  chatId: string;
  includeModels: boolean;
};

export type TelegramEvent = {
  designTitle: string | null;
  metric: Metric;
  previous: number;
  current: number;
  delta: number;
};

export type TelegramFollowerChange = {
  name: string;
  handle: string;
  action: "follow" | "unfollow";
};

function followerNet(changes: TelegramFollowerChange[]): number {
  return changes.reduce((sum, change) => sum + (change.action === "follow" ? 1 : -1), 0);
}

function followerLines(changes: TelegramFollowerChange[]): string[] {
  if (changes.length === 0) return [];
  const lines = ["", "<b>Followers</b>"];
  const cap = 15;
  for (const change of changes.slice(0, cap)) {
    const verb = change.action === "follow" ? "followed" : "unfollowed";
    const handle = change.handle ? ` <i>@${escapeHtml(change.handle)}</i>` : "";
    lines.push(`• ${escapeHtml(change.name || change.handle)}${handle} ${verb}`);
  }
  if (changes.length > cap) lines.push(`• …and ${changes.length - cap} more`);
  return lines;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  html: string,
): Promise<void> {
  const token = botToken.trim();
  const chat = chatId.trim();
  if (!token || !chat) throw new Error("Telegram bot token and chat ID are required.");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chat,
      text: html,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
    signal: AbortSignal.timeout(15000),
  });
  const body = (await res.json()) as { ok?: boolean; description?: string };
  if (!res.ok || !body.ok) {
    throw new Error(body.description || `Telegram request failed (${res.status}).`);
  }
}

export function formatChangeDigest(input: {
  creatorName: string;
  handle: string;
  events: TelegramEvent[];
  includeModels: boolean;
  followerChanges?: TelegramFollowerChange[];
}): string {
  const { creatorName, handle, events, includeModels } = input;
  const named = input.followerChanges ?? [];
  const followerDelta = events.find((event) => !event.designTitle && event.metric === "followers")?.delta;
  const hideCount = named.length > 0 && followerDelta === followerNet(named);
  const account = events.filter(
    (event) => !event.designTitle && !(hideCount && event.metric === "followers"),
  );
  const models = events.filter((event) => event.designTitle);
  const lines = [
    `<b>MakerPulse</b> · ${escapeHtml(creatorName)} <i>@${escapeHtml(handle)}</i>`,
    "",
  ];
  if (account.length === 0 && models.length === 0 && named.length === 0) {
    lines.push("No stat changes since the last check.");
    return lines.join("\n");
  }
  if (account.length) {
    lines.push("<b>Account</b>");
    for (const event of account) {
      lines.push(
        `• ${METRIC_LABELS[event.metric]}: ${formatExact(event.current)} (${formatDelta(event.delta)})`,
      );
    }
  }
  if (includeModels && models.length) {
    lines.push("", "<b>Models</b>");
    const grouped = new Map<string, TelegramEvent[]>();
    for (const event of models) {
      const key = event.designTitle ?? "Model";
      const list = grouped.get(key) ?? [];
      list.push(event);
      grouped.set(key, list);
    }
    let shown = 0;
    for (const [title, list] of grouped) {
      if (shown >= 12) {
        lines.push(`• …and ${grouped.size - shown} more models`);
        break;
      }
      const bits = list
        .map((e) => `${METRIC_LABELS[e.metric]} ${formatDelta(e.delta)}`)
        .join(", ");
      lines.push(`• ${escapeHtml(title)} — ${bits}`);
      shown += 1;
    }
  }
  lines.push(...followerLines(named));
  return lines.join("\n");
}

export function formatPeriodicSummary(input: {
  creatorName: string;
  handle: string;
  totals: Record<Metric, number>;
  deltas: Record<Metric, number>;
  modelCount: number;
  windowLabel: string;
  modelChanges?: { title: string; changes: { metric: Metric; delta: number }[] }[];
  followerChanges?: TelegramFollowerChange[];
}): string {
  const { creatorName, handle, totals, deltas, modelCount, windowLabel, modelChanges } = input;
  const named = input.followerChanges ?? [];
  const hideCount = named.length > 0 && deltas.followers === followerNet(named);
  const lines = [
    `<b>MakerPulse summary</b> · ${escapeHtml(windowLabel)}`,
    `${escapeHtml(creatorName)} <i>@${escapeHtml(handle)}</i> · ${modelCount} models`,
    "",
  ];
  const moved = (Object.keys(totals) as Metric[]).filter(
    (metric) => deltas[metric] !== 0 && !(hideCount && metric === "followers"),
  );
  if (moved.length === 0) {
    if (named.length === 0) {
      lines.push("<b>Account</b>", "No account changes in this period.");
    }
  } else {
    lines.push("<b>Account</b>");
    for (const metric of moved) {
      lines.push(
        `• ${METRIC_LABELS[metric]}: ${formatExact(totals[metric])} (${formatDelta(deltas[metric])})`,
      );
    }
  }
  if (modelChanges && modelChanges.length) {
    lines.push("", "<b>Models</b>");
    const cap = 12;
    modelChanges.slice(0, cap).forEach((model) => {
      const bits = model.changes
        .map((change) => `${METRIC_LABELS[change.metric]} ${formatDelta(change.delta)}`)
        .join(", ");
      lines.push(`• ${escapeHtml(model.title)} — ${bits}`);
    });
    if (modelChanges.length > cap) {
      lines.push(`• …and ${modelChanges.length - cap} more models`);
    }
  }
  lines.push(...followerLines(named));
  return lines.join("\n");
}

export type MilestoneHit = {
  id: number;
  title: string;
  metric: Metric;
  threshold: number;
  value: number;
};

export function formatMilestones(input: {
  creatorName: string;
  handle: string;
  hits: MilestoneHit[];
  catchUp: boolean;
  more: number;
}): string[] {
  const chunks: MilestoneHit[][] = [];
  for (let index = 0; index < input.hits.length; index += 20) {
    chunks.push(input.hits.slice(index, index + 20));
  }
  if (chunks.length === 0) return [];
  return chunks.map((chunk, index) => {
    const lines = [
      `<b>MakerPulse milestone</b>`,
      `${escapeHtml(input.creatorName)} <i>@${escapeHtml(input.handle)}</i>`,
    ];
    if (input.catchUp && index === 0) {
      lines.push(
        "Levels crossed while tracking. Older alerts only watched a few download and boost steps, so these were not sent.",
      );
    }
    lines.push("");
    let current = "";
    for (const hit of chunk) {
      if (hit.title !== current) {
        current = hit.title;
        lines.push(`<b>${escapeHtml(hit.title)}</b>`);
      }
      lines.push(
        `• ${formatExact(hit.threshold)} ${METRIC_LABELS[hit.metric]} (now ${formatExact(hit.value)})`,
      );
    }
    if (index === chunks.length - 1 && input.more > 0) {
      lines.push("", `${input.more} more milestones follow on the next sync.`);
    }
    return lines.join("\n");
  });
}
