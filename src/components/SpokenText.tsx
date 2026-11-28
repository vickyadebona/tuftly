"use client";

import { useSpokenFraction } from "@/lib/speech";
import { spokenLength } from "@/lib/voice";

/**
 * A line Bobbin says, with its words appearing as he says them. All of it holds its place from the
 * start, so nothing jumps, and screen readers get the whole line at once.
 */
export function SpokenText({ id, text }: { id: string; text: string }) {
  const fraction = useSpokenFraction(id);
  if (fraction === null) return text;
  const shown = spokenLength(text, fraction);
  return (
    <>
      <span aria-hidden="true">
        {text.slice(0, shown)}
        <span className="spoken-later">{text.slice(shown)}</span>
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}
