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
    reviewed: true,
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
            "I'm a front-end developer with three years of experience building React apps. Most recently I rebuilt our checkout form, and I'm looking for a team that cares about accessibility.",
            "Honestly, I'm not sure where to start. I've done a bit of everything.",
            "I'm a hard worker and a fast learner.",
          ],
          answerIndex: 1,
          reveal:
            "Start with who you are now, then a recent highlight, then what you're looking for. That tells the interviewer what you do and where you're headed in about a minute. A life story or a list of traits doesn't.",
        },
        workedExample: {
          sample:
            "“I'm a front-end developer with three years of experience building React apps. Most recently I led a rebuild of our checkout form, which cut abandoned checkouts by 18%. I'm looking for a team where I can work on accessibility at a bigger scale, which is why this role caught my eye.”",
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
            "Last year I rebuilt our signup flow, which cut drop-off by 18%.",
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
            "I'm a front-end developer with three years of experience building React apps. Most recently I led a rebuild of our checkout form, which cut abandoned checkouts by 18%. I'm looking for a team where I can work on accessibility at a bigger scale, which is why this role caught my eye.",
          keyPoints: [
            "Starts with who you are now",
            "Gives one recent highlight with a result",
            "Ends with what you want next, tied to this role",
            "Takes about a minute, not five",
          ],
        },
        reteach: {
          steps: [
            "Think of it as three short sentences: who you are now, one thing you've done, and what you want next.",
            "It's a headline, not a biography. They can ask for more detail afterwards.",
            "Aim for about 60 to 90 seconds, which is roughly 150 to 200 words.",
          ],
        },
        retries: [
          {
            prompt: "About how long should a “tell me about yourself” answer be?",
            options: [
              "About 60 to 90 seconds",
              "Five minutes, so nothing is missed",
              "Ten seconds",
              "As long as it takes to cover your whole career",
            ],
            answerIndex: 0,
            explanation:
              "A minute or so is enough for who you are, a highlight and what you want. They'll ask for more if they want it.",
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
    reviewed: true,
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
            "“Four of us built the checkout rebuild. My part was the payment form: I wrote the validation, set up the error messages and tested it with a screen reader. Another developer owned the API, and a designer handled the layout.”",
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
            "I owned the payment form and worked with two other developers on the rest.",
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
            "There were four of us. I owned the payment form: I wrote the validation, designed the error messages and tested it with a screen reader. Another developer owned the API and a designer handled the layout, so I worked closely with both.",
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
            "“Our checkout form had a high drop-off rate. My job was to find out why and fix it. I watched session recordings, saw people getting stuck on the address field, and rebuilt it with better validation and clearer errors. Drop-offs fell by 18% over the next month.”",
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
            "I was asked to find out why.",
            "I rebuilt the address field with clearer errors.",
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
            "Our checkout form had a high drop-off rate, and my job was to find out why. I watched session recordings, saw people getting stuck on the address field, and rebuilt it with better validation and clearer errors. Drop-offs fell by 18% over the next month. If I did it again, I'd test with real users earlier.",
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
            prompt: "Which part is missing? “The app was slow. I added caching and split the bundle.”",
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
            "No, not yet. I've built REST APIs for two years, so I expect to pick it up quickly.",
            "I don't remember.",
            "No.",
          ],
          answerIndex: 1,
          reveal:
            "Say honestly that you haven't, then point to the closest thing you have done. It's believable and it shows how you'd handle it on the job. Bluffing is risky because the next question will test it.",
        },
        workedExample: {
          sample:
            "“I haven't used GraphQL in a job yet. I've built REST APIs for two years, so I know the ideas behind queries and schemas, and last year I picked up Redux on a deadline. I'd start with the official tutorial and build something small.”",
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
            "I'd have tested with real users sooner, because we only found two usability issues after launch.",
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
            "On the checkout rebuild we shipped a validation rule that rejected some valid addresses, and support tickets went up for a day. I rolled it back, wrote tests for the edge cases we'd missed and added a check to our release process. It taught me to test with messy real-world data, not just clean examples.",
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
];
