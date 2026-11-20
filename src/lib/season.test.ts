import test from "node:test";
import assert from "node:assert/strict";
import { seasonFor, seasonForMonth } from "./season.ts";

test("scarf season runs November through February (north)", () => {
  for (const d of ["2026-11-18", "2026-12-25", "2027-01-10", "2027-02-28"]) {
    assert.equal(seasonFor(d), "winter", d);
  }
});

test("spring, summer and autumn months (north)", () => {
  assert.equal(seasonFor("2027-03-01"), "spring");
  assert.equal(seasonFor("2027-05-31"), "spring");
  assert.equal(seasonFor("2027-06-01"), "summer");
  assert.equal(seasonFor("2027-08-31"), "summer");
  assert.equal(seasonFor("2026-09-01"), "autumn");
  assert.equal(seasonFor("2026-10-31"), "autumn");
});

test("southern hemisphere is six months offset", () => {
  assert.equal(seasonFor("2026-07-15", "south"), "winter");
  assert.equal(seasonFor("2026-01-15", "south"), "summer");
  assert.equal(seasonForMonth(11, "south"), "summer");
});
