import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PIXEL_ICON_NAMES, PixelCloud, PixelIcon, Teacup } from "./PixelIcon";

const meta = {
  title: "Pixel art/PixelIcon",
  component: PixelIcon,
  tags: ["autodocs"],
  args: { name: "star", size: 48, color: "#f2b93b" },
  argTypes: {
    name: { control: "select", options: PIXEL_ICON_NAMES },
    color: { control: "color" },
    size: { control: { type: "range", min: 16, max: 128, step: 4 } },
  },
} satisfies Meta<typeof PixelIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Tiny sprites drawn as SVG rects, so they stay crisp at any size and take any colour. */
export const Playground: Story = {};

/** Every icon, at the same size. */
export const Gallery: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <ul className="grid grid-cols-3 gap-4 sm:grid-cols-5">
      {PIXEL_ICON_NAMES.map((name) => (
        <li key={name} className="pixel-box flex flex-col items-center gap-3 p-4">
          <PixelIcon name={name} size={40} />
          <span className="font-mono text-xs text-ink-soft">{name}</span>
        </li>
      ))}
    </ul>
  ),
};

/** Pixel clouds for the hero scene. */
export const Clouds: Story = {
  parameters: { backgrounds: { value: "sky" } },
  render: () => (
    <div className="flex items-end gap-6 p-6">
      <PixelCloud size={64} />
      <PixelCloud size={96} />
      <PixelCloud size={144} />
    </div>
  ),
};

/** The teacup on the tea-break screen. */
export const TeaCup: Story = { render: () => <Teacup size={96} /> };
