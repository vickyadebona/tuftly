import type { Progress } from "@/lib/store";

/** Progress states for stories that show screens. Dates are relative to today so "due" works. */
export const today = () => new Date().toISOString().slice(0, 10);

export const emptyProgress: Progress = {
  cards: {},
  activeDays: [],
  lessonsDone: [],
  restWeekdays: [],
  lessonProgress: {},
  struggled: [],
  unitsSeen: [],
};

export const learner = { name: "Sam", email: null, guest: false, tourDone: true };

/** A few lessons done and some drills due. */
export function midProgress(): Progress {
  const d = today();
  return {
    ...emptyProgress,
    lessonsDone: ["pitch-basics", "arrays-copy-vs-mutate"],
    activeDays: [d],
    unitsSeen: ["communication", "javascript"],
    cards: {
      "d-arr-1": { box: 0, due: d, reps: 1, lapses: 0, lastReviewed: d },
      "d-pit-1": { box: 1, due: d, reps: 2, lapses: 0, lastReviewed: d },
    },
  };
}
