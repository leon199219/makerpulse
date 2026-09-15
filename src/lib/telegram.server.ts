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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&")
    .replaceAll("<", "<")
    .replaceAll(">", ">");
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
}): string {
  const { creatorName, handle, events, includeModels } = input;
  const account = events.filter((e) => !e.designTitle);
  const models = events.filter((e) => e.designTitle);
  const lines = [
    `<b>MakerPulse</b> · ${escapeHtml(creatorName)} <i>@${escapeHtml(handle)}</i>`,
    "",
  ];
  if (account.length === 0 && models.length === 0) {
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
  return lines.join("\n");
}

export function formatPeriodicSummary(input: {
  creatorName: string;
  handle: string;
  totals: Record<Metric, number>;
  deltas: Record<Metric, number>;
  modelCount: number;
}): string {
  const { creatorName, handle, totals, deltas, modelCount } = input;
  const lines = [
    `<b>MakerPulse summary</b>`,
    `${escapeHtml(creatorName)} <i>@${escapeHtml(handle)}</i> · ${modelCount} models`,
    "",
  ];
  (Object.keys(totals) as Metric[]).forEach((metric) => {
    lines.push(
      `• ${METRIC_LABELS[metric]}: ${formatExact(totals[metric])} (${formatDelta(deltas[metric])})`,
    );
  });
  return lines.join("\n");
}
