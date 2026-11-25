"use client";

import Link from "next/link";
import { useState } from "react";
import {
  afterExample,
  afterExplain,
  afterGuess,
  afterReteach,
  afterRight,
  afterWrong,
  canRetry,
  isRecap,
  questionFor,
  START,
  type LessonPosition,
} from "@/lib/lessonFlow";
import { getLessons } from "@/content";
import { getUnit, getUnitNumber } from "@/content/units";
import { clearLessonPosition, completeLesson, markUnitSeen, saveLessonPosition, useHydrated, useProgress } from "@/lib/store";
import type { Lesson, LessonIdea, UnitInfo } from "@/lib/types";
import { Bobbin } from "./Bobbin";
import { ChoiceList } from "./ChoiceList";
import { CodeBlock } from "./CodeBlock";
import { LessonDiagram } from "./LessonDiagram";
import { RichText } from "./RichText";
import { LessonIntro, UnitIntro } from "./LessonIntro";
import { LessonSkeleton } from "./Skeleton";

const STAGE_LABEL = { guess: "Guess", example: "Example", check: "Your turn", reteach: "Another look", explain: "Say it" } as const;

/**
 * A lesson is a few small ideas. A miss on an idea's check re-teaches that same idea and asks a
 * fresh question before moving on. The position is saved after every step, so a learner can
 * leave at any point and pick up exactly where they stopped.
 */
export function LessonFlow({ lesson }: { lesson: Lesson }) {
  const hydrated = useHydrated();
  const progress = useProgress();
  if (!hydrated) return <LessonSkeleton />;
  const finished = progress.lessonsDone.includes(lesson.id);
  const saved = finished ? undefined : progress.lessonProgress[lesson.id];
  // A new unit gets one introduction before its first lesson. Anyone already part-way in skips it.
  const unit = getUnit(lesson.track);
  const trackLessons = getLessons().filter((l) => l.track === lesson.track);
  const unitIntro =
    unit &&
    trackLessons[0]?.id === lesson.id &&
    !saved &&
    !progress.unitsSeen.includes(lesson.track) &&
    !trackLessons.some((l) => progress.lessonsDone.includes(l.id))
      ? { unit, number: getUnitNumber(lesson.track), lessons: trackLessons }
      : undefined;
  return <LessonRun key={lesson.id} lesson={lesson} saved={saved} unitIntro={unitIntro} />;
}

function LessonRun({
  lesson,
  saved,
  unitIntro,
}: {
  lesson: Lesson;
  saved?: LessonPosition;
  unitIntro?: { unit: UnitInfo; number: number; lessons: Lesson[] };
}) {
  const [pos, setPos] = useState<LessonPosition>(
    saved ? { idea: saved.idea, stage: saved.stage, attempt: saved.attempt, missed: saved.missed } : START,
  );
  const [resumed, setResumed] = useState(!!saved && (saved.idea > 0 || saved.stage !== "guess"));
  const [picked, setPicked] = useState<number | null>(null);
  const [saveDone, setSaveDone] = useState(false);
  // Someone resuming mid-lesson has already had the intro.
  const [introDone, setIntroDone] = useState(!!saved && (saved.idea > 0 || saved.stage !== "guess"));

  const total = lesson.ideas.length;
  const recap = isRecap(pos, total);
  const idea = lesson.ideas[Math.min(pos.idea, total - 1)];

  function go(next: LessonPosition) {
    setPos(next);
    setPicked(null);
    setResumed(false);
    saveLessonPosition(lesson.id, next);
  }

  function startOver() {
    clearLessonPosition(lesson.id);
    setPos(START);
    setPicked(null);
    setResumed(false);
  }

  const nextLabel = (p: LessonPosition) =>
    p.idea + 1 >= total ? "See the recap" : `Next idea: ${lesson.ideas[p.idea + 1].title}`;
  const nextLabelFrom = nextLabel;

  if (unitIntro) {
    return (
      <UnitIntro
        unit={unitIntro.unit}
        number={unitIntro.number}
        lessons={unitIntro.lessons}
        onStart={() => markUnitSeen(lesson.track)}
      />
    );
  }
  if (!introDone) return <LessonIntro lesson={lesson} onBegin={() => setIntroDone(true)} />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-pixel text-3xl font-bold text-ink">{lesson.title}</h1>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1" role="img" aria-label={`Idea ${Math.min(pos.idea + 1, total)} of ${total}`}>
            {lesson.ideas.map((it, i) => (
              <span
                key={it.id}
                className={`h-4 w-8 border-[3px] border-line ${
                  recap || i < pos.idea ? "bg-teal" : i === pos.idea ? "bg-butter" : "bg-paper"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-ink-soft">
            {recap ? "Recap" : `Idea ${pos.idea + 1} of ${total} · ${STAGE_LABEL[pos.stage]}`}
          </p>
        </div>
        {!recap && <p className="font-pixel text-lg font-bold text-ink">{idea.title}</p>}
        <p className="text-sm text-ink-soft">
          Your place is saved, so you can leave any time.{" "}
          <Link href="/home" className="font-semibold text-teal-deep underline">
            Back to the quest map
          </Link>
        </p>
        {resumed && (
          <p className="pixel-box flex flex-wrap items-center gap-x-3 gap-y-1 bg-sky px-4 py-2 text-sm text-ink">
            <span>Picked up where you left off.</span>
            <button type="button" onClick={startOver} className="font-semibold text-teal-deep underline">
              Start the lesson over
            </button>
          </p>
        )}
      </div>

      {!recap && pos.stage === "guess" && (
        <section className="flex flex-col gap-4">
          {pos.idea === 0 && <Bobbin mood="thinking" say="Make a guess before you see the answer. A wrong guess is fine." />}
          <h2 className="font-pixel text-xl font-bold text-ink">{idea.guess.question}</h2>
          {idea.guess.code && <CodeBlock code={idea.guess.code} />}
          <ChoiceList
            options={idea.guess.options}
            picked={picked}
            answerIndex={idea.guess.answerIndex}
            revealed={picked !== null}
            onPick={setPicked}
          />
          {picked !== null && (
            <>
              <p className="pixel-box bg-mint p-4 text-ink">
                {picked === idea.guess.answerIndex ? "That's right. " : "Not quite, and it's a common one. "}
                <RichText text={idea.guess.reveal} />
              </p>
              <button onClick={() => go(afterGuess(pos))} className="btn-primary">
                Show me an example
              </button>
            </>
          )}
        </section>
      )}

      {!recap && pos.stage === "example" && (
        <section className="flex flex-col gap-4">
          <h2 className="font-pixel text-xl font-bold text-ink">Worked example</h2>
          {idea.workedExample.code && <CodeBlock code={idea.workedExample.code} />}
          {idea.workedExample.sample && (
            <blockquote className="pixel-box whitespace-pre-line bg-teal-wash p-4 text-ink">{idea.workedExample.sample}</blockquote>
          )}
          {idea.workedExample.diagram && <LessonDiagram diagram={idea.workedExample.diagram} />}
          <ol className="list-decimal space-y-2 pl-5 text-ink">
            {idea.workedExample.walkthrough.map((w) => (
              <li key={w}>
                <RichText text={w} />
              </li>
            ))}
          </ol>
          <button onClick={() => go(afterExample(pos))} className="btn-primary">
            Now you try
          </button>
        </section>
      )}

      {!recap && pos.stage === "reteach" && (
        <section className="flex flex-col gap-4">
          <h2 className="font-pixel text-xl font-bold text-ink">Another way to look at it</h2>
          <ol className="list-decimal space-y-2 pl-5 text-ink">
            {idea.reteach.steps.map((s) => (
              <li key={s}>
                <RichText text={s} />
              </li>
            ))}
          </ol>
          {idea.reteach.code && <CodeBlock code={idea.reteach.code} />}
          <button onClick={() => go(afterReteach(pos))} className="btn-primary">
            Try another one
          </button>
        </section>
      )}

      {!recap && pos.stage === "check" && (() => {
        const q = questionFor(idea, pos.attempt);
        const right = picked === q.answerIndex;
        const more = canRetry(idea, pos.attempt);
        return (
          <section className="flex flex-col gap-4">
            {pos.attempt > 0 && <p className="text-ink-soft">A fresh question on the same idea.</p>}
            <h2 className="font-pixel text-xl font-bold text-ink">{q.prompt}</h2>
            {q.code && <CodeBlock code={q.code} />}
            <ChoiceList
              options={q.options}
              picked={picked}
              answerIndex={q.answerIndex}
              revealed={picked !== null}
              onPick={setPicked}
            />
            {picked !== null && (
              <>
                <p className="pixel-box bg-mint p-4 text-ink">
                  {right ? "That's it. " : "Not quite. This one is easy to mix up. "}
                  <RichText text={q.explanation} />
                  {!right && !more && " We'll bring this one back in practice."}
                </p>
                {right ? (
                  <button onClick={() => go(afterRight(pos))} className="btn-primary">
                    Now say it in words
                  </button>
                ) : more ? (
                  <button onClick={() => go(afterWrong(pos, idea))} className="btn-primary">
                    Go over it again
                  </button>
                ) : (
                  <button onClick={() => go(afterWrong(pos, idea))} className="btn-primary">
                    Now say it in words
                  </button>
                )}
              </>
            )}
          </section>
        );
      })()}

      {!recap && pos.stage === "explain" && (
        <ExplainStep
          key={`${idea.id}-explain`}
          explain={idea.explain}
          first={pos.idea === 0}
          nextLabel={nextLabelFrom(pos)}
          onNext={() => go(afterExplain(pos))}
        />
      )}

      {recap && (
        <section className="flex flex-col gap-4">
          <Bobbin mood="cheering" say="That's the lesson. Here's what to remember." />
          <ul className="list-disc space-y-2 pl-5 text-ink">
            {lesson.ideas.map((it) => (
              <li key={it.id}>
                <RichText text={it.recap} />
              </li>
            ))}
          </ul>
          {pos.missed.length > 0 && (
            <p className="pixel-box bg-butter/40 p-4 text-ink">
              Worth another look:{" "}
              {pos.missed
                .map((id) => lesson.ideas.find((i) => i.id === id)?.title)
                .filter(Boolean)
                .join(", ")}
              . Practice will bring those back first.
            </p>
          )}
          <p className="text-ink-soft">
            Short practice on this will come back over the next few days, spaced out so you remember
            it for longer.
          </p>
          {!saveDone ? (
            <button
              onClick={() => {
                completeLesson(lesson.id, pos.missed);
                setSaveDone(true);
              }}
              className="btn-primary"
            >
              Add to my practice
            </button>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Link href="/review" className="btn-primary">
                Practice now
              </Link>
              <Link href="/home" className="btn-secondary">
                More lessons
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/**
 * Interviews ask you to explain, not just to know. Write it the way you'd say it out loud, then
 * compare with one way to say it and tick what you covered. Nothing here is graded or saved.
 */
function ExplainStep({
  explain,
  first,
  nextLabel,
  onNext,
}: {
  explain: LessonIdea["explain"];
  first: boolean;
  nextLabel: string;
  onNext: () => void;
}) {
  const [text, setText] = useState("");
  const [starter, setStarter] = useState(false);
  const [shown, setShown] = useState(false);
  const [ticked, setTicked] = useState<boolean[]>(() => explain.keyPoints.map(() => false));

  return (
    <section className="flex flex-col gap-4">
      {first && (
        <Bobbin
          mood="determined"
          say="Interviews ask you to explain, not just to know the answer. Try saying it in your own words."
        />
      )}
      <h2 className="font-pixel text-xl font-bold text-ink">Say it like you would in an interview</h2>
      <p className="pixel-box bg-peach p-4 text-ink">
        <span className="font-bold">Interviewer: </span>
        {explain.question}
      </p>
      <p className="text-ink-soft">
        A clear answer has three parts: the short answer, the reason, then a quick example.
      </p>
      <label htmlFor="say-it" className="sr-only">
        Your answer
      </label>
      <textarea
        id="say-it"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={shown}
        rows={5}
        placeholder="Write it the way you would say it out loud."
        className="w-full resize-y border-[3px] border-line bg-paper p-3 text-ink placeholder:text-ink-soft disabled:opacity-80"
      />
      {!shown && (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setShown(true)} className="btn-primary">
            Show one way to say it
          </button>
          <button type="button" onClick={() => setStarter(true)} className="font-semibold text-teal-deep underline">
            Need a way in?
          </button>
        </div>
      )}
      {starter && !shown && <p className="text-ink-soft">You could start with: {explain.starter}</p>}
      {shown && (
        <>
          <div className="pixel-box bg-mint p-4 text-ink">
            <p className="font-pixel mb-1 text-sm font-bold">One way to say it</p>
            <p>
              <RichText text={explain.modelAnswer} />
            </p>
          </div>
          <fieldset className="pixel-box p-4">
            <legend className="font-pixel px-1 text-sm font-bold text-ink">Tick what your answer covered</legend>
            {explain.keyPoints.map((k, i) => (
              <label key={k} className="flex items-start gap-2 py-1 text-ink">
                <input
                  type="checkbox"
                  checked={ticked[i]}
                  onChange={() => setTicked((t) => t.map((v, j) => (j === i ? !v : v)))}
                  className="mt-1 h-5 w-5 accent-teal"
                />
                <RichText text={k} />
              </label>
            ))}
          </fieldset>
          <p className="text-sm text-ink-soft">
            If you missed one, that&apos;s normal. Try saying the answer out loud once, in your own words.
          </p>
          <button type="button" onClick={onNext} className="btn-primary">
            {nextLabel}
          </button>
        </>
      )}
    </section>
  );
}
