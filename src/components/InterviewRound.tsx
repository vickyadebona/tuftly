"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDrills } from "@/content";
import { COMPANION, type PressureLevel } from "@/lib/config";
import { useHydrated, useProgress } from "@/lib/store";
import { interleave } from "@/lib/queue";
import { useSeason } from "@/lib/useSeason";
import { CodeBlock } from "./CodeBlock";
import { PixelArtBobbin } from "./PixelArtBobbin";
import { PixelIcon, Teacup } from "./PixelIcon";
import { InterviewSkeleton } from "./Skeleton";

// A practice round with the content we already have. Questions come from the drill bank and you
// check your own answer against key points. The AI interviewer (follow-ups, scoring) comes later.

const ROUND_SIZE = 5;

const PRESSURE: { id: PressureLevel; label: string; seconds: number | null; hints: boolean; note: string }[] = [
  { id: "relaxed", label: "Relaxed", seconds: null, hints: true, note: "Hints on · No timer" },
  { id: "standard", label: "Standard", seconds: 300, hints: true, note: "Hints on · Gentle timer" },
  { id: "zara-like", label: "Interview day", seconds: 180, hints: false, note: "Hints off · Strict timer" },
];

function fmt(total: number) {
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function Round({ pressure }: { pressure: PressureLevel }) {
  const season = useSeason();
  const learned = useProgress().lessonsDone;
  // Only ask about lessons the learner has finished.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const questions = useMemo(() => interleave(getDrills().filter((d) => learned.includes(d.lessonId))).slice(0, ROUND_SIZE), []);
  const level = PRESSURE.find((p) => p.id === pressure)!;

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"answering" | "checking">("answering");
  const [answer, setAnswer] = useState("");
  const [nudge, setNudge] = useState(false);
  const [ticked, setTicked] = useState<boolean[]>([]);
  const [results, setResults] = useState<{ topic: string; hit: number; total: number }[]>([]);
  const [onBreak, setOnBreak] = useState(false);
  const [left, setLeft] = useState<number | null>(level.seconds);

  const finished = index >= questions.length;
  const q = questions[index];

  // Gentle clock: only runs while you are answering and not on a tea break.
  const clockOn = left !== null && phase === "answering" && !onBreak && !finished;
  useEffect(() => {
    if (!clockOn) return;
    const id = window.setInterval(() => setLeft((s) => (s === null ? s : Math.max(0, s - 1))), 1000);
    return () => window.clearInterval(id);
  }, [clockOn]);

  function send() {
    setPhase("checking");
    setTicked(q.rubric.map(() => false));
  }

  function next() {
    const hit = ticked.filter(Boolean).length;
    setResults((r) => [...r, { topic: q.topic, hit, total: q.rubric.length }]);
    setIndex((i) => i + 1);
    setPhase("answering");
    setAnswer("");
    setNudge(false);
    setLeft(level.seconds);
  }

  if (finished) return <Summary results={results} season={season} />;

  const mood = onBreak ? "sleepy" : phase === "checking" ? "happy" : "thinking";
  const bobbinSays = onBreak
    ? "Breathe in, breathe out. I'll hold your place."
    : phase === "checking"
      ? "Tick the key points your answer covered. This is only for you."
      : "Answer in your own words. A rough answer is a fine start.";
  const timeUp = pressure === "zara-like" && left === 0;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-pixel text-2xl font-bold text-ink">Interview with Bobbin</h1>
          <span className="pixel-chip bg-peach">{level.label}</span>
          <span className="pixel-chip bg-sky">
            Question <span className="font-sans">{index + 1}</span> of <span className="font-sans">{questions.length}</span>
          </span>
          <span className="flex gap-1" aria-hidden="true">
            {questions.map((item, i) => (
              <span
                key={item.id}
                className={`h-3 w-5 border-2 border-line ${i < index ? "bg-teal" : i === index ? "bg-butter" : "bg-paper"}`}
              />
            ))}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {left !== null && (
            <span className="pixel-chip" aria-live="off">
              <PixelIcon name="coin" size={16} color="#f2b93b" />
              <span className="font-sans font-bold">{timeUp ? "Time's up" : `${fmt(left)} left`}</span>
            </span>
          )}
          {!onBreak && (
            <button type="button" className="btn-secondary" onClick={() => setOnBreak(true)}>
              Tea break
            </button>
          )}
        </div>
      </div>

      {onBreak ? (
        <div className="flex flex-1 items-center justify-center">
        <section className="pixel-box flex max-w-lg flex-col items-center gap-4 bg-teal-wash p-8 text-center">
          <Teacup size={96} />
          <h2 className="font-pixel text-2xl font-bold text-ink">Tea time</h2>
          <p className="text-lg text-ink">Sip, breathe, then come back when you are ready. The clock is paused.</p>
          <p className="text-ink-soft">In for four. Hold for four. Out for four.</p>
          <button type="button" className="btn-primary" onClick={() => setOnBreak(false)}>
            I&apos;m ready
          </button>
        </section>
        </div>
      ) : (
        <div
          className={`mx-auto grid w-full gap-6 ${
            phase === "checking" ? "max-w-6xl lg:grid-cols-[220px_minmax(0,1fr)_300px]" : "max-w-4xl lg:grid-cols-[220px_minmax(0,1fr)]"
          }`}
        >
          <div className="pixel-box flex items-center gap-3 bg-peach p-3 text-left lg:flex-col lg:gap-2 lg:self-start lg:p-5 lg:text-center">
            <span className="shrink-0 [&_img]:h-16 [&_img]:w-16 lg:[&_img]:h-[140px] lg:[&_img]:w-[140px]">
              <PixelArtBobbin mood={mood} outfit={season} size={140} />
            </span>
            <span className="flex flex-col items-start gap-1 lg:items-center">
              <span className="pixel-chip bg-butter">{COMPANION.name}</span>
              <p className="text-sm text-ink-soft">{bobbinSays}</p>
            </span>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <section className="pixel-box flex flex-col gap-4 p-5" aria-label="Question">
              <h2 className="font-pixel text-xl font-bold leading-snug text-ink">{q.prompt}</h2>
              {q.code && <CodeBlock code={q.code} />}
              {phase === "checking" && (
                <p className="rounded bg-mint p-3 text-ink">
                  <span className="font-bold">A strong answer: </span>
                  {q.sayIt}
                </p>
              )}
            </section>

            <section className="pixel-box flex flex-col gap-3 p-5" aria-label="Your answer">
              <label htmlFor="answer" className="font-pixel text-sm font-bold text-teal-deep">
                Your answer
              </label>
              <textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={phase === "checking"}
                rows={5}
                placeholder="Explain what you would do and why. There is no wrong way to start."
                className="w-full resize-y border-[3px] border-line bg-paper p-3 text-ink placeholder:text-ink-soft disabled:opacity-80"
              />
              {nudge && <p className="rounded bg-butter/40 p-3 text-ink">Nudge: {q.hint}</p>}
              {phase === "answering" ? (
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="btn-secondary" disabled title="Voice answers are coming later">
                    Answer by voice (soon)
                  </button>
                  {level.hints && (
                    <button type="button" className="btn-accent" onClick={() => setNudge(true)}>
                      Need a nudge?
                    </button>
                  )}
                  <button type="button" className="btn-primary order-first w-full sm:order-last sm:w-auto" onClick={send}>
                    Send answer
                  </button>
                </div>
              ) : null}
            </section>
          </div>

          {phase === "checking" && (
            <section className="pixel-box flex flex-col gap-3 self-start bg-mint p-5" aria-label="Key points">
              <h2 className="font-pixel text-xl font-bold text-ink">Key points</h2>
              <ul className="flex flex-col gap-2.5">
                {q.rubric.map((point, i) => (
                  <li key={point}>
                    <label className="flex cursor-pointer items-start gap-3 text-ink">
                      <input
                        type="checkbox"
                        checked={ticked[i] ?? false}
                        onChange={() => setTicked((t) => t.map((v, j) => (j === i ? !v : v)))}
                        className="mt-1 h-5 w-5 accent-teal"
                      />
                      <span>{point}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <button type="button" className="btn-primary mt-2" onClick={next}>
                {index + 1 === questions.length ? "See my round" : "Next question"}
              </button>
            </section>
          )}
        </div>
      )}

    </div>
  );
}

const LEVEL_MOOD = { relaxed: "happy", standard: "sparkle", "zara-like": "determined" } as const;
const LEVEL_BG = { relaxed: "bg-mint", standard: "bg-peach", "zara-like": "bg-lilac" } as const;

/** Needs one finished practice first, then you pick how it feels, then the round starts. */
export function InterviewRound() {
  const hydrated = useHydrated();
  const progress = useProgress();
  const season = useSeason();
  const [pressure, setPressure] = useState<PressureLevel>("relaxed");
  const [started, setStarted] = useState(false);

  if (!hydrated) return <InterviewSkeleton />;

  const practiced = Object.keys(progress.cards).length > 0;

  if (!practiced) {
    return (
      <section className="pixel-box mx-auto flex max-w-xl flex-col items-center gap-4 bg-peach p-8 text-center">
        <PixelArtBobbin mood="sparkle" outfit={season} size={140} />
        <h1 className="font-pixel text-2xl font-bold text-ink">Warm up first</h1>
        <p className="text-lg text-ink">
          Do one short practice before your first interview with {COMPANION.name}. It takes a couple of
          minutes and makes the round much friendlier.
        </p>
        <Link href={progress.lessonsDone.length === 0 ? "/home" : "/review"} className="btn-primary">
          {progress.lessonsDone.length === 0 ? "Start with a lesson" : "Start a practice"}
        </Link>
        {progress.lessonsDone.length === 0 && (
          <p className="text-sm text-ink-soft">Practice drills unlock once you finish a lesson.</p>
        )}
      </section>
    );
  }

  if (started) return <Round pressure={pressure} />;

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
      <h1 className="font-pixel text-3xl font-bold text-ink">How should it feel today?</h1>
      <p className="text-lg text-ink-soft">Pick a pace. You can change it next time.</p>
      <div role="radiogroup" aria-label="How it feels" className="grid w-full gap-5 md:grid-cols-3">
        {PRESSURE.map((p) => {
          const chosen = pressure === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={chosen}
              onClick={() => setPressure(p.id)}
              className={`pixel-box flex items-center gap-4 p-4 text-left md:flex-col md:gap-2 md:p-6 md:text-center ${LEVEL_BG[p.id]} ${
                chosen ? "outline outline-4 outline-offset-2 outline-teal-deep" : ""
              }`}
            >
              <span className="shrink-0 [&_img]:h-16 [&_img]:w-16 md:[&_img]:h-[110px] md:[&_img]:w-[110px]">
                <PixelArtBobbin mood={LEVEL_MOOD[p.id]} outfit={season} size={110} />
              </span>
              <span className="flex flex-col md:items-center">
                <span className="font-pixel text-xl font-bold text-ink">{p.label}</span>
                <span className="text-ink-soft">{p.note}</span>
              </span>
            </button>
          );
        })}
      </div>
      <button type="button" className="btn-primary" onClick={() => setStarted(true)}>
        Start round
      </button>
    </section>
  );
}

function Summary({
  results,
  season,
}: {
  results: { topic: string; hit: number; total: number }[];
  season: ReturnType<typeof useSeason>;
}) {
  const byTopic = new Map<string, { hit: number; total: number }>();
  for (const r of results) {
    const cur = byTopic.get(r.topic) ?? { hit: 0, total: 0 };
    byTopic.set(r.topic, { hit: cur.hit + r.hit, total: cur.total + r.total });
  }
  const rows = [...byTopic.entries()].map(([topic, v]) => ({ topic, ...v, pct: v.total ? v.hit / v.total : 0 }));
  const next = [...rows].sort((a, b) => a.pct - b.pct)[0];

  return (
    <section className="pixel-box mx-auto flex max-w-2xl flex-col items-center gap-5 bg-teal-wash p-8 text-center">
      <PixelArtBobbin mood="cheering" outfit={season} size={150} />
      <h1 className="font-pixel text-3xl font-bold text-ink">That&apos;s a wrap!</h1>
      <p className="text-lg text-ink">You finished the round. Here is where each topic stands, plus a good next step.</p>
      <ol className="flex flex-wrap justify-center gap-3" aria-label="Your round">
        {results.map((r, i) => (
          <li key={i} className="flex flex-col items-center gap-1">
            <span
              className={`flex h-12 w-12 items-center justify-center border-[3px] border-line ${
                r.total > 0 && r.hit / r.total >= 0.5 ? "bg-teal" : "bg-butter"
              }`}
            >
              <PixelIcon
                name={r.total > 0 && r.hit / r.total >= 0.5 ? "check" : "star"}
                size={22}
                color={r.total > 0 && r.hit / r.total >= 0.5 ? "#fffdf4" : "#f2b93b"}
              />
            </span>
            <span className="text-xs text-ink-soft">Question {i + 1}</span>
          </li>
        ))}
      </ol>
      <ul className="flex w-full flex-col gap-3 text-left">
        {rows.map((r) => (
          <li key={r.topic} className="pixel-box flex items-center justify-between gap-4 px-4 py-3">
            <span className="font-bold capitalize text-ink">{r.topic}</span>
            <span className="text-ink-soft">
              {r.hit} of {r.total} key points
            </span>
          </li>
        ))}
      </ul>
      {next && next.pct < 1 && (
        <p className="text-ink">
          Next up: a few short drills on <strong className="capitalize">{next.topic}</strong> will help it stick.
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/review" className="btn-primary">
          Practice drills
        </Link>
        <Link href="/home" className="btn-secondary">
          Back to the quest map
        </Link>
      </div>
    </section>
  );
}
