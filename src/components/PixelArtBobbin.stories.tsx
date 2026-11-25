import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SEASONS } from "@/lib/season";
import type { BobbinMood } from "./Bobbin";
import { PixelArtBobbin } from "./PixelArtBobbin";

const MOODS: BobbinMood[] = ["sparkle", "wink", "happy", "thinking", "cheering", "sleepy", "determined", "nervous", "teary", "talk"];

const meta = {
  title: "Pixel art/PixelArtBobbin",
  component: PixelArtBobbin,
  tags: ["autodocs"],
  args: { mood: "sparkle", outfit: "winter", size: 160 },
  argTypes: {
    mood: { control: "select", options: MOODS },
    outfit: { control: "inline-radio", options: SEASONS },
    size: { control: { type: "range", min: 48, max: 320, step: 8 } },
  },
} satisfies Meta<typeof PixelArtBobbin>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Bobbin, the little round bird. 200×200 pixel art in /public/bobbin/pixel, one image per season and mood. */
export const Playground: Story = {};

/** The expressions in one season. The app picks the outfit from today's date. */
export const Moods: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {MOODS.map((mood) => (
        <li key={mood} className="pixel-box flex flex-col items-center gap-2 p-3">
          <PixelArtBobbin mood={mood} outfit={args.outfit} size={120} />
          <span className="font-mono text-xs text-ink-soft">{mood}</span>
        </li>
      ))}
    </ul>
  ),
};

/** Every mood in every season. */
export const Everything: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="flex flex-col gap-6 p-6">
      {SEASONS.map((season) => (
        <section key={season} className="flex flex-col gap-2">
          <h2 className="font-pixel text-lg font-bold capitalize text-ink">{season}</h2>
          <ul className="flex flex-wrap gap-2">
            {MOODS.map((mood) => (
              <li key={mood} className="pixel-box p-2">
                <PixelArtBobbin mood={mood} outfit={season} size={88} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  ),
};
