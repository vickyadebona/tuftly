import { addDays, weekday } from "./dates.ts";

/**
 * Gentle streak: counts active days walking back from today.
 * - Today never breaks the streak (the day isn't over).
 * - The user's chosen rest weekdays are skipped (neither count nor miss).
 * - Up to `graceDays` consecutive missed days are forgiven.
 */
export function computeStreak(
  activeDays: string[],
  today: string,
  graceDays: number,
  restWeekdays: number[],
): number {
  const active = new Set(activeDays);
  let streak = 0;
  let missed = 0;
  let day = today;
  for (let i = 0; i < 400; i++, day = addDays(day, -1)) {
    if (active.has(day)) {
      streak++;
      missed = 0;
      continue;
    }
    if (day === today) continue;
    if (restWeekdays.includes(weekday(day))) continue;
    missed++;
    if (missed > graceDays) break;
  }
  return streak;
}
