import type { Lesson } from "@/lib/types";

// AI-drafted starter content for the "Telling your story" unit. Set `reviewed: true` only after
// you've checked it. The examples use an invented front-end developer. They show the shape of an
// answer; learners are told to use their own real details, and never to invent results.
export const communicationLessons: Lesson[] = [
  {
    id: "pitch-basics",
    track: "communication",
    topic: "pitch",
    title: "Tell me about yourself",
    minutes: 6,
    reviewed: false,
    intro: {
      summary: "How to answer “tell me about yourself” in about a minute, using your own experience.",
      outcomes: ["Open with who you are, one recent highlight and what you want next", "Match your answer to what the role asks for", "Back up claims with what you did and what changed"],
    },
    ideas: [
      {
        id: "pitch-shape",
        title: "Present, past, future",
        guess: {
          question: "An interviewer says, “Tell me about yourself.” Which opening works best?",
          options: [
            "I grew up in a small town, and then I went to college where I studied a few different things…",
            "I'm a front-end developer with three years of experience building React apps. Most recently I worked on our checkout rebuild, and I'm looking for a team that cares about accessibility.",
            "Honestly, I'm not sure where to start. I've done a bit of everything.",
            "I'm a hard worker and a fast learner.",
          ],
          answerIndex: 1,
          reveal:
            "Start with who you are now, then a recent highlight, then what you're looking for. That tells the interviewer what you do and where you're headed in about a minute. A life story or a list of traits doesn't.",
        },
        workedExample: {
          sample:
            "“I'm a front-end developer with three years of experience building React apps. Most recently I worked on a rebuild of our checkout form that cut abandoned checkouts by 18%, and I owned the payment fields. Before that, I helped move our component library to TypeScript, and the whole team still uses it. I'm looking for a team where I can work on accessibility at a bigger scale, which is why this role caught my eye.”",
          walkthrough: [
            "Present: who you are and what you do now, in one sentence.",
            "Past: one or two relevant things you've done, with a result.",
            "Future: what you're looking for, and why it points at this role.",
          ],
        },
        check: {
          prompt: "Which sentence belongs in the “past” part of the pitch?",
          options: [
            "I'm a developer who loves learning new things.",
            "Last year I rebuilt our signup flow, which cut drop-off by 12%.",
            "I'd like to grow into a tech lead role.",
            "I studied computer science from 2016 to 2020.",
          ],
          answerIndex: 1,
          explanation:
            "The past part is a recent highlight with a result. The first is a trait, the third is about the future, and the fourth is background that rarely needs saying.",
        },
        explain: {
          question: "Tell me about yourself. (Use your own background.)",
          starter: "I'm a … with … of experience. Most recently I …",
          modelAnswer:
            "I'm a front-end developer with three years of experience building React apps. Most recently I worked on a rebuild of our checkout form that cut abandoned checkouts by 18%, and I owned the payment fields. Before that, I helped move our component library to TypeScript, and the whole team still uses it. I'm looking for a team where I can work on accessibility at a bigger scale, which is why this role caught my eye.",
          keyPoints: [
            "Starts with who you are now",
            "Gives one recent highlight with a result",
            "Ends with what you want next, tied to this role",
            "Takes about a minute, not five",
          ],
        },
        reteach: {
          steps: [
            "Think of it as a few short sentences: who you are now, one or two things you've done, and what you want next.",
            "It's a headline, not a biography. They can ask for more detail afterwards.",
            "Aim for about 30 to 60 seconds, which is roughly 70 to 150 words.",
          ],
        },
        retries: [
          {
            prompt: "About how long should a “tell me about yourself” answer be?",
            options: [
              "About 30 to 60 seconds",
              "Five minutes, so nothing is missed",
              "Ten seconds",
              "As long as it takes to cover your whole career",
            ],
            answerIndex: 0,
            explanation:
              "Under a minute is enough for who you are, a highlight and what you want. They'll ask for more if they want it.",
          },
          {
            prompt:
              "“I'm a backend developer with five years of experience. I'm looking for a role where I can work on payments.” Which part is missing?",
            options: ["The present", "The past: something you've done", "The future", "Nothing, it's complete"],
            answerIndex: 1,
            explanation:
              "It says who you are and what you want, but gives no example of what you've done. One recent highlight with a result fills the gap.",
          },
        ],
        recap: "Open with who you are now, add one recent highlight with a result, then say what you want next. About a minute.",
      },
      {
        id: "pitch-match",
        title: "Match it to the role",
        guess: {
          question:
            "The job description asks for “experience with React and accessibility.” You've worked on many projects. What do you lead with?",
          options: [
            "All of them, in the order you did them",
            "The projects that show React and accessibility",
            "Your favourite project, even if it's unrelated",
            "Only how many years you've worked",
          ],
          answerIndex: 1,
          reveal:
            "Pick the two or three things the role asks for and talk about the experience that matches them. The interviewer is listening for a fit, not a full history.",
        },
        workedExample: {
          sample:
            "“The role is about building accessible interfaces in React. At my last job I made our form components keyboard-friendly and tested them with a screen reader, and I fixed 40 issues from an accessibility audit. That's the kind of work I'd like to keep doing here.”",
          walkthrough: [
            "Read the description and underline two or three things it asks for.",
            "For each one, find something you really did that matches, and say what changed because of it.",
            "Use the same words the description uses, so the interviewer can hear the match.",
          ],
        },
        check: {
          prompt: "The role asks for “building data dashboards.” Which line from your background fits best?",
          options: [
            "I'm a quick learner and I enjoy new challenges.",
            "I built a sales dashboard in React that 40 people check every morning.",
            "I've worked on a few different things over the years.",
            "I've always been interested in data.",
          ],
          answerIndex: 1,
          explanation:
            "It names what you built and who uses it, which matches the ask directly. The others are traits or interests, with nothing the interviewer can check.",
        },
        explain: {
          question: "Why do you think you're a good fit for this role? (Answer from the job description in front of you.)",
          starter: "The role asks for … and I've …",
          modelAnswer:
            "The role asks for experience building accessible React interfaces. At my last job I made our form components keyboard-friendly and tested them with a screen reader, and I fixed 40 issues from an accessibility audit. It's also why I'm interested in this team: the work looks like more of the same, at a bigger scale.",
          keyPoints: [
            "Names two or three things the role asks for",
            "Matches each one to something you actually did",
            "Says what changed or what the result was",
            "Uses the role's own words",
          ],
        },
        reteach: {
          steps: [
            "A job description is a list of what they need. Your job is to show where you already have it.",
            "Pick two or three items. More than that and the answer turns into a list.",
            "For each one: say what they need, what you did that matches, and what came of it.",
          ],
        },
        retries: [
          {
            prompt: "The role needs “someone who can improve page speed.” Which answer matches?",
            options: [
              "I enjoy working on performance when I get the chance.",
              "I cut our page load from 4 seconds to 1.5 by compressing images and splitting the bundle.",
              "I've used lots of tools and frameworks.",
              "I'm happy to learn performance if needed.",
            ],
            answerIndex: 1,
            explanation:
              "It gives a specific thing you did and a result. The others show interest or willingness, but not that you've done it.",
          },
          {
            prompt: "How many things from the job description should you aim to match in a short answer?",
            options: ["Two or three", "All of them", "Just one", "As many as fit in five minutes"],
            answerIndex: 0,
            explanation:
              "Two or three is enough to show fit and still be clear. A long list is hard to follow, and it invites questions about parts you've only touched.",
          },
        ],
        recap: "Pick two or three things the role asks for and match each to something you've really done, with a result.",
      },
      {
        id: "pitch-evidence",
        title: "Show it with a result",
        guess: {
          question: "Which of these is the strongest thing to say?",
          options: [
            "I'm a strong problem solver and a great teammate.",
            "I cut our build time from 12 minutes to 4 by caching dependencies, and the whole team now uses it.",
            "I worked on the build system.",
            "I'm passionate about developer tools.",
          ],
          answerIndex: 1,
          reveal:
            "A specific thing you did, with a number or an outcome, is something the interviewer can picture and check. Words like “strong” and “passionate” are easy to say and hard to believe.",
        },
        workedExample: {
          sample:
            "Weaker: “I'm good at performance.”\n\nStronger: “I cut our page load from 4 seconds to 1.5 by compressing images and splitting the bundle, and our bounce rate dropped.”",
          walkthrough: [
            "The weaker version is a claim. The stronger one is evidence.",
            "Good evidence has three parts: what you did, how, and what changed.",
            "If you don't have an exact number, say what changed instead, like “the support tickets about it stopped.” Don't invent a figure.",
          ],
        },
        check: {
          prompt: "Which version is the strongest?",
          options: [
            "I improved the app's performance.",
            "I'm very good at making things fast.",
            "I cut the page load from 4s to 1.5s by compressing images.",
            "I worked on performance for a while.",
          ],
          answerIndex: 2,
          explanation:
            "It says what you did, how, and by how much. The others describe the topic without showing a result.",
        },
        explain: {
          question: "What's something you've built that you're proud of?",
          starter: "I built …, and the result was …",
          modelAnswer:
            "I built a sales dashboard in React that the whole sales team checks each morning. Before it, they pieced numbers together from three spreadsheets, so I pulled them into one view and added filters by region. They told me it saved them about an hour a week, and it's still in use a year later.",
          keyPoints: [
            "Says what you built and who uses it",
            "Says how or why you built it that way",
            "Gives a result, with a number or a clear outcome",
            "Only claims what's true and checkable",
          ],
        },
        reteach: {
          steps: [
            "A claim says you're good at something. Evidence shows it.",
            "Use this shape: what you did, how you did it, what changed.",
            "If you don't have a number, describe the change. Never make up a figure: interviewers often ask how you measured it.",
          ],
        },
        retries: [
          {
            prompt: "You don't have an exact number for your result. What's the best thing to do?",
            options: [
              "Estimate a number that sounds good",
              "Describe what changed, for example “the support tickets about it stopped”",
              "Skip the result entirely",
              "Say the result was huge",
            ],
            answerIndex: 1,
            explanation:
              "A real, describable change is honest and still gives evidence. An invented number can fall apart when the interviewer asks how you measured it.",
          },
          {
            prompt: "Which line is a claim rather than evidence?",
            options: [
              "I'm excellent at debugging.",
              "I traced a memory leak to an unclosed event listener and fixed it.",
              "I reduced crash reports by 30%.",
              "I added caching, which cut API calls in half.",
            ],
            answerIndex: 0,
            explanation: "“Excellent at debugging” is a claim. The other three say what was done or what changed.",
          },
        ],
        recap: "Back every claim with what you did and what changed. Never invent a number.",
      },
    ],
  },
  {
    id: "pitch-followups",
    track: "communication",
    topic: "experience",
    title: "When they dig into your experience",
    minutes: 6,
    reviewed: false,
    intro: {
      summary: "What to do when the interviewer starts digging into your experience.",
      outcomes: ["Say clearly what you personally did", "Walk through a project from situation to result", "Answer honestly about gaps and mistakes"],
    },
    ideas: [
      {
        id: "own-your-part",
        title: "Say what you did",
        guess: {
          question: "The interviewer asks, “What was your part in that project?” Which answer is better?",
          options: [
            "We built it as a team and it went really well.",
            "Three of us built it. I owned the search feature: I designed the API and built the screen.",
            "I did all of it myself.",
            "It was mostly the other developers.",
          ],
          answerIndex: 1,
          reveal:
            "Say what you personally owned and credit the team honestly. “We” on its own hides your part, and claiming everything usually falls apart under the next question.",
        },
        workedExample: {
          sample:
            "“Three of us rebuilt the checkout form. My part was the payment form: I wrote the validation, set up the error messages and tested it with a screen reader. Another developer owned the API, and a designer handled the layout.”",
          walkthrough: [
            "Name the team size, so the scale is clear.",
            "Say what you owned, using “I”.",
            "Credit the rest with “we” or by role. It sounds confident and honest.",
          ],
        },
        check: {
          prompt: "Which answer is best when asked, “What was your role?”",
          options: [
            "We all worked on everything.",
            "I led the whole project.",
            "I owned the payment form, and worked with another developer and a designer on the rest.",
            "I helped out where I could.",
          ],
          answerIndex: 2,
          explanation:
            "It's specific about your part and honest about the team. “We all worked on everything” hides your part, and “helped out” undersells it.",
        },
        explain: {
          question: "What was your specific part in that project?",
          starter: "There were … of us. I owned …",
          modelAnswer:
            "There were three of us. I owned the payment form: I wrote the validation, designed the error messages and tested it with a screen reader. Another developer owned the API and a designer handled the layout, so I worked closely with both.",
          keyPoints: [
            "Gives the team size",
            "Says what you personally owned, using “I”",
            "Credits others honestly",
            "Names a concrete piece of work",
          ],
        },
        reteach: {
          steps: [
            "Interviewers ask this to find out what you personally did, not what the team did.",
            "Use “I” for your own work and “we” for shared work.",
            "Be specific: a feature, a fix or a decision, not a general sense of having been involved.",
          ],
        },
        retries: [
          {
            prompt: "You're asked what your part was. Which phrase is the weakest start?",
            options: [
              "I owned the search screen.",
              "We did a bit of everything.",
              "I wrote the API for it.",
              "I led the testing.",
            ],
            answerIndex: 1,
            explanation:
              "“We did a bit of everything” doesn't tell the interviewer what you did. Starting with something specific you owned does.",
          },
          {
            prompt: "If someone else did most of a project, what should you say?",
            options: [
              "Take credit for it, since you were there",
              "Say clearly what you did, and credit the others",
              "Say nothing about the team",
              "Say you weren't involved",
            ],
            answerIndex: 1,
            explanation:
              "Being honest about your part is more convincing than a bigger claim, and the next question usually checks it.",
          },
        ],
        recap: "Say what you personally owned. Use “I” for that and “we” for the rest.",
      },
      {
        id: "walk-through",
        title: "Walk me through a project",
        guess: {
          question: "The interviewer says, “Walk me through a project you worked on.” What order works best?",
          options: [
            "Result first, then jump around",
            "Context, your task, what you did, then the result",
            "Every technical detail, from the first commit",
            "Only the technologies you used",
          ],
          answerIndex: 1,
          reveal:
            "A simple order is: what the situation was, what you needed to do, what you did, and what happened. It's often called STAR: situation, task, action, result.",
        },
        workedExample: {
          sample:
            "“Our checkout form had a high drop-off rate, and I was one of three people asked to rebuild it. My job was the payment form. I watched session recordings, saw people getting stuck on the card fields, and rebuilt them with better validation and clearer errors. Drop-offs on the whole checkout fell by 18% over the next month.”",
          walkthrough: [
            "Situation: the context, in a sentence.",
            "Task: what you were responsible for.",
            "Action: what you did, with the details that show your skill. Result: what changed.",
          ],
        },
        check: {
          prompt: "Which line is the result?",
          options: [
            "Checkout drop-offs were high.",
            "My job was the payment form.",
            "I rebuilt the card fields with clearer errors.",
            "Drop-offs fell by 18% the following month.",
          ],
          answerIndex: 3,
          explanation:
            "The result says what changed afterwards. The first is the situation, the second the task and the third the action.",
        },
        explain: {
          question: "Walk me through a project you're proud of.",
          starter: "The situation was … My job was … I …",
          modelAnswer:
            "Our checkout form had a high drop-off rate, and I was one of three people asked to rebuild it. My job was the payment form. I watched session recordings, saw people getting stuck on the card fields, and rebuilt them with better validation and clearer errors. Drop-offs on the whole checkout fell by 18% over the next month. If I did it again, I'd test with real users earlier.",
          keyPoints: [
            "Sets the scene in a sentence",
            "Says what you were responsible for",
            "Describes what you did, in some detail",
            "Ends with a result",
          ],
        },
        reteach: {
          steps: [
            "Tell it like a short story with four beats: situation, task, action, result.",
            "Spend the most time on the action. That's where your skill shows.",
            "Finish with what changed, then stop. They'll ask more if they want it.",
          ],
        },
        retries: [
          {
            prompt: "Which part of a project walkthrough should get the most time?",
            options: ["The situation", "The action: what you did", "The result", "The team's background"],
            answerIndex: 1,
            explanation: "The action is where the interviewer learns how you work, so give it the most detail.",
          },
          {
            prompt: "Which part is missing? “The app was slow, and my job was to speed it up. I added caching and split the bundle.”",
            options: ["The situation", "The task", "The action", "The result"],
            answerIndex: 3,
            explanation:
              "It gives the problem and what you did, but not what changed afterwards. Add the result, such as how much faster it got.",
          },
        ],
        recap: "Walk through a project as situation, task, action, result, and spend the most time on the action.",
      },
      {
        id: "be-honest",
        title: "Gaps and what went wrong",
        guess: {
          question: "The interviewer asks, “Have you used GraphQL?” You haven't. What's the best answer?",
          options: [
            "Yes, a bit.",
            "No, not yet. I've worked with REST APIs from React for three years, so I expect to pick it up quickly.",
            "I don't remember.",
            "No.",
          ],
          answerIndex: 1,
          reveal:
            "Say honestly that you haven't, then point to the closest thing you have done. It's believable and it shows how you'd handle it on the job. Bluffing is risky because the next question will test it.",
        },
        workedExample: {
          sample:
            "“I haven't used GraphQL in a job yet. I've worked with REST APIs from React for three years, so I'm used to fetching and shaping data, and last year I picked up Redux on a deadline. I'd start with the official tutorial and build something small.”",
          walkthrough: [
            "Say plainly that you haven't done it.",
            "Mention the closest related thing you have done.",
            "Say how you'd close the gap. Keep it short.",
          ],
        },
        check: {
          prompt: "Asked “What would you do differently on that project?”, which answer is best?",
          options: [
            "Nothing, it went perfectly.",
            "I'd have tested with real users sooner, because we didn't find two usability issues until after launch.",
            "I'd have had a better team.",
            "I'm not sure.",
          ],
          answerIndex: 1,
          explanation:
            "A specific, honest lesson shows you reflect and learn. “Nothing” sounds unaware, and blaming others or saying you're unsure gives them nothing to work with.",
        },
        explain: {
          question: "Tell me about something that didn't go well.",
          starter: "We ran into … I learned …",
          modelAnswer:
            "On the checkout rebuild we shipped a validation rule that rejected some valid billing postcodes, and support tickets went up for a day. I rolled it back, wrote tests for the edge cases we'd missed and added a check to our release process. It taught me to test with messy real-world data, not just clean examples.",
          keyPoints: [
            "Describes a real problem plainly",
            "Says what you did about it",
            "Names a specific lesson",
            "Doesn't blame other people",
          ],
        },
        reteach: {
          steps: [
            "Honesty works better than bluffing: the next question usually checks the claim.",
            "For something you haven't done, say so, then share the closest thing you have done and how you'd learn it.",
            "For a mistake, say what happened, what you did and what you learned. Keep it specific.",
          ],
        },
        retries: [
          {
            prompt: "You're asked about a tool you've never used. What's the safest start?",
            options: [
              "Say you've used it a little",
              "Say you haven't, then mention something related you have done",
              "Change the subject",
              "Say it isn't important",
            ],
            answerIndex: 1,
            explanation:
              "Being honest and pointing to related experience is believable, and it shows how you'd approach it.",
          },
          {
            prompt: "What makes an answer about a mistake work?",
            options: [
              "It was someone else's fault",
              "It's specific, and says what you did and what you learned",
              "It's very short",
              "It's about a tiny mistake that didn't matter",
            ],
            answerIndex: 1,
            explanation:
              "A specific mistake, what you did about it and what you learned shows reflection. Blaming others or picking something trivial doesn't.",
          },
        ],
        recap: "Be honest about gaps and name the closest thing you've done. Take one specific lesson from a mistake.",
      },
    ],
  },
  {
    id: "pitch-strengths",
    track: "communication",
    topic: "strengths",
    title: "Strengths and growth areas",
    minutes: 6,
    reviewed: true,
    intro: {
      summary: "How to answer “what are your strengths and weaknesses?” with real moments from your own work.",
      outcomes: ["Back up a strength with one real moment and what it changed", "Describe a growth area, what it cost and what you do differently now", "Turn a vague answer into a specific one"],
    },
    ideas: [
      {
        id: "strength-evidence",
        title: "A strength, with a moment",
        guess: {
          question: "An interviewer asks, “What's one of your strengths?” Which answer works best?",
          options: [
            "I'm hard-working, organised, creative, friendly and a fast learner.",
            "I check my work the way people will use it. On our checkout rebuild, a screen reader test showed me that error messages weren't being read out, and I fixed that before launch.",
            "I'm probably the best at React on any team I join.",
            "I don't really like talking about myself.",
          ],
          answerIndex: 1,
          reveal:
            "Name one strength, then show it with a real moment. A list of traits is hard to remember, and a big claim with nothing behind it is hard to believe.",
        },
        workedExample: {
          sample:
            "“One strength of mine is checking my work the way people will really use it. On our checkout rebuild, I tried the payment form with a keyboard and a screen reader and found that error messages weren't being read out. I fixed it before launch, and the team added that check to our code reviews.”",
          walkthrough: [
            "Name it: one strength, in plain words.",
            "Evidence: one real moment, including what you did.",
            "Change: what was different for the work or the team afterwards.",
          ],
        },
        check: {
          prompt: "“I'm good at explaining things. Last month a new teammate was stuck on how our forms handle errors, so I drew the flow and walked through it with them.” What would make this stronger?",
          options: [
            "Adding four more strengths",
            "Saying “really good” instead of “good”",
            "Saying what changed, for example what the teammate could then do",
            "Removing the example",
          ],
          answerIndex: 2,
          explanation:
            "It names a strength and gives a moment, but stops before the effect. What changed for the work or the team is the missing part.",
        },
        explain: {
          question: "What's one of your strengths? (Use a moment that really happened.)",
          starter: "One strength of mine is … For example, …",
          modelAnswer:
            "One strength of mine is checking my work the way people will really use it. On our checkout rebuild, I tried the payment form with a screen reader and found that error messages weren't being read out. I fixed it before launch, and the team added that check to our code reviews.",
          keyPoints: [
            "Names one strength",
            "Gives one real moment as evidence",
            "Says what you did in that moment",
            "Says what changed for the work or the team",
          ],
        },
        reteach: {
          steps: [
            "Pick one strength that matters for this role. One with proof is easier to remember than a list.",
            "Think of a time it showed. Work, a course, a personal project or a job outside tech can all count.",
            "Finish with what changed. If you can't point to a number, describe the change. Never invent a number or a result.",
          ],
        },
        retries: [
          {
            prompt: "Which part is missing? “I'm very organised, and that has really helped my team.”",
            options: [
              "The name of the strength",
              "A real moment that shows it",
              "A second strength",
              "Nothing, it's complete",
            ],
            answerIndex: 1,
            explanation:
              "It names a strength and says it helped, but gives no moment the interviewer can picture or ask about.",
          },
          {
            prompt: "You can't think of a measurable result for your example. What's the best thing to do?",
            options: [
              "Describe what changed, such as “the team started doing the same check”",
              "Make up a percentage",
              "Leave out the example and just name the strength",
              "Say it saved the company a lot of money",
            ],
            answerIndex: 0,
            explanation:
              "A real change you can describe is enough. Only claim results that happened, because a follow-up question may ask how you know.",
          },
        ],
        recap: "Name one strength, give one real moment that shows it, and say what changed for the work or the team.",
      },
      {
        id: "growth-area",
        title: "A growth area you're working on",
        guess: {
          question: "The interviewer asks, “What's something you're working on improving?” Which answer works best?",
          options: [
            "I'm a perfectionist. I just care too much.",
            "I lack experience with back-end work.",
            "Nothing comes to mind, to be honest.",
            "I can stay stuck too long before asking for help. It once held up a teammate, so now I ask after an hour with notes on what I've tried.",
          ],
          answerIndex: 3,
          reveal:
            "A specific behaviour, what it cost and what you do now shows that you notice things and act on them. A disguised strength, a broad gap or “nothing” tells the interviewer much less.",
        },
        workedExample: {
          sample:
            "“I've tended to stay stuck on a problem too long before asking for help. When we moved our component library to TypeScript, I spent most of two days on one type error, and a teammate waiting on that component couldn't start. Now, if I'm still stuck after an hour, I write down what I've tried and ask. I'm still practising it.”",
          walkthrough: [
            "Behaviour: something you do, specific enough to picture.",
            "Cost: what it led to, said plainly and without drama.",
            "Now: what you do differently. It's fine to say you're still working on it.",
          ],
        },
        check: {
          prompt: "Which of these names a specific behaviour?",
          options: [
            "I lack experience with testing.",
            "I'm not the best communicator.",
            "I've started coding before checking I understood the request.",
            "I'm too much of a perfectionist.",
          ],
          answerIndex: 2,
          explanation:
            "It's something you can picture happening, so you can also say what it cost and what you do instead. The others are broad labels.",
        },
        explain: {
          question: "What's something you're working on improving?",
          starter: "I've tended to … It meant … Now I …",
          modelAnswer:
            "I've tended to stay stuck too long before asking for help. While moving our component library to TypeScript, I spent most of two days on one type error, and a teammate couldn't start their work. Now, after an hour, I write down what I've tried and ask.",
          keyPoints: [
            "Names a specific behaviour, not a broad gap",
            "Says what it cost",
            "Says what you do differently now",
            "Is real, with nothing invented",
          ],
        },
        reteach: {
          steps: [
            "“I lack experience with something” describes a gap. A growth area is easier to discuss when it's something you do, like skipping questions at the start of a task.",
            "Think of one time it caused a problem: a delay, some rework or a confused teammate.",
            "Say what you do now. Only describe a habit you really have. If you've only just started, say so.",
          ],
        },
        retries: [
          {
            prompt:
              "“I've sometimes skipped writing tests when I was rushing, and a bug reached our users.” What's missing?",
            options: ["The behaviour", "The cost", "What you do differently now", "A strength to balance it"],
            answerIndex: 2,
            explanation:
              "It names the behaviour and what it cost. Adding what you do now shows what you took from it.",
          },
          {
            prompt: "Why is “I work too hard” a weak answer to this question?",
            options: [
              "It sounds like a strength in disguise and shows nothing you're changing",
              "It's too specific",
              "It's too short to count",
              "Interviewers don't want to hear about work",
            ],
            answerIndex: 0,
            explanation:
              "The question asks what you're improving. A dressed-up strength avoids it, and there's no behaviour or change to talk about.",
          },
        ],
        recap: "For a growth area, name a specific behaviour, what it cost and what you do differently now.",
      },
      {
        id: "sharpen-answer",
        title: "Sharpen a vague first try",
        guess: {
          question:
            "Your first try is “I could be better at communication.” What's the most useful thing to ask yourself next?",
          options: [
            "Which longer word could replace “communication”?",
            "When did this happen, and what did I do or not do?",
            "How can I make it sound like a strength?",
            "What do other candidates usually say?",
          ],
          answerIndex: 1,
          reveal:
            "A vague answer usually has a real moment behind it. Finding that moment gives you the behaviour, what it cost and what you changed.",
        },
        workedExample: {
          sample:
            "Before: “I could be better at communication.”\n\nAfter: “I've tended to stay quiet when a task was running late. On a sales dashboard, I mentioned a delay only on the day it was due, and the sales team had to rearrange a meeting. Now I send a short update as soon as a date looks at risk.”",
          walkthrough: [
            "A first try is often a label. That's a fine place to start.",
            "Ask: when did it happen, what did I do, and what followed?",
            "Swap the label for the behaviour, then add the cost and what you do now. The same questions sharpen a strength.",
          ],
        },
        check: {
          prompt: "Which is the sharpest rewrite of “I'm a good teammate”?",
          options: [
            "I'm a really great teammate who loves working with people.",
            "Everyone I've worked with would say I'm a team player.",
            "I help my team in lots of different ways.",
            "When a teammate was off sick, I picked up their review comments, and the release went out on the planned day.",
          ],
          answerIndex: 3,
          explanation:
            "It swaps the label for something you did and what came of it. The others repeat the claim in more words.",
        },
        explain: {
          question:
            "Take a vague line about yourself, such as “I could be better at organising”, and give the sharper answer you'd say out loud.",
          starter: "A time this happened was … I … Now I …",
          modelAnswer:
            "I've tended to keep small tasks in my head. During one release I forgot to update an error message I'd promised to change, and a teammate had to catch it in review. Now I write each promise on the ticket as soon as I make it.",
          keyPoints: [
            "Replaces the label with something you did",
            "Points to one real moment",
            "Says what followed",
            "For a growth area, says what you do now",
          ],
        },
        reteach: {
          steps: [
            "Underline the vague words, such as “good”, “better” or “communication”.",
            "For each one, ask “what did that look like on one particular day?”",
            "Write what you remember, even roughly, then trim it to a few sentences. Keep it true: don't add a number or a result to make it sound bigger.",
          ],
        },
        retries: [
          {
            prompt: "Which rewrite of “I need to work on time management” is the sharpest?",
            options: [
              "I really need to get much better with my time.",
              "Time management is something everyone struggles with.",
              "I've said yes to extra tasks without checking my deadline, and one feature slipped. Now I check what it would delay first.",
              "I'm usually on time, so it isn't a big problem.",
            ],
            answerIndex: 2,
            explanation:
              "It names a behaviour, what it cost and the change. The others stay at the level of the label or brush it aside.",
          },
          {
            prompt: "While sharpening an answer, you can't remember how big the effect was. What should you do?",
            options: [
              "Pick a number that seems about right",
              "Say what you do remember, without a number",
              "Say the effect was huge",
              "Borrow a result from an example answer",
            ],
            answerIndex: 1,
            explanation:
              "Specific doesn't have to mean numbers. What happened, as you remember it, is enough and you can stand behind it.",
          },
        ],
        recap: "Sharpen a vague line by finding the real moment behind it: what you did, what followed and, for a growth area, what you do now.",
      },
    ],
  },
];
