// Runs every code snippet used in the lessons and drills and checks the stated answer.
// Usage: node scripts/verify-content.mjs   (Node 22)
import assert from "node:assert/strict";

const checks = [];
const check = (name, fn) => {
  try {
    fn();
    checks.push([true, name]);
  } catch (e) {
    checks.push([false, `${name}: ${e.message.split("\n")[0]}`]);
  }
};

// arrays-copy-vs-mutate
check("lesson arrays: predict a=[3,1,2]; b=a.sort(); a is [1,2,3] and b===a", () => {
  const a = [3, 1, 2];
  const b = a.sort();
  assert.deepEqual(a, [1, 2, 3]);
  assert.equal(b === a, true);
});
check("lesson arrays: [...scores].sort((a,b)=>a-b) leaves original", () => {
  const scores = [30, 10, 20];
  const sorted = [...scores].sort((a, b) => a - b);
  assert.deepEqual(scores, [30, 10, 20]);
  assert.deepEqual(sorted, [10, 20, 30]);
  assert.deepEqual(scores.map((n) => n * 2), [60, 20, 40]);
});
check("d-arr-2: [10,9,1].sort() is [1,10,9]", () => assert.deepEqual([10, 9, 1].sort(), [1, 10, 9]));
check("d-arr-3: filter keeps evens, map gives booleans", () => {
  const nums = [1, 2, 3, 4];
  assert.deepEqual(nums.filter((n) => n % 2 === 0), [2, 4]);
  assert.deepEqual(nums.map((n) => n % 2 === 0), [false, true, false, true]);
});

// objects-references
check("lesson objects: b=a shares object", () => {
  const a = { n: 1 };
  const b = a;
  b.n = 2;
  assert.equal(a.n, 2);
});
check("lesson objects: spread is shallow (name copies, tags shared)", () => {
  const user = { name: "Sam", tags: ["a"] };
  const copy = { ...user };
  copy.name = "Alex";
  copy.tags.push("b");
  assert.equal(user.name, "Sam");
  assert.deepEqual(user.tags, ["a", "b"]);
});
check("lesson objects: structuredClone makes a deep copy", () => {
  const user = { name: "Sam", tags: ["a"] };
  const deep = structuredClone(user);
  deep.tags.push("z");
  assert.deepEqual(user.tags, ["a"]);
});
check("d-obj-1: spread copy y.v=2 leaves x.v at 1", () => {
  const x = { v: 1 };
  const y = { ...x };
  y.v = 2;
  assert.equal(x.v, 1);
});
check("d-obj-2: copy.tags.push shows in user.tags", () => {
  const user = { name: "Sam", tags: ["a"] };
  const copy = { ...user };
  copy.tags.push("b");
  assert.deepEqual(user.tags, ["a", "b"]);
});

// map-vs-object
check("lesson map: 1 and '1' are different Map keys (size 2)", () => {
  const m = new Map();
  m.set(1, "a");
  m.set("1", "b");
  assert.equal(m.size, 2);
});
check("lesson map: word counts with get/set and ?? 0", () => {
  const counts = new Map();
  for (const w of ["a", "b", "a"]) counts.set(w, (counts.get(w) ?? 0) + 1);
  assert.equal(counts.get("a"), 2);
  assert.equal(counts.size, 2);
  assert.equal(counts.has("b"), true);
});
check("d-map-2: object keys 1 and '1' collide (1 key)", () => {
  const o = {};
  o[1] = "a";
  o["1"] = "b";
  assert.equal(Object.keys(o).length, 1);
});
check("d-map-3: new Set([1,2,2,3]).size is 3", () => assert.equal(new Set([1, 2, 2, 3]).size, 3));

for (const [ok, name] of checks) console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
const failed = checks.filter(([ok]) => !ok).length;
console.log(`\n${checks.length - failed}/${checks.length} passed`);
process.exit(failed ? 1 : 0);
