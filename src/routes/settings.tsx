import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { ConnectCreator } from "@/components/connect-creator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  connectCreator,
  exportCsv,
  loadDashboard,
  resetTracking,
  saveSettings,
  testTelegram,
} from "@/lib/dashboard";

export const Route = createFileRoute("/settings")({
  loader: () => loadDashboard({ data: { period: "7d" } }),
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const initial = Route.useLoaderData();
  const dash = useQuery({
    queryKey: ["dashboard", "7d"],
    queryFn: () => loadDashboard({ data: { period: "7d" } }),
    initialData: initial,
  });
  const settings = dash.data?.settings;
  const [poll, setPoll] = useState(30);
  const [enabled, setEnabled] = useState(false);
  const [token, setToken] = useState("");
  const [chat, setChat] = useState("");
  const [cadence, setCadence] = useState("daily");
  const [onChange, setOnChange] = useState(true);
  const [includeModels, setIncludeModels] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setPoll(settings.pollIntervalMinutes);
    setEnabled(settings.telegramEnabled);
    setChat(settings.telegramChatId);
    setCadence(settings.telegramCadence);
    setOnChange(settings.telegramOnChange);
    setIncludeModels(settings.telegramIncludeModels);
  }, [settings]);

  const connect = useMutation({
    mutationFn: (input: string) => connectCreator({ data: { input } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });
  const save = useMutation({
    mutationFn: () =>
      saveSettings({
        data: {
          pollIntervalMinutes: poll,
          telegramEnabled: enabled,
          telegramBotToken: token,
          telegramChatId: chat,
          telegramCadence: cadence as "hourly" | "every_6h" | "daily" | "weekly",
          telegramOnChange: onChange,
          telegramIncludeModels: includeModels,
        },
      }),
    onSuccess: () => {
      setToken("");
      setStatus("Settings saved.");
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => setStatus(err instanceof Error ? err.message : "Save failed"),
  });
  const test = useMutation({
    mutationFn: () => testTelegram(),
    onSuccess: () => setStatus("Test message sent."),
    onError: (err) => setStatus(err instanceof Error ? err.message : "Telegram test failed"),
  });
  const csv = useMutation({
    mutationFn: () => exportCsv(),
    onSuccess: (data) => {
      const blob = new Blob([data.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "makerpulse-snapshots.csv";
      a.click();
      URL.revokeObjectURL(url);
    },
  });
  const reset = useMutation({
    mutationFn: () => resetTracking(),
    onSuccess: () => {
      setConfirmReset(false);
      setStatus("Tracking data reset. Fresh baseline synced.");
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => setStatus(err instanceof Error ? err.message : "Reset failed"),
  });

  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Creator, polling, Telegram, export, and reset.</p>
      </div>

      <ConnectCreator
        onSubmit={(input) => connect.mutate(input)}
        pending={connect.isPending}
        error={connect.error instanceof Error ? connect.error.message : null}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Polling</CardTitle>
        </CardHeader>
        <CardContent className="flex max-w-md flex-col gap-3">
          <Label htmlFor="interval">Interval (minutes)</Label>
          <Input
            id="interval"
            type="number"
            min={5}
            max={1440}
            value={poll}
            onChange={(e) => setPoll(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            MakerPulse checks MakerWorld on this cadence and whenever you press Sync now.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Telegram bot</CardTitle>
        </CardHeader>
        <CardContent className="flex max-w-lg flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Enable updates</p>
              <p className="text-xs text-muted-foreground">Periodic summaries and optional change alerts.</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="token">Bot token</Label>
            <Input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={settings?.telegramConfigured ? "Saved · paste to replace" : "123456:ABC…"}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="chat">Chat ID</Label>
            <Input
              id="chat"
              value={chat}
              onChange={(e) => setChat(e.target.value)}
              placeholder="-100…"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cadence">Summary cadence</Label>
            <select
              id="cadence"
              value={cadence}
              onChange={(e) => setCadence(e.target.value)}
              className="h-11 rounded-md border border-input bg-secondary px-3 text-sm"
            >
              <option value="hourly">Hourly</option>
              <option value="every_6h">Every 6 hours</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Each summary covers changes over that full period, not only the latest poll.
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm">Send when stats change</p>
            <Switch checked={onChange} onCheckedChange={setOnChange} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm">Include per-model details</p>
            <Switch checked={includeModels} onCheckedChange={setIncludeModels} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => save.mutate()} disabled={save.isPending}>
              Save
            </Button>
            <Button type="button" variant="secondary" onClick={() => test.mutate()} disabled={test.isPending}>
              Send test
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Export</CardTitle>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="secondary" onClick={() => csv.mutate()} disabled={csv.isPending}>
            Download CSV
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Reset data</CardTitle>
        </CardHeader>
        <CardContent className="flex max-w-lg flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Clears snapshots, models, and activity — including leftover demo results — then syncs a
            fresh baseline for the connected creator. Telegram settings stay as they are.
          </p>
          {confirmReset ? (
            <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <p className="text-sm text-foreground">
                This cannot be undone. History from the demo creator and mixed totals will be deleted.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => reset.mutate()}
                  disabled={reset.isPending}
                >
                  {reset.isPending ? "Resetting…" : "Yes, reset"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setConfirmReset(false)}
                  disabled={reset.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button type="button" variant="destructive" onClick={() => setConfirmReset(true)}>
              Reset tracking data
            </Button>
          )}
        </CardContent>
      </Card>

      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
    </AppShell>
  );
}
