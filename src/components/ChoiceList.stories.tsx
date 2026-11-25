import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { ChoiceList } from "./ChoiceList";

const meta = {
  title: "Learning/ChoiceList",
  component: ChoiceList,
  tags: ["autodocs"],
  args: { options: ["[1, 9, 10]", "[10, 9, 1]", "[1, 10, 9]", "[9, 10, 1]"], answerIndex: 2, picked: null, revealed: false, onPick: fn() },
  decorators: [(Story) => <div className="w-[420px] max-w-full"><Story /></div>],
} satisfies Meta<typeof ChoiceList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Answer choices. After reveal the right answer is green and a wrong pick is soft amber, never red. */
export const Unanswered: Story = {};
export const Picked: Story = { args: { picked: 1 } };
export const AnsweredRight: Story = { args: { picked: 2, revealed: true } };
export const AnsweredWrong: Story = { args: { picked: 0, revealed: true } };

/** Click an option to see it reveal. */
function InteractiveDemo(args: React.ComponentProps<typeof ChoiceList>) {
  const [picked, setPicked] = useState<number | null>(null);
  return <ChoiceList {...args} picked={picked} revealed={picked !== null} onPick={setPicked} />;
}
export const Interactive: Story = { render: (args) => <InteractiveDemo {...args} /> };
