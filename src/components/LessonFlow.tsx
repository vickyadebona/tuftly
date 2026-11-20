"use client";

import Link from "next/link";
import { useState } from "react";
import { completeLesson } from "@/lib/store";
import type { Lesson } from "@/lib/types";
import { ChoiceList } from "./ChoiceList";
import { CodeBlock } from "./CodeBlock";
import { Bobbin } from "./Bobbin";

const STEPS = ["Guess", "Example", "Your turn", "Recap"];

export function LessonFlow({ lesson }: { lesson: Lesson }) {
  const [step, setStep] = useState(0);
  const [guess, setGuess] = useState<number | null>(null);
  const [turn, setTurn] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const next = () => setStep((s) => s + 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2 text-sm" aria-label="Lesson progress">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`font-pixel border-[3px] border-line px-3 py-1 font-semibold ${
              i === step
                ? "bg-butter text-ink"
                : i < step
                  ? "bg-teal text-white"
                  : "bg-paper text-ink-soft"
            }`}
          >
            {s}
          </span>
        ))}
      </div>

      {step === 0 && (
        <section className="flex flex-col gap-4">
          <Bobbin
            mood="thinking"
            say="Here's the tea: guessing first helps it stick, even when you're wrong."
          />
          <h2 className="font-pixel text-xl font-bold text-ink">{lesson.predict.question}</h2>
          {lesson.predict.code && <CodeBlock code={lesson.predict.code} />}
          <ChoiceList
            options={lesson.predict.options}
            picked={guess}
            answerIndex={lesson.predict.answerIndex}
            revealed={guess !== null}
            onPick={setGuess}
          />
          {guess !== null && (
            <>
              <p className="pixel-box bg-mint p-4 text-ink">
                {guess === lesson.predict.answerIndex ? "Nice, you got it. " : "Good try! "}
                {lesson.predict.reveal}
              </p>
              <button onClick={next} className="btn-primary">
                Show me an example
              </button>
            </>
          )}
        </section>
      )}

      {step === 1 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-pixel text-xl font-bold text-ink">Worked example</h2>
          <CodeBlock code={lesson.workedExample.code} />
          <ol className="list-decimal space-y-2 pl-5 text-ink">
            {lesson.workedExample.walkthrough.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ol>
          <button onClick={next} className="btn-primary">
            Now you try
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-pixel text-xl font-bold text-ink">{lesson.yourTurn.prompt}</h2>
          <CodeBlock code={lesson.yourTurn.codeWithBlank} />
          <ChoiceList
            options={lesson.yourTurn.options}
            picked={turn}
            answerIndex={lesson.yourTurn.answerIndex}
            revealed={turn !== null}
            onPick={setTurn}
          />
          {turn !== null && (
            <>
              <p className="pixel-box bg-mint p-4 text-ink">
                {turn === lesson.yourTurn.answerIndex ? "Yes! " : "Not quite, and that's okay. "}
                {lesson.yourTurn.explanation}
              </p>
              <button onClick={next} className="btn-primary">
                Wrap up
              </button>
            </>
          )}
        </section>
      )}

      {step === 3 && (
        <section className="flex flex-col gap-4">
          <Bobbin mood="cheering" say="Nice work! Here's what to keep." />
          <ul className="list-disc space-y-2 pl-5 text-ink">
            {lesson.recap.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className="text-ink-soft">
            Short practice on this will come back over the next few days. Spaced-out practice is
            what makes it stick.
          </p>
          {!saved ? (
            <button
              onClick={() => {
                completeLesson(lesson.id);
                setSaved(true);
              }}
              className="btn-primary"
            >
              Add to my practice
            </button>
          ) : (
            <div className="flex gap-3">
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
