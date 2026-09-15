# Install MakerPulse in Docker Compose

English install guide. Unpack the project folder onto the Docker host, then pick **standalone** (own stack + Postgres) or **merge** (add one service to an existing Compose file).

## Requirements

| Need | Notes |
| --- | --- |
| Docker Engine 24+ | With Compose v2 (`docker compose version`) |
| Disk | ~1.5 GB for the image + Postgres data |
| Outbound HTTPS | `api.bambulab.com` / `makerworld.com` (and `api.telegram.org` if you use the bot) |
| MakerWorld user ID | Numeric UID, or connect later in **Settings** |
| Free host port | Default `8080` — change only the **left** side of `HOST:8080` |
| Postgres | Bundled in the standalone file, or reuse yours |
| Telegram (optional) | Token from [@BotFather](https://t.me/BotFather) + chat ID |

You do **not** need Node.js, npm, or `node_modules` on the host. The image runs `npm ci` during build.

## What to place on the host

Unpack as a folder named `makerpulse/` (standalone: anywhere; merge: next to your existing Compose file). Keep:

- `Dockerfile`
- `docker-compose.yml` (standalone) and `docker-compose.merge.yml` (paste snippet)
- `package.json`, `package-lock.json`
- `src/`, `public/`, `scripts/`, `server/`, `migrations/`
- `vite.config.ts`, `tsconfig.json`, `.dockerignore`, `.grok/app-env.json`

Do **not** copy `node_modules`. Do **not** bind-mount the app at runtime. The only persistent volume is Postgres data.

The container always listens on **8080**. Map any host port on the left:

```yaml
ports:
  - "3001:8080"    # host 3001 → container 8080
```

Or, for the standalone file: `MAKERPULSE_PORT=3001`.

---

## Path A — Standalone (new stack)

Use this when MakerPulse should have its own Compose file and its own Postgres.

1. Copy the folder onto the Docker host, e.g. `/opt/makerpulse`.
2. Edit `docker-compose.yml`:
   - `MAKERWORLD_UID` if you already know it
   - `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` if you want alerts
   - Host port: `"3001:8080"` or `MAKERPULSE_PORT=3001`
3. From that folder run:

```bash
docker compose up -d --build
```

4. Open the UI on the host port you mapped.
5. In **Settings**, connect your MakerWorld creator if `MAKERWORLD_UID` was empty.
6. Optional: enable Telegram and send a test.

Schema is applied automatically on start (`node scripts/migrate.mjs`).

Update later from the same folder:

```bash
docker compose up -d --build
```

---

## Path B — Merge into an existing Compose file

Use this when you already have a stack (and maybe Postgres).

1. Copy the project into a **subfolder next to your Compose file**:

```text
your-stack/
  docker-compose.yml      ← your existing file
  makerpulse/             ← this project
    Dockerfile
    src/
    …
```

2. Paste the `makerpulse` service from `docker-compose.merge.yml` into your Compose file.
3. Keep `build: ./makerpulse`.
4. Set `DATABASE_URL`:
   - **Reuse your Postgres:** `postgres://USER:PASSWORD@SERVICE_NAME:5432/DBNAME`  
     `SERVICE_NAME` is the Compose **service name** of Postgres, not `localhost`.
   - **No Postgres yet:** also copy the `db` service + `makerpulse-data` volume from `docker-compose.yml`.
5. Pick a free host port; keep `8080` on the right: `"3001:8080"`.
6. Point `depends_on` at your Postgres service (`condition: service_healthy` if it has a healthcheck).
7. From your stack folder:

```bash
docker compose up -d --build makerpulse
```

The first start still runs migrations. You can also apply `migrations/0002_makerpulse.sql` yourself; re-running is safe (`_migrations` table).

## Troubleshooting

### `depends on undefined service "db"`

The `makerpulse` service points at a Compose service named `db`, but that name is not in **your** file. You copied the standalone service without the bundled Postgres.

Pick one:

1. **Reuse your Postgres** — change `depends_on` and the host in `DATABASE_URL` to your real service name (`postgres`, `postgresql`, …). List names with `docker compose config --services`.
2. **Bundle Postgres** — also paste the `db` service and `makerpulse-data` volume from `docker-compose.yml`. Then `depends_on: db` is valid.

Do not use `localhost` as the database host inside Compose; use the service name.

---

## Share as a Docker image

You do not need the source tree on every host. Build once, then run with `image:`.

### 1. Build on a machine that has the project

```bash
docker build -t makerpulse:1.0 .
```

### 2a. Copy the image as a file (USB, scp, shared disk)

```bash
docker save makerpulse:1.0 | gzip > makerpulse-1.0.tar.gz
```

On the other host:

```bash
gunzip -c makerpulse-1.0.tar.gz | docker load
```

### 2b. Push to GitHub Container Registry

```bash
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u leon199219 --password-stdin
docker tag makerpulse:1.0 ghcr.io/leon199219/makerpulse:1.0
docker push ghcr.io/leon199219/makerpulse:1.0
```

Other hosts:

```bash
docker pull ghcr.io/leon199219/makerpulse:1.0
```

A GitHub Actions workflow (`.github/workflows/image.yml`) publishes `ghcr.io/<owner>/makerpulse` on push to `main` and on `v*` tags.

### 3. Run from the image (no `build:`)

Standalone:

```bash
MAKERPULSE_IMAGE=makerpulse:1.0 docker compose -f docker-compose.image.yml up -d
```

Or, in an existing Compose file, paste **only** this service (point `DATABASE_URL` / `depends_on` at your Postgres):

```yaml
  makerpulse:
    image: makerpulse:1.0   # or ghcr.io/leon199219/makerpulse:1.0
    restart: unless-stopped
    ports:
      - "3001:8080"
    environment:
      DATABASE_URL: postgres://USER:PASSWORD@postgres:5432/DATABASE
      MAKERWORLD_UID: ""
      POLL_INTERVAL_MINUTES: "30"
    depends_on:
      - postgres
```

No Dockerfile, `src/`, or `npm` on that host.

---

## Environment

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres URL |
| `MAKERWORLD_UID` | No | Numeric MakerWorld user ID (or set in the UI) |
| `POLL_INTERVAL_MINUTES` | No | Default `30`, minimum `5` |
| `TELEGRAM_BOT_TOKEN` | No | BotFather token |
| `TELEGRAM_CHAT_ID` | No | Chat or group ID |
| `TELEGRAM_CADENCE` | No | `hourly` \| `every_6h` \| `daily` \| `weekly` |
| `CRON_SECRET` | No | Protects `GET /api/cron` |
| `MAKERPULSE_PORT` | No | Host port for the standalone file (default `8080`) |

Creator and Telegram can always be configured in **Settings** after start.

## Reverse proxy

Point the proxy at `makerpulse:8080` on the Compose network. Do not change the container port.

```yaml
labels:
  - traefik.enable=true
  - traefik.http.routers.makerpulse.rule=Host(`pulse.example.com`)
  - traefik.http.services.makerpulse.loadbalancer.server.port=8080
```

## Check that it is up

- UI: `/`
- Liveness: `GET /api/health` → `{ "ok": true, "service": "makerpulse" }`
- Stats JSON: `GET /api/stats`

If the UI is empty after a demo creator, use **Settings → Reset data**.

## Notes

- Estimated points use public MakerWorld data (`prints × 2 + boosts`).
- Switching creator in Settings starts a fresh history.
