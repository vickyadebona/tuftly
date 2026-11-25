import type { Drill, Lesson } from "../lib/types";

// AI-drafted, then marked reviewed. Content about follow-up questions that ask for more depth:
// how something works, where a rule is enforced, what breaks. New additions start unreviewed.
// The examples use an invented online shop.

const answerDepth: Lesson = {
  id: "answer-depth",
  track: "communication",
  topic: "depth",
  title: "Go one level deeper",
  minutes: 6,
  reviewed: true,
  intro: {
    summary: "How to turn a correct but thin technical answer into one that shows you understand it.",
    outcomes: ["Explain how something works, not only what it's called", "Say when you'd choose it and what goes wrong otherwise"],
  },
  ideas: [
    {
      id: "depth-mechanism",
      title: "Say how it works",
      guess: {
        question: "In an interview you're asked, “What does a database index do?” Which answer shows the most understanding?",
        options: [
          "It's a separate structure, usually sorted, so the database can jump to matching rows without reading every one. Writes get a bit slower because it has to be updated too.",
          "It makes the database faster.",
          "It's something I add when a query is slow.",
          "It's a best practice for production databases.",
        ],
        answerIndex: 0,
        reveal: "It says what happens underneath and what it costs. The others could be said by someone who has only heard the word.",
      },
      workedExample: {
        sample:
          "“An index is a separate structure, usually sorted, that points back to the rows. So a lookup by email can go straight to the match instead of reading the whole table. I'd add one for columns we search often. The cost is extra storage and slower writes, so I wouldn't index everything.”",
        walkthrough: [
          "What: one sentence that names the thing.",
          "How: what actually happens when it's used.",
          "When: the situation where you'd choose it.",
          "What breaks or costs: the downside of using it, or of not using it.",
        ],
      },
      check: {
        prompt: "In an interview, a candidate says, “Caching makes pages load faster.” What would add the most depth?",
        options: [
          "Saying it again with more confidence",
          "Saying what gets stored, where, and what happens when the data changes",
          "Listing five caching tools",
          "Saying that every big company uses it",
        ],
        answerIndex: 1,
        explanation: "How it works and what can go wrong (stale data) show understanding. A list of names doesn't.",
      },
      explain: {
        question: "Pick a tool or technique you've used. What does it do, and how?",
        starter: "… is … . Under the hood it …",
        modelAnswer:
          "Debouncing means waiting until the user stops doing something before acting. Each keystroke cancels the previous timer and starts a new one, so the search request only goes out after a short pause. I'd use it on a search box. The cost is a small delay, so I wouldn't use it where the response must be instant.",
        keyPoints: ["Names it in one sentence", "Explains what happens underneath", "Says when you'd use it", "Names a cost or a way it fails"],
      },
      reteach: {
        steps: [
          "A name shows you've met the idea. The mechanism shows you understand it.",
          "Ask yourself “and then what happens?” until you can describe the steps.",
          "Finish with one cost or limit.",
        ],
      },
      retries: [
        {
          prompt: "In an interview answer about HTTPS, which one explains a mechanism rather than just making a claim?",
          options: [
            "HTTPS is secure.",
            "HTTPS is the modern standard.",
            "HTTPS encrypts the connection, and a certificate lets the browser check which server it's talking to.",
            "HTTPS is important for users.",
          ],
          answerIndex: 2,
          explanation: "It says what happens: encryption, plus a check of the server's identity.",
        },
        {
          prompt: "In an interview, you don't know how something works underneath. What's the best move?",
          options: [
            "Invent a plausible explanation",
            "Change the subject",
            "Repeat the name of the tool",
            "Say what you do know, say where your knowledge stops, and how you'd find out",
          ],
          answerIndex: 3,
          explanation: "Being clear about the edge of your knowledge is honest, and a made-up mechanism is easy to catch with one follow-up.",
        },
      ],
      recap: "Answer in four beats: what it is, how it works, when you'd use it, what it costs or breaks.",
    },
    {
      id: "depth-tradeoff",
      title: "Name the tradeoff",
      guess: {
        question: "In an interview about a shop you built you're asked, “Why did you store the cart in the database?” Which answer is strongest?",
        options: [
          "Shoppers needed to keep their cart across devices. Browser storage was simpler but stays on one device, so I accepted the extra requests.",
          "That's how I usually do it.",
          "Databases are better than browser storage.",
          "The tutorial did it that way.",
        ],
        answerIndex: 0,
        reveal: "It gives the need, the other option, and what was given up to get it.",
      },
      workedExample: {
        sample:
          "“Shoppers moved between phone and laptop, so the cart had to follow them. I considered keeping it in the browser, which is simpler and needs no requests, but it stays on one device. I stored it in the database. If nobody signed in, I'd have kept it in the browser.”",
        walkthrough: [
          "Problem: the need or limit that forced a choice.",
          "Options: at least one real alternative, with what was good about it.",
          "Choice and cost: what you picked and what you gave up.",
          "What would change your mind: shows it was a decision, not a habit.",
        ],
      },
      check: {
        prompt: "In an interview, what is missing from the answer “I chose server rendering because it's faster”?",
        options: [
          "The version number of the framework",
          "The alternative, and what you gave up",
          "How long you have used it",
          "Nothing, it is complete",
        ],
        answerIndex: 1,
        explanation: "A choice only makes sense next to what else you could have done and what it cost.",
      },
      explain: {
        question: "Tell me about a technical decision you made and why.",
        starter: "We needed … . I could have … , but …",
        modelAnswer:
          "We needed product pages to show up in search. I could have rendered everything in the browser, which was simpler to host, but the first load showed an empty page. I rendered product pages on the server and accepted the extra setup. For a private dashboard I'd have stayed with the browser.",
        keyPoints: ["Starts with the need or constraint", "Names an alternative fairly", "Says what you gave up", "Says what would change your choice"],
      },
      reteach: {
        steps: [
          "Every real choice has a loser. Name it, and say what was good about it.",
          "Tie the choice to a need in this project, not to what is generally popular.",
        ],
      },
      retries: [
        {
          prompt: "In an interview answer about a design choice, which phrase signals a tradeoff?",
          options: ["“It's the best one.”", "“Everyone uses it.”", "“We gave up some simplicity to get offline support.”", "“I like it.”"],
          answerIndex: 2,
          explanation: "It names both what was gained and what it cost.",
        },
        {
          prompt: "After you explain a design choice, the interviewer asks, “When would you not do that?” What are they checking?",
          options: [
            "Whether you'll take your answer back",
            "Whether you memorised the documentation",
            "Whether you can talk for longer",
            "Whether you know the limits of your choice",
          ],
          answerIndex: 3,
          explanation: "Knowing when a choice stops being right shows you chose it for a reason.",
        },
      ],
      recap: "Problem, options, choice, what you gave up, and what would change your mind.",
    },
  ],
};

const propertyLookup: Lesson = {
  id: "property-lookup",
  track: "javascript",
  topic: "objects",
  title: "How property lookup works",
  minutes: 6,
  reviewed: true,
  intro: {
    summary: "Where JavaScript looks when you read a property, and what happens when you write one.",
    outcomes: ["Explain the prototype chain", "Tell own properties apart from inherited ones"],
  },
  ideas: [
    {
      id: "proto-chain",
      title: "Reading walks the chain",
      guess: {
        question: "In JavaScript, what does this print?",
        code: `const base = { greeting: "hi" };\nconst child = Object.create(base);\nconsole.log(child.greeting);`,
        options: ['"hi"', "undefined", "It throws an error"],
        answerIndex: 0,
        reveal: "child has no greeting of its own, so JavaScript looks at its prototype, base, and finds it there.",
      },
      workedExample: {
        code: `const base = { greeting: "hi" };\nconst child = Object.create(base);\nconsole.log(child.greeting); // hi\nchild.greeting = "yo";\nconsole.log(child.greeting); // yo\nconsole.log(base.greeting); // hi`,
        walkthrough: [
          "A read checks the object itself first, then its prototype, then that one's prototype, until it reaches null.",
          "A plain assignment doesn't change the prototype. It creates a property on child that hides (shadows) the inherited one.",
          "A setter or a read-only property higher up the chain changes what an assignment does.",
        ],
      },
      check: {
        prompt: "In JavaScript, what does this print?",
        code: `const defaults = { size: "M" };\nconst order = Object.create(defaults);\norder.size = "L";\nconsole.log(defaults.size);`,
        options: ['"L"', '"M"', "undefined"],
        answerIndex: 1,
        explanation: "The assignment created a size on order. defaults was not touched.",
      },
      explain: {
        question: "What happens when you read a property that isn't on the object?",
        starter: "JavaScript first checks the object itself, then …",
        modelAnswer:
          "JavaScript checks the object's own properties first. If it isn't there, it follows the object's prototype and looks there, and keeps going up the chain until it reaches null. If nothing has it, the result is undefined. Assigning is different: it normally creates a property on the object itself.",
        keyPoints: ["Own properties are checked first", "Then the prototype chain, ending at null", "Missing everywhere gives undefined", "Assignment normally creates an own property"],
      },
      reteach: {
        steps: [
          "Picture each object holding a link to a backup object.",
          "Reading follows the links. Writing normally stays on the object you wrote to.",
        ],
        code: `const parent = { colour: "red" };\nconst kid = Object.create(parent);\nparent.colour = "blue";\nconsole.log(kid.colour); // blue`,
      },
      retries: [
        {
          prompt: "In JavaScript, what does this print?",
          code: `const a = { n: 1 };\nconst b = Object.create(a);\nconst c = Object.create(b);\nconsole.log(c.n);`,
          options: ["undefined", "It throws an error", "1"],
          answerIndex: 2,
          explanation: "The lookup goes from c to b to a, where n is found.",
        },
        {
          prompt: "In JavaScript, what does this print?",
          code: `const point = { x: 1 };\nconsole.log(point.y);`,
          options: ["undefined", "null", "It throws an error"],
          answerIndex: 0,
          explanation: "No object in the chain has y, so the result is undefined.",
        },
      ],
      recap: "Reads walk the prototype chain. Plain assignment creates an own property.",
    },
    {
      id: "own-property",
      title: "Own or inherited?",
      guess: {
        question: "In JavaScript, what does this print?",
        code: `const counts = {};\nconsole.log("toString" in counts);`,
        options: ["true", "false"],
        answerIndex: 0,
        reveal: "in checks the whole chain, and an object written with {} inherits toString from Object.prototype.",
      },
      workedExample: {
        code: `const counts = {};\nconsole.log("toString" in counts); // true\nconsole.log(Object.hasOwn(counts, "toString")); // false\nconst safe = new Map();\nconsole.log(safe.has("toString")); // false`,
        walkthrough: [
          "in asks “is it anywhere in the chain?”",
          "Object.hasOwn asks “is it on this object itself?”",
          "A Map has no inherited keys, which makes it a good fit when keys come from users.",
        ],
      },
      check: {
        prompt: "In JavaScript, you need to know if a word a user typed was saved in a plain object. Which check is safe?",
        code: `const saved = { apple: 1 };\nconst word = "constructor";`,
        options: ["word in saved", "Object.hasOwn(saved, word)", "saved[word] !== undefined"],
        answerIndex: 1,
        explanation: "The other two also find the inherited constructor, even though nobody saved it.",
      },
      explain: {
        question: "When would you use a Map instead of a plain object?",
        starter: "I'd use a Map when the keys …",
        modelAnswer:
          "I use a plain object for a record with a known shape, like a product. I use a Map when keys are added at run time, especially from user input, because it has no inherited keys, accepts any type as a key and has a size. The catch is that it doesn't turn into JSON by itself.",
        keyPoints: ["Object for a known shape", "Map for keys added at run time", "Plain objects inherit keys from their prototype", "A Map needs converting for JSON"],
      },
      reteach: {
        steps: [
          "A plain object arrives with inherited names such as toString and constructor.",
          "Use Object.hasOwn to ignore them, or a Map to avoid them.",
        ],
      },
      retries: [
        {
          prompt: "In JavaScript, what does this print?",
          code: `const tally = {};\nconsole.log(Object.keys(tally).length);`,
          options: ["1", "undefined", "0"],
          answerIndex: 2,
          explanation: "Object.keys lists own enumerable string keys only. Inherited ones aren't counted.",
        },
        {
          prompt: "In JavaScript, what does this print?",
          code: `const bare = Object.create(null);\nconsole.log("toString" in bare);`,
          options: ["true", "false"],
          answerIndex: 1,
          explanation: "bare has no prototype, so there is nothing to inherit.",
        },
      ],
      recap: "in includes inherited properties. Object.hasOwn does not.",
    },
  ],
};

const typePrecision: Lesson = {
  id: "ts-precision",
  track: "typescript",
  topic: "typescript",
  title: "unknown, any, type and interface",
  minutes: 6,
  reviewed: true,
  intro: {
    summary: "Two common TypeScript questions, answered with what the compiler actually does.",
    outcomes: ["Explain why unknown is safer than any", "Say what interface can do that type can't, and the reverse"],
  },
  ideas: [
    {
      id: "unknown-any",
      title: "unknown makes you check",
      guess: {
        question: "In TypeScript, which line does the compiler reject?",
        code: `const loose: any = "hi";\nconst careful: unknown = "hi";`,
        options: ["careful.toUpperCase()", "loose.toUpperCase()", "Both lines", "Neither line"],
        answerIndex: 0,
        reveal: "any switches checking off. unknown accepts any value but won't let you use it until you've shown what it is.",
      },
      workedExample: {
        code: `function shout(input: unknown): string {\n  if (typeof input === "string") {\n    return input.toUpperCase();\n  }\n  return "not text";\n}`,
        walkthrough: [
          "Anything can be passed in, because every type fits into unknown.",
          "Inside the if, TypeScript narrows input to string, so toUpperCase is allowed.",
          "Use unknown for data from outside: parsed JSON, responses, caught errors. These checks happen at run time. A type annotation alone checks nothing at run time.",
        ],
      },
      check: {
        prompt: "In TypeScript, JSON.parse returns any. What is the safest way to hold its result?",
        options: ["Keep it as any", "Type it as unknown, then check its shape before use", "Cast it with “as User”", "Add a comment saying what it holds"],
        answerIndex: 1,
        explanation: "A cast only tells the compiler to believe you. A check proves it while the program runs.",
      },
      explain: {
        question: "What's the difference between unknown and any?",
        starter: "Both accept any value, but …",
        modelAnswer:
          "Both accept any value. With any, the compiler stops checking: I can call or index it however I like, and it spreads to whatever I assign it to. With unknown, I have to narrow it first, using typeof, instanceof, a type guard or a schema. I use unknown for anything coming from outside.",
        keyPoints: ["Both accept any value", "any turns checking off and spreads", "unknown must be narrowed before use", "Names a way to narrow", "Gives a real source of unknown data"],
      },
      reteach: {
        steps: ["any says “trust me”.", "unknown says “prove it first”."],
      },
      retries: [
        {
          prompt: "In TypeScript, which of these narrows a value typed as unknown?",
          options: ["A longer variable name", "Writing it to the console", "A typeof check", "Declaring it with const"],
          answerIndex: 2,
          explanation: "typeof is a run-time check that TypeScript understands.",
        },
        {
          prompt: "In a TypeScript app that fetches data, why is writing “as User” on a server response risky?",
          options: [
            "It slows the program down",
            "It changes the data",
            "It is a syntax error",
            "Nothing checks that the data really has that shape",
          ],
          answerIndex: 3,
          explanation: "The cast disappears when the code is compiled, so bad data gets through.",
        },
      ],
      recap: "any turns checking off. unknown makes you narrow before you use the value.",
    },
    {
      id: "interface-type",
      title: "interface or type",
      guess: {
        question: "In TypeScript, what happens with these two declarations?",
        code: `interface Cart { id: string }\ninterface Cart { total: number }`,
        options: ["They merge into one Cart", "The second replaces the first", "It is a duplicate name error"],
        answerIndex: 0,
        reveal: "Interfaces with the same name in the same scope merge. Two type aliases with the same name are an error.",
      },
      workedExample: {
        code: `interface Product { name: string }\ninterface Product { price: number }\nconst mug: Product = { name: "Mug", price: 12 };\n\ntype Size = "S" | "M" | "L";`,
        walkthrough: [
          "Both Product declarations count, so mug needs name and price. This is how you can add to a library's interface.",
          "Size is a union. An interface can't express that; type can, along with tuples, mapped and conditional types.",
          "Both can describe an object shape, be built on (extends for interface, & for type) and be used with implements. A class can't implement a union.",
        ],
      },
      check: {
        prompt: "In TypeScript, you need a status that is exactly “paid” or “refunded”. What do you write?",
        options: ["Two interfaces with the same name", "A type alias with a union", "A value typed as any"],
        answerIndex: 1,
        explanation: "Unions need type.",
      },
      explain: {
        question: "interface vs type: how do you choose?",
        starter: "Both can describe an object. The differences are …",
        modelAnswer:
          "Both can describe object shapes. Interfaces with the same name merge, which lets consumers add to a library's types. Type aliases can't merge, but they can name unions, tuples and computed types. I use interface for object contracts others may extend, and type for unions and composed types, and stay consistent with the codebase.",
        keyPoints: ["Both describe object shapes", "Interfaces merge, type aliases don't", "type can express unions and tuples", "Gives a rule you actually follow"],
      },
      reteach: {
        steps: ["Merging is what interface has and type doesn't.", "Unions are what type has and interface doesn't."],
      },
      retries: [
        {
          prompt: "In TypeScript, which one can name a tuple, such as a pair of numbers, directly?",
          options: ["type Pair = [number, number]", "interface Pair = [number, number]"],
          answerIndex: 0,
          explanation: "A type alias can name any type, including a tuple.",
        },
        {
          prompt: "In TypeScript, a library declares an interface and you need one more field on it. What lets you add it?",
          options: ["A type cast on every use", "Editing the installed package", "Declaration merging"],
          answerIndex: 2,
          explanation: "Declaring the interface again, in the right module or global scope, adds to it.",
        },
      ],
      recap: "interface merges. type names unions, tuples and computed types.",
    },
  ],
};

const whereRulesLive: Lesson = {
  id: "where-rules-live",
  track: "engineering",
  topic: "design",
  title: "Where do the rules live?",
  minutes: 6,
  reviewed: true,
  intro: {
    summary: "How to explain which checks belong in the browser, on the server and in the database.",
    outcomes: ["Say why the server must work out prices itself", "Choose rules the database should enforce"],
  },
  ideas: [
    {
      id: "server-decides",
      title: "The server decides",
      guess: {
        question: "In an online shop, the page sends the server the item and the total price when you pay. What's the problem?",
        options: ["A user can change the price before it's sent", "The request is too large", "Prices can't be sent as numbers", "There is no problem"],
        answerIndex: 0,
        reveal: "Anything sent from the browser can be edited. The server should receive the choices and work out the price itself.",
      },
      workedExample: {
        code: `const prices: Record<string, number> = { mug: 1200, shirt: 2500 };\n\n// Runs on the server. Amounts are in cents.\nfunction priceFor(item: string, quantity: number): number {\n  if (!Object.hasOwn(prices, item)) throw new Error("unknown item");\n  if (!Number.isInteger(quantity) || quantity < 1) throw new Error("bad quantity");\n  return prices[item] * quantity;\n}`,
        walkthrough: [
          "The browser sends only the item and quantity. The price comes from data the server controls.",
          "The server checks both inputs, even if the page already did.",
          "Browser checks are for quick feedback. Server checks are for safety.",
          "A pure function like this is easy to unit test.",
        ],
      },
      check: {
        prompt: "In an online shop, the order form already blocks a quantity of 0. Should the server check it too?",
        options: ["Yes, because requests can be sent without the form", "No, that repeats work", "Only on mobile"],
        answerIndex: 0,
        explanation: "The form is a convenience. The server can't assume a request came from it.",
      },
      explain: {
        question: "Where would you validate an order and calculate its price?",
        starter: "In the browser I'd … , but the server …",
        modelAnswer:
          "The browser validates for quick feedback, but I don't trust it. The server validates every request again and works out the price from its own data, using only the item and quantity sent. The database enforces rules that must never break. With a payment provider, the server sets the amount and confirms payment before fulfilling.",
        keyPoints: ["Browser checks are for the user's convenience", "Server validates again", "Server calculates the price", "Database backs up the important rules"],
      },
      reteach: {
        steps: ["Ask “what if someone skips my page and sends this request by hand?”", "Whatever must hold in that case belongs on the server or in the database."],
      },
      retries: [
        {
          prompt: "In an online shop, what should the browser send to the server when someone checks out?",
          options: ["The final price", "What they chose and how many", "The discount already applied to the price"],
          answerIndex: 1,
          explanation: "Choices go up. The server turns them into an amount.",
        },
        {
          prompt: "In a web app that validates a form in both places, why share one validation schema between browser and server?",
          options: [
            "So the server can skip validating",
            "So users can't read the rules",
            "So the rules are written once and don't drift apart",
          ],
          answerIndex: 2,
          explanation: "Both sides still run the check, from one definition.",
        },
      ],
      recap: "Browser checks help the user. The server decides, and calculates prices itself.",
    },
    {
      id: "db-rules",
      title: "The database holds the line",
      guess: {
        question: "In a web app with a database, two sign-up requests use the same email at the same moment. What reliably stops a duplicate account?",
        options: ["A unique constraint in the database", "A check in the form", "A server check that looks first, then inserts"],
        answerIndex: 0,
        reveal: "Both requests can look before either inserts. The database applies the constraint to every write.",
      },
      workedExample: {
        code: `const schema = \`\n  create table order_lines (\n    id bigint primary key,\n    order_id bigint not null references orders (id),\n    sku text not null,\n    quantity integer not null check (quantity > 0),\n    unique (order_id, sku)\n  );\n\`;`,
        walkthrough: [
          "not null and check refuse bad values.",
          "references refuses a line that points to an order that doesn't exist.",
          "unique stops the same product appearing twice in one order, even with requests arriving together.",
          "The server should catch the error and reply with a clear message.",
        ],
      },
      check: {
        prompt: "In an online shop's order system, “quantity must be above zero” must hold even when a one-off admin script writes data. Where does the rule go?",
        options: ["The form", "A check constraint in the database", "One API route"],
        answerIndex: 1,
        explanation: "Only the database sees every write, whichever code makes it.",
      },
      explain: {
        question: "If the server already validates, why add database constraints?",
        starter: "Because the server isn't the only …",
        modelAnswer:
          "Because rules in one route only protect that route. Scripts, new endpoints and bugs can write too, and two requests can pass the same check at once. Constraints such as not null, check, foreign keys and unique apply to every write. I keep them for rules that must never break, and handle their errors kindly.",
        keyPoints: ["Other code can write to the database", "Concurrent requests can both pass a check", "Names real constraint types", "Handles the error for the user"],
      },
      reteach: {
        steps: ["Application checks can be skipped or raced.", "A constraint is checked by the database itself on every write."],
      },
      retries: [
        {
          prompt: "In a database with orders and order lines, which constraint stops a line pointing at a deleted or missing order?",
          options: ["A default value", "An index on the quantity", "A foreign key"],
          answerIndex: 2,
          explanation: "A foreign key requires the referenced row to exist.",
        },
        {
          prompt: "In a shop's server, the payment provider can send the same webhook (a payment notice) twice. What helps you process it once?",
          options: ["Storing each event id with a unique constraint", "Asking users not to refresh", "Making the page load faster"],
          answerIndex: 0,
          explanation: "Record the id in the same transaction as the work. A repeat then fails to insert and can be ignored.",
        },
      ],
      recap: "Put must-never-break rules in the database: it sees every write.",
    },
  ],
};

const stableTests: Lesson = {
  id: "stable-tests",
  track: "engineering",
  topic: "testing",
  title: "Tests that don't flake",
  minutes: 6,
  reviewed: true,
  intro: {
    summary: "How to explain what makes a browser test give the same result every run. Examples use Playwright.",
    outcomes: ["Give each test its own data and control what varies", "Wait for what the user would see instead of a fixed time"],
  },
  ideas: [
    {
      id: "test-data",
      title: "Control what varies",
      guess: {
        question: "In an automated test suite, a test passes alone but fails when everything runs together. What's the likeliest cause?",
        options: ["The test file name", "Tests share data and change it for each other", "Too many assertions", "The browser window colour"],
        answerIndex: 1,
        reveal: "Shared accounts and records make results depend on what ran before, or alongside.",
      },
      workedExample: {
        sample:
          "“Each test creates its own user and order through the API, so it never depends on another test. I fix the clock and time zone where dates matter, and stand in a fake response for outside services I don't control. Then tests can run in any order, in parallel.”",
        walkthrough: [
          "Data: each test makes what it needs.",
          "Time and place: fix the clock, time zone and locale when results depend on them.",
          "Outside services: use their test mode or intercept the request.",
          "Roles: sign in once per role, save the signed-in state and reuse it.",
        ],
      },
      check: {
        prompt: "In end-to-end tests for an online shop, which setup is most reliable for a test that cancels an order?",
        options: [
          "Cancel whichever order is first in a shared account",
          "Create an order for this test, then cancel it",
          "Run it only after the checkout test",
        ],
        answerIndex: 1,
        explanation: "It owns its data, so nothing else can change the outcome.",
      },
      explain: {
        question: "How do you make end-to-end tests deterministic?",
        starter: "First, each test …",
        modelAnswer:
          "Each test sets up its own data, usually through the API, so order doesn't matter and they can run in parallel. I control anything that varies, like time, time zone and outside services. With several user roles, I sign in once per role and reuse the saved state. Most logic is tested lower down with unit tests.",
        keyPoints: ["Each test owns its data", "Controls time or outside services", "Tests don't depend on order", "Reuses signed-in state per role", "Keeps the browser suite small"],
      },
      reteach: {
        steps: ["Deterministic means the same inputs give the same result.", "List what could differ between runs, then fix or fake each one."],
      },
      retries: [
        {
          prompt: "In an automated test suite, one test fails only on the last day of the month. What should it control?",
          options: ["The screen size", "The number of retries", "The clock"],
          answerIndex: 2,
          explanation: "With a fixed date, the result no longer depends on when it runs.",
        },
        {
          prompt: "In a web app with unit tests and browser tests, where should most checks of a pricing calculation live?",
          options: ["In unit tests of the function", "In browser tests", "In manual testing"],
          answerIndex: 0,
          explanation: "Unit tests are fast and exact. A few browser tests confirm the pieces are connected.",
        },
      ],
      recap: "Give each test its own data and control time and outside services.",
    },
    {
      id: "test-waiting",
      title: "Wait for the result, not the clock",
      guess: {
        question: "In a browser test of a checkout page, the test sleeps for 3 seconds before looking for “Order placed”. What can go wrong?",
        options: [
          "Nothing, 3 seconds is always enough",
          "It fails on a slow run and wastes time on a fast one",
          "The page reloads",
        ],
        answerIndex: 1,
        reveal: "A fixed wait is a guess about speed. Waiting for the text itself adapts to each run.",
      },
      workedExample: {
        code: `import { test, expect } from "@playwright/test";\n\ntest("places an order", async ({ page }) => {\n  await page.goto("/checkout");\n  await page.getByRole("button", { name: "Pay" }).click();\n  await expect(page.getByText("Order placed")).toBeVisible();\n});`,
        walkthrough: [
          "getByRole finds the button the way a user would, so a styling change doesn't break the test.",
          "click waits until the button is ready to be clicked.",
          "This expect retries until the text shows or the time limit passes. No sleep is needed.",
          "For failures in CI, keep a trace so you can see what happened.",
        ],
      },
      check: {
        prompt: "In a browser test, results change from run to run because a list loads slowly. What is the better fix?",
        options: ["Add a longer sleep", "Delete the test", "Assert on the item you expect, and let the assertion retry", "Retry until it passes and move on"],
        answerIndex: 2,
        explanation: "Wait for the state you care about. Retries alone hide the cause.",
      },
      explain: {
        question: "How do you deal with flaky tests?",
        starter: "I start by finding out why …",
        modelAnswer:
          "I find the cause before changing anything, using the trace from the failed run. Usually it's timing or shared data. I replace fixed sleeps with assertions that retry, use locators based on roles or test ids, and give the test its own data. If it still flakes, I quarantine it and fix it, not ignore it.",
        keyPoints: ["Finds the cause first", "No fixed sleeps", "Uses stable locators", "Checks for shared data", "Doesn't leave flaky tests ignored"],
      },
      reteach: {
        steps: ["Ask what the user waits to see.", "Make the test wait for exactly that."],
      },
      retries: [
        {
          prompt: "In a browser test that needs to click a button, which way of finding it is least likely to break after a restyle?",
          options: ["A chain of CSS class names", "The third div on the page", "The button's role and name"],
          answerIndex: 2,
          explanation: "Role and name stay the same when layout and classes change.",
        },
        {
          prompt: "In your build pipeline, a test fails, then passes on its second retry. What does that tell you?",
          options: ["Something is unreliable and worth investigating", "It is fine", "The app is faster now"],
          answerIndex: 0,
          explanation: "A retry can keep the build moving, but the cause is still there.",
        },
      ],
      recap: "Wait for what the user sees, not for a number of seconds.",
    },
  ],
};

export const depthLessons: Lesson[] = [answerDepth, propertyLookup, typePrecision, whereRulesLive, stableTests];

type DepthDrill = Omit<Drill, "reviewed" | "kind">;
const drill = (d: DepthDrill): Drill => ({ ...d, kind: "pick-a-or-b", reviewed: true });

export const depthDrills: Drill[] = [
  drill({
    id: "d-dep-1",
    lessonId: "answer-depth",
    ideaId: "depth-mechanism",
    topic: "depth",
    prompt: "In a web interview you're asked, “What is lazy loading?” Which answer goes a level deeper?",
    options: ["It makes the site faster.", "It delays loading something until it's needed, so the first load downloads less. The user may see a short wait later."],
    answerIndex: 1,
    rubric: ["Says what happens underneath", "Names the benefit and the cost"],
    hint: "Which one could survive “how?”",
    sayIt: "Lazy loading waits to fetch something until it's needed. The first load is smaller, but there can be a short wait when the user reaches that part.",
  }),
  drill({
    id: "d-dep-2",
    lessonId: "answer-depth",
    ideaId: "depth-tradeoff",
    topic: "depth",
    prompt: "In an interview about your app's design you're asked, “Why a monolith?” Which answer shows a decision?",
    options: ["One person was building it, so one deploy was simpler than several services. We gave up scaling parts separately.", "Monoliths are good."],
    answerIndex: 0,
    rubric: ["Gives the constraint", "Says what was given up"],
    hint: "Look for what it cost.",
    sayIt: "I was building it alone, so one app and one deploy kept things simple. The cost is that I can't scale one part on its own, which didn't matter yet.",
  }),
  drill({
    id: "d-dep-3",
    lessonId: "property-lookup",
    ideaId: "proto-chain",
    topic: "objects",
    prompt: "In JavaScript, what does this print?",
    code: `const shared = { theme: "light" };\nconst mine = Object.create(shared);\nmine.theme = "dark";\ndelete mine.theme;\nconsole.log(mine.theme);`,
    options: ["undefined", '"light"'],
    answerIndex: 1,
    rubric: ["delete removes only the own property", "The lookup then finds the inherited one"],
    hint: "What is still on the prototype?",
    sayIt: "It prints light. Deleting removes my own theme, so the lookup falls through to the prototype again.",
  }),
  drill({
    id: "d-dep-4",
    lessonId: "property-lookup",
    ideaId: "own-property",
    topic: "objects",
    prompt: "In JavaScript, what does this print?",
    code: `const votes = {};\nconsole.log(typeof votes["constructor"]);`,
    options: ["function", "undefined"],
    answerIndex: 0,
    rubric: ["constructor is inherited from Object.prototype", "User-chosen keys can collide with inherited names"],
    hint: "An empty object still has a prototype.",
    sayIt: "It prints function, because constructor is inherited. For keys that users choose, I'd use a Map or check own properties.",
  }),
  drill({
    id: "d-dep-5",
    lessonId: "ts-precision",
    ideaId: "unknown-any",
    topic: "typescript",
    prompt: "In a TypeScript project with the strict setting on, you catch an error. Before reading its message, what should you do?",
    options: ["Read it directly", "Check that it is an Error, for example with instanceof"],
    answerIndex: 1,
    rubric: ["With strict on, the caught value is typed unknown", "Anything can be thrown, so narrow first"],
    hint: "Can only Error objects be thrown?",
    sayIt: "With TypeScript's strict setting, a caught value is unknown, since anything can be thrown. I check it's an Error before reading the message.",
  }),
  drill({
    id: "d-dep-6",
    lessonId: "ts-precision",
    ideaId: "interface-type",
    topic: "typescript",
    prompt: "In TypeScript, does this compile?",
    code: `type User = { id: string };\ntype User = { name: string };`,
    options: ["No, the name is declared twice", "Yes, the two merge"],
    answerIndex: 0,
    rubric: ["Type aliases don't merge", "Interfaces with the same name would"],
    hint: "Which of the two kinds can merge?",
    sayIt: "No. A type alias can only be declared once. With two interfaces of the same name, they'd merge instead.",
  }),
  drill({
    id: "d-dep-7",
    lessonId: "where-rules-live",
    ideaId: "server-decides",
    topic: "design",
    prompt: "At an online shop's checkout, a discount code is applied. Who should work out the final amount?",
    options: ["The browser, then send it", "The server, from the cart and the code"],
    answerIndex: 1,
    rubric: ["Browser values can be edited", "The server checks the code and calculates"],
    hint: "What could a user change before sending?",
    sayIt: "The server. The browser sends the cart and the code, and the server checks the code and calculates the amount, because anything from the browser can be edited.",
  }),
  drill({
    id: "d-dep-8",
    lessonId: "where-rules-live",
    ideaId: "db-rules",
    topic: "design",
    prompt: "In a database-backed app, usernames must be unique. What actually guarantees it?",
    options: ["A unique constraint in the database", "Checking availability while the user types"],
    answerIndex: 0,
    rubric: ["Two requests can pass a check together", "The constraint applies to every write"],
    hint: "Think of two people pressing submit at once.",
    sayIt: "A unique constraint. The live availability check is nice for the user, but two requests can pass it at the same time.",
  }),
  drill({
    id: "d-dep-9",
    lessonId: "stable-tests",
    ideaId: "test-data",
    topic: "testing",
    prompt: "In an end-to-end test suite, two tests edit the same account and sometimes fail when run in parallel. What's the fix?",
    options: ["Add more retries", "Give each test its own account"],
    answerIndex: 1,
    rubric: ["Shared state causes the failure", "Own data makes order and parallel runs safe"],
    hint: "What do the two tests share?",
    sayIt: "I'd give each test its own account. They fail because they change shared data, and retries would only hide that.",
  }),
  drill({
    id: "d-dep-10",
    lessonId: "stable-tests",
    ideaId: "test-waiting",
    topic: "testing",
    prompt: "In a browser test, a “Saved” message appears after a delay that varies. How should the test wait?",
    options: ["Assert the message is visible with a retrying assertion", "Sleep for five seconds"],
    answerIndex: 0,
    rubric: ["Fixed sleeps guess at speed", "A retrying assertion waits for the real state"],
    hint: "What are you actually waiting for?",
    sayIt: "I'd assert that the message is visible and let the assertion retry. A fixed sleep is too short on slow runs and wasteful on fast ones.",
  }),
];
