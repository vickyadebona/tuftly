import type { Lesson } from "@/lib/types";

// AI-drafted starter content. Set `reviewed: true` only after you've checked every claim.
export const lessons: Lesson[] = [
  {
    id: "arrays-copy-vs-mutate",
    track: "javascript",
    topic: "arrays",
    title: "Sorting and transforming arrays",
    minutes: 4,
    predict: {
      question: "What do you think this prints?",
      code: `const a = [3, 1, 2];\nconst b = a.sort();\nconsole.log(a, b === a);`,
      options: ["[3, 1, 2] false", "[1, 2, 3] true", "[1, 2, 3] false", "[3, 1, 2] true"],
      answerIndex: 1,
      reveal:
        "sort() rearranges the original array in place and returns that same array, so a is now sorted and b === a is true.",
    },
    workedExample: {
      code: `const scores = [30, 10, 20];\nconst sorted = [...scores].sort((a, b) => a - b);\nconsole.log(scores); // [30, 10, 20]\nconsole.log(sorted); // [10, 20, 30]`,
      walkthrough: [
        "[...scores] makes a new array holding the same items (a shallow copy).",
        "sort() then reorders the copy, so the original stays untouched.",
        "(a, b) => a - b sorts numbers properly. Without it, sort() compares items as text.",
      ],
    },
    yourTurn: {
      prompt: "Fill in the blank to build a new array with every score doubled.",
      codeWithBlank: `const doubled = scores.___(n => n * 2);`,
      options: ["forEach", "map", "filter", "reduce"],
      answerIndex: 1,
      explanation:
        "map runs the function on every item and returns a new array of the results. forEach returns nothing, and filter only keeps items.",
    },
    recap: [
      "sort() changes the original array. Copy first with [...arr] when you need the original.",
      "Default sort() compares as text. Pass (a, b) => a - b for numbers.",
      "map transforms every item. filter keeps some items. Both return new arrays.",
    ],
    reviewed: true,
  },
  {
    id: "objects-references",
    track: "javascript",
    topic: "objects",
    title: "Copying objects",
    minutes: 4,
    predict: {
      question: "What do you think this prints?",
      code: `const a = { n: 1 };\nconst b = a;\nb.n = 2;\nconsole.log(a.n);`,
      options: ["1", "2", "undefined", "It throws an error"],
      answerIndex: 1,
      reveal:
        "b = a gives both names the same object, so changing b.n changes a.n too.",
    },
    workedExample: {
      code: `const user = { name: "Sam", tags: ["a"] };\nconst copy = { ...user };\ncopy.name = "Alex";\ncopy.tags.push("b");\nconsole.log(user.name); // "Sam"\nconsole.log(user.tags); // ["a", "b"]`,
      walkthrough: [
        "{ ...user } copies the top-level properties into a new object.",
        "name is a string, so copy.name = \"Alex\" changes only the copy.",
        "tags is an array (an object), so both objects still share the same array. Pushing to it shows up in both.",
      ],
    },
    yourTurn: {
      prompt: "Fill in the blank to make a fully independent copy, including nested data.",
      codeWithBlank: `const deep = ___(user);`,
      options: ["Object.assign", "structuredClone", "Object.freeze", "JSON.parse"],
      answerIndex: 1,
      explanation:
        "structuredClone makes a deep copy. Spread and Object.assign copy only the top level. (JSON.parse(JSON.stringify(x)) also works for plain data, but it turns Dates into strings and drops undefined and functions.)",
    },
    recap: [
      "Assigning an object to another variable gives both names the same object.",
      "Spread { ...obj } is a shallow copy. Nested objects and arrays are still shared.",
      "Use structuredClone(obj) when you need a deep copy.",
    ],
    reviewed: true,
  },
  {
    id: "map-vs-object",
    track: "javascript",
    topic: "maps-sets",
    title: "Using Map and Set",
    minutes: 5,
    predict: {
      question: "What do you think this prints?",
      code: `const m = new Map();\nm.set(1, "a");\nm.set("1", "b");\nconsole.log(m.size);`,
      options: ["1", "2", "0", "It throws an error"],
      answerIndex: 1,
      reveal:
        "A Map keeps keys as they are, so the number 1 and the string \"1\" are different keys. A plain object would turn both into the string \"1\".",
    },
    workedExample: {
      code: `const counts = new Map();\nfor (const w of ["a", "b", "a"]) {\n  counts.set(w, (counts.get(w) ?? 0) + 1);\n}\nconsole.log(counts.get("a")); // 2\nconsole.log(counts.size);     // 2`,
      walkthrough: [
        "counts.get(w) returns undefined the first time, so ?? 0 starts the count at zero.",
        "counts.set(w, ...) stores the new count under that word.",
        "counts.size gives the number of keys directly. No Object.keys(...).length needed.",
      ],
    },
    yourTurn: {
      prompt: "Fill in the blank to check whether the key \"b\" exists in the Map.",
      codeWithBlank: `counts.___("b")`,
      options: ["has", "includes", "contains", "exists"],
      answerIndex: 0,
      explanation:
        "Map has has(key). includes is for arrays and strings. Contains and exists aren't Map methods.",
    },
    recap: [
      "Map keys can be any type and stay as they are. Object keys are strings (or symbols), so other types get converted.",
      "Map has .size, .has(), .get(), .set(), .delete(), and is built for frequent adds and removes.",
      "Set stores unique values: new Set([1, 2, 2, 3]).size is 3.",
    ],
    reviewed: true,
  },
];
