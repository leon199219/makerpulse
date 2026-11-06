create table if not exists mp_profiles (
  profile_id text primary key,
  design_id text not null,
  title text not null,
  model_title text not null default '',
  cover_url text not null default '',
  is_exclusive boolean not null default false,
  published_at timestamptz,
  last_seen_at timestamptz not null default now(),
  removed_at timestamptz
);

alter table mp_snapshots add column if not exists profile_id text;
alter table mp_events add column if not exists profile_id text;

create index if not exists mp_snapshots_profile_taken_idx on mp_snapshots (profile_id, taken_at);
create index if not exists mp_profiles_design_idx on mp_profiles (design_id);
