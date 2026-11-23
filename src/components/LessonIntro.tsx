"use client";

import type { Lesson, UnitInfo } from "@/lib/types";
import { Bobbin } from "./Bobbin";
import { PixelIcon } from "./PixelIcon";

const HOW_LESSONS_WORK = [
  "Guess first, before you see the answer. A wrong guess is fine.",
  "Study one short example.",
  "Try one yourself. If you miss, we go over that idea again and ask a fresh question before moving on.",
  "Say it in words, the way you would in an interview.",
];

/** Shown once, before the first lesson of a unit: what it covers, who it's for, how long it takes. */
export function UnitIntro({
  unit,
  number,
  lessons,
  onStart,
}: {
  unit: UnitInfo;
  number: number;
  lessons: Lesson[];
  onStart: () => void;
}) {
  const totalMinutes = lessons.reduce((n, l) => n + l.minutes, 0);
  return (
    <section className="flex flex-col gap-5" aria-labelledby="unit-intro-title">
      <p className="font-pixel text-sm font-semibold uppercase tracking-wide text-teal-deep">Unit {number}</p>
      <h1 id="unit-intro-title" className="font-pixel text-3xl font-bold text-ink">
        {unit.title}
      </h1>
      <Bobbin mood="happy" say={unit.blurb} />

      <div className="pixel-box flex flex-col gap-3 p-5">
        <h2 className="font-pixel text-lg font-bold text-ink">Who it&apos;s for</h2>
        <p className="text-ink">{unit.forWho}</p>
      </div>

      <div className="pixel-box flex flex-col gap-3 p-5">
        <h2 className="font-pixel text-lg font-bold text-ink">What you&apos;ll cover</h2>
        <ul className="flex flex-col gap-2">
          {unit.learn.map((item) => (
            <li key={item} className="flex items-start gap-3 text-ink">
              <span className="mt-1.5 shrink-0">
                <PixelIcon name="check" size={16} color="#2f7f78" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="pixel-box flex flex-col gap-3 p-5">
        <h2 className="font-pixel text-lg font-bold text-ink">The lessons</h2>
        <ol className="flex flex-col gap-2">
          {lessons.map((l, i) => (
            <li key={l.id} className="flex items-baseline justify-between gap-3 text-ink">
              <span>
                {i + 1}. {l.title}
              </span>
              <span className="shrink-0 text-sm text-ink-soft">{l.minutes} min</span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-ink-soft">
          About {totalMinutes} minutes in total. {unit.format}
        </p>
      </div>

      {number === 1 && (
        <div className="pixel-box flex flex-col gap-3 bg-sky p-5">
          <h2 className="font-pixel text-lg font-bold text-ink">How tuftly works</h2>
          <p className="text-ink">
            <span className="font-bold">Lessons</span> teach one idea at a time.{" "}
            <span className="font-bold">Practice</span> brings those ideas back on a schedule, so you
            remember them. <span className="font-bold">Interviews</span> let you rehearse with Bobbin once
            you&apos;ve practiced. There&apos;s no timer on lessons, and your place is saved if you need to stop.
          </p>
        </div>
      )}

      <button type="button" onClick={onStart} className="btn-primary self-start">
        Start with lesson 1
      </button>
    </section>
  );
}

/** Shown before every lesson: what you'll be able to do, and how the lesson runs. */
export function LessonIntro({ lesson, onBegin }: { lesson: Lesson; onBegin: () => void }) {
  return (
    <section className="flex flex-col gap-5" aria-labelledby="lesson-intro-title">
      <h1 id="lesson-intro-title" className="font-pixel text-3xl font-bold text-ink">
        {lesson.title}
      </h1>
      <p className="text-lg text-ink">{lesson.intro.summary}</p>
      <p className="text-sm text-ink-soft">
        About {lesson.minutes} minutes · {lesson.ideas.length} short ideas
      </p>

      <div className="pixel-box flex flex-col gap-3 bg-mint p-5">
        <h2 className="font-pixel text-lg font-bold text-ink">By the end you&apos;ll be able to</h2>
        <ul className="flex flex-col gap-2">
          {lesson.intro.outcomes.map((o) => (
            <li key={o} className="flex items-start gap-3 text-ink">
              <span className="mt-1.5 shrink-0">
                <PixelIcon name="check" size={16} color="#2f7f78" />
              </span>
              {o}
            </li>
          ))}
        </ul>
      </div>

      <div className="pixel-box flex flex-col gap-3 p-5">
        <h2 className="font-pixel text-lg font-bold text-ink">How it works</h2>
        <p className="text-ink">Each idea goes like this:</p>
        <ol className="list-decimal space-y-1.5 pl-5 text-ink">
          {HOW_LESSONS_WORK.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="text-sm text-ink-soft">
          Nothing is graded and there&apos;s no timer. Your place is saved after every step, so you can leave
          whenever you need to.
        </p>
      </div>

      <button type="button" onClick={onBegin} className="btn-primary self-start">
        Begin lesson
      </button>
    </section>
  );
}
