import { SHOW_UNREVIEWED } from "@/lib/config";
import type { Drill, Lesson } from "@/lib/types";
import { drills } from "./drills";
import { lessons } from "./lessons";

/** Only human-reviewed content ships. Drafts show in development so you can review them. */
export function getLessons(): Lesson[] {
  return lessons.filter((l) => l.reviewed || SHOW_UNREVIEWED);
}

/** Every lesson id, drafts included. Routes are generated for all; drafts 404 at render in production. */
export function getAllLessonIds(): string[] {
  return lessons.map((l) => l.id);
}

export function getLesson(id: string): Lesson | undefined {
  return getLessons().find((l) => l.id === id);
}

export function getDrills(): Drill[] {
  return drills.filter((d) => d.reviewed || SHOW_UNREVIEWED);
}
