import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { emptyProgress, learner, midProgress } from "@/stories/seeds";
import { QuestHome } from "./QuestHome";

const meta = {
  title: "Screens/Quest map",
  component: QuestHome,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div className="mx-auto max-w-6xl p-6"><Story /></div>],
} satisfies Meta<typeof QuestHome>;

export default meta;
type Story = StoryObj<typeof meta>;

// Note: like the live site, a static Storybook build hides content marked `reviewed: false`.
// In `npm run storybook` (dev) everything shows.

/** Before any lesson is done: just Bobbin saying hello, so the first step is obvious. */
export const FirstVisit: Story = { parameters: { tuftly: { account: learner, progress: emptyProgress } } };

/** After lessons are done: the unit tracks, today's quests and the week strip. */
export const WithProgress: Story = { parameters: { tuftly: { account: learner, progress: midProgress() } } };
