"use client";

import Link from "next/link";
import { useState } from "react";
import { getDrills } from "@/content";
import { todayStr } from "@/lib/dates";
import { buildQueue, summarize } from "@/lib/queue";
import type { Grade } from "@/lib/scheduler";
import { recordReview, useHydrated, useProgress } from "@/lib/store";
import type { Drill } from "@/lib/types";
import { ChoiceList } from "./ChoiceList";
import { CodeBlock } from "./CodeBlock";
import { Bobbin } from "./Bobbin";
import { CardSkeleton } from "./Skeleton";

const GRADES: { grade: Grade; label: string }[] = [
  { grade: "got", label: "Got it" },
  { grade: "almost", label: "Almost" },
  { grade: "not-yet", label: "Not yet" },
];

function DrillCard({ drill, onGrade }: { drill: Drill; onGrade: (g: Grade) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [why, setWhy] = useState("");
  const [hint, setHint] = useState(false);
  const [checked, setChecked] = useState(false);
  const [covered, setCovered] = useState<boolean[]>(() => drill.rubric.map(() => false));

  const correct = picked === drill.answerIndex;
  const coveredCount = covered.filter(Boolean).length;
  const suggested: Grade = !correct
    ? "not-yet"
    : coveredCount >= Math.ceil(drill.rubric.length / 2)
      ? "got"
      : "almost";

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-pixel text-xl font-bold text-ink">{drill.prompt}</h2>
      {drill.code && <CodeBlock code={drill.code} />}
      <ChoiceList
        options={drill.options}
        picked={picked}
        answerIndex={drill.answerIndex}
        revealed={checked}
        onPick={setPicked}
      />

      {!checked && (
        <>
          <label className="flex flex-col gap-1 text-ink">
            Why? Say it in your own words (optional, but it helps it stick).
            <textarea
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              rows={2}
              className="border-[3px] border-line bg-paper p-2 text-ink"
            />
          </label>
          <div className="flex items-center gap-3">
            <button
              disabled={picked === null}
              onClick={() => setChecked(true)}
              className="btn-primary"
            >
              Check my answer
            </button>
            <button onClick={() => setHint(true)} className="font-semibold text-teal-deep underline">
              Need a nudge?
            </button>
          </div>
          {hint && <p className="text-ink-soft">Nudge: {drill.hint}</p>}
        </>
      )}

      {checked && (
        <>
          <p className="text-ink">
            {correct
              ? "Nice, that's right."
              : "Not quite yet. That's how it sticks. Here's the idea:"}
          </p>
          <fieldset className="pixel-box bg-mint p-4">
            <legend className="font-pixel px-1 text-sm font-bold text-ink">Key points. Tick the ones you had.</legend>
            {drill.rubric.map((r, i) => (
              <label key={r} className="flex items-start gap-2 py-1 text-ink">
                <input
                  type="checkbox"
                  checked={covered[i]}
                  onChange={() => setCovered((c) => c.map((v, j) => (j === i ? !v : v)))}
                  className="mt-1 h-5 w-5 accent-teal"
                />
                {r}
              </label>
            ))}
          </fieldset>
          <div>
            <p className="mb-2 text-ink">How did that feel?</p>
            <div className="flex gap-2">
              {GRADES.map(({ grade, label }) => (
                <button
                  key={grade}
                  onClick={() => onGrade(grade)}
                  className={grade === suggested ? "btn-accent" : "btn-secondary"}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function ReviewSession() {
  const hydrated = useHydrated();
  const progress = useProgress();
  const drills = getDrills();
  const [queue, setQueue] = useState<Drill[] | null>(null);
  const [index, setIndex] = useState(0);
  const [requeued, setRequeued] = useState<string[]>([]);

  if (!hydrated) return <CardSkeleton label="Loading your practice" />;

  const today = todayStr();

  if (queue === null) {
    const { due, fresh, nextDue } = summarize(progress, drills, today);
    const total = due.length + fresh.length;
    if (total === 0) {
      return (
        <div className="flex flex-col gap-4">
          <Bobbin
            say={
              progress.lessonsDone.length === 0
                ? "Finish a lesson first, then I'll bring its practice here."
                : "You're all caught up. Nothing due right now."
            }
          />
          {nextDue && <p className="text-ink-soft">Next practice is due {nextDue}.</p>}
          <Link href="/home" className="btn-primary self-start">
            Back to the quest map
          </Link>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-4">
        <Bobbin say="Short and sweet. Mixing topics like this helps it stay with you." />
        <p className="text-ink">
          {due.length} to review · {fresh.length} new
        </p>
        <button
          onClick={() => setQueue(buildQueue(progress, drills, today))}
          className="btn-primary self-start"
        >
          Start
        </button>
      </div>
    );
  }

  const drill = queue[index];
  if (!drill) {
    return (
      <div className="flex flex-col gap-4">
        <Bobbin mood="cheering" say="That's a wrap! Every review makes the next one easier." />
        <Link href="/home" className="btn-primary self-start">
          Back to the quest map
        </Link>
      </div>
    );
  }

  function handleGrade(grade: Grade) {
    recordReview(drill.id, grade);
    if (grade === "not-yet" && !requeued.includes(drill.id)) {
      setRequeued([...requeued, drill.id]);
      setQueue([...queue!, drill]); // one more try at the end of this session
    }
    setIndex(index + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-soft">
        {index + 1} of {queue.length}
      </p>
      <DrillCard key={`${drill.id}-${index}`} drill={drill} onGrade={handleGrade} />
    </div>
  );
}
