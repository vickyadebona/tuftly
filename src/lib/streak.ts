import { addDays, weekday } from "./dates.ts";

/** 0 = Sunday, 1 = Monday. */
export type WeekStart = 0 | 1;

/** Rest days and week start as they stood from one date on, so a change never rewrites the past. */
export interface StreakSettings {
  /** First date these apply to. */
  from: string;
  /** When they were chosen, so the later choice wins when two devices disagree. */
  at: number;
  rest: number[];
  weekStart: WeekStart;
}

export interface StreakInput {
  activeDays: string[];
  /** Rest weekdays chosen before settings were dated. They apply until the first dated change. */
  restWeekdays: number[];
  streakSettings?: StreakSettings[];
}

/**
 * - done: practiced
 * - covered: missed, and that week's grace day kept the streak going
 * - rest: a chosen day off
 * - missed: nothing to cover it
 * - today: today, not practiced yet
 * - future / before: not part of the streak yet, or from before the first practice
 */
export type DayStatus = "done" | "covered" | "rest" | "missed" | "today" | "future" | "before";

export function settingsOn(input: StreakInput, date: string): { rest: number[]; weekStart: WeekStart } {
  let found: StreakSettings | undefined;
  for (const s of input.streakSettings ?? []) if (s.from <= date && (!found || s.from > found.from)) found = s;
  return found ?? { rest: input.restWeekdays, weekStart: 0 };
}

/** The first date of the week that `date` falls in. */
export function weekStartOf(date: string, start: WeekStart): string {
  return addDays(date, -((weekday(date) - start + 7) % 7));
}

/**
 * Walks every day from the first practice to today. A streak counts practiced days. Rest days are
 * skipped, today never breaks it, and one missed day each week is covered.
 */
export function streakSummary(input: StreakInput, today: string) {
  const active = new Set(input.activeDays.filter((d) => d <= today));
  const first = [...active].sort()[0];
  const days = new Map<string, DayStatus>();
  let current = 0;
  let longest = 0;
  let lastCovered = "";
  for (let day = first ?? today; day <= today; day = addDays(day, 1)) {
    const { rest, weekStart } = settingsOn(input, day);
    let status: DayStatus;
    if (active.has(day)) {
      status = "done";
      current++;
      longest = Math.max(longest, current);
    } else if (rest.includes(weekday(day))) {
      status = "rest";
    } else if (day === today) {
      status = "today";
    } else if (current > 0 && lastCovered < weekStartOf(day, weekStart)) {
      status = "covered";
      lastCovered = day;
    } else {
      status = "missed";
      current = 0;
    }
    days.set(day, status);
  }

  const now = settingsOn(input, today);
  const thisWeek = weekStartOf(today, now.weekStart);
  // The day this week's grace was spent, if it has been.
  const graceUsed = lastCovered >= thisWeek ? lastCovered : null;

  function statusOf(date: string): DayStatus {
    const known = days.get(date);
    if (known) return known;
    if (date > today) return now.rest.includes(weekday(date)) ? "rest" : "future";
    return "before";
  }

  // True while the grace day is the latest thing that happened to a streak that is still going.
  let justCovered = false;
  if (current > 0 && graceUsed && !active.has(today)) {
    justCovered = true;
    for (let day = addDays(graceUsed, 1); day <= today; day = addDays(day, 1)) {
      if (active.has(day)) justCovered = false;
    }
  }

  return { current, longest, statusOf, graceUsed, justCovered, ...now };
}

/** The settings list with a change made today. A second change the same day replaces the first. */
export function withSettings(
  input: StreakInput,
  today: string,
  change: Partial<{ rest: number[]; weekStart: WeekStart }>,
  at: number,
): StreakSettings[] {
  const now = settingsOn(input, today);
  const others = (input.streakSettings ?? []).filter((s) => s.from !== today);
  return [...others, { from: today, at, rest: now.rest, weekStart: now.weekStart, ...change }].sort((a, b) =>
    a.from.localeCompare(b.from),
  );
}

/** Both devices' changes by date; the later choice wins for the same date. */
export function mergeSettings(a: StreakSettings[] = [], b: StreakSettings[] = []): StreakSettings[] {
  const byDate = new Map<string, StreakSettings>();
  for (const s of [...b, ...a]) {
    const have = byDate.get(s.from);
    if (!have || s.at >= have.at) byDate.set(s.from, s);
  }
  return [...byDate.values()].sort((x, y) => x.from.localeCompare(y.from));
}
