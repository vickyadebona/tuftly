"use client";

import Link from "next/link";
import { useState } from "react";
import { getDrills, getLessons } from "@/content";
import { SHARE_GAPS } from "@/lib/config";
import { todayStr } from "@/lib/dates";
import { gapFeedback, MAX_GAP, shareGap } from "@/lib/feedback";
import { nextCard, practicePool, type PracticeCard } from "@/lib/practice";
import { buildQueue, summarize } from "@/lib/queue";
import type { Grade } from "@/lib/scheduler";
import { recordReview, useHydrated, useProgress } from "@/lib/store";
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/config";
import type { Drill, LessonIdea } from "@/lib/types";
import { correctLine, READY, wrongLine } from "@/lib/phrases";
import { ChoiceList } from "./ChoiceList";
import { CodeBlock } from "./CodeBlock";
import { LessonDiagram } from "./LessonDiagram";
import { RichText } from "./RichText";
import { Bobbin } from "./Bobbin";
import { CardSkeleton } from "./Skeleton";
import { StreakCelebration } from "./StreakCelebration";

const GRADES: { grade: Grade; label: string }[] = [
  { grade: "got", label: "Got it" },
  { grade: "almost", label: "Almost" },
  { grade: "not-yet", label: "Not yet" },
];

interface Extra {
  /** Questions already answered on this idea, oldest first. */
  seen: string[];
  /** What the learner said is still hard. Aims the questions that follow. */
  gap: string;
  /** Set while asking what's still hard: the key points they didn't check. */
  asking: string[] | null;
  /** Show the lesson's other explanation above the question. */
  refresh: boolean;
  /** Show the idea's diagram before the next question, after "Not yet". */
  picture: boolean;
}

const NO_EXTRA: Extra = { seen: [], gap: "", asking: null, refresh: false, picture: false };

function DrillCard({
  drill,
  answered,
  onGrade,
  onMoveOn,
}: {
  drill: PracticeCard;
  /** How many questions came before this one, so Bobbin's lines take turns. */
  answered: number;
  onGrade: (g: Grade, missed: string[]) => void;
  /** Set during extra practice, so a learner can leave an idea without saying they've got it. */
  onMoveOn?: () => void;
}) {
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
            Why? Say it the way you would in an interview (optional).
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
            {drill.hint && (
              <button onClick={() => setHint(true)} className="font-semibold text-teal-deep underline">
                Need a nudge?
              </button>
            )}
          </div>
          {hint && <p className="text-ink-soft">Nudge: {drill.hint}</p>}
        </>
      )}

      {checked && (
        <>
          <p className="text-ink">
            {correct ? correctLine(answered) : `Not quite. ${wrongLine(answered)} Here's the idea:`}
          </p>
          <div className="pixel-box bg-sky p-4 text-ink">
            <p className="font-pixel mb-1 text-sm font-bold">{drill.sayIt ? "One way to say it" : "Why"}</p>
            <p>
              <RichText text={drill.sayIt ?? drill.explanation ?? ""} />
            </p>
          </div>
          {drill.rubric.length > 0 && <fieldset className="pixel-box bg-mint p-4">
            <legend className="font-pixel px-1 text-sm font-bold text-ink">Key points. Check the ones you had.</legend>
            {drill.rubric.map((r, i) => (
              <label key={r} className="flex items-start gap-2 py-1 text-ink">
                <input
                  type="checkbox"
                  checked={covered[i]}
                  onChange={() => setCovered((c) => c.map((v, j) => (j === i ? !v : v)))}
                  className="mt-1 h-5 w-5 accent-teal"
                />
                <RichText text={r} />
              </label>
            ))}
          </fieldset>}
          <div>
            <p className="text-ink">How did that feel?</p>
            <p className="mb-2 text-sm text-ink-soft">
              &quot;Got it&quot; moves on. &quot;Almost&quot; asks what&apos;s still fuzzy. &quot;Not yet&quot; gives you another
              question on this idea.
            </p>
            <div className="flex gap-2">
              {GRADES.map(({ grade, label }) => (
                <button
                  key={grade}
                  onClick={() => onGrade(grade, drill.rubric.filter((_, i) => !covered[i]))}
                  className={grade === suggested ? "btn-accent" : "btn-secondary"}
                >
                  {label}
                </button>
              ))}
            </div>
            {onMoveOn && (
              <button type="button" onClick={onMoveOn} className="mt-3 font-semibold text-teal-deep underline">
                Move on for now
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const canShare = SHARE_GAPS && supabaseConfigured;

/**
 * After "Almost": ask what's still fuzzy, so the next question can aim at it. Nothing leaves the
 * device unless the learner checks the box to share it.
 */
function GapStep({ drillId, missed, onPractice, onMoveOn }: { drillId: string; missed: string[]; onPractice: (gap: string) => void; onMoveOn: () => void }) {
  const [text, setText] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [share, setShare] = useState(false);

  function shareIfAsked() {
    const feedback = share && canShare ? gapFeedback(drillId, text, chosen) : null;
    if (feedback) shareGap(SUPABASE_URL!, SUPABASE_KEY!, feedback);
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-pixel text-xl font-bold text-ink">Almost there. What&apos;s still fuzzy?</h2>
      {missed.length > 0 && (
        <fieldset className="pixel-box bg-mint p-4">
          {/* Floated so a heading that wraps stays inside the box instead of across its border. */}
          <legend className="font-pixel float-left mb-2 w-full text-sm font-bold text-ink">Points you didn&apos;t check. Pick any that are hard.</legend>
          <div className="clear-both" />
          {missed.map((m) => (
            <label key={m} className="flex items-start gap-2 py-1 text-ink">
              <input
                type="checkbox"
                checked={chosen.includes(m)}
                onChange={() => setChosen((c) => (c.includes(m) ? c.filter((x) => x !== m) : [...c, m]))}
                className="mt-1 h-5 w-5 accent-teal"
              />
              <RichText text={m} />
            </label>
          ))}
        </fieldset>
      )}
      <label className="flex flex-col gap-1 text-ink">
        What are you struggling with most? A few words is fine.
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_GAP}
          rows={3}
          className="border-[3px] border-line bg-paper p-2 text-ink"
        />
      </label>
      {canShare && (
        <label className="flex items-start gap-2 text-ink">
          <input type="checkbox" checked={share} onChange={() => setShare((v) => !v)} className="mt-1 h-5 w-5 shrink-0 accent-teal" />
          <span>
            Share this to help improve lessons.
            <span className="block text-sm text-ink-soft">
              What you typed and picked above is saved without your name or account. Leave out personal details.{" "}
              <Link href="/privacy" className="font-semibold text-teal-deep underline">
                Privacy
              </Link>
            </span>
          </span>
        </label>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {/* Typed words and picked points aim the next question. With neither, the unchecked points do. */}
        <button
          type="button"
          onClick={() => {
            shareIfAsked();
            onPractice([text, ...chosen].join(" ").trim() || missed.join(" "));
          }}
          className="btn-primary"
        >
          Practice this part
        </button>
        <button
          type="button"
          onClick={() => {
            shareIfAsked();
            onMoveOn();
          }}
          className="font-semibold text-teal-deep underline"
        >
          Move on for now
        </button>
      </div>
    </section>
  );
}

/** The lesson's second way of explaining the idea, shown above the next question. */
function Refresher({ reteach }: { reteach: LessonIdea["reteach"] }) {
  return (
    <div className="pixel-box bg-butter/40 p-4 text-ink">
      <p className="font-pixel mb-1 text-sm font-bold">Another way to look at it</p>
      <ul className="list-disc space-y-1 pl-5">
        {reteach.steps.map((step) => (
          <li key={step}>
            <RichText text={step} />
          </li>
        ))}
      </ul>
      {reteach.code && (
        <div className="mt-3">
          <CodeBlock code={reteach.code} />
        </div>
      )}
    </div>
  );
}

/**
 * After "Not yet": the lesson's worked example and its diagram, on their own. The question comes
 * after, so it's answered from memory and not read off the picture. The code gives the diagram's
 * names their meaning.
 */
function PictureStep({ example, onNext, onMoveOn }: { example: LessonIdea["workedExample"]; onNext: () => void; onMoveOn: () => void }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-pixel text-xl font-bold text-ink">Picture it</h2>
      {example.code && <CodeBlock code={example.code} />}
      <LessonDiagram diagram={example.diagram!} />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onNext} className="btn-primary">
          Try another question
        </button>
        <button type="button" onClick={onMoveOn} className="font-semibold text-teal-deep underline">
          Move on for now
        </button>
      </div>
    </section>
  );
}

export function ReviewSession() {
  const hydrated = useHydrated();
  const progress = useProgress();
  const drills = getDrills();
  const [queue, setQueue] = useState<Drill[] | null>(null);
  const [index, setIndex] = useState(0);
  const [requeued, setRequeued] = useState<string[]>([]);
  // Extra practice on the current idea. No questions seen means the scheduled drill is showing.
  const [extra, setExtra] = useState<Extra>(NO_EXTRA);

  if (!hydrated) return <CardSkeleton label="Loading your practice" />;

  const today = todayStr();

  if (queue === null) {
    const { due, fresh, nextDue } = summarize(progress, drills, today);
    const total = due.length + fresh.length;
    if (total === 0) {
      return (
        <div className="flex flex-col gap-4">
          <StreakCelebration />
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
        <Bobbin say={`${READY} A few questions, with topics mixed together.`} />
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
        <StreakCelebration />
        <Bobbin mood="cheering" say="Good session. Anything you missed will come back in a later one." />
        <Link href="/home" className="btn-primary self-start">
          Back to the quest map
        </Link>
      </div>
    );
  }

  const lessons = getLessons();
  const idea = lessons.find((l) => l.id === drill.lessonId)?.ideas.find((x) => x.id === drill.ideaId);

  const pool = practicePool(drill, drills, lessons);
  const turn = extra.seen.length;
  const card = turn === 0 ? pool[0] : nextCard(pool, extra.seen, extra.gap);

  function moveOn() {
    setExtra(NO_EXTRA);
    setIndex(index + 1);
  }

  function handleGrade(grade: Grade, missed: string[]) {
    // Only the first answer sets when the drill comes back. Extra practice never changes that.
    if (turn === 0) {
      recordReview(drill.id, grade);
      if (grade === "not-yet" && !requeued.includes(drill.id)) {
        setRequeued([...requeued, drill.id]);
        setQueue([...queue!, drill]); // one more try at the end of this session
      }
    }
    if (grade === "got") return moveOn();
    setExtra({
      seen: [...extra.seen, card.id],
      gap: extra.gap,
      asking: grade === "almost" ? missed : null,
      refresh: false,
      picture: grade === "not-yet",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-soft">
        {index + 1} of {queue.length}
        {turn > 0 && ` · More practice${idea ? `: ${idea.title}` : ""}`}
      </p>
      {extra.asking ? (
        <GapStep
          key={turn}
          drillId={card.id}
          missed={extra.asking}
          onPractice={(gap) => setExtra({ ...extra, gap, asking: null, refresh: true })}
          onMoveOn={moveOn}
        />
      ) : extra.picture && idea?.workedExample.diagram ? (
        <PictureStep example={idea.workedExample} onNext={() => setExtra({ ...extra, picture: false })} onMoveOn={moveOn} />
      ) : (
        <>
          {extra.refresh && idea && <Refresher reteach={idea.reteach} />}
          <DrillCard
            answered={index + turn}
            key={`${drill.id}-${index}-${turn}`}
            drill={card}
            onGrade={handleGrade}
            onMoveOn={turn > 0 ? moveOn : undefined}
          />
        </>
      )}
    </div>
  );
}
