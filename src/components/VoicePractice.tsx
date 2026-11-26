"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { COMPANION, DAILY_INTERVIEW_CAP } from "@/lib/config";
import { todayStr } from "@/lib/dates";
import { NAV_AGAIN } from "@/lib/events";
import { canListen, hush, LISTEN_PROBLEM, speak, useDictation } from "@/lib/speech";
import { recordPractice, useHydrated } from "@/lib/store";
import { supabaseConfigured } from "@/lib/supabase/config";
import { useAuthUser } from "@/lib/useAuthUser";
import { useSeason } from "@/lib/useSeason";
import {
  answerNotes,
  fmtClock,
  interviewsLeft,
  lengthNote,
  MODE_LABEL,
  reassurance,
  STORY_QUESTIONS,
  summarize,
  transcriptText,
  VOICE_SECONDS,
  type Interview,
  type Mode,
  type Turn,
  type VoiceQuestion,
} from "@/lib/voice";
import { countInterview, deleteInterview, saveInterview, usedToday, useVoiceData } from "@/lib/voiceStore";
import { LeaveDialog } from "./LeaveDialog";
import { PixelArtBobbin } from "./PixelArtBobbin";
import { PixelIcon } from "./PixelIcon";
import { SeasonBadgeTea } from "./SeasonHeadline";
import { InterviewSkeleton } from "./Skeleton";
import { StreakCelebration } from "./StreakCelebration";
import { TalkingBobbin } from "./TalkingBobbin";
import { TeaBreak } from "./TeaBreak";

type Step = "choose" | "ready" | "explain" | "ask" | "answer" | "check" | "feedback" | "notsure" | "review" | "summary" | "transcript";

/** Steps that are part of a running interview, with its controls at the top. */
const IN_ROUND: Step[] = ["ask", "answer", "check", "feedback", "notsure"];

const SCREEN = "mx-auto flex w-full max-w-3xl flex-col items-center gap-5 text-center";

function TeaButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button type="button" className={`btn-accent gap-2 whitespace-nowrap max-sm:px-2 max-sm:text-[13px] ${className}`} onClick={onClick}>
      Take a tea break
      <SeasonBadgeTea />
    </button>
  );
}

function Scale({ label, value, onPick }: { label: string; value: number; onPick: (n: number) => void }) {
  return (
    <fieldset className="flex flex-col items-center gap-3">
      <legend className="mb-3 w-full text-center text-lg font-bold text-ink">{label}</legend>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-sm text-ink-soft">Not ready</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className={`flex h-11 w-11 cursor-pointer items-center justify-center border-[3px] border-line font-sans text-lg font-bold text-ink has-[:focus-visible]:outline has-[:focus-visible]:outline-4 has-[:focus-visible]:outline-teal-deep ${
              value === n ? "bg-butter" : "bg-paper"
            }`}
          >
            <input type="radio" name={label} className="sr-only" checked={value === n} onChange={() => onPick(n)} />
            {n}
          </label>
        ))}
        <span className="text-sm text-ink-soft">Ready</span>
      </div>
    </fieldset>
  );
}

function KeyPoints({ question, turn, onToggle }: { question: VoiceQuestion; turn: Turn; onToggle: (i: number) => void }) {
  return (
    <fieldset className="pixel-box w-full bg-mint p-5 text-left">
      <legend className="font-pixel px-1 text-base font-bold text-ink">Check the ones you covered</legend>
      {question.rubric.map((point, i) => (
        <label key={point} className="flex cursor-pointer items-start gap-3 py-1.5 text-ink">
          <input type="checkbox" checked={turn.covered[i] ?? false} onChange={() => onToggle(i)} className="mt-1 h-5 w-5 accent-teal" />
          <span>{point}</span>
        </label>
      ))}
    </fieldset>
  );
}

function List({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <section className={`pixel-box flex-1 p-5 text-left ${tone}`}>
      <h2 className="font-pixel text-lg font-bold text-ink">{title}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-ink">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function VoicePractice({ onExit }: { onExit: () => void }) {
  const hydrated = useHydrated();
  const auth = useAuthUser();
  const data = useVoiceData();
  const season = useSeason();
  const owner = auth.user?.id ?? "device";
  const questions = STORY_QUESTIONS;

  const [step, setStep] = useState<Step>("choose");
  const [mode, setMode] = useState<Mode>("coach");
  const [ready, setReady] = useState(0);
  const [adult, setAdult] = useState(false);
  const [testing, setTesting] = useState(false);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [edited, setEdited] = useState(false);
  const [notSure, setNotSure] = useState(false);
  const [left, setLeft] = useState(VOICE_SECONDS);
  const [spent, setSpent] = useState(0);
  const [onBreak, setOnBreak] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [confirm, setConfirm] = useState<"redo" | "delete" | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const counted = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);

  const { heard, error, waiting, start: listen, stop: stopListening } = useDictation();
  const question = questions[index];
  const inRound = IN_ROUND.includes(step);
  const timeUp = left === 0;
  const supported = hydrated && canListen();
  // Speech that can't be heard falls back to typing, keeping whatever was already heard.
  const mustType = typing || !supported || error !== null;
  // If listening fails partway, what was heard moves into the text box.
  const typed = draft || (error ? heard : "");
  const spoken = mustType ? typed : heard;

  // Move focus to each new screen's heading, so keyboard and screen reader users follow along.
  useEffect(() => {
    heading.current?.focus();
  }, [step, index, onBreak]);

  useEffect(() => hush, []);

  // Out of time: stop listening. What was heard stays on screen to send.
  useEffect(() => {
    if (timeUp) stopListening();
  }, [timeUp, stopListening]);

  // The seven minutes only run while you are answering.
  const clockOn = step === "answer" && !onBreak && !leaving && !waiting && left > 0;
  useEffect(() => {
    if (!clockOn) return;
    const id = window.setInterval(() => {
      setLeft((s) => Math.max(0, s - 1));
      setSpent((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [clockOn]);

  const exit = useCallback(() => {
    hush();
    stopListening();
    onExit();
  }, [onExit, stopListening]);

  // Leaving ends the interview and throws it away. Ask first only if there is something to lose.
  const hasWork = !!interview && (interview.turns.length > 0 || draft.trim() !== "" || heard.trim() !== "");
  const leave = useCallback(() => {
    if (inRound && hasWork) setLeaving(true);
    else exit();
  }, [inRound, hasWork, exit]);

  useEffect(() => {
    window.addEventListener(NAV_AGAIN, leave);
    return () => window.removeEventListener(NAV_AGAIN, leave);
  }, [leave]);

  if (!hydrated || !auth.ready) return <InterviewSkeleton />;

  if (supabaseConfigured && !auth.user) {
    return (
      <section className={SCREEN}>
        <PixelArtBobbin mood="happy" outfit={season} size={140} />
        <h1 className="font-pixel text-3xl font-bold text-ink">Sign in to practice by voice</h1>
        <p className="text-ink">Voice practice needs an account. Typed interview rounds stay open to everyone.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/login" className="btn-primary">
            Sign in
          </Link>
          <button type="button" className="btn-secondary" onClick={onExit}>
            Back to interviews
          </button>
        </div>
      </section>
    );
  }

  const leftToday = interviewsLeft(usedToday(data, owner), DAILY_INTERVIEW_CAP);
  const mine = data.interviews.filter((i) => i.owner === owner);

  function update(next: Interview) {
    setInterview(next);
    saveInterview(next);
  }

  function say(i: number) {
    speak(questions[i].prompt);
  }

  function ask(i: number) {
    setIndex(i);
    setDraft("");
    setTyping(false);
    setEdited(false);
    setNotSure(false);
    setSpent(0);
    setStep("ask");
    say(i);
  }

  function begin() {
    stopListening();
    setTesting(false);
    counted.current = false;
    setLeft(VOICE_SECONDS);
    setInterview({ id: String(Date.now()), owner, at: Date.now(), mode, turns: [], readyBefore: ready });
    ask(0);
  }

  function answer(keep = "", byTyping = typing) {
    hush();
    setDraft(keep);
    setTyping(byTyping);
    setStep("answer");
    if (supported && !byTyping) listen(keep);
  }

  /** Saves the current question's turn and returns the interview with it. */
  function record(text: string, more: Partial<Turn> = {}): Interview {
    if (!counted.current) {
      counted.current = true;
      countInterview(owner);
    }
    const turn: Turn = {
      questionId: question.id,
      kind: question.kind,
      question: question.prompt,
      answer: text.trim(),
      seconds: spent,
      edited,
      typed: mustType && !heard.trim(),
      notSure,
      skipped: false,
      covered: question.rubric.map(() => false),
      ...more,
    };
    if (turn.answer) recordPractice();
    const next = { ...interview!, turns: [...interview!.turns.filter((t) => t.questionId !== question.id), turn] };
    update(next);
    return next;
  }

  /** On to the next question, or to the end when there are none left or the time is used up. */
  function advance(current: Interview) {
    if (index + 1 < questions.length && left > 0) ask(index + 1);
    else {
      hush();
      setStep(current.mode === "full" ? "review" : "summary");
    }
  }

  function done() {
    const text = spoken;
    stopListening();
    if (!text.trim()) return;
    if (interview!.mode === "coach") {
      setDraft(text);
      setStep("check");
    } else advance(record(text));
  }

  function redo() {
    setConfirm(null);
    setEdited(false);
    setSpent(0);
    answer("", false);
  }

  function toggle(questionId: string, i: number) {
    update({
      ...interview!,
      turns: interview!.turns.map((t) =>
        t.questionId === questionId ? { ...t, covered: t.covered.map((v, j) => (j === i ? !v : v)) } : t,
      ),
    });
  }

  function takeBreak() {
    hush();
    stopListening();
    // Keep what was said, so the answer carries on afterward.
    if (step === "answer") setDraft(spoken);
    setOnBreak(true);
  }

  function endBreak() {
    setOnBreak(false);
    if (step === "answer" && supported && !typing) listen(draft);
  }

  function download(item: Interview) {
    const url = URL.createObjectURL(new Blob([transcriptText(item)], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `tuftly-transcript-${todayStr(new Date(item.at))}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const title = (text: string, className = "text-3xl") => (
    <h1 ref={heading} tabIndex={-1} className={`font-pixel font-bold text-ink outline-none ${className}`}>
      {text}
    </h1>
  );

  const bird = (mood: "happy" | "thinking" | "cheering", size = 130) => <PixelArtBobbin mood={mood} outfit={season} size={size} />;

  if (onBreak) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <TeaBreak onReady={endBreak} />
      </div>
    );
  }

  const current = step === "transcript" ? (mine.find((i) => i.id === openId) ?? interview) : interview;
  const turn = interview?.turns.find((t) => t.questionId === question.id);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <button type="button" className="btn-secondary gap-2 whitespace-nowrap max-sm:px-2 max-sm:text-[13px]" onClick={leave}>
          <PixelIcon name="exit" size={18} color="#4a3326" />
          {inRound ? "Leave interview" : "Back to interviews"}
        </button>
        {inRound && <TeaButton onClick={takeBreak} />}
      </div>

      {inRound && (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <span className="pixel-chip bg-butter">Your story</span>
          <span className="pixel-chip bg-mint">{MODE_LABEL[mode]}</span>
          <span className="pixel-chip bg-sky">
            Question <span className="font-sans">{index + 1}</span> of <span className="font-sans">{questions.length}</span>
          </span>
          <span className="pixel-chip">
            <span className="font-sans font-bold">{timeUp ? "Time's up" : `${fmtClock(left)} left`}</span>
          </span>
        </div>
      )}

      {step === "choose" && (
        <section className={SCREEN}>
          {title("Your story, out loud")}
          <p className="text-lg text-ink-soft">
            <strong className="font-extrabold text-ink">Practice for AI-powered voice interviews, not for interviews with real people.</strong>{" "}
            “Tell me about yourself” and the questions that follow it.
          </p>
          <div role="radiogroup" aria-label="How to practice" className="grid w-full gap-4 sm:grid-cols-2">
            {(
              [
                ["coach", "bg-mint", "Check in after each question, and try again if you like.", "Gentle · good for learning"],
                ["full", "bg-lilac", "Go through it all like the real thing. Look back at the end.", "Realistic · good for rehearsal"],
              ] as const
            ).map(([id, tone, about, note]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={mode === id}
                onClick={() => setMode(id)}
                className={`pixel-box flex flex-col gap-2 p-5 text-left ${tone} ${mode === id ? "outline outline-4 outline-offset-2 outline-teal-deep" : ""}`}
              >
                <span className="font-pixel text-xl font-bold text-ink">{MODE_LABEL[id]}</span>
                <span className="text-ink">{about}</span>
                <span className="text-sm font-bold text-ink">{note}</span>
              </button>
            ))}
          </div>
          <p className="text-xl font-bold text-ink">
            Up to 7 minutes of answering ·{" "}
            <span className="text-orange-deep">
              {leftToday} {leftToday === 1 ? "interview" : "interviews"} left today
            </span>
          </p>
          {leftToday === 0 && <p className="text-ink">That&apos;s both for today. Typed rounds are still open, and you get two more tomorrow.</p>}
          <button type="button" className="btn-primary" disabled={leftToday === 0} onClick={() => setStep("ready")}>
            Next
          </button>
          {mine.length > 0 && (
            <div className="w-full">
              <h2 className="font-pixel text-lg font-bold text-ink">Past practice</h2>
              <ul className="mt-2 flex flex-col gap-2">
                {mine.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="font-semibold text-teal-deep underline"
                      onClick={() => {
                        setOpenId(item.id);
                        setStep("transcript");
                      }}
                    >
                      {new Date(item.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} ·{" "}
                      {MODE_LABEL[item.mode]}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {step === "ready" && (
        <section className={SCREEN}>
          {title("Before we start")}
          <Scale label="How ready do you feel?" value={ready} onPick={setReady} />
          <div aria-live="polite" className="w-full max-w-xl">
            {ready > 0 && (
              <div className="pixel-box flex items-center gap-4 bg-mint p-5 text-left">
                <span className="shrink-0 max-sm:hidden">{bird("happy", 88)}</span>
                <div className="flex flex-col items-start gap-3">
                  <p className="text-ink">{reassurance(ready).text}</p>
                  {reassurance(ready).offerTea && <TeaButton onClick={takeBreak} />}
                </div>
              </div>
            )}
          </div>
          <button type="button" className="btn-primary" disabled={ready === 0} onClick={() => setStep("explain")}>
            Next
          </button>
        </section>
      )}

      {step === "explain" && (
        <section className={SCREEN}>
          <TalkingBobbin size={150} />
          {title("How this works", "text-2xl")}
          <p className="pixel-box max-w-xl p-4 text-ink">
            Hi! This is practice for an AI-powered voice interview, not one with a real person. I&apos;ll ask a question out loud.
            Answer when you&apos;re ready, then press “Done answering”. Each question has a follow-up. Saying “I&apos;m not sure” is
            allowed. I don&apos;t judge your answers: you check them against key points.
          </p>
          <div className="pixel-box flex max-w-xl flex-col gap-3 bg-sky p-4 text-left text-ink">
            <label className="flex cursor-pointer items-start gap-3 font-bold">
              <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} className="mt-1 h-5 w-5 accent-teal" />
              I&apos;m 18 or older and in the US
            </label>
            <p className="text-sm">
              Your browser turns your voice into text. Some browsers, including Chrome and Safari, may send the audio to their maker
              to do that. tuftly doesn&apos;t save audio. Your transcript stays on this device.
            </p>
          </div>
          {!supported && <p className="text-ink">This browser can&apos;t listen, so you&apos;ll type your answers. Say them out loud first.</p>}
          {testing && (
            <p className="text-ink" aria-live="polite">
              {waiting
                ? "Waiting for you to allow the microphone. Take your time."
                : error
                  ? `${LISTEN_PROBLEM[error]} You can also type your answers.`
                  : heard
                    ? `I heard: “${heard}”`
                    : "Say a few words…"}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            {supported && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  // After a problem the same button tries again.
                  if (testing && !error) {
                    stopListening();
                    setTesting(false);
                  } else {
                    listen();
                    setTesting(true);
                  }
                }}
              >
                {testing ? (error ? "Try the microphone again" : "Stop the test") : "Test my microphone"}
              </button>
            )}
            <button type="button" className="btn-primary" disabled={!adult} onClick={begin}>
              Start
            </button>
          </div>
        </section>
      )}

      {step === "ask" && (
        <section className={SCREEN}>
          <TalkingBobbin key={index} size={170} />
          {question.kind === "followup" && <span className="pixel-chip bg-peach">Follow-up</span>}
          <div className="pixel-box w-full max-w-xl p-6">{title(question.prompt, "text-2xl")}</div>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" className="btn-secondary" onClick={() => say(index)}>
              Hear it again
            </button>
            <button type="button" className="btn-primary" onClick={() => answer()}>
              Start answering
            </button>
          </div>
        </section>
      )}

      {step === "answer" && (
        <section className={SCREEN}>
          {title(question.prompt, "text-2xl")}
          <p className="pixel-chip bg-peach" role="status">
            {timeUp ? "That's all 7 minutes" : waiting ? "Waiting for the microphone" : mustType ? "Typing" : "● Listening…"} <span className="font-sans">{fmtClock(spent)}</span>
          </p>
          {error && (
            <p className="text-ink" role="alert">
              {LISTEN_PROBLEM[error]} Or type your answer here.
            </p>
          )}
          {mustType ? (
            <textarea
              aria-label="Your answer"
              value={typed}
              onChange={(e) => setDraft(e.target.value)}
              disabled={timeUp}
              rows={5}
              placeholder="Say it out loud, then type it here."
              className="w-full border-[3px] border-line bg-paper p-3 text-left text-ink placeholder:text-ink-soft"
            />
          ) : (
            <p className="pixel-box min-h-32 w-full bg-paper p-4 text-left text-lg text-ink" aria-label="What Bobbin hears">
              {heard || (
                <span className="text-ink-soft">
                  {waiting ? "Allow the microphone in your browser. Take your time; the clock is waiting too." : "Start speaking. Your words show up here."}
                </span>
              )}
            </p>
          )}
          <p className="text-sm text-ink-soft">Take your time. Pauses are fine.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="btn-accent"
              onClick={() => {
                stopListening();
                setNotSure(true);
                setStep("notsure");
              }}
            >
              I&apos;m not sure
            </button>
            {mustType && supported && !timeUp && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  // Carry on from whatever has been typed or heard.
                  setTyping(false);
                  setDraft("");
                  listen(typed);
                }}
              >
                {error ? "Try the microphone again" : "Use the microphone"}
              </button>
            )}
            {!mustType && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setDraft(heard);
                  stopListening();
                  setTyping(true);
                }}
              >
                Type instead
              </button>
            )}
            <button type="button" className="btn-primary" disabled={!spoken.trim()} onClick={done}>
              Done answering
            </button>
            {timeUp && !spoken.trim() && (
              <button type="button" className="btn-secondary" onClick={() => advance(interview!)}>
                Finish
              </button>
            )}
          </div>
        </section>
      )}

      {step === "check" && (
        <section className={SCREEN}>
          {title("Did I hear you right?", "text-2xl")}
          <label className="flex w-full flex-col gap-2 text-left font-bold text-ink">
            Your answer (click to edit)
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setEdited(true);
              }}
              rows={5}
              className="w-full border-[3px] border-line bg-paper p-3 font-sans text-lg font-normal text-ink focus:outline focus:outline-4 focus:outline-teal-deep"
            />
          </label>
          <p className="text-ink-soft">Fix any words I got wrong before you send it. The clock is paused.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" className="btn-secondary" disabled={timeUp} onClick={() => (edited ? setConfirm("redo") : redo())}>
              Answer again
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!draft.trim()}
              onClick={() => {
                record(draft);
                setStep("feedback");
              }}
            >
              Send answer
            </button>
          </div>
        </section>
      )}

      {step === "feedback" && turn && (
        <section className={SCREEN}>
          {bird("happy", 110)}
          {title("How did that go?", "text-2xl")}
          <KeyPoints question={question} turn={turn} onToggle={(i) => toggle(question.id, i)} />
          {lengthNote(turn) && <p className="font-bold text-ink">{lengthNote(turn)}</p>}
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" className="btn-secondary" disabled={timeUp} onClick={redo}>
              Try this one again
            </button>
            <button type="button" className="btn-primary" onClick={() => advance(interview!)}>
              {index + 1 === questions.length || timeUp ? "Finish" : questions[index + 1].kind === "followup" ? "Next: follow-up" : "Next question"}
            </button>
          </div>
        </section>
      )}

      {step === "notsure" && (
        <section className={SCREEN}>
          {bird("thinking", 150)}
          {title("That's okay. It happens in real interviews too.", "text-2xl")}
          <List title="A way to start" items={question.hints} tone="w-full max-w-xl flex-none bg-sky" />
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" className="btn-secondary" onClick={() => advance(record("", { skipped: true }))}>
              Skip this one
            </button>
            <button type="button" className="btn-primary" disabled={timeUp} onClick={() => answer(spoken)}>
              Try answering
            </button>
          </div>
        </section>
      )}

      {step === "review" && interview && (
        <section className={SCREEN}>
          {title("Now look back")}
          <p className="text-ink">Check the key points each answer covered. This is only for you.</p>
          {interview.turns.map((t) => (
            <div key={t.questionId} className="flex w-full flex-col gap-2 text-left">
              <h2 className="font-pixel text-lg font-bold text-ink">{t.question}</h2>
              <p className="pixel-box bg-paper p-3 text-ink">{t.skipped ? "Skipped" : t.answer}</p>
              {lengthNote(t) && <p className="text-sm font-bold text-ink">{lengthNote(t)}</p>}
              {!t.skipped && (
                <KeyPoints question={questions.find((q) => q.id === t.questionId)!} turn={t} onToggle={(i) => toggle(t.questionId, i)} />
              )}
            </div>
          ))}
          <button type="button" className="btn-primary" onClick={() => setStep("summary")}>
            See my summary
          </button>
        </section>
      )}

      {step === "summary" && interview && (
        <section className={SCREEN}>
          <StreakCelebration />
          {bird("cheering", 120)}
          {title(interview.turns.length === questions.length ? "That's the whole interview!" : "That's a wrap!")}
          <div className="flex w-full flex-col gap-4 sm:flex-row">
            <List title="What you covered" items={summarize(interview.turns).covered.length ? summarize(interview.turns).covered : ["You showed up and practiced"]} tone="bg-mint" />
            {summarize(interview.turns).next.length > 0 && <List title="To try next time" items={summarize(interview.turns).next} tone="bg-butter" />}
          </div>
          <p className="text-sm text-ink-soft">Saved on this device: your transcript. No audio.</p>
          <Scale label="How ready do you feel now?" value={interview.readyAfter ?? 0} onPick={(n) => update({ ...interview, readyAfter: n })} />
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setOpenId(interview.id);
                setStep("transcript");
              }}
            >
              Read the transcript
            </button>
            <button type="button" className="btn-primary" onClick={exit}>
              Done
            </button>
          </div>
        </section>
      )}

      {step === "transcript" && current && (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {title("Your transcript")}
          <p className="text-sm text-ink-soft">
            Your story · {MODE_LABEL[current.mode]} · {new Date(current.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
          <ol className="flex flex-col gap-3">
            {current.turns.map((t) => (
              <li key={t.questionId} className="flex flex-col gap-3">
                <div className="pixel-box mr-8 self-start bg-sky p-3 text-ink">
                  <p className="text-sm font-bold">
                    {COMPANION.name} · {t.kind === "followup" ? "Follow-up" : "Question"}
                  </p>
                  <p>{t.question}</p>
                </div>
                <div className="pixel-box ml-8 self-end bg-paper p-3 text-ink">
                  <p className="text-sm font-bold">You · {answerNotes(t)}</p>
                  {!t.skipped && <p>{t.answer}</p>}
                </div>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" className="btn-secondary" onClick={() => setConfirm("delete")}>
              Delete transcript
            </button>
            <button type="button" className="btn-secondary" onClick={() => download(current)}>
              Download transcript
            </button>
            <button type="button" className="btn-primary" onClick={() => setStep(interview?.id === current.id ? "summary" : "choose")}>
              {interview?.id === current.id ? "Back to summary" : "Back"}
            </button>
          </div>
          <p className="text-center text-sm text-ink-soft">Downloads as a plain text file to your device.</p>
        </section>
      )}

      {leaving && (
        <LeaveDialog
          onStay={() => setLeaving(false)}
          onLeave={() => {
            if (interview) deleteInterview(interview.id);
            exit();
          }}
        />
      )}

      {confirm && (
        <LeaveDialog
          title={confirm === "redo" ? "Replace this answer?" : "Delete this transcript?"}
          message={confirm === "redo" ? "Your edits will be lost when you record it again." : "It can't be brought back."}
          stayLabel="Keep it"
          leaveLabel={confirm === "redo" ? "Record again" : "Delete"}
          exitIcon={false}
          onStay={() => setConfirm(null)}
          onLeave={() => {
            if (confirm === "redo") return redo();
            if (current) deleteInterview(current.id);
            if (interview?.id === current?.id) setInterview(null);
            setConfirm(null);
            setStep("choose");
          }}
        />
      )}
    </div>
  );
}
