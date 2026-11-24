import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { lessons } from "@/content/lessons";
import { units } from "@/content/units";
import { LessonIntro, UnitIntro } from "./LessonIntro";

const lesson = (id: string) => lessons.find((l) => l.id === id)!;
const unit = (track: string) => units.find((u) => u.track === track)!;

const meta = {
  title: "Learning/Intros",
  component: LessonIntro,
  args: { lesson: lesson("pitch-basics"), onBegin: fn() },
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="mx-auto max-w-2xl"><Story /></div>],
} satisfies Meta<typeof LessonIntro>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Shown before every lesson: what you'll be able to do and how the lesson runs. */
export const Lesson: Story = {};
export const CodeLesson: Story = { args: { lesson: lesson("arrays-copy-vs-mutate") } };

/** Shown once, before the first lesson of a unit. Unit 1 also explains how tuftly works. */
export const FirstUnit: Story = {
  render: () => (
    <UnitIntro unit={unit("communication")} number={1} lessons={lessons.filter((l) => l.track === "communication")} onStart={fn()} />
  ),
};
export const LaterUnit: Story = {
  render: () => (
    <UnitIntro unit={unit("javascript")} number={2} lessons={lessons.filter((l) => l.track === "javascript")} onStart={fn()} />
  ),
};
