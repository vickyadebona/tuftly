import { unitNumber } from "@/lib/units";
import type { Track, UnitInfo } from "@/lib/types";
import { getLessons } from "./index";

// What a learner sees once, before the first lesson of a unit. Plain and specific: what it covers,
// who it's for. Lesson counts and times come from the published lessons, so never write them here. The order here is the order on the quest map; "Unit N" is
// worked out from it, never written by hand.
export const units: UnitInfo[] = [
  {
    track: "communication",
    title: "Telling your story",
    blurb:
      "Most interviews open with “tell me about yourself” and then dig into what you've done. This unit is about answering those questions clearly and honestly.",
    forWho: "Anyone, whatever your background. You don't need a long work history.",
    learn: [
      "Giving a clear one-minute pitch",
      "Matching your experience to a role",
      "Handling follow-up questions about your work, including gaps and mistakes",
      "Talking about your strengths and growth areas",
      "Going a level deeper: how it works, and what you traded off",
    ],
    format: "There's also a Pitch page where you work with your own experience.",
  },
  {
    track: "javascript",
    title: "Arrays, objects and maps",
    blurb:
      "Three core JavaScript topics that come up again and again in web developer interviews, and the mistakes people make with them most often.",
    forWho: "Anyone who has written some JavaScript and wants to explain it clearly when asked.",
    learn: [
      "Sorting and transforming arrays without surprises",
      "Copying objects, and when a copy still shares data",
      "Using Map and Set instead of plain objects and arrays",
      "Explaining how property lookup follows the prototype chain",
    ],
    format: "Practice for each lesson unlocks when you finish it. Stop and come back whenever you like.",
  },
  {
    track: "typescript",
    title: "TypeScript, precisely",
    blurb: "Common TypeScript questions, answered with what the compiler actually does rather than a rule of thumb.",
    forWho: "Anyone who has written some TypeScript.",
    learn: ["Why unknown is safer than any", "How interface and type differ"],
    format: "Practice unlocks when you finish one.",
  },
  {
    track: "engineering",
    title: "Explaining how you build",
    blurb: "Follow-up questions about design and testing: where a rule is enforced, and why a test can be trusted.",
    forWho: "Anyone who can talk about a web app they've worked on.",
    learn: ["Placing checks in the browser, server and database", "Keeping tests stable and repeatable"],
    format: "Practice unlocks when you finish one.",
  },
];

export function getUnit(track: Track): UnitInfo | undefined {
  return units.find((u) => u.track === track);
}

/** "Unit 1", "Unit 2"… following the order units appear, skipping any that aren't shown. */
export function getUnitNumber(track: Track): number {
  return unitNumber(
    units.map((u) => u.track),
    (t) => getLessons().some((l) => l.track === t),
    track,
  );
}
