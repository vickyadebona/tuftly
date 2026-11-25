"use client";

import Link from "next/link";
import { useState } from "react";
import { STREAK } from "@/lib/config";
import { todayStr, weekday } from "@/lib/dates";
import { setWeekStart, toggleRestWeekday, useHydrated, useProgress } from "@/lib/store";
import { streakSummary, type DayStatus } from "@/lib/streak";
import { CardSkeleton } from "./Skeleton";
import { DayCell, DayMark, WEEKDAYS, weekdayOrder } from "./StreakDays";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "YYYY-MM" moved by `n` months. */
function addMonths(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7);
}

const days = (n: number) => `${n} ${n === 1 ? "day" : "days"}`;

const LEGEND: { status: DayStatus; label: string; look: string }[] = [
  { status: "done", label: "Practiced", look: "bg-teal" },
  { status: "covered", label: "Covered", look: "bg-butter" },
  { status: "rest", label: "Rest day", look: "bg-lilac-deep" },
];

/** Your streak: how long, a month at a time, and the two things you can choose about it. */
export function StreakCalendar() {
  const hydrated = useHydrated();
  const progress = useProgress();
  const [shown, setShown] = useState<string | null>(null);

  if (!hydrated) return <CardSkeleton label="Loading your streak" />;

  const today = todayStr();
  const { current, longest, statusOf, rest, weekStart } = streakSummary(progress, today);

  const thisMonth = today.slice(0, 7);
  const firstMonth = [...progress.activeDays].sort()[0]?.slice(0, 7) ?? thisMonth;
  const month = shown ?? thisMonth;
  const [year, m] = month.split("-").map(Number);
  const length = new Date(Date.UTC(year, m, 0)).getUTCDate();
  const blanks = (weekday(`${month}-01`) - weekStart + 7) % 7;
  const order = weekdayOrder(weekStart);

  const arrow = "font-pixel h-10 w-10 text-2xl font-bold text-ink disabled:opacity-30";
  const choice = (on: boolean) => `border-line text-ink ${on ? "border-4 bg-butter" : "border-2 bg-paper hover:bg-cream-deep"}`;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-pixel text-3xl font-bold text-ink">Your streak</h1>
        <Link href="/home" aria-label="Close" className="font-pixel flex h-10 w-10 items-center justify-center text-2xl font-bold text-ink">
          ✕
        </Link>
      </div>

      <dl className="grid grid-cols-2 gap-4">
        {[
          ["Current", current, "bg-peach"],
          ["Longest", longest, "bg-paper"],
        ].map(([label, n, bg]) => (
          <div key={label} className={`pixel-box flex flex-col items-center p-3 ${bg}`}>
            <dt className="text-sm text-ink-soft">{label}</dt>
            <dd className="font-pixel text-2xl font-bold text-ink">{days(n as number)}</dd>
          </div>
        ))}
      </dl>

      <section className="pixel-box flex flex-col gap-2 p-3" aria-label="Calendar">
        <div className="flex items-center justify-between">
          <button type="button" className={arrow} aria-label="Earlier month" disabled={month <= firstMonth} onClick={() => setShown(addMonths(month, -1))}>
            ‹
          </button>
          <h2 className="font-pixel text-lg font-bold text-ink" aria-live="polite">
            {MONTHS[m - 1]} {year}
          </h2>
          <button type="button" className={arrow} aria-label="Later month" disabled={month >= thisMonth} onClick={() => setShown(addMonths(month, 1))}>
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-ink-soft" aria-hidden="true">
          {order.map((day) => (
            <span key={day}>{WEEKDAYS[day][0]}</span>
          ))}
        </div>
        <ol className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: blanks }, (_, i) => (
            <li key={`blank-${i}`} aria-hidden="true" />
          ))}
          {Array.from({ length }, (_, i) => {
            const date = `${month}-${String(i + 1).padStart(2, "0")}`;
            return <DayCell key={date} label={String(i + 1)} name={`${MONTHS[m - 1]} ${i + 1}`} status={statusOf(date)} />;
          })}
        </ol>
        <ul className="mt-1 flex flex-wrap justify-center gap-4 text-sm text-ink" aria-label="Key">
          {LEGEND.map((item) => (
            <li key={item.status} className="flex items-center gap-1.5">
              <span className={`flex h-5 w-5 items-center justify-center border-2 border-line ${item.look}`}>
                <DayMark status={item.status} />
              </span>
              {item.label}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-sm text-ink-soft">
        One grace day a week covers a missed day. A day counts with one practice answer, interview answer or finished lesson.
      </p>

      <section className="pixel-box flex flex-col gap-3 p-4">
        <h2 className="font-pixel text-lg font-bold text-ink">Rest days</h2>
        <div className="grid grid-cols-7 gap-1.5" role="group" aria-label="Rest days">
          {order.map((day) => {
            const on = rest.includes(day);
            return (
              <button
                key={day}
                type="button"
                aria-pressed={on}
                aria-label={WEEKDAYS[day]}
                disabled={!on && rest.length >= STREAK.restDaysPerWeek}
                onClick={() => toggleRestWeekday(day, STREAK.restDaysPerWeek)}
                className={`flex h-12 flex-col items-center justify-center border-2 border-line text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-50 ${
                  on ? "bg-lilac-deep" : "bg-paper hover:bg-cream-deep"
                }`}
              >
                {WEEKDAYS[day][0]}
                {on && <DayMark status="rest" />}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-ink-soft">Pick up to {STREAK.restDaysPerWeek}. Changes start today.</p>
      </section>

      <section className="pixel-box flex flex-col gap-3 p-4">
        <h2 id="week-start" className="font-pixel text-lg font-bold text-ink">
          Week starts on
        </h2>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="week-start">
          {([0, 1] as const).map((day) => (
            <button
              key={day}
              type="button"
              role="radio"
              aria-checked={weekStart === day}
              onClick={() => setWeekStart(day)}
              className={`h-11 font-bold ${choice(weekStart === day)}`}
            >
              {weekStart === day && <span aria-hidden="true">✓ </span>}
              {WEEKDAYS[day]}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
