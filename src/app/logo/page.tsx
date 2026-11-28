import type { Metadata } from "next";
import { Fredoka, Pixelify_Sans } from "next/font/google";
import Link from "next/link";
import { PixelArtBobbin } from "@/components/PixelArtBobbin";

// Display fonts (open-license Google fonts; confirm the licenses before shipping).
const pixelify = Pixelify_Sans({ subsets: ["latin"], weight: ["600"] });
const fredoka = Fredoka({ subsets: ["latin"], weight: ["600"] });

const TEAL = "#3A9188";

function Wordmark({ font, size }: { font: string; size: number }) {
  return (
    <span className={font} style={{ fontSize: size, lineHeight: 1 }}>
      tuft<span style={{ color: TEAL }}>ly</span>
    </span>
  );
}

function Lockup({ font, dark }: { font: string; dark: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-zinc-300 p-6 ${
        dark ? "bg-zinc-950 text-white" : "bg-white text-zinc-900"
      }`}
    >
      <PixelArtBobbin mood="sparkle" size={80} />
      <Wordmark font={font} size={44} />
    </div>
  );
}

function AppIcon({ size }: { size: number }) {
  return (
    <div
      className="grid place-items-center"
      style={{ width: size, height: size, borderRadius: size * 0.225, background: "#FFF3C9" }}
    >
      <PixelArtBobbin mood="sparkle" size={Math.round(size * 0.86)} />
    </div>
  );
}

/** Logo exploration with the pixel-art Bobbin. Concepts only; not trademark-cleared. */
export const metadata: Metadata = { title: "Logo exploration", robots: { index: false } };

export default function LogoPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <Link href="/" className="text-sm underline">
        ← Home
      </Link>
      <h1 className="text-2xl font-semibold">Logo exploration</h1>
      <p className="text-sm text-zinc-600">
        Pixel Bobbin as the mark, with a lowercase wordmark. The &quot;ly&quot; picks up the scarf
        teal. The dark panels only show how it would look on a dark background; the app itself is
        light only.
      </p>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-zinc-500">Pixel wordmark</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Lockup font={pixelify.className} dark={false} />
          <Lockup font={pixelify.className} dark />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-zinc-500">Rounded wordmark</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Lockup font={fredoka.className} dark={false} />
          <Lockup font={fredoka.className} dark />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-zinc-500">
          App icon at different sizes (source art is only 200×200)
        </h2>
        <div className="flex items-end gap-6">
          <AppIcon size={128} />
          <AppIcon size={64} />
          <AppIcon size={32} />
          <AppIcon size={20} />
        </div>
      </section>
    </main>
  );
}
