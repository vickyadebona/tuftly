"use client";

import Link from "next/link";
import { getDrills, getLessons } from "@/content";
import { useAccount } from "@/lib/account";
import { COMPANION } from "@/lib/config";
import { todayStr, weekday } from "@/lib/dates";
import { summarize } from "@/lib/queue";
import { useHydrated, useProgress } from "@/lib/store";
import { streakSummary, weekStartOf } from "@/lib/streak";
import type { Track } from "@/lib/types";
import { useSeason } from "@/lib/useSeason";
import { HELLO, WELCOME_BACK } from "@/lib/phrases";
import { PathNode, type NodeState } from "./PathNode";
import { PixelArtBobbin } from "./PixelArtBobbin";
import { PixelIcon } from "./PixelIcon";
import { QuestSkeleton } from "./Skeleton";
import { StreakCelebration } from "./StreakCelebration";
import { StreakWeek, WEEKDAYS } from "./StreakDays";

const COMING_SOON = ["Async basics", "Closures"];


const UNITS: {
  track: Track;
  title: string;
  bg: string;
  comingSoon?: string[];
  pitchLink?: boolean;
}[] = [
  { track: "communication", title: "Telling your story", bg: "bg-lilac-deep", pitchLink: true },
  { track: "javascript", title: "Arrays, objects and maps", bg: "bg-teal", comingSoon: COMING_SOON },
  { track: "typescript", title: "TypeScript, precisely", bg: "bg-lilac-deep" },
  { track: "engineering", title: "Explaining how you build", bg: "bg-teal" },
];

export function QuestHome() {
  const hydrated = useHydrated();
  const progress = useProgress();
  const season = useSeason();
  const account = useAccount();
  const hello = account && !account.guest ? `${HELLO} Hi ${account.name}, I'm ${COMPANION.name}.` : `${HELLO} I'm ${COMPANION.name}.`;
  const lessons = getLessons();

  const today = hydrated ? todayStr() : "";
  const done = new Set(progress.lessonsDone);
  const currentId = lessons.find((l) => !done.has(l.id))?.id;
  const doneCount = lessons.filter((l) => done.has(l.id)).length;
  // Units that have at least one lesson to show, numbered in order with no gaps.
  const shownUnits = UNITS.filter((u) => lessons.some((l) => l.track === u.track));
  const place = currentId ? progress.lessonProgress[currentId] : undefined;
  const inProgress = !!place && (place.idea > 0 || place.stage !== "guess");

  let waiting = 0;
  let restDay = false;
  let activeToday = false;
  const streak = hydrated ? streakSummary(progress, today) : null;
  if (hydrated) {
    const { due, fresh } = summarize(progress, getDrills(), today);
    waiting = due.length + fresh.length;
    restDay = streak!.rest.includes(weekday(today));
    activeToday = progress.activeDays.includes(today);
  }

  // A streak that ended, with nothing done yet today: welcome them back, with no guilt.
  const startingOver = !!streak && streak.current === 0 && streak.longest > 0;
  const covered = streak?.justCovered ? streak.graceUsed : null;
  // The grace day returns when the next week begins.
  const weekBegins = streak ? WEEKDAYS[weekday(weekStartOf(today, streak.weekStart))] : "";

  const say = !hydrated
    ? `Hi, I'm ${COMPANION.name}!`
    : restDay
      ? "Rest day. Take a tea break, your streak is safe."
      : covered
        ? `${COMPANION.name} covered ${WEEKDAYS[weekday(covered)]}. Your ${streak!.current} day streak is safe.`
        : startingOver
          ? `${WELCOME_BACK} One practice starts a new streak.`
          : doneCount === 0
            ? `${hello} Want to start with a quick lesson?`
        : waiting > 0
          ? `${HELLO} ${waiting} short practice${waiting === 1 ? "" : "s"} ready when you are.`
          : `${HELLO} Good to see you. You're all caught up for today.`;

  const quests: { label: string; done: boolean; note: string; href?: string }[] = [
    { label: "Practice today", done: activeToday, note: activeToday ? "Done" : "Not yet" },
    {
      label: "Clear your queue",
      done: hydrated && doneCount > 0 && waiting === 0,
      note: doneCount === 0 ? "Finish a lesson first" : waiting === 0 ? "All clear" : `${waiting} to go`,
      href: waiting > 0 ? "/review" : undefined,
    },
    { label: "Chat with Bobbin", done: false, note: "Try a mock round", href: "/interview" },
  ];

  const welcome = (
      <section data-tour="welcome" className="pixel-box flex flex-col items-center gap-3 bg-peach p-4 sm:flex-row sm:gap-6 sm:px-6">
        <PixelArtBobbin
          mood={restDay ? "sleepy" : covered ? "sparkle" : startingOver || (doneCount > 0 && waiting > 0) ? "wink" : "sparkle"}
          outfit={season}
          size={88}
        />
        <p className="pixel-box w-full flex-1 px-4 py-3 text-center text-base text-ink sm:text-left sm:text-lg">{say}</p>
        {doneCount === 0 ? (
          <Link href={currentId ? `/lessons/${currentId}` : "/home"} className="btn-primary w-full shrink-0 sm:w-auto">
            {inProgress ? "Continue lesson" : "Start lesson"}
          </Link>
        ) : (
          <Link href="/review" className="btn-primary w-full shrink-0 sm:w-auto">
            Start practice
          </Link>
        )}
      </section>
  );

  // Saved progress is only readable in the browser, so show a skeleton until then.
  if (!hydrated) return <QuestSkeleton />;

  // Until one lesson is done: nothing but Bobbin saying hello, so the first step is obvious.
  // The unit track and side panel appear after the first completed lesson.
  if (doneCount === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <StreakCelebration />
        <div className="w-full max-w-2xl">{welcome}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <StreakCelebration />
      {welcome}

    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-10">
        {shownUnits.map((unit, unitIndex) => {
          const unitLessons = lessons.filter((l) => l.track === unit.track);
          const unitCurrent = unitLessons.find((l) => !done.has(l.id))?.id;
          const unitDone = unitLessons.filter((l) => done.has(l.id)).length;
          return (
            <section key={unit.track} aria-labelledby={`unit-${unit.track}`} className="flex min-w-0 flex-col gap-6">
              <div className={`flex flex-col items-start gap-4 lg:flex-row lg:items-end lg:justify-between border-[3px] border-line px-6 py-5 text-ink shadow-[4px_4px_0_rgb(91_58_41/0.28)] ${unit.bg}`}>
                <div>
                  <p className="font-pixel text-sm font-semibold uppercase tracking-wide">Unit {unitIndex + 1}</p>
                  <h2 id={`unit-${unit.track}`} className="font-pixel text-2xl font-bold sm:text-3xl">
                    {unit.title}
                  </h2>
                </div>
                <div className="flex shrink-0 flex-col items-start gap-1.5 lg:items-end">
                  <div className="flex flex-wrap gap-1" aria-hidden="true">
                    {unitLessons.map((l) => (
                      <span
                        key={l.id}
                        className={`h-4 w-5 border-2 border-line ${done.has(l.id) ? "bg-butter" : "bg-paper"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm">
                    {unitDone} of {unitLessons.length} lessons done
                  </p>
                </div>
              </div>

              <ol className="flex flex-col gap-5 pl-1">
                {unitLessons.map((l) => {
                  const state: NodeState = done.has(l.id) ? "done" : l.id === unitCurrent ? "current" : "locked";
                  const lessonPlace = progress.lessonProgress[l.id];
                  const started = !!lessonPlace && (lessonPlace.idea > 0 || lessonPlace.stage !== "guess");
                  const card = (
                    <div className="pixel-box flex min-w-0 flex-1 flex-col gap-2 px-4 py-3">
                      <span className="font-pixel text-lg font-bold text-ink">{l.title}</span>
                      <span className="text-sm text-ink-soft">
                        {state === "done"
                          ? "Complete. Tap to revisit"
                          : state === "current"
                            ? started
                              ? `Idea ${Math.min(lessonPlace.idea + 1, l.ideas.length)} of ${l.ideas.length} · your place is saved`
                              : `${l.minutes} min · ${l.ideas.length} short ideas`
                            : "Unlocks after the lesson above"}
                        {!l.reviewed && " · draft"}
                      </span>
                      {state === "current" && (
                        <span className="btn-primary self-start px-4 py-1.5 text-sm">
                          {started ? "Continue lesson" : "Start lesson"}
                        </span>
                      )}
                    </div>
                  );
                  return (
                    <li key={l.id}>
                      {state === "locked" ? (
                        <div className="flex items-center gap-3 opacity-90">
                          <PathNode state={state} />
                          {card}
                        </div>
                      ) : (
                        <Link href={`/lessons/${l.id}`} className="flex items-center gap-3">
                          <PathNode state={state} />
                          {card}
                        </Link>
                      )}
                    </li>
                  );
                })}
                {unit.comingSoon?.map((title) => (
                  <li key={title}>
                    <div className="flex items-center gap-3">
                      <PathNode state="locked" />
                      <div className="pixel-box flex min-w-0 flex-1 flex-col gap-1 px-4 py-3">
                        <span className="font-pixel text-lg font-bold text-ink">{title}</span>
                        <span className="text-sm text-ink-soft">Coming soon</span>
                      </div>
                    </div>
                  </li>
                ))}
                {unit.pitchLink && (
                  <li>
                    <Link href="/pitch" className="flex items-center gap-3">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center border-[3px] border-line bg-lilac-deep sm:h-[68px] sm:w-[68px]">
                        <PixelIcon name="speech" size={30} color="#fffdf4" />
                      </span>
                      <div className="pixel-box flex min-w-0 flex-1 flex-col gap-1 bg-lilac px-4 py-3">
                        <span className="font-pixel text-lg font-bold text-ink">Build your pitch</span>
                        <span className="text-sm text-ink-soft">
                          Paste a job description and match it to your own experience
                        </span>
                      </div>
                    </Link>
                  </li>
                )}
              </ol>
            </section>
          );
        })}

        <div className="flex flex-wrap items-end justify-between gap-2 border-[3px] border-line bg-cream-deep px-6 py-4 shadow-[4px_4px_0_rgb(91_58_41/0.28)]">
          <div>
            <p className="font-pixel text-sm font-semibold uppercase tracking-wide text-ink-soft">Unit {shownUnits.length + 1}</p>
            <p className="font-pixel text-xl font-bold text-ink">Intro to TypeScript</p>
          </div>
          <p className="text-sm text-ink-soft">Coming soon</p>
        </div>
      </div>

      <aside className="flex flex-col gap-6" aria-label="Today">
        <section className="pixel-box flex flex-col gap-3 p-5">
          <h2 className="font-pixel text-xl font-bold text-ink">Today&apos;s quests</h2>
          <ul className="flex flex-col gap-2.5">
            {quests.map((q) => {
              const row = (
                <>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center border-[3px] border-line ${
                      q.done ? "bg-teal" : "bg-paper"
                    }`}
                  >
                    {q.done && <PixelIcon name="check" size={14} color="#fffdf4" />}
                  </span>
                  <span className="flex-1 text-ink">{q.label}</span>
                  <span className="text-sm font-semibold text-teal-deep">{q.note}</span>
                </>
              );
              return (
                <li key={q.label}>
                  {q.href ? (
                    <Link href={q.href} className="flex items-center gap-3">
                      {row}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3">{row}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="pixel-box flex flex-col gap-3 p-5">
          <h2 className="font-pixel text-xl font-bold text-ink">This week</h2>
          <StreakWeek today={today} start={streak!.weekStart} statusOf={streak!.statusOf} />
          <p className="text-sm text-ink-soft">
            {streak!.graceUsed
              ? `You've used this week's grace day. It comes back ${weekBegins}.`
              : startingOver
                ? `Your longest streak is ${streak!.longest} ${streak!.longest === 1 ? "day" : "days"}. It's saved.`
                : "Rest days and one grace day a week keep your streak safe."}
          </p>
          <Link href="/streak" className="self-start font-semibold text-teal-deep underline">
            Calendar and rest days
          </Link>
        </section>
      </aside>
    </div>
    </div>
  );
}
