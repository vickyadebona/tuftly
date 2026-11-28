"use client";

import { useMemo } from "react";
import { FEET, LEAF, LEAVES, scene, SCENE_H, SCENE_W } from "@/lib/island";
import type { Season } from "@/lib/season";
import { PixelArtBobbin } from "./PixelArtBobbin";

/** Bobbin's width in scene pixels, and how far down the picture the feet are. */
const BIRD = 36;
const SPRITE_FEET = 0.905;

/** Bobbin on a floating island dressed for `season`. Fills the width it's given. */
export function IslandArt({ season, priority = false }: { season: Season; priority?: boolean }) {
  const layers = useMemo(() => scene(season), [season]);
  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} className="block w-full" shapeRendering="crispEdges" aria-hidden="true">
        {layers.map((layer, i) => (
          <path key={i} d={layer.d} fill={layer.color} />
        ))}
        {season === "autumn" &&
          LEAVES.map(({ x, y, flip }) => (
            <image
              key={`${x}-${y}`}
              href={LEAF.src}
              width={LEAF.width}
              height={LEAF.height}
              transform={flip ? `translate(${x + LEAF.width} ${y}) scale(-1 1)` : `translate(${x} ${y})`}
              style={{ imageRendering: "pixelated" }}
            />
          ))}
      </svg>
      <div
        className="absolute aspect-square [&_img]:h-full [&_img]:w-full"
        style={{
          width: `${(BIRD / SCENE_W) * 100}%`,
          left: `${((SCENE_W - BIRD) / 2 / SCENE_W) * 100}%`,
          top: `${((FEET - BIRD * SPRITE_FEET) / SCENE_H) * 100}%`,
        }}
      >
        <PixelArtBobbin mood="sparkle" outfit={season} size={300} priority={priority} />
      </div>
    </div>
  );
}
