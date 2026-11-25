import assert from "node:assert/strict";
import { test } from "node:test";
import { startSync } from "./sync.ts";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function fake(loads: { data: string | null; error: unknown }[]) {
  const log: string[] = [];
  let change = () => {};
  return {
    log,
    change: () => change(),
    steps: {
      load: async () => {
        log.push("load");
        return loads.shift() ?? { data: null, error: null };
      },
      apply: (data: string | null) => void log.push(`apply ${data}`),
      push: async () => void log.push("push"),
      watch: (onChange: () => void) => {
        change = onChange;
        return () => {
          change = () => {};
        };
      },
    },
  };
}

test("loads and merges before the first push", async () => {
  const f = fake([{ data: "saved", error: null }]);
  const stop = startSync(f.steps);
  await wait(5);
  stop();
  assert.deepEqual(f.log, ["load", "apply saved", "push"]);
});

test("never pushes while the saved copy can't be read", async () => {
  const f = fake([{ data: null, error: new Error("offline") }]);
  const stop = startSync(f.steps, { retryMs: 1000, debounceMs: 1 });
  await wait(5);
  f.change();
  await wait(5);
  stop();
  assert.deepEqual(f.log, ["load"]);
});

test("tries again after a failed load, then syncs changes", async () => {
  const f = fake([{ data: null, error: "nope" }]);
  const stop = startSync(f.steps, { retryMs: 5, debounceMs: 1 });
  await wait(20);
  f.change();
  await wait(10);
  stop();
  assert.deepEqual(f.log, ["load", "load", "apply null", "push", "push"]);
});

test("stopping cancels a waiting retry", async () => {
  const f = fake([{ data: null, error: "nope" }]);
  const stop = startSync(f.steps, { retryMs: 5 });
  await wait(1);
  stop();
  await wait(15);
  assert.deepEqual(f.log, ["load"]);
});
