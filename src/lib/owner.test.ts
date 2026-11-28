import assert from "node:assert/strict";
import { test } from "node:test";
import { claim, release, type Keys } from "./owner.ts";

/** A device's storage, and a count of how often what's on it was wiped. */
function device(start: Record<string, string> = {}) {
  const items = new Map(Object.entries(start));
  const state = { wiped: 0 };
  const keys: Keys = {
    getItem: (k) => items.get(k) ?? null,
    setItem: (k, v) => void items.set(k, v),
    removeItem: (k) => void items.delete(k),
  };
  return { keys, state, wipe: () => void state.wiped++ };
}

test("one person's progress is never handed to the next account", () => {
  const d = device();
  assert.equal(claim(d.keys, "ana", d.wipe), false);
  // Ana logs out and Ben signs in on the same device.
  assert.equal(claim(d.keys, "ben", d.wipe), true);
  assert.equal(d.state.wiped, 1);
});

test("signing back in keeps what is on the device", () => {
  const d = device();
  claim(d.keys, "ana", d.wipe);
  assert.equal(claim(d.keys, "ana", d.wipe), false);
  assert.equal(d.state.wiped, 0);
});

test("practice done before signing up comes along", () => {
  const d = device();
  release(d.keys, d.wipe);
  assert.equal(claim(d.keys, "ana", d.wipe), false);
  assert.equal(d.state.wiped, 0);
});

test("a new profile after someone signed in starts clean", () => {
  const d = device();
  claim(d.keys, "ana", d.wipe);
  release(d.keys, d.wipe);
  assert.equal(d.state.wiped, 1);
  // What the new person then does is theirs to keep when they sign in.
  assert.equal(claim(d.keys, "ben", d.wipe), false);
  assert.equal(d.state.wiped, 1);
});

test("a device that only remembers whose pitch it holds still counts as theirs", () => {
  const d = device({ "tuftly-pitch-owner-v1": "ana" });
  assert.equal(claim(d.keys, "ben", d.wipe), true);
});
