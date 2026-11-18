# Security

## Never publish

- A `.env` file with database credentials, a Telegram bot token or a cron secret
- A screenshot or log that shows those values
- A compose file or README snippet that still has your real passwords

Other people copy [`.env.example`](.env.example) to `.env` and fill in their own values.

`.env` is listed in [`.gitignore`](.gitignore). Before you push, check it is not in the commit.

## Database credentials

The compose files in this repo use `makerpulse:makerpulse` as the default Postgres user and password (`DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`). That is fine for a local demo. Change those credentials before you run MakerPulse on a network other people can reach, or anywhere that is not a throwaway demo.

Keep `DATABASE_URL` in line with `POSTGRES_USER`, `POSTGRES_PASSWORD` and `POSTGRES_DB`.

## Telegram

A bot token is a password. Each person should create their own bot with [@BotFather](https://t.me/BotFather). Do not share a token in issues or screenshots.

## Cron endpoint

If you set `CRON_SECRET`, treat it as a password. It protects `GET /api/cron`. Do not share it in issues or screenshots.
