import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, LayoutDashboard, Settings2, Boxes } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/models", label: "Models", icon: Boxes },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/settings", label: "Settings", icon: Settings2 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-w-0 max-w-6xl flex-col gap-6 px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
                <path
                  d="M3 16h3l2-6 2.5 10 2-7 1.5 3H21"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>
              <span className="block text-base font-medium tracking-tight">MakerPulse</span>
              <span className="block text-xs text-muted-foreground">MakerWorld tracker</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        {children}
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur sm:hidden">
        <div className="grid grid-cols-4">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
