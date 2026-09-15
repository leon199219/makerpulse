import { parseISO } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 10_000) return `${(value / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}k`;
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDelta(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value) || value === 0) return "0";
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value)}`;
}

export function formatExact(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

export function asDate(value: string | Date): Date {
  return value instanceof Date ? value : parseISO(value);
}

export function asIso(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}
