import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useRef, useState } from "react";

// Swatches read the real colour from the page, so this stays in step with src/app/globals.css.
function Swatch({ name, cls, use }: { name: string; cls: string; use: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hex, setHex] = useState("");
  useEffect(() => {
    if (!ref.current) return;
    const [r, g, b] = (getComputedStyle(ref.current).backgroundColor.match(/\d+/g) ?? []).map(Number);
    setHex("#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join(""));
  }, []);
  return (
    <li className="flex flex-col gap-2">
      <div ref={ref} className={`h-16 border-[3px] border-line ${cls}`} />
      <div className="flex flex-col">
        <span className="font-bold text-ink">{name}</span>
        <span className="font-mono text-xs text-ink-soft">{hex} · {cls}</span>
        <span className="text-sm text-ink-soft">{use}</span>
      </div>
    </li>
  );
}

const GROUPS: { title: string; swatches: { name: string; cls: string; use: string }[] }[] = [
  {
    title: "Surfaces",
    swatches: [
      { name: "cream", cls: "bg-cream", use: "Page background" },
      { name: "paper", cls: "bg-paper", use: "Cards, inputs, boxes" },
      { name: "cream-deep", cls: "bg-cream-deep", use: "Hover, quiet banners" },
      { name: "sky", cls: "bg-sky", use: "Hints, how-it-works" },
      { name: "mint", cls: "bg-mint", use: "Feedback, key points" },
      { name: "lilac", cls: "bg-lilac", use: "Story unit, pitch" },
      { name: "peach", cls: "bg-peach", use: "Warm-ups, Bobbin banners" },
      { name: "teal-wash", cls: "bg-teal-wash", use: "Code blocks, calm sections" },
    ],
  },
  {
    title: "Brand and accents",
    swatches: [
      { name: "teal", cls: "bg-teal", use: "Primary buttons, done (brown text only)" },
      { name: "teal-deep", cls: "bg-teal-deep", use: "Links, small teal text" },
      { name: "teal-light", cls: "bg-teal-light", use: "Primary button hover" },
      { name: "butter", cls: "bg-butter", use: "Current step, accent buttons" },
      { name: "butter-deep", cls: "bg-butter-deep", use: "Stars, accent hover" },
      { name: "coral", cls: "bg-coral", use: "Hearts, warm accents" },
      { name: "orange", cls: "bg-orange", use: "Flames (decoration)" },
      { name: "orange-deep", cls: "bg-orange-deep", use: "Error text, meaningful lines" },
      { name: "grass", cls: "bg-grass", use: "Hero ground" },
      { name: "lilac-deep", cls: "bg-lilac-deep", use: "Story unit header" },
    ],
  },
  {
    title: "Text and lines",
    swatches: [
      { name: "ink", cls: "bg-ink", use: "Body text" },
      { name: "ink-soft", cls: "bg-ink-soft", use: "Secondary text" },
      { name: "line", cls: "bg-line", use: "Every border and outline" },
    ],
  },
];

function Palette() {
  return (
    <div className="flex max-w-4xl flex-col gap-8 p-6">
      {GROUPS.map((g) => (
        <section key={g.title} className="flex flex-col gap-3">
          <h2 className="font-pixel text-xl font-bold text-ink">{g.title}</h2>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {g.swatches.map((s) => (
              <Swatch key={s.name} {...s} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

const meta = {
  title: "Foundations/Colors",
  component: Palette,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Palette>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The palette. The same tokens exist as variables in the Figma file "tuftly: layout explorations". */
export const Palette_: Story = { name: "Palette" };
