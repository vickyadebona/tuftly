"use client";

import { useState, type ReactNode } from "react";
import { correctLine, wrongLine } from "@/lib/phrases";
import type { DayStatus } from "@/lib/streak";
import { ChoiceList } from "./ChoiceList";
import { PixelArtBobbin } from "./PixelArtBobbin";
import { PixelIcon, type PixelIconName } from "./PixelIcon";
import { RichText } from "./RichText";
import { StreakWeek } from "./StreakDays";

function Tile({ icon, color, title, text, tone = "bg-paper", className = "", children }: {
  icon: PixelIconName;
  color: string;
  title: string;
  text: string;
  tone?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <li className={`pixel-box flex min-w-0 flex-col gap-4 p-5 sm:p-7 ${tone} ${className}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center border-[3px] border-line bg-paper">
          <PixelIcon name={icon} size={24} color={color} />
        </span>
        <h3 className="font-pixel text-xl font-bold text-ink">{title}</h3>
      </div>
      <p className="text-ink">
        <RichText text={text} />
      </p>
      {children}
    </li>
  );
}

const OPTIONS = [
  "I grew up in a small town, and then I went to college…",
  "I'm a front-end developer who builds React apps. Lately I rebuilt a checkout form…",
  "I'm a hard worker and a fast learner.",
];
const RIGHT = 1;

/** A sample question, answered the way it is in a lesson. */
function LessonPreview() {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <p className="font-pixel text-lg font-bold text-ink">“Tell me about yourself.” Which opening works best?</p>
      <ChoiceList options={OPTIONS} picked={picked} answerIndex={RIGHT} revealed={picked !== null} onPick={setPicked} />
      <div aria-live="polite">
        {picked !== null && (
          <p className="pixel-box bg-mint p-4 text-ink">
            {picked === RIGHT ? correctLine(0) : `Not quite. ${wrongLine(0)}`} Start with who you are now, then one recent highlight.
          </p>
        )}
      </div>
      {picked !== null && (
        <button type="button" className="self-start font-semibold text-teal-deep underline" onClick={() => setPicked(null)}>
          Try again
        </button>
      )}
    </div>
  );
}

const GRADES = [
  { label: "Got it", then: "Next practice is due in a few days." },
  { label: "Almost", then: "Bobbin asks what's still fuzzy, then another question." },
  { label: "Not yet", then: "You get another question on this idea." },
];

/** The end of a practice card. */
function PracticePreview() {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <p className="font-pixel text-lg font-bold text-ink">How did that feel?</p>
      <div className="flex flex-wrap gap-2">
        {GRADES.map((g, i) => (
          <button key={g.label} type="button" aria-pressed={picked === i} className={picked === i ? "btn-accent" : "btn-secondary"} onClick={() => setPicked(i)}>
            {g.label}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="min-h-12 text-ink">
        {picked === null ? "Pick one to see what happens next." : GRADES[picked].then}
      </p>
    </div>
  );
}

/** A still picture of the answering screen in voice practice. */
function VoicePreview() {
  return (
    <div
      role="img"
      aria-label="The voice practice screen: Bobbin asks “Tell me about yourself” and your words appear as you speak."
      className="flex flex-col items-center gap-3 border-[3px] border-line bg-cream p-4 text-center"
    >
      <PixelArtBobbin mood="talk" size={110} />
      <p className="font-pixel text-xl font-bold text-ink">Tell me about yourself.</p>
      <p className="pixel-chip bg-peach">
        ● Listening… <span className="font-sans">0:32</span>
      </p>
      <p className="pixel-box w-full bg-paper p-3 text-left text-ink">I&apos;m a front-end developer, and lately I&apos;ve been working on…</p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="btn-accent">I&apos;m not sure</span>
        <span className="btn-primary">Done answering</span>
      </div>
    </div>
  );
}

// A made-up week, Sunday first: rest on Wednesday, not yet practiced today.
const WEEK: DayStatus[] = ["done", "done", "done", "rest", "done", "today", "future"];

function StreakPreview() {
  return (
    <div className="flex flex-col gap-3">
      <p className="pixel-chip self-start bg-peach">
        <PixelIcon name="flame" size={16} color="#f08a24" /> <span className="font-sans">4</span> day streak
      </p>
      <StreakWeek today="2026-01-09" start={0} statusOf={(date) => WEEK[new Date(`${date}T12:00:00`).getDay()]} />
    </div>
  );
}

/** What you get, shown with pieces that look like the app's own. */
export function FeaturePreviews() {
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <ul className="flex min-w-0 flex-col gap-6 lg:col-span-3 [&>li:last-child]:flex-1">
          <Tile icon="star" color="#f2b93b" tone="bg-peach" title="Bite-size lessons" text="A few minutes each. Guess first, study a worked example, then try it yourself.">
            <LessonPreview />
          </Tile>
          <Tile icon="gem" color="#9fd5ea" tone="bg-butter" title="Practice that sticks" text="Questions come back on a schedule and mix across topics, so what you learn stays with you.">
            <PracticePreview />
          </Tile>
      </ul>
      <ul className="flex min-w-0 flex-col gap-6 lg:col-span-2 [&>li:last-child]:flex-1">
          <Tile icon="heart" color="#ff9e80" title="Practice rounds with Bobbin" tone="bg-sky" text="Try **voice practice**, where Bobbin asks out loud, or type your answers. You check off the key points you covered.">
            <VoicePreview />
          </Tile>
          <Tile icon="check" color="#2f7f78" tone="bg-lilac" title="Gentle streaks" text="Rest days and a weekly grace day keep your streak safe. There are no leaderboards.">
            <StreakPreview />
          </Tile>
      </ul>
    </div>
  );
}
