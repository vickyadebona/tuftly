import type { Meta, StoryObj } from "@storybook/nextjs-vite";

function Type() {
  return (
    <div className="flex max-w-3xl flex-col gap-8 p-6">
      <section className="flex flex-col gap-3">
        <h2 className="font-pixel text-sm font-bold uppercase tracking-wide text-teal-deep">Pixelify Sans: headings, buttons, labels</h2>
        <p className="font-pixel text-6xl font-bold leading-[1.05] text-ink">Warm up for your next AI interview</p>
        <p className="font-pixel text-4xl font-bold text-ink">Unit heading, 36px</p>
        <p className="font-pixel text-3xl font-bold text-ink">Page title, 30px</p>
        <p className="font-pixel text-xl font-bold text-ink">Card title and question, 20px</p>
        <p className="font-pixel text-sm font-semibold text-ink">Small label, 14px · font-pixel turns ligatures off so “fi” and “fl” draw correctly: first flight</p>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-pixel text-sm font-bold uppercase tracking-wide text-teal-deep">Nunito: reading text</h2>
        <p className="text-xl text-ink-soft">Large intro text, 20px. Short lessons, game-like drills and a friendly bird.</p>
        <p className="text-lg text-ink">Body text, 18px. Say what you personally owned, and credit the team honestly.</p>
        <p className="text-base text-ink">Body text, 16px. Default size for explanations and answers.</p>
        <p className="text-sm text-ink-soft">Small text, 14px. Notes, hints and captions.</p>
        <p className="text-base font-bold text-ink">Bold for labels and emphasis</p>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-pixel text-sm font-bold uppercase tracking-wide text-teal-deep">Monospace: code and answer choices</h2>
        <p className="font-mono text-sm text-ink">const sorted = [...scores].sort((a, b) =&gt; a - b);</p>
      </section>
    </div>
  );
}

const meta = { title: "Foundations/Typography", component: Type, parameters: { layout: "fullscreen" } } satisfies Meta<typeof Type>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {};
