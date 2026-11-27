"use client";

import { useState } from "react";
import { PRESSURE, type PressureLevel } from "@/lib/config";
import { correctLine, HELLO, NOT_SURE, TEA_TIME } from "@/lib/phrases";
import { PixelArtBobbin } from "./PixelArtBobbin";
import { RichText } from "./RichText";
import { SippingBobbin } from "./TeaBreak";

const MOODS = [
  { mood: "sparkle", label: "Hello", says: `${HELLO} Good to see you.` },
  { mood: "cheering", label: "Cheering", says: correctLine(0) },
  { mood: "thinking", label: "Thinking", says: NOT_SURE },
  { mood: "sip", label: "Tea time", says: TEA_TIME },
  { mood: "sleepy", label: "Resting", says: "Rest day. Your streak is safe." },
] as const;

/** One big Bobbin who changes expression and line as you pick a mood. */
export function MoodPicker() {
  const [at, setAt] = useState(0);
  const now = MOODS[at];
  return (
    <div className="flex flex-col items-center gap-4">
      <p aria-live="polite" className="pixel-box flex min-h-20 w-full max-w-sm items-center justify-center bg-paper px-4 py-3 text-center font-pixel text-xl font-bold text-ink">
        {now.says}
      </p>
      {/* Tea time drinks the way the app's tea break does, cup and wings included. */}
      <div className="flex h-[220px] items-center justify-center">
        {now.mood === "sip" ? (
          <div className="scale-[1.29]">
            <SippingBobbin />
          </div>
        ) : (
          <PixelArtBobbin mood={now.mood} size={220} />
        )}
      </div>
      <div role="radiogroup" aria-label="Bobbin's mood" className="flex flex-wrap justify-center gap-2">
        {MOODS.map((m, i) => (
          <button
            key={m.label}
            type="button"
            role="radio"
            aria-checked={at === i}
            onClick={() => setAt(i)}
            className={`pixel-chip ${at === i ? "bg-teal" : "bg-paper hover:bg-cream-deep"}`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const LOOKS: Record<PressureLevel, { mood: "happy" | "sparkle" | "determined"; bg: string; text: string }> = {
  relaxed: { mood: "happy", bg: "bg-mint", text: "Hints are on and there is no timer. Take all the time you need." },
  standard: { mood: "sparkle", bg: "bg-peach", text: "Hints are on, with a gentle timer for each question." },
  "zara-like": { mood: "determined", bg: "bg-lilac", text: "No hints and a shorter timer, so a **timed AI interview** feels familiar." },
};

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** One panel that changes as you slide from a relaxed round to interview day. */
export function PaceSlider() {
  const [at, setAt] = useState(0);
  const level = PRESSURE[at];
  const look = LOOKS[level.id];
  return (
    <div className={`pixel-box mx-auto flex w-full max-w-2xl flex-col items-center gap-6 p-6 text-center transition-colors sm:p-8 ${look.bg}`}>
      <PixelArtBobbin mood={look.mood} size={170} />
      <div aria-live="polite" className="flex flex-col items-center gap-3">
        <h3 className="font-pixel text-2xl font-bold text-ink">{level.label}</h3>
        <p className="min-h-12 max-w-md text-ink">
          <RichText text={look.text} />
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <span className="pixel-chip">{level.hints ? "Hints on" : "Hints off"}</span>
          <span className="pixel-chip">
            {level.seconds === null ? "No timer" : <span className="font-sans font-bold">{clock(level.seconds)}</span>}
            {level.seconds === null ? null : " a question"}
          </span>
        </div>
      </div>
      <div className="w-full max-w-md">
        <input
          type="range"
          min={0}
          max={PRESSURE.length - 1}
          step={1}
          value={at}
          onChange={(e) => setAt(Number(e.target.value))}
          aria-label="How much pressure"
          aria-valuetext={level.label}
          className="h-8 w-full cursor-pointer accent-teal-deep"
        />
        <div className="flex justify-between gap-2">
          {PRESSURE.map((p, i) => (
            <button key={p.id} type="button" onClick={() => setAt(i)} className={`font-pixel text-sm font-bold text-ink ${at === i ? "underline" : ""}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
