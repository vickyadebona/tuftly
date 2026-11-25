import type { Lesson } from "@/lib/types";
import { communicationLessons } from "./communication.ts";
import { depthLessons } from "./depth.ts";

// AI-drafted starter content. Set `reviewed: true` only after you've checked every claim.
//
// Each lesson is a few small ideas. An idea = guess, worked example, a check, and (shown only
// after a miss) a re-teach from another angle plus fresh questions on the same idea.
// Voice: plain and warm. Say what's right or wrong and why. No cheering, no slogans.
const codeLessons: Lesson[] = [
  {
    id: "arrays-copy-vs-mutate",
    track: "javascript",
    topic: "arrays",
    title: "Sorting and transforming arrays",
    minutes: 6,
    reviewed: true,
    intro: {
      summary: "Three things that trip people up with arrays in interviews: sort() changing the array you call it on, sorting numbers, and when to use map or filter.",
      outcomes: ["Explain why sort() changes the original array, and how to avoid that", "Sort numbers correctly with a compare function", "Choose between map and filter, and say why"],
    },
    ideas: [
      {
        id: "sort-mutates",
        title: "sort() changes the original",
        guess: {
          question: "In JavaScript, what do you think this prints?",
          code: `const a = [3, 1, 2];\nconst b = a.sort();\nconsole.log(a, b === a);`,
          options: ["[3, 1, 2] false", "[1, 2, 3] true", "[1, 2, 3] false", "[3, 1, 2] true"],
          answerIndex: 1,
          reveal:
            "sort() rearranges the original array in place and returns that same array, so a is now sorted and b === a is true.",
        },
        workedExample: {
          code: `const scores = [30, 10, 20];\nconst sorted = [...scores].sort();\nconsole.log(scores); // [30, 10, 20]\nconsole.log(sorted); // [10, 20, 30]`,
          walkthrough: [
            "[...scores] builds a new array with the same items (a shallow copy).",
            "sort() reorders that copy and returns it.",
            "scores is untouched, because only the copy was sorted. Calling scores.sort() directly would have reordered scores itself.",
          ],
        },
        check: {
          prompt: "In JavaScript, fill in the blank so names keeps its original order.",
          code: `const names = ["Sam", "Alex", "Jo"];\nconst sortedNames = ___.sort();`,
          options: ["names", "[...names]", "names.length", "names.sort"],
          answerIndex: 1,
          explanation:
            "[...names] makes a copy, so sort() only reorders the copy. Using names directly would reorder names itself.",
        },
        explain: {
          question: "In JavaScript, what's the catch with using sort() on an array?",
          starter: "sort() changes the original array, so if I need to keep the order I…",
          modelAnswer: "sort() sorts the array in place, which means it changes the original array instead of returning a new one. If I still need the original order, I copy it first, for example with [...arr].sort(), and sort the copy. For instance, calling scores.sort() would reorder scores itself.",
          keyPoints: ["It changes (mutates) the original array", "It sorts in place and returns that same array", "To keep the original, copy first, e.g. [...arr].sort()"],
        },
        reteach: {
          steps: [
            "Some array methods change the array you call them on. That's called mutating it, and sort() is one of them.",
            "Others, like map and filter, leave the original alone and hand back a new array.",
            "When you need the original order later, copy first with [...arr] or arr.slice(), then sort the copy.",
          ],
          code: `const a = [3, 1, 2];\na.sort();\nconsole.log(a); // [1, 2, 3]  (a itself changed)`,
        },
        retries: [
          {
            prompt: "In JavaScript, what does this print?",
            code: `const list = ["b", "c", "a"];\nconst result = list.sort();\nconsole.log(list[0]);`,
            options: ['"b"', '"a"', '"c"', "undefined"],
            answerIndex: 1,
            explanation:
              'sort() reordered list itself, so list[0] is now "a". result is just another name for the same array.',
          },
          {
            prompt: "In JavaScript, which line leaves prices in its original order?",
            code: `const prices = [30, 10, 20];`,
            options: ["prices.sort()", "[...prices].sort()", "prices.reverse()", "prices.sort().slice()"],
            answerIndex: 1,
            explanation:
              "Only [...prices].sort() sorts a copy. The others reorder prices itself: slice() runs after sort() has already changed it.",
          },
        ],
        recap: "sort() changes the array you call it on. Copy first with [...arr] when you need the original.",
      },
      {
        id: "sort-numbers",
        title: "Sorting numbers",
        guess: {
          question: "In JavaScript, what do you think this prints?",
          code: `console.log([5, 25, 100].sort());`,
          options: ["[5, 25, 100]", "[100, 25, 5]", "[25, 5, 100]", "[100, 5, 25]"],
          answerIndex: 1,
          reveal:
            'With no function, sort() compares items as text. As text, "100" comes before "25", and "25" before "5", so the result is [100, 25, 5].',
        },
        workedExample: {
          code: `const nums = [5, 25, 100];\nnums.sort((a, b) => a - b);\nconsole.log(nums); // [5, 25, 100]`,
          walkthrough: [
            "sort() can take a compare function. It gets two items, a and b, and answers: which goes first?",
            "A negative result means a goes first. Positive means b goes first. Zero means leave them as they are.",
            "a - b is negative when a is smaller, so smaller numbers come first. Use b - a for largest first.",
          ],
        },
        check: {
          prompt: "In JavaScript, fill in the blank to sort the numbers from largest to smallest.",
          code: `const nums = [5, 25, 100];\nnums.sort((a, b) => ___);`,
          options: ["a - b", "b - a", "a > b", "a + b"],
          answerIndex: 1,
          explanation:
            "b - a is negative when a is the bigger number, so the bigger number goes first. a - b does the opposite. a > b gives true or false, not a number, so it doesn't sort reliably.",
        },
        explain: {
          question: "Why does [10, 9, 1].sort() give [1, 10, 9], and how would you fix it?",
          starter: "By default sort() compares items as text, so…",
          modelAnswer: "By default, sort() converts the items to strings and compares them as text, so \"10\" comes before \"9\" because \"1\" is smaller than \"9\". To sort numbers properly I pass a compare function, like (a, b) => a - b, which puts smaller numbers first.",
          keyPoints: ["Default sort() compares items as text (strings)", "So \"10\" sorts before \"9\": it compares characters, not size", "Fix: pass a compare function such as (a, b) => a - b"],
        },
        reteach: {
          steps: [
            "The compare function answers one question: should a come before b?",
            "Negative means yes, a first. Positive means no, b first. Zero means it doesn't matter.",
            "Try a = 2 and b = 7. a - b is -5, which is negative, so 2 goes first. That's ascending order.",
          ],
          code: `[10, 2, 33].sort((a, b) => a - b); // [2, 10, 33]`,
        },
        retries: [
          {
            prompt: "In JavaScript, what does this print?",
            code: `console.log([3, 20, 100].sort());`,
            options: ["[3, 20, 100]", "[100, 20, 3]", "[100, 3, 20]", "[20, 100, 3]"],
            answerIndex: 1,
            explanation:
              'Without a compare function the numbers are compared as text: "100" < "20" < "3". So the result is [100, 20, 3].',
          },
          {
            prompt: "In JavaScript, which call sorts numbers from smallest to largest?",
            code: `const nums = [3, 20, 100];`,
            options: [
              "nums.sort()",
              "nums.sort((a, b) => a - b)",
              "nums.sort((a, b) => b - a)",
              "nums.sort((a, b) => a > b)",
            ],
            answerIndex: 1,
            explanation:
              "a - b is negative when a is smaller, so smaller numbers go first. The plain sort() compares as text, and b - a goes the other way.",
          },
        ],
        recap: "Default sort() compares as text. Pass (a, b) => a - b to sort numbers smallest first.",
      },
      {
        id: "map-filter",
        title: "map and filter",
        guess: {
          question: "In JavaScript, what do you think this prints?",
          code: `const nums = [1, 2, 3, 4];\nconst result = nums.filter(n => n > 2);\nconsole.log(result, nums.length);`,
          options: ["[3, 4] 4", "[3, 4] 2", "[false, false, true, true] 4", "[1, 2] 4"],
          answerIndex: 0,
          reveal:
            "filter keeps the items where the function returns true and gives you a new array. nums itself isn't changed, so its length is still 4.",
        },
        workedExample: {
          code: `const scores = [30, 10, 20];\nconst doubled = scores.map(n => n * 2);\nconst big = scores.filter(n => n > 15);\nconsole.log(doubled); // [60, 20, 40]\nconsole.log(big);     // [30, 20]`,
          walkthrough: [
            "map runs the function on every item and collects the results: 60, 20, 40.",
            "filter runs the function on every item too, but keeps only the items where it returns true.",
            "Both return new arrays, and scores is unchanged.",
          ],
        },
        check: {
          prompt: "In JavaScript, fill in the blank to build a new array with every score doubled.",
          code: `const scores = [30, 10, 20];\nconst doubled = scores.___(n => n * 2);`,
          options: ["forEach", "map", "filter", "reduce"],
          answerIndex: 1,
          explanation:
            "map runs the function on every item and returns a new array of the results. forEach returns nothing, and filter only keeps items.",
        },
        explain: {
          question: "What's the difference between map and filter?",
          starter: "map … every item, while filter …",
          modelAnswer: "map runs a function on every item and returns a new array of the results, so it has the same length as the original. filter keeps only the items where the function returns true, so the new array can be shorter. Neither one changes the original array. For example, nums.map(n => n * 2) doubles every number, and nums.filter(n => n > 2) keeps just the ones above two.",
          keyPoints: ["map transforms every item: same length out", "filter keeps only some items: it can be shorter", "Both return a new array and leave the original alone"],
        },
        reteach: {
          steps: [
            "map is for changing every item. You get the same number of items out as you put in.",
            "filter is for choosing items. You get some of the same items back, so maybe fewer.",
            "forEach just runs code for each item and returns nothing, so it can't build the new array for you.",
          ],
          code: `[1, 2, 3].map(n => n + 1);    // [2, 3, 4]\n[1, 2, 3].filter(n => n > 1); // [2, 3]`,
        },
        retries: [
          {
            prompt: "In JavaScript, fill in the blank to keep only the names longer than 3 letters.",
            code: `const names = ["Sam", "Alex", "Jo", "Priya"];\nconst long = names.___(name => name.length > 3);`,
            options: ["map", "filter", "forEach", "sort"],
            answerIndex: 1,
            explanation:
              "filter keeps the items where the function returns true. map would give back an array of true and false instead.",
          },
          {
            prompt: "In JavaScript, how many items does result have?",
            code: `const result = [1, 2, 3].map(n => n > 1);\nconsole.log(result.length);`,
            options: ["3", "2", "1", "0"],
            answerIndex: 0,
            explanation:
              "map returns one result per item, so there are 3: [false, true, true]. It never removes anything. That's filter's job.",
          },
        ],
        recap: "map changes every item. filter keeps some items. Both return new arrays and leave the original alone.",
      },
    ],
  },
  {
    id: "objects-references",
    track: "javascript",
    topic: "objects",
    title: "Copying objects",
    minutes: 6,
    reviewed: true,
    intro: {
      summary: "Why changing a copy can change the original, and how to make a copy that doesn't.",
      outcomes: ["Explain why assigning an object doesn't copy it", "Describe what a shallow copy is and where spread falls short", "Make a deep copy with structuredClone"],
    },
    ideas: [
      {
        id: "shared-reference",
        title: "Assigning shares the object",
        guess: {
          question: "In JavaScript, what do you think this prints?",
          code: `const a = { n: 1 };\nconst b = a;\nb.n = 2;\nconsole.log(a.n);`,
          options: ["1", "2", "undefined", "It throws an error"],
          answerIndex: 1,
          reveal: "b = a gives both names the same object, so changing b.n changes a.n too.",
        },
        workedExample: {
          code: `const a = { n: 1 };\nconst b = a;\nb.n = 2;\nconsole.log(a.n);     // 2\nconsole.log(a === b); // true`,
          walkthrough: [
            "An object lives in one place. a and b are two names that point to it.",
            "const b = a doesn't copy anything. It gives the same object a second name.",
            "So changing b.n changes what a sees too, and a === b is true.",
          ],
        },
        check: {
          prompt: "In JavaScript, which one gives you a separate object, so changing one doesn't touch the other?",
          code: `const original = { n: 1 };\nconst other = ___;`,
          options: ["original", "{ ...original }", "[original]", "original.n"],
          answerIndex: 1,
          explanation:
            "{ ...original } builds a new object with the same properties. Using original just adds a second name for the same object.",
        },
        explain: {
          question: "If I write const b = a with an object and then change b, what happens to a, and why?",
          starter: "Both names point to…",
          modelAnswer: "a changes too. A variable holds a reference to the object, not the object itself, so const b = a doesn't copy the object, it just gives it a second name. Both variables point at the same object, so a change made through b is visible through a. If I want a separate object, I have to copy it, for example with { ...a }.",
          keyPoints: ["Assigning an object copies the reference, not the object", "Both names point to the same object, so changes show up in both", "To get a separate object you need to copy it, e.g. { ...a }"],
        },
        reteach: {
          steps: [
            "Think of an object as a document in a shared drive. A variable holds the link, not the document.",
            "const b = a copies the link. Edits through either link change the same document.",
            "To get a separate document you have to make a copy on purpose.",
          ],
          code: `const a = { n: 1 };\nconst b = a;        // same object\nconst c = { ...a }; // a new object`,
        },
        retries: [
          {
            prompt: "In JavaScript, what does this print?",
            code: `const x = { v: 1 };\nconst y = x;\ny.v = 5;\nconsole.log(x.v);`,
            options: ["1", "5", "undefined", "It throws an error"],
            answerIndex: 1,
            explanation: "y is another name for the same object as x, so changing y.v changes x.v too.",
          },
          {
            prompt: "In JavaScript, what does this print?",
            code: `const x = { v: 1 };\nconst y = { v: 1 };\nconsole.log(x === y);`,
            options: ["true", "false", "undefined", "It throws an error"],
            answerIndex: 1,
            explanation:
              "=== on objects asks whether they are the same object, not whether they look the same. These are two separate objects, so it's false.",
          },
        ],
        recap: "Assigning an object to another variable gives both names the same object.",
      },
      {
        id: "shallow-copy",
        title: "Spread is a shallow copy",
        guess: {
          question: "In JavaScript, what do you think this prints?",
          code: `const user = { name: "Sam", tags: ["a"] };\nconst copy = { ...user };\ncopy.tags.push("b");\nconsole.log(user.tags);`,
          options: ['["a"]', '["a", "b"]', "undefined", "It throws an error"],
          answerIndex: 1,
          reveal:
            "Spread copies the top level only. tags is an array, which is an object, so user and copy hold the same array. Pushing to it shows up in both.",
        },
        workedExample: {
          code: `const user = { name: "Sam", tags: ["a"] };\nconst copy = { ...user };\ncopy.name = "Alex";\ncopy.tags.push("b");\nconsole.log(user.name); // "Sam"\nconsole.log(user.tags); // ["a", "b"]`,
          walkthrough: [
            "{ ...user } copies the top-level properties into a new object.",
            'name is a string, so copy.name = "Alex" changes only the copy.',
            "tags is an array (an object), so both objects still share the same array. Pushing to it shows up in both.",
          ],
        },
        check: {
          prompt: "In JavaScript, what does this print?",
          code: `const user = { name: "Sam", tags: ["a"] };\nconst copy = { ...user };\ncopy.name = "Alex";\nconsole.log(user.name);`,
          options: ['"Sam"', '"Alex"', "undefined", "It throws an error"],
          answerIndex: 0,
          explanation:
            "name is a string, which is copied by value, so changing copy.name doesn't touch user.name. Only nested objects and arrays, like tags, are shared.",
        },
        explain: {
          question: "Is the spread operator on an object a deep copy? What can go wrong?",
          starter: "Spread makes a shallow copy, which means…",
          modelAnswer: "No, spread makes a shallow copy. It copies the top-level properties into a new object, but any nested objects or arrays are still shared between the original and the copy. So if I push to copy.tags, user.tags changes too. Simple values like strings are copied, so each object has its own.",
          keyPoints: ["Spread copies only the top level (a shallow copy)", "Nested objects and arrays are still shared", "Changing a nested value through the copy changes the original"],
        },
        reteach: {
          steps: [
            "Spread copies each property of the top level into a new object.",
            "If a property holds a simple value (a string, number or boolean), the new object gets its own copy.",
            "If a property holds an object or array, the new object gets a reference to the same one, so that nested piece is shared.",
          ],
          code: `const user = { name: "Sam", tags: ["a"] };\nconst copy = { ...user };\ncopy.name = "Alex";   // only copy changes\ncopy.tags.push("b"); // user.tags changes too`,
        },
        retries: [
          {
            prompt: "In JavaScript, which change will also show up in the original a?",
            code: `const a = { n: 1, list: [1] };\nconst b = { ...a };`,
            options: ["b.n = 2", "b.list.push(2)", "b.extra = true", "delete b.n"],
            answerIndex: 1,
            explanation:
              "list is shared between a and b, so pushing to it changes both. The other lines only change b's own top-level properties.",
          },
          {
            prompt: "In JavaScript, what does this print?",
            code: `const a = { inner: { x: 1 } };\nconst b = { ...a };\nconsole.log(a.inner === b.inner);`,
            options: ["true", "false", "undefined", "It throws an error"],
            answerIndex: 0,
            explanation:
              "Spread copied the reference to inner, not inner itself. Both objects point at the same inner object, so it's true.",
          },
        ],
        recap: "Spread { ...obj } is a shallow copy. Nested objects and arrays are still shared.",
      },
      {
        id: "deep-copy",
        title: "Deep copies with structuredClone",
        guess: {
          question: "In JavaScript, what do you think this prints?",
          code: `const user = { name: "Sam", tags: ["a"] };\nconst deep = structuredClone(user);\ndeep.tags.push("b");\nconsole.log(user.tags);`,
          options: ['["a"]', '["a", "b"]', "undefined", "It throws an error"],
          answerIndex: 0,
          reveal:
            "structuredClone copies nested data too, so deep.tags is a separate array. Pushing to it leaves user.tags alone.",
        },
        workedExample: {
          code: `const user = { name: "Sam", tags: ["a"] };\nconst deep = structuredClone(user);\ndeep.tags.push("b");\nconsole.log(user.tags); // ["a"]\nconsole.log(deep.tags); // ["a", "b"]`,
          walkthrough: [
            "structuredClone(user) copies user and everything nested inside it.",
            "deep.tags is its own array, so pushing to it doesn't affect user.tags.",
            "Use it when you need a fully independent copy. For a flat object with no nested data, spread is enough.",
          ],
        },
        check: {
          prompt: "In JavaScript, fill in the blank to make a fully independent copy, including nested data.",
          code: `const user = { name: "Sam", tags: ["a"] };\nconst deep = ___(user);`,
          options: ["Object.assign", "structuredClone", "Object.freeze", "Object.create"],
          answerIndex: 1,
          explanation:
            "structuredClone makes a deep copy. Spread and Object.assign copy only the top level, Object.freeze only blocks edits, and Object.create doesn't copy anything: it makes a new object that points back at the original.",
        },
        explain: {
          question: "How would you make a fully independent copy of a nested object?",
          starter: "I'd use structuredClone, because…",
          modelAnswer: "I'd use structuredClone(obj). It makes a deep copy, so nested objects and arrays are copied too and the copy shares nothing with the original. Spread and Object.assign only copy the top level, so nested data would still be shared. It has limits: it throws an error on functions, and class instances come back as plain objects. JSON.parse(JSON.stringify(obj)) also works for plain data, but it turns Dates into strings, drops functions and undefined values in objects, and turns Maps and Sets into empty objects.",
          keyPoints: ["structuredClone makes a deep copy, nested data included", "Spread and Object.assign are shallow", "Its limits: it throws on functions, and class instances come back as plain objects"],
        },
        reteach: {
          steps: [
            "A shallow copy makes the top level new, but nested objects are still shared. A deep copy copies the nested ones too.",
            "Object.assign works like spread: shallow. Object.freeze doesn't copy at all, it only blocks edits.",
            "structuredClone is built in and copies nested objects, arrays and Dates.",
            "It has limits: it throws an error if the object contains a function, and class instances come back as plain objects.",
          ],
        },
        retries: [
          {
            prompt:
              "In JavaScript, you have settings = { theme: { dark: true } } and want a copy you can change without touching the original. Which is safest?",
            options: ["{ ...settings }", "settings", "structuredClone(settings)", "Object.assign({}, settings)"],
            answerIndex: 2,
            explanation:
              "Spread and Object.assign would share the theme object, and plain settings isn't a copy at all. structuredClone copies theme too.",
          },
          {
            prompt: "In JavaScript, what does this print?",
            code: `const a = { list: [1] };\nconst b = structuredClone(a);\nb.list.push(2);\nconsole.log(a.list.length);`,
            options: ["1", "2", "0", "It throws an error"],
            answerIndex: 0,
            explanation: "b.list is a separate array, so pushing to it doesn't change a.list. Its length is still 1.",
          },
        ],
        recap: "Use structuredClone(obj) when you need a deep copy.",
      },
    ],
  },
  {
    id: "map-vs-object",
    track: "javascript",
    topic: "maps-sets",
    title: "Using Map and Set",
    minutes: 6,
    reviewed: true,
    intro: {
      summary: "When to reach for a Map or a Set instead of a plain object or array.",
      outcomes: ["Explain how Map keys differ from object keys", "Use the main Map methods", "Remove duplicates with a Set"],
    },
    ideas: [
      {
        id: "map-keys",
        title: "Map keys keep their type",
        guess: {
          question: "In JavaScript, what do you think this prints?",
          code: `const m = new Map();\nm.set(1, "a");\nm.set("1", "b");\nconsole.log(m.size);`,
          options: ["1", "2", "0", "It throws an error"],
          answerIndex: 1,
          reveal:
            'A Map keeps keys as they are, so the number 1 and the string "1" are different keys. A plain object would turn both into the string "1".',
        },
        workedExample: {
          code: `const m = new Map();\nm.set(1, "a");\nm.set("1", "b");\nconsole.log(m.size);   // 2\nconsole.log(m.get(1)); // "a"`,
          walkthrough: [
            'A Map keeps each key as it is, so the number 1 and the string "1" are two separate keys.',
            "m.get(1) finds the entry stored under the number.",
            'A plain object would turn both keys into the string "1", and the second would overwrite the first.',
          ],
        },
        check: {
          prompt: "In JavaScript, what does this print?",
          code: `const m = new Map();\nm.set(true, "yes");\nm.set("true", "no");\nconsole.log(m.size);`,
          options: ["1", "2", "0", "It throws an error"],
          answerIndex: 1,
          explanation: 'The boolean true and the string "true" are different keys, so the Map holds two entries.',
        },
        explain: {
          question: "When would you pick a Map over a plain object?",
          starter: "I'd pick a Map when my keys…",
          modelAnswer: "I'd pick a Map when the keys aren't plain strings, or when I add and remove entries a lot. Object keys can only be strings or symbols, so numbers and other types get converted to strings: 1 and \"1\" end up as the same key, but a Map keeps keys as they are, so numbers, booleans and even objects work as keys. A Map also has a built-in size.",
          keyPoints: ["Object keys are strings (or symbols), so other types get converted", "A Map keeps keys as they are, of any type", "A Map has .size and is built for frequent adds and removes"],
        },
        reteach: {
          steps: [
            "Object keys can only be strings or symbols. Any other key, like a number, is converted to a string.",
            "Map keys can be anything: numbers, booleans, even objects. They are compared as they are.",
            "That's the main reason to pick a Map when your keys aren't plain strings.",
          ],
          code: `const o = {};\no[1] = "a";\nconsole.log(Object.keys(o)); // ["1"]  (a string now)`,
        },
        retries: [
          {
            prompt: "In JavaScript, what does this print?",
            code: `const o = {};\no[2] = "x";\no["2"] = "y";\nconsole.log(o[2]);`,
            options: ['"x"', '"y"', "undefined", "It throws an error"],
            answerIndex: 1,
            explanation: 'The number 2 becomes the string "2", the same key as the second line, so "y" overwrites "x".',
          },
          {
            prompt: "In JavaScript, what does this print?",
            code: `const k = { id: 1 };\nconst m = new Map();\nm.set(k, "found");\nconsole.log(m.get(k));`,
            options: ['"found"', "undefined", '"[object Object]"', "It throws an error"],
            answerIndex: 0,
            explanation: "A Map can use an object as a key and looks it up by that exact object, so it finds the entry.",
          },
        ],
        recap: "Map keys can be any type and stay as they are. Object keys are strings (or symbols), so other types get converted.",
      },
      {
        id: "map-methods",
        title: "Working with a Map",
        guess: {
          question: "In JavaScript, what do you think this prints?",
          code: `const counts = new Map();\ncounts.set("a", 1);\nconsole.log(counts.get("b") ?? 0);`,
          options: ["undefined", "0", "null", "It throws an error"],
          answerIndex: 1,
          reveal:
            "get returns undefined for a key that isn't there. ?? replaces undefined (or null) with the fallback, so this prints 0.",
        },
        workedExample: {
          code: `const counts = new Map();\nfor (const w of ["a", "b", "a"]) {\n  counts.set(w, (counts.get(w) ?? 0) + 1);\n}\nconsole.log(counts.get("a")); // 2\nconsole.log(counts.size);     // 2`,
          walkthrough: [
            "counts.get(w) returns undefined the first time, so ?? 0 starts the count at zero.",
            "counts.set(w, ...) stores the new count under that word.",
            "counts.size gives the number of keys directly. No Object.keys(...).length needed.",
          ],
        },
        check: {
          prompt: 'In JavaScript, fill in the blank to check whether the key "b" exists in the Map.',
          code: `const counts = new Map([["a", 2], ["b", 1]]);\ncounts.___("b")`,
          options: ["has", "includes", "contains", "exists"],
          answerIndex: 0,
          explanation: "Map has has(key). includes is for arrays and strings. contains and exists aren't Map methods.",
        },
        explain: {
          question: "How would you count how many times each word appears in a list, using a Map?",
          starter: "I'd loop over the words and, for each one…",
          modelAnswer: "I'd create a Map and loop over the words. For each word I'd read the current count with counts.get(word), use ?? 0 to start at zero if it isn't there yet, add one, and store it with counts.set(word, newCount). At the end counts.get(\"a\") gives the count for a word, and counts.size gives the number of different words.",
          keyPoints: ["Loop over the items and keep the counts in a Map", "get(word) ?? 0 handles a word that hasn't been seen yet", "set(word, count + 1) stores the new count; size is the number of different words"],
        },
        reteach: {
          steps: [
            "A Map has its own methods: set to add or change an entry, get to read one, has to check, delete to remove.",
            "includes belongs to arrays and strings, so a Map doesn't have it.",
            "size is a property, not a method: counts.size, with no parentheses.",
          ],
          code: `const m = new Map([["a", 1]]);\nm.has("a");    // true\nm.get("a");    // 1\nm.delete("a");\nm.size;        // 0`,
        },
        retries: [
          {
            prompt: 'In JavaScript, fill in the blank to remove the key "a".',
            code: `const counts = new Map([["a", 2], ["b", 1]]);\ncounts.___("a");`,
            options: ["remove", "delete", "clear", "pop"],
            answerIndex: 1,
            explanation: "delete(key) removes one entry. clear() removes everything. remove and pop aren't Map methods.",
          },
          {
            prompt: "In JavaScript, how do you get the number of entries in the Map called counts?",
            code: `const counts = new Map([["a", 2], ["b", 1]]);`,
            options: ["counts.size", "counts.length", "counts.size()", "counts.count"],
            answerIndex: 0,
            explanation: "size is a property on Maps, so there are no parentheses. length is for arrays.",
          },
        ],
        recap: "Map has .size, .has(), .get(), .set() and .delete(), and is built for frequent adds and removes.",
      },
      {
        id: "set-unique",
        title: "Set stores unique values",
        guess: {
          question: "In JavaScript, what do you think this prints?",
          code: `console.log(new Set([1, 2, 2, 3]).size);`,
          options: ["4", "3", "2", "It throws an error"],
          answerIndex: 1,
          reveal: "A Set keeps each value once, so the extra 2 is dropped and the size is 3.",
        },
        workedExample: {
          code: `const tags = ["a", "b", "a", "c", "b"];\nconst unique = [...new Set(tags)];\nconsole.log(unique); // ["a", "b", "c"]`,
          walkthrough: [
            "new Set(tags) keeps only the first copy of each value.",
            "A Set can be spread, so [...set] turns it back into an array.",
            "This is a common way to remove duplicates from an array.",
          ],
        },
        check: {
          prompt: "In JavaScript, fill in the blank to remove the duplicates from nums.",
          code: `const nums = [1, 2, 2, 3];\nconst unique = [...new ___(nums)];`,
          options: ["Map", "Set", "Array", "Object"],
          answerIndex: 1,
          explanation: "A Set stores each value only once. Spreading it back out gives an array without the repeats.",
        },
        explain: {
          question: "How do you remove duplicates from an array?",
          starter: "I'd put the array into a Set, because…",
          modelAnswer: "I'd put the array into a Set, because a Set only keeps each value once, and then spread it back into an array: [...new Set(arr)]. That drops the repeats and keeps the first occurrence of each value, in its original order. A Set is also a good fit when I just need to check whether I've seen a value before.",
          keyPoints: ["A Set stores each value only once", "Spread the Set back into an array: [...new Set(arr)]", "It keeps the first occurrence of each value, in order"],
        },
        reteach: {
          steps: [
            "A Set is a collection with no repeats. Adding a value that's already there does nothing.",
            "That makes it a good fit for 'have I seen this before?', because has() is quick.",
            "You can build one from any list: new Set([1, 1, 2]) holds 1 and 2.",
          ],
          code: `const s = new Set();\ns.add(1);\ns.add(1);\nconsole.log(s.size); // 1`,
        },
        retries: [
          {
            prompt: "In JavaScript, what does this print?",
            code: `const s = new Set();\ns.add("a");\ns.add("b");\ns.add("a");\nconsole.log(s.size);`,
            options: ["3", "2", "1", "0"],
            answerIndex: 1,
            explanation: 'The second "a" is ignored, so the Set holds just "a" and "b".',
          },
          {
            prompt: "In JavaScript, what does this evaluate to?",
            code: `[...new Set("banana")]`,
            options: ['["b", "a", "n"]', '["b", "a", "n", "a", "n", "a"]', '["a", "b", "n"]', '"ban"'],
            answerIndex: 0,
            explanation:
              "A string can be looped over letter by letter. The Set keeps the first of each, in the order they first appeared: b, a, n.",
          },
        ],
        recap: "Set stores unique values: new Set([1, 2, 2, 3]).size is 3.",
      },
    ],
  },
];

// Telling your story comes first: "tell me about yourself" is how most interviews begin.
export const lessons: Lesson[] = [...communicationLessons, ...codeLessons, ...depthLessons];
