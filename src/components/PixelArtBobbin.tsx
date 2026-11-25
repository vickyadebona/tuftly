"use client";

import Image from "next/image";
import { COMPANION } from "@/lib/config";
import type { Season } from "@/lib/season";
import { useSeason } from "@/lib/useSeason";
import type { BobbinMood } from "./Bobbin";

// AI-generated pixel-art sets (200x200, transparent) in /public/bobbin/pixel/<season>/<mood>.webp.
// Lossless WebP (pixel-identical to the PNG originals in /design, about a third smaller). Images
// load lazily; pass `priority` for the one above the fold so it is not delayed. "calm" has no separate drawing, so it uses sparkle.
// "wink" is drawn from sparkle and cheering by scripts/make-wink.mjs: rerun it if those change.
// "talk" is sparkle with cheering's open beak (scripts/make-talk.mjs).
// "sip" is happy without its side wings (scripts/make-sip.mjs), for the tea break.
const FILE: Record<BobbinMood, string> = {
  sparkle: "sparkle",
  wink: "wink",
  sip: "sip",
  talk: "talk",
  calm: "sparkle",
  happy: "happy",
  thinking: "thinking",
  cheering: "cheering",
  sleepy: "sleepy",
  determined: "determined",
  nervous: "nervous",
  teary: "teary",
};

export function PixelArtBobbin({
  mood = "sparkle",
  outfit,
  size = 96,
  priority = false,
}: {
  mood?: BobbinMood;
  /** Leave this off: Bobbin dresses for today's season. Set it only to show a particular outfit. */
  outfit?: Season;
  size?: number;
  /** Above-the-fold image: load right away instead of lazily. */
  priority?: boolean;
}) {
  const today = useSeason();
  const season = outfit ?? today;
  const motion =
    mood === "cheering" ? "bobbin-cheer" : mood === "sleepy" ? "bobbin-sleep" : "bobbin-idle";
  return (
    <Image
      src={`/bobbin/pixel/${season}/${FILE[mood]}.webp`}
      alt={`${COMPANION.name}, a little round pixel-art bird in a ${season} outfit, ${mood === "wink" ? "winking" : mood === "sip" ? "having a sip" : mood === "talk" ? "talking" : `looking ${mood}`}`}
      width={size}
      height={size}
      unoptimized
      priority={priority}
      loading={priority ? undefined : "lazy"}
      decoding="async"
      className={motion}
    />
  );
}
