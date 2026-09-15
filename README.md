# MakerPulse

Self-hosted MakerWorld creator analytics. Tracks likes, collections, prints, downloads, comments, boosts, followers, and estimated points — per published model and as account totals. Optional Telegram summaries. English UI.

**Install in Docker Compose:** see [INSTALL.md](INSTALL.md) for requirements and a step-by-step (standalone stack, merge into an existing file, or run a pre-built **image**).

## Docker Compose

The image is built from this project folder (`Dockerfile` + app source). You do **not** mount extra app files at runtime. Postgres data is the only volume.

### Files to keep next to Compose

Place the MakerPulse project (or a copy of it) on the machine that runs Compose. The build context must include:

| Path | Why |
| --- | --- |
| `Dockerfile` | Image build |
| `package.json` / `package-lock.json` | Dependencies |
| `src/` `public/` `scripts/` `server/` `migrations/` | App |
| `vite.config.ts` `tsconfig.json` | Build tooling |

Do **not** copy `node_modules` — the image runs `npm ci` itself. No bind-mounts are required for the UI or tracker.

### Standalone stack

From this folder:

```yaml
services:
  makerpulse:
    build: .
    container_name: makerpulse
    restart: unless-stopped
    ports:
      # HOST:CONTAINER — container always listens on 8080.
      # Map any free host port on the left, e.g. "3001:8080".
      - "${MAKERPULSE_PORT:-8080}:8080"
    environment:
      DATABASE_URL: postgres://makerpulse:makerpulse@db:5432/makerpulse
      MAKERWORLD_UID: "123456789"
      POLL_INTERVAL_MINUTES: "30"
      TELEGRAM_BOT_TOKEN: ""
      TELEGRAM_CHAT_ID: ""
      TELEGRAM_CADENCE: "daily"
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: makerpulse
      POSTGRES_PASSWORD: makerpulse
      POSTGRES_DB: makerpulse
    volumes:
      - makerpulse-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U makerpulse -d makerpulse"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  makerpulse-data:
```

Set a different host port with `MAKERPULSE_PORT=3001` in the same directory as Compose, or write `"3001:8080"` directly.

### Merge into an existing Compose file

1. Copy the MakerPulse project into a subfolder, e.g. `./makerpulse/`.
2. Add the `makerpulse` service with `build: ./makerpulse`.
3. Keep the right-hand port at `8080`. Change only the left-hand host port if needed:

```yaml
  makerpulse:
    build: ./makerpulse
    restart: unless-stopped
    ports:
      - "3001:8080"
    environment:
      DATABASE_URL: postgres://USER:PASS@YOUR_POSTGRES:5432/YOUR_DB
      MAKERWORLD_UID: ""
      POLL_INTERVAL_MINUTES: "30"
    depends_on:
      - YOUR_POSTGRES
```

If you reuse an existing Postgres, apply `migrations/0002_makerpulse.sql` once (or let the container run `node scripts/migrate.mjs` on start). You then do **not** need the bundled `db` service.

## Environment

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `MAKERWORLD_UID` | Numeric MakerWorld user ID |
| `POLL_INTERVAL_MINUTES` | Poll cadence (minimum 5) |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | Chat or group ID |
| `TELEGRAM_CADENCE` | `hourly` \| `every_6h` \| `daily` \| `weekly` |
| `CRON_SECRET` | Optional bearer/query secret for `GET /api/cron` |
| `MAKERPULSE_PORT` | Host port published by Compose (default `8080`) |

You can also set the creator and Telegram bot from **Settings** in the UI.

Creator input accepts a numeric user ID or any published model URL (`https://makerworld.com/en/models/…`). Public handle lookup is not available.

## HTTP API

- `GET /api/health` — liveness
- `GET /api/stats` — current totals and 24h deltas (Home Assistant / Grafana JSON)
- `GET /api/cron` — trigger a poll (`CRON_SECRET` if set)

## Telegram

1. Create a bot with [@BotFather](https://t.me/BotFather) and copy the token.
2. Message the bot, then get your chat ID (for example via `@userinfobot`).
3. Paste token + chat ID in Settings, enable updates, send a test.

## Notes

- Points are **estimated** from public data (`prints × 2 + boosts`, +25% on exclusive models). MakerWorld does not publish the official points balance without a Creator Center session.
- Comments and per-model boosts come from the public model list; followers, likes, collections, downloads, and boosts gained come from the public profile.
