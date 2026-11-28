import { test } from "node:test";
import assert from "node:assert/strict";
import { scene } from "./island.ts";
import { SEASONS } from "./season.ts";

test("each season draws its own island, the same way every time", () => {
  const drawn = SEASONS.map((season) => JSON.stringify(scene(season)));
  assert.equal(new Set(drawn).size, SEASONS.length);
  assert.deepEqual(SEASONS.map((season) => JSON.stringify(scene(season))), drawn);
});

test("the sky and the floating island are drawn separately", () => {
  for (const season of SEASONS) {
    const { sky, land } = scene(season);
    assert.ok(sky.length > 0 && land.length > 0, season);
  }
});
