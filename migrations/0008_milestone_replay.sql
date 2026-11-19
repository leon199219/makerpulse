alter table mp_milestones add column if not exists notified boolean not null default true;

alter table mp_settings add column if not exists milestones_replayed boolean not null default false;
