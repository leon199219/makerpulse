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
    <div className="flex w-full shrink-0 flex-wrap gap-1 rounded-lg bg-secondary p-1 sm:w-auto">
      {PERIODS.map((period) => (
        <button
          key={period.key}
          type="button"
          onClick={() => onChange(period.key)}
          className={cn(
            "inline-flex h-11 shrink-0 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors",
            value === period.key
              ? "bg-background text-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
