import type { Track, UnitInfo } from "@/lib/types";

// What a learner sees once, before the first lesson of a unit. Plain and specific: what it covers,
// who it's for, how long it takes.
export const units: UnitInfo[] = [
  {
    track: "javascript",
    label: "Unit 1",
    title: "Arrays, objects and maps",
    blurb:
      "Three core JavaScript topics that come up again and again in web developer interviews, and the mistakes people make with them most often.",
    forWho: "Anyone who has written some JavaScript and wants to explain it clearly when asked.",
    learn: [
      "Sorting and transforming arrays without surprises",
      "Copying objects, and when a copy still shares data",
      "Using Map and Set instead of plain objects and arrays",
    ],
    format: "3 lessons of about 6 minutes each. Practice for each one unlocks when you finish it. Stop and come back whenever you like.",
    showHowItWorks: true,
  },
  {
    track: "communication",
    label: "Unit 2",
    title: "Telling your story",
    blurb:
      "Most interviews open with “tell me about yourself” and then dig into what you've done. This unit is about answering those questions clearly and honestly.",
    forWho: "Anyone, whatever your background. You don't need a long work history.",
    learn: [
      "Giving a clear one-minute pitch",
      "Matching your experience to a role",
      "Handling follow-up questions about your work, including gaps and mistakes",
    ],
    format: "2 lessons of about 6 minutes each, plus a Pitch page where you work with your own experience.",
  },
];

export function getUnit(track: Track): UnitInfo | undefined {
  return units.find((u) => u.track === track);
}
