import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.ComponentProps<"span"> & { tone?: "neutral" | "up" | "down" | "accent" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
        tone === "neutral" && "bg-secondary text-muted-foreground",
        tone === "up" && "bg-success/15 text-success",
        tone === "down" && "bg-destructive/15 text-destructive",
        tone === "accent" && "bg-primary/15 text-primary",
        className,
      )}
      {...props}
    />
  );
}
