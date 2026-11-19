import assert from "node:assert/strict";
import test from "node:test";
import { replaySeries, thresholdsCrossed, thresholdsReached } from "./milestones.ts";

test("thresholds include the small steps and then widen", () => {
  assert.deepEqual(thresholdsReached(0), []);
  assert.deepEqual(thresholdsReached(1), [1]);
  assert.deepEqual(thresholdsCrossed(90, 600), [100, 250, 500]);
  assert.deepEqual(thresholdsCrossed(1000, 1000), []);
  assert.deepEqual(thresholdsCrossed(5000, 100), []);
  assert.ok(thresholdsReached(20000).includes(15000));
  assert.ok(thresholdsReached(20000).includes(20000));
  assert.ok(!thresholdsReached(12000).includes(15000));
});

test("replay announces only levels crossed after the first snapshot", () => {
  const drafts = replaySeries({
    designId: "m1",
    metrics: ["prints", "downloads"],
    points: [
      { stats: { likes: 0, collections: 0, prints: 40, downloads: 100, comments: 0, boosts: 0, followers: 0 } },
      { stats: { likes: 0, collections: 0, prints: 120, downloads: 180, comments: 0, boosts: 0, followers: 0 } },
      { stats: { likes: 0, collections: 0, prints: 260, downloads: 600, comments: 0, boosts: 0, followers: 0 } },
    ],
  });
  const announced = drafts.filter((draft) => draft.announce);
  assert.deepEqual(
    announced.map((draft) => `${draft.metric}:${draft.threshold}`),
    ["prints:50", "prints:100", "prints:250", "downloads:250", "downloads:500"],
  );
  assert.equal(
    drafts.some((draft) => !draft.announce && draft.metric === "downloads" && draft.threshold === 100),
    true,
  );
});
