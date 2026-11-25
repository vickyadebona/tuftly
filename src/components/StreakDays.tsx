import { addDays, weekday } from "@/lib/dates";
import type { DayStatus, WeekStart } from "@/lib/streak";
import { PixelIcon } from "./PixelIcon";

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Weekday numbers (0 = Sunday) in the order a week is shown. */
export const weekdayOrder = (start: WeekStart) => WEEKDAYS.map((_, i) => (i + start) % 7);

const LOOK: Record<DayStatus, string> = {
  done: "bg-teal border-line",
  covered: "bg-butter border-line",
  rest: "bg-lilac-deep border-line",
  missed: "bg-paper border-line",
  today: "bg-paper border-line outline outline-[3px] outline-line",
  future: "bg-paper border-line/40 text-ink-soft",
  before: "bg-paper border-line/40 text-ink-soft",
};

const SAYS: Record<DayStatus, string> = {
  done: "practiced",
  covered: "covered by your grace day",
  rest: "rest day",
  missed: "missed",
  today: "today, not practiced yet",
  future: "still to come",
  before: "before your first practice",
};

/** The mark under the label, so the state never rests on color alone. */
export function DayMark({ status }: { status: DayStatus }) {
  if (status === "done") return <PixelIcon name="check" size={12} color="#4a3326" />;
  if (status === "covered") return <PixelIcon name="heart" size={12} color="#c8372d" />;
  if (status === "rest")
    return (
      <span aria-hidden="true" className="text-xs leading-none">
        z
      </span>
    );
  return null;
}

/** One day: a weekday letter or date number, its mark, and the state spelled out for screen readers. */
export function DayCell({ label, name, status }: { label: string; name: string; status: DayStatus }) {
  return (
    <li className={`flex h-12 min-w-0 flex-col items-center justify-center gap-0.5 border-2 text-sm font-bold ${LOOK[status]}`}>
      <span aria-hidden="true" className="leading-none">
        {label}
      </span>
      <DayMark status={status} />
      <span className="sr-only">{`${name}: ${SAYS[status]}`}</span>
    </li>
  );
}

/** The seven days of the week that holds `today`. */
export function StreakWeek({ today, start, statusOf }: { today: string; start: WeekStart; statusOf: (date: string) => DayStatus }) {
  const first = addDays(today, -((weekday(today) - start + 7) % 7));
  return (
    <ol className="grid w-full grid-cols-7 gap-1.5">
      {weekdayOrder(start).map((day, i) => (
        <DayCell key={day} label={WEEKDAYS[day][0]} name={WEEKDAYS[day]} status={statusOf(addDays(first, i))} />
      ))}
    </ol>
  );
}
