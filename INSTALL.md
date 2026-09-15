# Install MakerPulse

English install guide. Most people should run the **published image** — no Node.js, npm, or source tree on the host.

**Image:** `ghcr.io/leon199219/makerpulse:latest`  
**Package:** [ghcr.io/leon199219/makerpulse](https://github.com/leon199219/makerpulse/pkgs/container/makerpulse)

The container always listens on **8080**. Map any host port on the left: `"3001:8080"`.

---

## Requirements

| Need | Notes |
| --- | --- |
| Docker Engine 24+ | Compose v2 (`docker compose version`) |
| Disk | ~1.5 GB for the image + Postgres data |
| Outbound HTTPS | `makerworld.com` / `api.bambulab.com` (and `api.telegram.org` if you use the bot) |
| MakerWorld user ID | Numeric UID, or connect later in **Settings** |
| Free host port | Default `8080` |
| Postgres | Bundled below, or reuse yours |
| Telegram (optional) | Token from [@BotFather](https://t.me/BotFather) + chat ID |

---

## Path A — Published image (recommended)

Copy [docker-compose.image.yml](docker-compose.image.yml) or paste:

```yaml
services:
  makerpulse:
    image: ghcr.io/leon199219/makerpulse:latest
    pull_policy: always
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://makerpulse:makerpulse@db:5432/makerpulse
      POLL_INTERVAL_MINUTES: "30"
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

```bash
docker compose up -d
```

Open the UI, then **Settings** → connect your MakerWorld account.

### Update

```bash
docker compose pull makerpulse
docker compose up -d --force-recreate makerpulse
```

Do **not** use `docker compose down -v` (that wipes history).

---

## Path B — Merge into an existing Compose file

Add only the app service. Point `DATABASE_URL` at **your** Postgres service name (not `localhost`).

```yaml
  makerpulse:
    image: ghcr.io/leon199219/makerpulse:latest
    pull_policy: always
    restart: unless-stopped
    ports:
      - "3001:8080"
    environment:
      DATABASE_URL: postgres://USER:PASSWORD@postgres:5432/DATABASE
      POLL_INTERVAL_MINUTES: "30"
    depends_on:
      - postgres
```

Schema is applied on start (`node scripts/migrate.mjs`). You can also apply `migrations/0002_makerpulse.sql` yourself; re-running is safe.

Snippet file: [docker-compose.merge.yml](docker-compose.merge.yml).

---

## Path C — Build from source

Need this folder on the host (`Dockerfile`, `package.json`, `src/`, …). Do **not** copy `node_modules`.

```bash
git clone https://github.com/leon199219/makerpulse.git
cd makerpulse
docker compose up -d --build
```

Update later from the same folder: `docker compose up -d --build`.

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
| `MAKERPULSE_PORT` | No | Host port for the standalone compose file (default `8080`) |

Creator input accepts a numeric user ID or a model URL (`https://makerworld.com/en/models/…`). Public handle lookup is not available.

---

## Troubleshooting

### `pull access denied for makerpulse`

Compose has `image: makerpulse:latest`. Docker then looks on **Docker Hub**. Use the full name:

```yaml
image: ghcr.io/leon199219/makerpulse:latest
```

### `depends on undefined service "db"`

`depends_on` names a service that is not in **your** file. Either paste the `db` service from this repo, or point `depends_on` + `DATABASE_URL` at your existing Postgres service (`postgres`, `postgresql`, …). List names with `docker compose config --services`.

### Image does not update

`:latest` is cached locally unless you pull:

```bash
docker compose pull makerpulse
docker compose up -d --force-recreate makerpulse
```

Or set `pull_policy: always`.

---

## Reverse proxy

Point the proxy at `makerpulse:8080` on the Compose network. Do not change the container port.

```yaml
labels:
  - traefik.enable=true
  - traefik.http.routers.makerpulse.rule=Host(`pulse.example.com`)
  - traefik.http.services.makerpulse.loadbalancer.server.port=8080
```

---

## Check that it is up

- UI: `/`
- Liveness: `GET /api/health` → `{ "ok": true, "service": "makerpulse" }`
- Stats JSON: `GET /api/stats`

If demo data mixed with your account, use **Settings → Reset tracking data**.

---

## Notes

- Estimated points use public MakerWorld data (`prints × 2 + boosts`).
- Switching creator in Settings starts a fresh history.
