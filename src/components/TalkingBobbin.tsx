"use client";

import { SEASON_OVERRIDE } from "@/lib/config";
import { useSeason } from "@/lib/useSeason";
import { PixelArtBobbin } from "./PixelArtBobbin";

/**
 * Bobbin explaining something: the beak opens and closes for a moment, then stays open. With
 * `talking`, it moves for exactly as long as that is true.
 */
export function TalkingBobbin({ size = 88, talking }: { size?: number; talking?: boolean }) {
  const detected = useSeason();
  const season = SEASON_OVERRIDE ?? detected;
  return (
    // The wrapper floats, so both drawings move as one.
    <div className="bobbin-idle bobbin-still relative shrink-0">
      <PixelArtBobbin mood="talk" outfit={season} size={size} priority />
      <span className="bobbin-shut absolute inset-0" data-talking={talking} aria-hidden="true">
        <PixelArtBobbin mood="sparkle" outfit={season} size={size} priority />
      </span>
    </div>
  );
}
