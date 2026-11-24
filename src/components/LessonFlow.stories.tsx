import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { lessons } from "@/content/lessons";
import { emptyProgress, learner } from "@/stories/seeds";
import { LessonFlow } from "./LessonFlow";

const arrays = lessons.find((l) => l.id === "arrays-copy-vs-mutate")!;
const at = (idea: number, stage: string, attempt = 0, missed: string[] = []) => ({
  ...emptyProgress,
  unitsSeen: ["javascript"],
  lessonProgress: { [arrays.id]: { idea, stage, attempt, missed, updatedAt: Date.now() } },
});

const meta = {
  title: "Screens/Lesson",
  component: LessonFlow,
  args: { lesson: arrays },
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="mx-auto max-w-2xl"><Story /></div>],
} satisfies Meta<typeof LessonFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

// Lessons save their place after every step. These stories start from a saved place, so each
// step of the flow can be viewed without clicking through the lesson.

export const LessonIntroStep: Story = { parameters: { tuftly: { account: learner, progress: { ...emptyProgress, unitsSeen: ["javascript"] } } } };
export const YourTurn: Story = { parameters: { tuftly: { account: learner, progress: at(0, "check") } } };
/** After a miss: the same idea explained another way, then a fresh question. */
export const AnotherLook: Story = { parameters: { tuftly: { account: learner, progress: at(0, "reteach", 1, ["sort-mutates"]) } } };
export const SayItInWords: Story = { parameters: { tuftly: { account: learner, progress: at(0, "explain") } } };
export const SecondIdea: Story = { parameters: { tuftly: { account: learner, progress: at(1, "guess") } } };
export const Recap: Story = { parameters: { tuftly: { account: learner, progress: at(3, "guess", 0, ["sort-numbers"]) } } };
