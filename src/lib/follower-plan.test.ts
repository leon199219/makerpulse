import assert from "node:assert/strict";
import test from "node:test";
import { classifyFans, scanCap } from "./follower-plan.ts";

const fan = (uid: string) => ({ uid, name: uid, handle: uid, avatar: "" });

test("scan cap uses a prefix above 1000 followers", () => {
  assert.equal(scanCap(0), 0);
  assert.equal(scanCap(40), 40);
  assert.equal(scanCap(1000), 1000);
  assert.equal(scanCap(1001), 200);
});

test("first sync does not announce people already following", () => {
  const plan = classifyFans({
    baseline: true,
    complete: true,
    fans: [fan("a"), fan("b")],
    known: new Map(),
  });
  assert.deepEqual(plan.fresh.map((row) => row.uid), ["a", "b"]);
  assert.deepEqual(plan.gone, []);
  assert.deepEqual(plan.back, []);
});

test("later sync separates new follows, returns, and unfollows", () => {
  const plan = classifyFans({
    baseline: false,
    complete: true,
    fans: [fan("new"), fan("back"), fan("stay")],
    known: new Map([
      ["back", { lost: true }],
      ["stay", { lost: false }],
      ["gone", { lost: false }],
    ]),
  });
  assert.deepEqual(plan.fresh.map((row) => row.uid), ["new"]);
  assert.deepEqual(plan.back.map((row) => row.uid), ["back"]);
  assert.deepEqual(plan.stay.map((row) => row.uid), ["stay"]);
  assert.deepEqual(plan.gone, ["gone"]);
});

test("a partial scan does not invent unfollows", () => {
  const plan = classifyFans({
    baseline: false,
    complete: false,
    fans: [fan("new")],
    known: new Map([["old", { lost: false }]]),
  });
  assert.deepEqual(plan.fresh.map((row) => row.uid), ["new"]);
  assert.deepEqual(plan.gone, []);
});
