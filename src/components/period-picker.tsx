import { PERIODS, type PeriodKey } from "@/lib/metrics";
import { cn } from "@/lib/utils";

export function PeriodPicker({
  value,
  onChange,
}: {
  value: PeriodKey;
  onChange: (key: PeriodKey) => void;
}) {
  return (
    <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">
      {PERIODS.map((period) => (
        <button
          key={period.key}
          type="button"
          onClick={() => onChange(period.key)}
          className={cn(
            "inline-flex h-9 shrink-0 items-center justify-center rounded-full px-3.5 text-xs font-medium transition-colors",
            value === period.key
              ? "bg-foreground text-background"
              : "bg-secondary text-foreground/85 hover:bg-accent",
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
