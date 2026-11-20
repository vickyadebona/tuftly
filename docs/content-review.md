# Content review
Generated from `src/content/`. Set `reviewed: true` on an item only after you've checked it.
All code outputs below were already run in Node by `scripts/verify-content.mjs` (13/13 pass), so the review is mainly about **wording, teaching quality and tone**.

## Checklist for each item
- [ ] Is every statement true (not just 'mostly')?
- [ ] Would a stressed beginner understand it on first read?
- [ ] Is the tone encouraging, never blaming?
- [ ] Is anything missing that an interviewer would expect?
- [ ] Is the difficulty right for a refresher?

---

## Lesson: Sorting and transforming arrays
id: `arrays-copy-vs-mutate` · topic: arrays · 4 min · reviewed: **true**

### 1. Guess first
What do you think this prints?

```js
const a = [3, 1, 2];
const b = a.sort();
console.log(a, b === a);
```
- `[3, 1, 2] false`
- **✔ `[1, 2, 3] true`**
- `[1, 2, 3] false`
- `[3, 1, 2] true`

**Reveal:** sort() rearranges the original array in place and returns that same array, so a is now sorted and b === a is true.

### 2. Worked example
```js
const scores = [30, 10, 20];
const sorted = [...scores].sort((a, b) => a - b);
console.log(scores); // [30, 10, 20]
console.log(sorted); // [10, 20, 30]
```
1. [...scores] makes a new array holding the same items (a shallow copy).
2. sort() then reorders the copy, so the original stays untouched.
3. (a, b) => a - b sorts numbers properly. Without it, sort() compares items as text.

### 3. Your turn
Fill in the blank to build a new array with every score doubled.

```js
const doubled = scores.___(n => n * 2);
```
- `forEach`
- **✔ `map`**
- `filter`
- `reduce`

**Explanation:** map runs the function on every item and returns a new array of the results. forEach returns nothing, and filter only keeps items.

### 4. Recap
- sort() changes the original array. Copy first with [...arr] when you need the original.
- Default sort() compares as text. Pass (a, b) => a - b for numbers.
- map transforms every item. filter keeps some items. Both return new arrays.

Review: - [ ] accurate  - [ ] clear  - [ ] encouraging

### Drills for this lesson (3)

#### d-arr-1 (pick-a-or-b) · reviewed: **true**
You need to sort an array but keep the original order intact. Which is better?

- `arr.sort()`
- **✔ `[...arr].sort()`**

**Key points a good "why" covers:**
- sort() mutates the original array in place
- Spread makes a (shallow) copy first, so the original is untouched
- Bonus: newer engines have toSorted(), which also returns a copy

**Hint:** Think about which one changes the array you started with.

Review: - [ ] accurate  - [ ] clear  - [ ] encouraging

#### d-arr-2 (quick-fire) · reviewed: **true**
What does this evaluate to?

```js
[10, 9, 1].sort()
```
- `[1, 9, 10]`
- `[10, 9, 1]`
- **✔ `[1, 10, 9]`**
- `[9, 10, 1]`

**Key points a good "why" covers:**
- Default sort() converts items to strings
- As text, "1" < "10" < "9", so the order is 1, 10, 9
- Pass (a, b) => a - b to sort numbers numerically

**Hint:** What does sort() compare when you don't give it a function?

Review: - [ ] accurate  - [ ] clear  - [ ] encouraging

#### d-arr-3 (pick-a-or-b) · reviewed: **true**
You want a new array containing only the even numbers. Which is better?

- `nums.map(n => n % 2 === 0)`
- **✔ `nums.filter(n => n % 2 === 0)`**

**Key points a good "why" covers:**
- filter keeps the items where the callback returns true
- map transforms every item, so option A would give an array of true/false values
- Both return a new array and leave the original alone

**Hint:** One of these keeps items. The other changes every item.

Review: - [ ] accurate  - [ ] clear  - [ ] encouraging

---

## Lesson: Copying objects
id: `objects-references` · topic: objects · 4 min · reviewed: **true**

### 1. Guess first
What do you think this prints?

```js
const a = { n: 1 };
const b = a;
b.n = 2;
console.log(a.n);
```
- `1`
- **✔ `2`**
- `undefined`
- `It throws an error`

**Reveal:** b = a gives both names the same object, so changing b.n changes a.n too.

### 2. Worked example
```js
const user = { name: "Sam", tags: ["a"] };
const copy = { ...user };
copy.name = "Alex";
copy.tags.push("b");
console.log(user.name); // "Sam"
console.log(user.tags); // ["a", "b"]
```
1. { ...user } copies the top-level properties into a new object.
2. name is a string, so copy.name = "Alex" changes only the copy.
3. tags is an array (an object), so both objects still share the same array. Pushing to it shows up in both.

### 3. Your turn
Fill in the blank to make a fully independent copy, including nested data.

```js
const deep = ___(user);
```
- `Object.assign`
- **✔ `structuredClone`**
- `Object.freeze`
- `JSON.parse`

**Explanation:** structuredClone makes a deep copy. Spread and Object.assign copy only the top level. (JSON.parse(JSON.stringify(x)) also works for plain data, but it turns Dates into strings and drops undefined and functions.)

### 4. Recap
- Assigning an object to another variable gives both names the same object.
- Spread { ...obj } is a shallow copy. Nested objects and arrays are still shared.
- Use structuredClone(obj) when you need a deep copy.

Review: - [ ] accurate  - [ ] clear  - [ ] encouraging

### Drills for this lesson (3)

#### d-obj-1 (quick-fire) · reviewed: **true**
What is x.v at the end?

```js
const x = { v: 1 };
const y = { ...x };
y.v = 2;
console.log(x.v);
```
- **✔ `1`**
- `2`
- `undefined`
- `It throws an error`

**Key points a good "why" covers:**
- Spread creates a new object, so y is separate from x
- Changing y.v doesn't affect x.v

**Hint:** Does { ...x } share the object or make a new one?

Review: - [ ] accurate  - [ ] clear  - [ ] encouraging

#### d-obj-2 (quick-fire) · reviewed: **true**
What is user.tags at the end?

```js
const user = { name: "Sam", tags: ["a"] };
const copy = { ...user };
copy.tags.push("b");
console.log(user.tags);
```
- `["a"]`
- **✔ `["a", "b"]`**
- `undefined`
- `It throws an error`

**Key points a good "why" covers:**
- Spread is a shallow copy: only the top level is copied
- tags is an array, so both objects hold a reference to the same array
- push on copy.tags therefore also shows up in user.tags

**Hint:** Spread copies the top level. What is tags, really?

Review: - [ ] accurate  - [ ] clear  - [ ] encouraging

#### d-obj-3 (pick-a-or-b) · reviewed: **true**
You need a fully independent copy of nested data. Which is better?

- `{ ...obj }`
- **✔ `structuredClone(obj)`**

**Key points a good "why" covers:**
- Spread is shallow: nested objects and arrays are still shared
- structuredClone makes a deep copy of nested data

**Hint:** Which one also copies the objects inside the object?

Review: - [ ] accurate  - [ ] clear  - [ ] encouraging

---

## Lesson: Using Map and Set
id: `map-vs-object` · topic: maps-sets · 5 min · reviewed: **true**

### 1. Guess first
What do you think this prints?

```js
const m = new Map();
m.set(1, "a");
m.set("1", "b");
console.log(m.size);
```
- `1`
- **✔ `2`**
- `0`
- `It throws an error`

**Reveal:** A Map keeps keys as they are, so the number 1 and the string "1" are different keys. A plain object would turn both into the string "1".

### 2. Worked example
```js
const counts = new Map();
for (const w of ["a", "b", "a"]) {
  counts.set(w, (counts.get(w) ?? 0) + 1);
}
console.log(counts.get("a")); // 2
console.log(counts.size);     // 2
```
1. counts.get(w) returns undefined the first time, so ?? 0 starts the count at zero.
2. counts.set(w, ...) stores the new count under that word.
3. counts.size gives the number of keys directly. No Object.keys(...).length needed.

### 3. Your turn
Fill in the blank to check whether the key "b" exists in the Map.

```js
counts.___("b")
```
- **✔ `has`**
- `includes`
- `contains`
- `exists`

**Explanation:** Map has has(key). includes is for arrays and strings. Contains and exists aren't Map methods.

### 4. Recap
- Map keys can be any type and stay as they are. Object keys are strings (or symbols), so other types get converted.
- Map has .size, .has(), .get(), .set(), .delete(), and is built for frequent adds and removes.
- Set stores unique values: new Set([1, 2, 2, 3]).size is 3.

Review: - [ ] accurate  - [ ] clear  - [ ] encouraging

### Drills for this lesson (3)

#### d-map-1 (pick-a-or-b) · reviewed: **true**
You're tracking a lot of keys that get added and removed often, and the keys might be numbers or objects. Which is better?

- `A plain object`
- **✔ `A Map`**

**Key points a good "why" covers:**
- Map keys can be any type; object keys are strings (or symbols), so numbers get converted to strings
- Map has a built-in .size and is designed for frequent adds and removes

**Hint:** Think about what types of keys an object can really hold.

Review: - [ ] accurate  - [ ] clear  - [ ] encouraging

#### d-map-2 (quick-fire) · reviewed: **true**
What does this print?

```js
const o = {};
o[1] = "a";
o["1"] = "b";
console.log(Object.keys(o).length);
```
- **✔ `1`**
- `2`
- `0`
- `undefined`

**Key points a good "why" covers:**
- Object keys are converted to strings, so 1 and "1" are the same key
- The second assignment overwrites the first, leaving one key

**Hint:** What happens to the number 1 when it's used as an object key?

Review: - [ ] accurate  - [ ] clear  - [ ] encouraging

#### d-map-3 (quick-fire) · reviewed: **true**
What does this evaluate to?

```js
new Set([1, 2, 2, 3]).size
```
- `4`
- **✔ `3`**
- `2`
- `It throws an error`

**Key points a good "why" covers:**
- A Set stores each value only once
- The duplicate 2 is dropped, leaving 1, 2, 3

**Hint:** What does a Set do with duplicates?

Review: - [ ] accurate  - [ ] clear  - [ ] encouraging

