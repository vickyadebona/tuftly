"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getDrills, getLessons } from "@/content";
import { COMPANION, type PressureLevel } from "@/lib/config";
import { NAV_AGAIN } from "@/lib/events";
import { recordPractice, useHydrated, useProgress } from "@/lib/store";
import { interleave } from "@/lib/queue";
import { lessonMix, minutesFor, SESSIONS, sessionQuestions, type RoundQuestion } from "@/lib/sessions";
import { useSeason } from "@/lib/useSeason";
import { CodeBlock } from "./CodeBlock";
import { useLeaveGuard } from "@/lib/useLeaveGuard";
import { LeaveDialog } from "./LeaveDialog";
import { VoicePractice } from "./VoicePractice";
import { PixelArtBobbin } from "./PixelArtBobbin";
import { PixelIcon } from "./PixelIcon";
import { TeaBreak } from "./TeaBreak";
import { SeasonBadgeTea } from "./SeasonHeadline";
import { InterviewSkeleton } from "./Skeleton";
import { StreakCelebration } from "./StreakCelebration";
import { RichText } from "./RichText";

// A practice round with the content we already have: a named session, or a mix from finished
// lessons. You check your own answer against key points. The AI interviewer (follow-ups,
// scoring) comes later. Voice practice is in VoicePractice.tsx.

const PRESSURE: { id: PressureLevel; label: string; seconds: number | null; hints: boolean; note: string }[] = [
  { id: "relaxed", label: "Relaxed", seconds: null, hints: true, note: "Hints on · No timer" },
  { id: "standard", label: "Standard", seconds: 300, hints: true, note: "Hints on · Gentle timer" },
  { id: "zara-like", label: "Interview day", seconds: 180, hints: false, note: "Hints off · Strict timer" },
];

/** Each pace keeps its color from the picker into the round. */
const LEVEL_BG = { relaxed: "bg-mint", standard: "bg-peach", "zara-like": "bg-lilac" } as const;

function fmt(total: number) {
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function Round({ pressure, title, questions, onLeave }: { pressure: PressureLevel; title: string; questions: RoundQuestion[]; onLeave: () => void }) {
  const season = useSeason();
  const level = PRESSURE.find((p) => p.id === pressure)!;

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"answering" | "checking">("answering");
  const [answer, setAnswer] = useState("");
  const [nudge, setNudge] = useState(false);
  const [ticked, setTicked] = useState<boolean[]>([]);
  const [results, setResults] = useState<{ topic: string; hit: number; total: number }[]>([]);
  const [onBreak, setOnBreak] = useState(false);
  const [left, setLeft] = useState<number | null>(level.seconds);
  const [leaving, setLeaving] = useState(false);
  // Where a link was headed when it was stopped to ask about leaving.
  const [goingTo, setGoingTo] = useState<string | null>(null);
  const router = useRouter();

  const finished = index >= questions.length;
  const q = questions[index];

  // Leaving ends the round (a tea break is the way to pause), so ask first until it's finished.
  const leave = useCallback(() => {
    if (!finished) setLeaving(true);
    else onLeave();
  }, [finished, onLeave]);

  const askToGo = useCallback((href: string) => {
    setGoingTo(href);
    setLeaving(true);
  }, []);
  useLeaveGuard(!finished, askToGo);

  // Tapping "Interviews" in the menu during a round means leaving it too.
  useEffect(() => {
    window.addEventListener(NAV_AGAIN, leave);
    return () => window.removeEventListener(NAV_AGAIN, leave);
  }, [leave]);

  // Gentle clock: only runs while you are answering, not on a tea break or deciding to leave.
  const clockOn = left !== null && phase === "answering" && !onBreak && !leaving && !finished;
  useEffect(() => {
    if (!clockOn) return;
    const id = window.setInterval(() => setLeft((s) => (s === null ? s : Math.max(0, s - 1))), 1000);
    return () => window.clearInterval(id);
  }, [clockOn]);

  // An interview answer counts toward the streak, typed here or said aloud and checked off.
  function send() {
    if (answer.trim()) recordPractice();
    setPhase("checking");
    setTicked(q.rubric.map(() => false));
  }

  function next() {
    const hit = ticked.filter(Boolean).length;
    if (hit > 0) recordPractice();
    setResults((r) => [...r, { topic: q.topic, hit, total: q.rubric.length }]);
    setIndex((i) => i + 1);
    setPhase("answering");
    setAnswer("");
    setNudge(false);
    setLeft(level.seconds);
  }

  if (finished) return <Summary results={results} season={season} onAnother={onLeave} />;

  const mood = onBreak ? "sleepy" : phase === "checking" ? "happy" : "thinking";
  const bobbinSays = onBreak
    ? "Breathe in, breathe out. I'll hold your place."
    : phase === "checking"
      ? "Check off the key points your answer covered. This is only for you."
      : index === 0
        ? // Said as each round starts, so nobody expects this to prepare them for a person.
          "This is practice for an AI-powered voice interview, not for an interview with a real person. A rough answer is a fine start."
        : "Answer in your own words. A rough answer is a fine start.";
  const timeUp = pressure === "zara-like" && left === 0;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-pixel text-2xl font-bold text-ink">Interview with Bobbin</h1>
          <span className="pixel-chip bg-butter">{title}</span>
          <span className={`pixel-chip ${LEVEL_BG[pressure]}`}>{level.label}</span>
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
        <div className="flex flex-wrap items-center gap-3">
          {left !== null && (
            <span className="pixel-chip" aria-live="off">
              <PixelIcon name="coin" size={16} color="#f2b93b" />
              <span className="font-sans font-bold">{timeUp ? "Time's up" : `${fmt(left)} left`}</span>
            </span>
          )}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {!onBreak && (
              <button type="button" className="btn-accent whitespace-nowrap max-sm:px-2 max-sm:text-[13px]" onClick={() => setOnBreak(true)}>
                Take a tea break
                <span className="ml-1.5 sm:ml-2">
                  <SeasonBadgeTea />
                </span>
              </button>
            )}
            <button type="button" className="btn-secondary gap-1.5 whitespace-nowrap max-sm:px-2 max-sm:text-[13px] sm:gap-2" onClick={leave}>
              <PixelIcon name="exit" size={18} color="#4a3326" />
              Leave interview
            </button>
          </div>
        </div>
      </div>

      {onBreak ? (
        <div className="flex flex-1 items-center justify-center">
          <TeaBreak onReady={() => setOnBreak(false)} />
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
                  <RichText text={q.sayIt} />
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
                      <RichText text={point} />
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

      {leaving && (
        <LeaveDialog
          onStay={() => {
            setLeaving(false);
            setGoingTo(null);
          }}
          onLeave={() => {
            if (goingTo) router.push(goingTo);
            onLeave();
          }}
        />
      )}
    </div>
  );
}

const LEVEL_MOOD = { relaxed: "happy", standard: "sparkle", "zara-like": "determined" } as const;

const MIX = "mix";

/** Pick what to practice, then how it should feel, then the round starts. */
export function InterviewRound() {
  const hydrated = useHydrated();
  const progress = useProgress();
  const season = useSeason();
  const [pressure, setPressure] = useState<PressureLevel>("relaxed");
  const [picked, setPicked] = useState<string | null>(null);
  // The questions are fixed when the round starts, so finishing a lesson elsewhere can't change them.
  const [round, setRound] = useState<{ title: string; questions: RoundQuestion[] } | null>(null);
  // Voice practice lives on this page, so tapping "Interviews" in the menu asks before leaving.
  const [voice, setVoice] = useState(false);

  const endRound = useCallback(() => {
    setRound(null);
    setPicked(null);
  }, []);
  const endVoice = useCallback(() => setVoice(false), []);
  const paceHeading = useRef<HTMLHeadingElement>(null);

  // Picking a session opens the pace step: move focus there, and let the "Interviews" menu go back.
  const choosingPace = picked !== null && round === null;
  useEffect(() => {
    if (!choosingPace) return;
    paceHeading.current?.focus();
    const back = () => setPicked(null);
    window.addEventListener(NAV_AGAIN, back);
    return () => window.removeEventListener(NAV_AGAIN, back);
  }, [choosingPace]);

  if (!hydrated) return <InterviewSkeleton />;

  // The mix needs a finished lesson and one practice. Named sessions are open to everyone.
  const practiced = Object.keys(progress.cards).length > 0;
  const mixReady = practiced && getDrills().some((d) => progress.lessonsDone.includes(d.lessonId));
  const lessons = getLessons();
  const named = SESSIONS.map((s) => ({ ...s, count: sessionQuestions(s, lessons).length })).filter((s) => s.count > 0);
  const pickedTitle = picked === MIX ? "Mix from your lessons" : named.find((s) => s.id === picked)?.title;

  function start() {
    const session = named.find((s) => s.id === picked);
    setRound(
      session
        ? { title: session.title, questions: sessionQuestions(session, lessons) }
        : { title: "Mix from your lessons", questions: lessonMix(getDrills(), progress.lessonsDone, interleave) },
    );
  }

  if (voice) return <VoicePractice onExit={endVoice} />;

  if (round) return <Round pressure={pressure} title={round.title} questions={round.questions} onLeave={endRound} />;

  const card = (id: string, name: string, about: string, note: string, disabled = false) => (
    <button
      key={id}
      type="button"
      disabled={disabled}
      onClick={() => setPicked(id)}
      className="pixel-box flex flex-col bg-paper px-3 py-2 text-left hover:bg-butter disabled:cursor-not-allowed disabled:bg-cream-deep sm:p-4"
    >
      <span className="font-pixel text-lg font-bold text-ink">{name}</span>
      <span className="text-sm text-ink-soft sm:text-base">{about}</span>
      <span className="text-sm font-semibold text-ink">{note}</span>
    </button>
  );

  if (pickedTitle) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
        <button type="button" className="btn-secondary self-start" onClick={() => setPicked(null)}>
          Back to sessions
        </button>
        <span className="pixel-chip bg-butter">{pickedTitle}</span>
        <h1 ref={paceHeading} tabIndex={-1} className="font-pixel text-3xl font-bold text-ink outline-none">
          How should it feel today?
        </h1>
        <p className="text-ink-soft">Pick a pace. You can change it next time.</p>
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
        <button type="button" className="btn-primary" onClick={start}>
          Start round
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
      <h1 className="font-pixel text-3xl font-bold text-ink">What do you want to practice?</h1>
      <p className="text-lg text-ink-soft">
        <strong className="font-extrabold text-ink">
          This is practice for AI-powered voice interviews, not for interviews with real people.
        </strong>{" "}
        Say each answer out loud, then type it or check it off. Pick any session, in any order.
      </p>
      <button
        type="button"
        onClick={() => setVoice(true)}
        className="pixel-box flex w-full flex-col items-center gap-1 bg-teal-wash p-5"
      >
        <span className="pixel-chip bg-butter">New</span>
        <span className="font-pixel text-2xl font-bold text-ink">Your story, out loud</span>
        <span className="text-ink">Bobbin asks “Tell me about yourself” and you answer by voice. Laptop works best.</span>
      </button>
      <h2 className="font-pixel text-2xl font-bold text-ink">Or practice by typing</h2>
      <div role="group" aria-label="Session" className="grid w-full gap-3 sm:grid-cols-2 sm:gap-4">
        {card(
          MIX,
          "Mix from your lessons",
          mixReady ? "Questions from what you've finished" : "Finish a lesson and one short practice to open this",
          mixReady ? "Up to 5 questions · about 10 minutes" : "Not open yet",
          !mixReady,
        )}
        {named.map((s) => card(s.id, s.title, s.about, `${s.count} questions · about ${minutesFor(s.count)} minutes`))}
      </div>
    </section>
  );
}

function Summary({
  results,
  season,
  onAnother,
}: {
  results: { topic: string; hit: number; total: number }[];
  season: ReturnType<typeof useSeason>;
  onAnother: () => void;
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
      <StreakCelebration />
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
            <span className="font-bold text-ink first-letter:uppercase">{r.topic}</span>
            <span className="text-ink-soft">
              {r.hit} of {r.total} key points
            </span>
          </li>
        ))}
      </ul>
      {next && next.pct < 1 && (
        <p className="text-ink">
          Worth another go: <strong>{next.topic}</strong>.
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-4">
        <button type="button" className="btn-primary" onClick={onAnother}>
          Try another session
        </button>
        <Link href="/review" className="btn-secondary">
          Practice drills
        </Link>
        <Link href="/home" className="btn-secondary">
          Back to the quest map
        </Link>
      </div>
    </section>
  );
}
