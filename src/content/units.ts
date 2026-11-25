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
    ],
    format: "Practice for each lesson unlocks when you finish it. Stop and come back whenever you like.",
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
