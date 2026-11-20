import Image from "next/image";
import { COMPANION } from "@/lib/config";
import type { Season } from "@/lib/season";
import type { BobbinMood } from "./Bobbin";

// AI-generated pixel-art sets (200x200, transparent) in /public/bobbin/pixel/<season>/<mood>.webp.
// Lossless WebP (pixel-identical to the PNG originals in /design, about a third smaller). Images
// load lazily; pass `priority` for the one above the fold so it is not delayed. "calm" has no separate drawing, so it uses sparkle.
const FILE: Record<BobbinMood, string> = {
  sparkle: "sparkle",
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
  outfit = "winter",
  size = 96,
  priority = false,
}: {
  mood?: BobbinMood;
  outfit?: Season;
  size?: number;
  /** Above-the-fold image: load right away instead of lazily. */
  priority?: boolean;
}) {
  const motion =
    mood === "cheering" ? "bobbin-cheer" : mood === "sleepy" ? "bobbin-sleep" : "bobbin-idle";
  return (
    <Image
      src={`/bobbin/pixel/${outfit}/${FILE[mood]}.webp`}
      alt={`${COMPANION.name}, a little round pixel-art bird in a ${outfit} outfit, looking ${mood}`}
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
