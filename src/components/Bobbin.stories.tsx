import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Bobbin } from "./Bobbin";

const meta = {
  title: "Pixel art/Bobbin (with speech)",
  component: Bobbin,
  tags: ["autodocs"],
  args: { say: "Make a guess before you see the answer. A wrong guess is fine.", mood: "thinking", outfit: "winter" },
  argTypes: { mood: { control: "select", options: ["sparkle", "wink", "happy", "thinking", "cheering", "sleepy", "determined", "nervous", "teary"] }, outfit: { control: "inline-radio", options: ["winter", "spring", "summer", "autumn"] } },
  decorators: [(Story) => <div className="w-[520px] max-w-full"><Story /></div>],
} satisfies Meta<typeof Bobbin>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Bobbin with an optional speech bubble. Used for lesson prompts and gentle nudges. */
export const WithSpeech: Story = {};
export const NoBubble: Story = { args: { say: undefined, mood: "happy" } };
export const Cheering: Story = { args: { say: "That's the lesson. Here's what to remember.", mood: "cheering" } };
