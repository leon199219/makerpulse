create table if not exists mp_settings (
  id integer primary key check (id = 1),
  creator_uid text not null default '',
  creator_handle text not null default '',
  creator_name text not null default '',
  creator_avatar text not null default '',
  poll_interval_minutes integer not null default 30,
  telegram_enabled boolean not null default false,
  telegram_bot_token text not null default '',
  telegram_chat_id text not null default '',
  telegram_cadence text not null default 'daily',
  telegram_on_change boolean not null default true,
  telegram_include_models boolean not null default true,
  last_telegram_at timestamptz,
  last_poll_at timestamptz,
  last_poll_error text not null default '',
  updated_at timestamptz not null default now()
);

insert into mp_settings (id) values (1) on conflict (id) do nothing;

create table if not exists mp_models (
  design_id text primary key,
  title text not null,
  slug text not null default '',
  cover_url text not null default '',
  is_exclusive boolean not null default false,
  published_at timestamptz,
  last_seen_at timestamptz not null default now()
);

create table if not exists mp_snapshots (
  id bigserial primary key,
  taken_at timestamptz not null default now(),
  design_id text,
  likes integer not null default 0,
  collections integer not null default 0,
  prints integer not null default 0,
  downloads integer not null default 0,
  comments integer not null default 0,
  boosts integer not null default 0,
  followers integer not null default 0,
  points integer not null default 0
);

create index if not exists mp_snapshots_taken_idx on mp_snapshots (taken_at);
create index if not exists mp_snapshots_design_taken_idx on mp_snapshots (design_id, taken_at);

create table if not exists mp_events (
  id bigserial primary key,
  detected_at timestamptz not null default now(),
  design_id text,
  metric text not null,
  previous integer not null,
  current integer not null,
  delta integer not null
);

create index if not exists mp_events_detected_idx on mp_events (detected_at desc);
