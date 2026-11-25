import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CodeBlock } from "./CodeBlock";

const meta = {
  title: "Learning/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  args: { code: "const scores = [30, 10, 20];\nconst sorted = [...scores].sort((a, b) => a - b);\nconsole.log(scores); // [30, 10, 20]" },
  decorators: [(Story) => <div className="w-[560px] max-w-full"><Story /></div>],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const OneLine: Story = { args: { code: "[10, 9, 1].sort()" } };
/** Long lines scroll sideways inside the block instead of widening the page. */
export const LongLine: Story = { args: { code: "const result = list.filter((item) => item.tags.includes('javascript') && item.level <= currentLevel).map((item) => item.title);" } };
