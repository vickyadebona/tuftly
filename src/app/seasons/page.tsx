import Link from "next/link";
import type { BobbinMood } from "@/components/Bobbin";
import { PixelArtBobbin } from "@/components/PixelArtBobbin";
import { SEASONS, type Season } from "@/lib/season";

const BLURB: Record<Season, string> = {
  winter: "Nov–Feb. Teal scarf: cozy and cold-weather ready.",
  spring: "Mar–May. A flower crown around the tuft.",
  summer: "Jun–Aug. A straw sun hat with a teal ribbon.",
  autumn: "Sep–Oct. A dusty-red beret.",
};

const MOODS: BobbinMood[] = [
  "sparkle",
  "happy",
  "thinking",
  "cheering",
  "determined",
  "nervous",
  "teary",
  "sleepy",
];

/** Bobbin gallery: every season and expression. Not linked from the app. */
export default function SeasonsPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-10">
      <Link href="/" className="text-sm underline">
        ← Home
      </Link>
      <h1 className="text-2xl font-semibold">Bobbin: seasons and expressions</h1>
      <p className="text-sm text-zinc-600">
        Pixel art only. The app picks the outfit from today&apos;s date (northern hemisphere by
        default; change <code>HEMISPHERE</code> in the config). Every season has the same 8
        expressions.
      </p>

      {SEASONS.map((season) => (
        <section key={season} className="flex flex-col gap-3">
          <div>
            <h2 className="font-medium capitalize">{season}</h2>
            <p className="text-xs text-zinc-500">{BLURB[season]}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MOODS.map((mood) => (
              <figure
                key={mood}
                className="flex flex-col items-center gap-1 rounded-2xl border border-amber-200 bg-white p-3"
              >
                <PixelArtBobbin mood={mood} outfit={season} size={110} />
                <figcaption className="text-xs">{mood}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
