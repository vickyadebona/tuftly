import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PixelIcon } from "@/components/PixelIcon";

// The shared look: chunky outlines with a hard offset shadow. These are CSS classes in
// src/app/globals.css, not React components, so they are documented here as examples.
function Showcase() {
  return (
    <div className="flex max-w-3xl flex-col gap-10 p-6">
      <section className="flex flex-col gap-3">
        <h2 className="font-pixel text-xl font-bold text-ink">.pixel-box</h2>
        <div className="pixel-box p-5 text-ink">A chunky outlined box with a hard offset shadow. Used for cards, questions and feedback.</div>
        <div className="pixel-box bg-mint p-5 text-ink">Tinted with a palette color: bg-mint.</div>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-pixel text-xl font-bold text-ink">.pixel-chip</h2>
        <div className="flex flex-wrap gap-3">
          <span className="pixel-chip">Standard</span>
          <span className="pixel-chip bg-peach"><PixelIcon name="flame" size={16} color="#f08a24" /> 5 day streak</span>
          <span className="pixel-chip bg-mint"><PixelIcon name="check" size={16} color="#2f7f78" /> No leaderboards</span>
          <span className="pixel-chip bg-sky">Question 2 of 5</span>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-pixel text-xl font-bold text-ink">Buttons</h2>
        <div className="flex flex-wrap items-center gap-4">
          <button className="btn-primary">Start lesson</button>
          <button className="btn-secondary">Back</button>
          <button className="btn-accent">Need a nudge?</button>
          <button className="btn-primary" disabled>Disabled</button>
        </div>
        <p className="text-sm text-ink-soft">Primary is the main action on a screen. Secondary is the way back. Accent is a helpful extra, like a hint.</p>
      </section>
    </div>
  );
}

const meta = { title: "Foundations/Pixel boxes, chips and buttons", component: Showcase, parameters: { layout: "fullscreen" } } satisfies Meta<typeof Showcase>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Examples: Story = {};
