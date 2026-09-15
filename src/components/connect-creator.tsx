import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function ConnectCreator({
  onSubmit,
  pending,
  error,
}: {
  onSubmit: (input: string) => void;
  pending?: boolean;
  error?: string | null;
}) {
  const [value, setValue] = useState("");

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-6 sm:p-8">
        <div className="max-w-xl">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Track a MakerWorld creator</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste a numeric user ID or any published model URL. Profile handles like @name need a model URL
            because MakerWorld does not expose a public handle lookup.
          </p>
        </div>
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) onSubmit(value.trim());
          }}
        >
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="User ID or https://makerworld.com/en/models/…"
            aria-label="Creator ID or model URL"
          />
          <Button type="submit" disabled={pending || !value.trim()} className="sm:w-40">
            {pending ? "Connecting…" : "Start tracking"}
          </Button>
        </form>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => onSubmit("242971666")}
          >
            Load demo creator
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
