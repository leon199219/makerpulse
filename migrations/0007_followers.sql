create table if not exists mp_followers (
  uid text primary key,
  name text not null default '',
  handle text not null default '',
  avatar text not null default '',
  first_seen_at timestamptz not null default now(),
  followed_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  lost_at timestamptz,
  baseline boolean not null default false
);

create index if not exists mp_followers_followed_idx on mp_followers (followed_at desc);
create index if not exists mp_followers_lost_idx on mp_followers (lost_at desc);

create table if not exists mp_follower_events (
  id bigserial primary key,
  detected_at timestamptz not null default now(),
  uid text not null,
  name text not null default '',
  handle text not null default '',
  action text not null check (action in ('follow', 'unfollow'))
);

create index if not exists mp_follower_events_detected_idx on mp_follower_events (detected_at desc);

create table if not exists mp_follower_sync (
  id integer primary key check (id = 1),
  scanned_at timestamptz,
  total_reported integer not null default 0,
  scanned_count integer not null default 0,
  complete boolean not null default false,
  note text not null default ''
);

insert into mp_follower_sync (id) values (1) on conflict (id) do nothing;
