# Changelog

User-facing changes to MakerPulse. Newest first.

Image: `ghcr.io/leon199219/makerpulse:latest`

## 2026-10-08

### Changed

- On Models, Likes, Collections, Prints, Downloads, Comments, Boosts, and Est. points sort by the change in the selected period. All still sorts by the all-time total.

## 2026-10-01

### Added

- Star rating per model and for the account, from MakerWorld print-profile ratings.
- Each period is compared with the previous window of the same length.
- Telegram milestone messages when downloads or boosts cross 100, 500, 1,000, and higher steps. Already-passed levels are not announced.

### Changed

- Interface closer to MakerWorld: dark canvas, green actions, pill navigation, and model cards with cover, downloads, and likes.

### Fixed

- Settings for **poll interval** and **Telegram summary cadence** stay saved. Compose defaults (`30` minutes and `daily`) were written back over the database on every page load.

## 2026-09-28

### Fixed

- Comment totals use the model-page count. The published-models list under-reports comments (for example 23 instead of 143 on “Shower Head Extension+Angle Adjustment= Rainfall”).
- Models deleted on MakerWorld leave the overview and move to **Removed from MakerWorld** on the Models page, with their last recorded stats.

## 2026-09-23

### Fixed

- Account **Downloads** now uses MakerWorld’s model-download total (`myDesignDownloadCount`), the same figure as the public profile. The previous value was `downloadCount`, which also folds in print-profile downloads and prints.
- Telegram summary cadence is a visible **1h / 6h / 24h / 7d** control again. Period buttons on Overview, Models, and Activity no longer collapse off-screen.
- Removed sandbox leftovers that are not needed to install or run the app (preview build output, unused skills, extra screenshots, and test-only scripts).
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
