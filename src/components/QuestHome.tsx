"use client";

import Link from "next/link";
import { getDrills, getLessons } from "@/content";
import { useAccount } from "@/lib/account";
import { COMPANION, STREAK } from "@/lib/config";
import { addDays, todayStr, weekday } from "@/lib/dates";
import { summarize } from "@/lib/queue";
import { toggleRestWeekday, useHydrated, useProgress } from "@/lib/store";
import { useSeason } from "@/lib/useSeason";
import { PixelArtBobbin } from "./PixelArtBobbin";
import { PixelIcon } from "./PixelIcon";
import { QuestSkeleton } from "./Skeleton";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const COMING_SOON = ["Async basics", "Closures"];

type NodeState = "done" | "current" | "locked";

function PathNode({ state }: { state: NodeState }) {
  const base = "flex h-[68px] w-[68px] shrink-0 items-center justify-center border-[3px] border-line";
  if (state === "done")
    return (
      <span className={`${base} bg-teal`}>
        <PixelIcon name="check" size={32} color="#fffdf4" />
      </span>
    );
  if (state === "current")
    return (
      <span className={`${base} bg-butter`}>
        <PixelIcon name="star" size={32} color="#f2b93b" />
      </span>
    );
  return (
    <span className={`${base} bg-paper`}>
      <PixelIcon name="lock" size={28} color="#7a6253" />
    </span>
  );
}

// Zigzag the path a little so it reads as a trail, not a list.
const INDENT = ["md:ml-0", "md:ml-16", "md:ml-32", "md:ml-16", "md:ml-0"];

export function QuestHome() {
  const hydrated = useHydrated();
  const progress = useProgress();
  const season = useSeason();
  const account = useAccount();
  const hello = account && !account.guest ? `Hi ${account.name}, I'm ${COMPANION.name}!` : `Hi, I'm ${COMPANION.name}!`;
  const lessons = getLessons();

  const today = hydrated ? todayStr() : "";
  const done = new Set(progress.lessonsDone);
  const currentId = lessons.find((l) => !done.has(l.id))?.id;
  const doneCount = lessons.filter((l) => done.has(l.id)).length;

  let waiting = 0;
  let restDay = false;
  let activeToday = false;
  if (hydrated) {
    const { due, fresh } = summarize(progress, getDrills(), today);
    waiting = due.length + fresh.length;
    restDay = progress.restWeekdays.includes(weekday(today));
    activeToday = progress.activeDays.includes(today);
  }

  const say = !hydrated
    ? `Hi, I'm ${COMPANION.name}!`
    : restDay
      ? "Rest day. Take a tea break, your streak is safe."
      : doneCount === 0
        ? `${hello} Want to start with a quick lesson?`
        : waiting > 0
          ? `${waiting} short practice${waiting === 1 ? "" : "s"} ready when you are.`
          : "All caught up. Nice work!";

  const weekStart = hydrated ? addDays(today, -weekday(today)) : "";

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
      <section data-tour="welcome" className="pixel-box flex flex-col items-center gap-4 bg-peach p-4 sm:flex-row sm:gap-6 sm:px-6">
        <PixelArtBobbin mood={restDay ? "sleepy" : "sparkle"} outfit={season} size={104} />
        <p className="pixel-box w-full flex-1 px-4 py-3 text-center text-lg text-ink sm:text-left">{say}</p>
        {doneCount === 0 ? (
          <Link href={currentId ? `/lessons/${currentId}` : "/home"} className="btn-primary shrink-0">
            Start lesson
          </Link>
        ) : (
          <Link href="/review" className="btn-primary shrink-0">
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
        <div className="w-full max-w-2xl">{welcome}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {welcome}

    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section aria-labelledby="unit-1" className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-[3px] border-line bg-teal px-6 py-5 text-white shadow-[4px_4px_0_rgb(91_58_41/0.28)]">
          <div>
            <p className="font-pixel text-sm font-semibold uppercase tracking-wide">Unit 1</p>
            <h1 id="unit-1" className="font-pixel text-2xl font-bold sm:text-3xl">
              Arrays, objects and maps
            </h1>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex gap-1" aria-hidden="true">
              {lessons.map((l) => (
                <span
                  key={l.id}
                  className={`h-4 w-5 border-2 border-line ${done.has(l.id) ? "bg-butter" : "bg-paper"}`}
                />
              ))}
            </div>
            <p className="text-sm">
              {doneCount} of {lessons.length} lessons done
            </p>
          </div>
        </div>

        <ol className="flex flex-col gap-5 pl-1">
          {lessons.map((l, i) => {
            const state: NodeState = done.has(l.id) ? "done" : l.id === currentId ? "current" : "locked";
            const card = (
              <div className="pixel-box flex flex-col gap-2 px-4 py-3">
                <span className="font-pixel text-lg font-bold text-ink">{l.title}</span>
                <span className="text-sm text-ink-soft">
                  {state === "done"
                    ? "Complete. Tap to revisit"
                    : state === "current"
                      ? `${l.minutes} min · guess, example, your turn`
                      : "Unlocks after the lesson above"}
                  {!l.reviewed && " · draft"}
                </span>
                {state === "current" && (
                  <span className="btn-primary self-start px-4 py-1.5 text-sm">Start lesson</span>
                )}
              </div>
            );
            return (
              <li key={l.id} className={INDENT[i % INDENT.length]}>
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
          {COMING_SOON.map((title, i) => (
            <li key={title} className={INDENT[(lessons.length + i) % INDENT.length]}>
              <div className="flex items-center gap-3">
                <PathNode state="locked" />
                <div className="pixel-box flex flex-col gap-1 px-4 py-3">
                  <span className="font-pixel text-lg font-bold text-ink">{title}</span>
                  <span className="text-sm text-ink-soft">Coming soon</span>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap items-end justify-between gap-2 border-[3px] border-line bg-cream-deep px-6 py-4 shadow-[4px_4px_0_rgb(91_58_41/0.28)]">
          <div>
            <p className="font-pixel text-sm font-semibold uppercase tracking-wide text-ink-soft">Unit 2</p>
            <p className="font-pixel text-xl font-bold text-ink">Intro to TypeScript</p>
          </div>
          <p className="text-sm text-ink-soft">Coming soon</p>
        </div>
      </section>

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
          <div className="flex gap-1.5" role="group" aria-label="Rest days: tap a day to rest">
            {DAY_LABELS.map((label, day) => {
              const date = hydrated ? addDays(weekStart, day) : "";
              const active = hydrated && progress.activeDays.includes(date);
              const rest = progress.restWeekdays.includes(day);
              const isToday = hydrated && date === today;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleRestWeekday(day, STREAK.restDaysPerWeek)}
                  aria-pressed={rest}
                  title={rest ? "Rest day (tap to undo)" : "Tap to make this a rest day"}
                  className={`h-9 flex-1 border-[3px] border-line font-bold ${
                    active
                      ? "bg-teal text-white"
                      : rest
                        ? "bg-lilac-deep text-ink"
                        : isToday
                          ? "bg-butter text-ink"
                          : "bg-paper text-ink"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-ink-soft">
            Rest days (pick up to {STREAK.restDaysPerWeek}) never hurt your streak.
          </p>
        </section>
      </aside>
    </div>
    </div>
  );
}
