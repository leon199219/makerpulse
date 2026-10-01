alter table mp_snapshots add column if not exists rating_count integer not null default 0;
alter table mp_snapshots add column if not exists rating_score_total integer not null default 0;

create table if not exists mp_milestones (
  id bigserial primary key,
  design_id text not null default '',
  metric text not null,
  threshold integer not null,
  value integer not null,
  reached_at timestamptz not null default now(),
  unique (design_id, metric, threshold)
);
