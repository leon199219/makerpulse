# Changelog

User-facing changes to MakerPulse. Newest first.

Image: `ghcr.io/leon199219/makerpulse:latest`

## 2026-09-23

### Fixed

- Telegram **summary cadence** now reports changes over the full window, not only since the last poll.
  - Hourly: the last hour
  - Every 6 hours: the last 6 hours
  - Daily: the last 24 hours
  - Weekly: the last 7 days
- The summary lists account metrics that moved in that period, and per-model lines when **Include per-model details** is on.
- Instant “send when stats change” alerts no longer reset the summary timer.

## 2026-09-15

### Added

- First public release: self-hosted MakerWorld analytics (Docker + Postgres).
- Account and per-model history for likes, collections, prints, downloads, comments, boosts, followers, and estimated points.
- Period picker: `1h`, `4h`, `8h`, `24h`, `7D`, `30D`, `90D`, `ALL`.
- Models table: newest/oldest, and sortable metric columns.
- Activity feed with filters.
- Settings: creator link, poll interval, Telegram bot, and reset tracking data.
- Optional Telegram summaries and change alerts.
- Published image `ghcr.io/leon199219/makerpulse:latest`.
- Cross-link with [MakerPulse-CYD](https://github.com/leon199219/MakerPulse-CYD).
