"use client";

import Link from "next/link";
import { useState } from "react";
import {
  buildDraft,
  clearPitch,
  estimateSeconds,
  extractRequirements,
  FOLLOW_UPS,
  MAX_PICKS,
  PITCH_CHECKS,
  savePitch,
  usePitch,
  wordCount,
} from "@/lib/pitch";
import { useHydrated } from "@/lib/store";
import { Bobbin } from "./Bobbin";
import { CardSkeleton } from "./Skeleton";

const STEPS = ["The role", "What they want", "Your matches", "Your pitch", "Follow-ups"];

const field = "w-full border-[3px] border-line bg-paper p-3 text-ink placeholder:text-ink-soft";

/**
 * A guided worksheet: paste the role, pick what it asks for, match each to something you really
 * did, then get a first draft of "tell me about yourself" to edit and practice. It only arranges
 * the learner's own words. Saved on this device after every change, so they can leave and return.
 */
export function PitchBuilder() {
  const hydrated = useHydrated();
  const d = usePitch();
  if (!hydrated) return <CardSkeleton label="Loading your pitch" />;

  const step = Math.min(d.step, STEPS.length - 1);
  const go = (n: number) => savePitch({ step: n });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1" role="img" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={`h-4 w-8 border-[3px] border-line ${i < step ? "bg-teal" : i === step ? "bg-butter" : "bg-paper"}`}
              />
            ))}
          </div>
          <p className="text-sm text-ink-soft">
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </p>
        </div>
        <p className="text-sm text-ink-soft">
          Saved on this device only, so you can leave and come back. It&apos;s your own words: nothing here
          writes claims for you, and you should only use things you can talk about in detail.
        </p>
      </div>

      {step === 0 && <RoleStep d={d} onNext={() => go(1)} />}
      {step === 1 && <PickStep d={d} onBack={() => go(0)} onNext={() => go(2)} />}
      {step === 2 && <MatchStep d={d} onBack={() => go(1)} onNext={() => go(3)} />}
      {step === 3 && <DraftStep d={d} onBack={() => go(2)} onNext={() => go(4)} />}
      {step === 4 && <FollowUpStep d={d} onBack={() => go(3)} />}
    </div>
  );
}

type D = ReturnType<typeof usePitch>;

function Nav({ onBack, onNext, nextLabel = "Next", disabled }: { onBack?: () => void; onNext?: () => void; nextLabel?: string; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-3">
      {onBack && (
        <button type="button" className="btn-secondary" onClick={onBack}>
          Back
        </button>
      )}
      {onNext && (
        <button type="button" className="btn-primary" onClick={onNext} disabled={disabled}>
          {nextLabel}
        </button>
      )}
    </div>
  );
}

function RoleStep({ d, onNext }: { d: D; onNext: () => void }) {
  return (
    <section className="flex flex-col gap-4">
      <Bobbin
        mood="thinking"
        say="Start with the role. Paste the job description, or the description of the AI project you're interviewing for."
      />
      <label className="flex flex-col gap-1 font-bold text-ink" htmlFor="role">
        Role or project name
        <input
          id="role"
          value={d.role}
          onChange={(e) => savePitch({ role: e.target.value })}
          placeholder="Front-end developer"
          className={`${field} font-normal`}
        />
      </label>
      <label className="flex flex-col gap-1 font-bold text-ink" htmlFor="description">
        The description
        <textarea
          id="description"
          value={d.description}
          onChange={(e) => savePitch({ description: e.target.value })}
          rows={10}
          placeholder="Paste it here. Bullet points work best."
          className={`${field} resize-y font-normal`}
        />
      </label>
      <p className="text-sm text-ink-soft">
        It stays in your browser. You can also skip pasting and type what they&apos;re asking for in the next step.
      </p>
      <Nav onNext={onNext} />
    </section>
  );
}

function PickStep({ d, onBack, onNext }: { d: D; onBack: () => void; onNext: () => void }) {
  const [own, setOwn] = useState("");
  const options = [...extractRequirements(d.description), ...d.custom.filter((c) => !extractRequirements(d.description).includes(c))];
  const full = d.picked.length >= MAX_PICKS;

  function toggle(req: string) {
    if (d.picked.includes(req)) savePitch({ picked: d.picked.filter((p) => p !== req) });
    else if (!full) savePitch({ picked: [...d.picked, req] });
  }
  function addOwn() {
    const t = own.trim();
    if (!t || d.custom.includes(t)) return;
    savePitch({ custom: [...d.custom, t], picked: full ? d.picked : [...d.picked, t] });
    setOwn("");
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-pixel text-xl font-bold text-ink">What are they asking for?</h2>
      <p className="text-ink">
        Pick the two or three things that matter most. Fewer is better: a short, clear match beats a long list.
      </p>
      <p className="text-sm font-semibold text-teal-deep">
        {d.picked.length} of {MAX_PICKS} picked
      </p>
      {options.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {options.map((req) => {
            const on = d.picked.includes(req);
            return (
              <li key={req}>
                <label
                  className={`flex cursor-pointer items-start gap-3 border-[3px] border-line p-3 text-ink ${on ? "bg-mint" : "bg-paper"} ${!on && full ? "opacity-60" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={!on && full}
                    onChange={() => toggle(req)}
                    className="mt-1 h-5 w-5 accent-teal"
                  />
                  <span>{req}</span>
                </label>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="pixel-box bg-sky p-4 text-ink">
          No lines to pick from yet. Type what the role asks for below, or go back and paste the description.
        </p>
      )}
      <div className="flex flex-col gap-2">
        <label htmlFor="own" className="font-bold text-ink">
          Add your own
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="own"
            value={own}
            onChange={(e) => setOwn(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addOwn()}
            placeholder="Experience building accessible interfaces"
            className={`${field} flex-1`}
          />
          <button type="button" className="btn-secondary" onClick={addOwn} disabled={!own.trim()}>
            Add
          </button>
        </div>
      </div>
      <Nav onBack={onBack} onNext={onNext} disabled={d.picked.length === 0} />
    </section>
  );
}

function MatchStep({ d, onBack, onNext }: { d: D; onBack: () => void; onNext: () => void }) {
  const set = (req: string, patch: Partial<{ did: string; result: string }>) =>
    savePitch({ matches: { ...d.matches, [req]: { ...{ did: "", result: "" }, ...d.matches[req], ...patch } } });

  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-pixel text-xl font-bold text-ink">Match each one to something you did</h2>
      <p className="text-ink">
        Use a real project or job. Start with a verb (rebuilt, led, fixed), then say what changed. If you
        don&apos;t have a number, describe the change. Never invent one: they may ask how you measured it.
      </p>
      {d.picked.map((req) => (
        <fieldset key={req} className="pixel-box flex flex-col gap-3 p-4">
          <legend className="font-pixel px-1 text-sm font-bold text-teal-deep">They asked for</legend>
          <p className="text-ink">“{req}”</p>
          <label className="flex flex-col gap-1 font-bold text-ink">
            What did you do?
            <input
              value={d.matches[req]?.did ?? ""}
              onChange={(e) => set(req, { did: e.target.value })}
              placeholder="rebuilt our checkout form with clearer errors"
              className={`${field} font-normal`}
            />
          </label>
          <label className="flex flex-col gap-1 font-bold text-ink">
            What changed because of it?
            <input
              value={d.matches[req]?.result ?? ""}
              onChange={(e) => set(req, { result: e.target.value })}
              placeholder="drop-offs fell by 18%"
              className={`${field} font-normal`}
            />
          </label>
        </fieldset>
      ))}
      <Nav onBack={onBack} onNext={onNext} />
    </section>
  );
}

function DraftStep({ d, onBack, onNext }: { d: D; onBack: () => void; onNext: () => void }) {
  const words = wordCount(d.draft);
  const secs = estimateSeconds(d.draft);
  const make = () => savePitch({ draft: buildDraft(d) });
  const long = secs > 90;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-pixel text-xl font-bold text-ink">Put it together</h2>
      <p className="text-ink">
        A good pitch has three parts: who you are now, one or two things you&apos;ve done, and what you want
        next. Two quick lines, then we&apos;ll build a first draft from your answers.
      </p>
      <label className="flex flex-col gap-1 font-bold text-ink">
        Who are you now?
        <input
          value={d.who}
          onChange={(e) => savePitch({ who: e.target.value })}
          placeholder="a front-end developer with three years of experience in React"
          className={`${field} font-normal`}
        />
      </label>
      <label className="flex flex-col gap-1 font-bold text-ink">
        What are you looking for next? (finish the sentence “I&apos;m looking for…”)
        <input
          value={d.why}
          onChange={(e) => savePitch({ why: e.target.value })}
          placeholder="a team that cares about accessibility"
          className={`${field} font-normal`}
        />
      </label>
      <div>
        <button type="button" className="btn-accent" onClick={make}>
          {d.draft ? "Rebuild the draft from my answers" : "Build my first draft"}
        </button>
        {d.draft && <p className="mt-1 text-sm text-ink-soft">Rebuilding replaces any edits you made below.</p>}
      </div>
      {d.draft && (
        <>
          <label htmlFor="draft" className="font-pixel text-sm font-bold text-teal-deep">
            Your draft. Edit it until it sounds like you.
          </label>
          <textarea
            id="draft"
            value={d.draft}
            onChange={(e) => savePitch({ draft: e.target.value })}
            rows={10}
            className={`${field} resize-y`}
          />
          <p className={`text-sm ${long ? "font-semibold text-ink" : "text-ink-soft"}`}>
            {words} words, about {secs} seconds out loud.{" "}
            {long ? "That's a bit long. Trim it toward a minute." : "A minute or so is about right."} Anything in [brackets]
            still needs filling in.
          </p>
        </>
      )}
      <Nav onBack={onBack} onNext={onNext} nextLabel="Practice it" disabled={!d.draft} />
    </section>
  );
}

function FollowUpStep({ d, onBack }: { d: D; onBack: () => void }) {
  const [checked, setChecked] = useState<boolean[]>(() => PITCH_CHECKS.map(() => false));
  const [owned, setOwned] = useState<Record<string, boolean>>({});

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="font-pixel text-xl font-bold text-ink">Say your pitch out loud</h2>
        <p className="pixel-box bg-teal-wash p-4 text-ink">{d.draft}</p>
        <p className="text-ink">Read it aloud once, then again without looking. Then check it against this list.</p>
        <fieldset className="pixel-box p-4">
          <legend className="font-pixel px-1 text-sm font-bold text-ink">Does it hold up?</legend>
          {PITCH_CHECKS.map((c, i) => (
            <label key={c} className="flex items-start gap-2 py-1 text-ink">
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => setChecked((v) => v.map((x, j) => (j === i ? !x : x)))}
                className="mt-1 h-5 w-5 accent-teal"
              />
              {c}
            </label>
          ))}
        </fieldset>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-pixel text-xl font-bold text-ink">Now the follow-ups</h2>
        <p className="text-ink">
          Whatever you say, they&apos;ll dig into it. Try answering each of these in a couple of sentences, out
          loud, for the experience you chose. If one is hard, that&apos;s the one to practice.
        </p>
        {d.picked.map((req) => {
          const m = d.matches[req];
          const did = m?.did?.trim();
          return (
            <div key={req} className="pixel-box flex flex-col gap-2 p-4">
              <p className="font-pixel text-sm font-bold text-teal-deep">About: {did ? did : req}</p>
              <ul className="flex flex-col">
                {FOLLOW_UPS.map((q) => {
                  const key = `${req}::${q}`;
                  return (
                    <li key={q}>
                      <label className="flex items-start gap-2 py-1 text-ink">
                        <input
                          type="checkbox"
                          checked={owned[key] ?? false}
                          onChange={() => setOwned((o) => ({ ...o, [key]: !o[key] }))}
                          className="mt-1 h-5 w-5 accent-teal"
                        />
                        <span>
                          “{q}” <span className="text-sm text-ink-soft">I can answer this.</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        <p className="text-sm text-ink-soft">
          Want more practice with this? The &quot;Telling your story&quot; lessons cover it step by step, and your
          interview rounds mix these questions in.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-secondary" onClick={onBack}>
          Back to my draft
        </button>
        <Link href="/interview" className="btn-primary">
          Go to interviews
        </Link>
        <button
          type="button"
          className="font-semibold text-teal-deep underline"
          onClick={() => {
            if (window.confirm("Start over with a new role? This clears your current pitch from this device.")) clearPitch();
          }}
        >
          Start over with a new role
        </button>
      </div>
    </section>
  );
}
