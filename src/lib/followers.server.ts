import { getSql, type Sql } from "@/lib/db";
import { classifyFans, scanCap, type FanIdentity } from "@/lib/follower-plan";
import { fetchFans } from "@/lib/makerworld.server";

export type FollowerChange = {
  uid: string;
  name: string;
  handle: string;
  action: "follow" | "unfollow";
};

const HIDDEN_NOTE =
  "MakerWorld returned no follower names while the profile still has followers. The name list was left unchanged.";
const PARTIAL_NOTE =
  "More than 1,000 followers. Each sync checks the first 200 names only, so unfollows are not detected at this size.";

async function writeSync(
  sql: Sql,
  input: { total: number; scanned: number; complete: boolean; note: string },
): Promise<void> {
  await sql.query(
    `insert into mp_follower_sync (id, scanned_at, total_reported, scanned_count, complete, note)
     values (1, now(), $1, $2, $3, $4)
     on conflict (id) do update set
       scanned_at = now(),
       total_reported = excluded.total_reported,
       scanned_count = excluded.scanned_count,
       complete = excluded.complete,
       note = excluded.note`,
    [input.total, input.scanned, input.complete, input.note],
  );
}

async function upsertFans(
  sql: Sql,
  fans: FanIdentity[],
  mode: "baseline" | "fresh" | "back" | "stay",
): Promise<void> {
  if (fans.length === 0) return;
  const uids = fans.map((fan) => fan.uid);
  const names = fans.map((fan) => fan.name);
  const handles = fans.map((fan) => fan.handle);
  const avatars = fans.map((fan) => fan.avatar);
  if (mode === "baseline" || mode === "fresh") {
    await sql.query(
      `insert into mp_followers (uid, name, handle, avatar, baseline, followed_at, first_seen_at, last_seen_at)
       select uid, name, handle, avatar, $5, now(), now(), now()
       from unnest($1::text[], $2::text[], $3::text[], $4::text[]) as t(uid, name, handle, avatar)
       on conflict (uid) do update set
         name = excluded.name,
         handle = excluded.handle,
         avatar = excluded.avatar,
         last_seen_at = now()`,
      [uids, names, handles, avatars, mode === "baseline"],
    );
    return;
  }
  if (mode === "back") {
    await sql.query(
      `update mp_followers as f
       set name = v.name,
           handle = v.handle,
           avatar = v.avatar,
           last_seen_at = now(),
           lost_at = null,
           followed_at = now(),
           baseline = false
       from unnest($1::text[], $2::text[], $3::text[], $4::text[]) as v(uid, name, handle, avatar)
       where f.uid = v.uid`,
      [uids, names, handles, avatars],
    );
    return;
  }
  await sql.query(
    `update mp_followers as f
     set name = v.name,
         handle = v.handle,
         avatar = v.avatar,
         last_seen_at = now()
     from unnest($1::text[], $2::text[], $3::text[], $4::text[]) as v(uid, name, handle, avatar)
     where f.uid = v.uid`,
    [uids, names, handles, avatars],
  );
}

async function insertEvents(sql: Sql, changes: FollowerChange[]): Promise<void> {
  if (changes.length === 0) return;
  await sql.query(
    `insert into mp_follower_events (uid, name, handle, action)
     select * from unnest($1::text[], $2::text[], $3::text[], $4::text[])`,
    [
      changes.map((change) => change.uid),
      changes.map((change) => change.name),
      changes.map((change) => change.handle),
      changes.map((change) => change.action),
    ],
  );
}

export async function syncFollowers(
  creatorUid: string,
  reportedFollowers: number,
): Promise<{ changes: FollowerChange[]; baseline: boolean; complete: boolean; note: string }> {
  const sql = await getSql();
  const probe = await fetchFans(creatorUid, 20);
  if (probe.total === 0 && reportedFollowers > 0) {
    await writeSync(sql, { total: reportedFollowers, scanned: 0, complete: false, note: HIDDEN_NOTE });
    return { changes: [], baseline: false, complete: false, note: HIDDEN_NOTE };
  }
  const cap = scanCap(probe.total);
  const list = cap <= probe.fans.length ? probe : await fetchFans(creatorUid, cap);
  const knownRows = await sql<{ uid: string; name: string; handle: string; lost_at: string | null }>`
    select uid, name, handle, lost_at from mp_followers
  `;
  const baseline = knownRows.length === 0;
  const known = new Map(
    knownRows.map((row) => [row.uid, { lost: row.lost_at != null, name: row.name, handle: row.handle }]),
  );
  const plan = classifyFans({
    baseline,
    complete: list.complete,
    fans: list.fans,
    known: new Map([...known].map(([uid, row]) => [uid, { lost: row.lost }])),
  });
  if (baseline) await upsertFans(sql, plan.fresh, "baseline");
  else {
    await upsertFans(sql, plan.fresh, "fresh");
    await upsertFans(sql, plan.back, "back");
    await upsertFans(sql, plan.stay, "stay");
    if (plan.gone.length) {
      await sql.query(
        `update mp_followers set lost_at = now() where uid = any($1::text[]) and lost_at is null`,
        [plan.gone],
      );
    }
  }
  const changes: FollowerChange[] = baseline
    ? []
    : [
        ...plan.fresh.map((fan) => ({ ...fan, action: "follow" as const })),
        ...plan.back.map((fan) => ({ ...fan, action: "follow" as const })),
        ...plan.gone.map((uid) => {
          const row = known.get(uid);
          return {
            uid,
            name: row?.name || uid,
            handle: row?.handle || uid,
            action: "unfollow" as const,
          };
        }),
      ];
  await insertEvents(sql, changes);
  const note = list.complete ? "" : PARTIAL_NOTE;
  await writeSync(sql, {
    total: list.total,
    scanned: list.fans.length,
    complete: list.complete,
    note,
  });
  return { changes, baseline, complete: list.complete, note };
}
