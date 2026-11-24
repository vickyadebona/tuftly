import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { emptyProgress, learner } from "@/stories/seeds";
import { PitchBuilder } from "./PitchBuilder";

const meta = {
  title: "Screens/Pitch builder",
  component: PitchBuilder,
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="mx-auto max-w-3xl"><Story /></div>],
} satisfies Meta<typeof PitchBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

const req = "Build accessible, well-tested user interfaces";
const filled = {
  step: 3,
  role: "Front-end developer",
  description: "- 3+ years of experience with React and TypeScript\n- Build accessible, well-tested user interfaces\n- Work closely with design and product",
  custom: [],
  picked: [req],
  matches: { [req]: { did: "rebuilt our checkout form with clearer errors", result: "drop-offs fell by 18%" } },
  who: "a front-end developer with three years of experience in React",
  why: "a team that cares about accessibility",
  draft:
    "I'm a front-end developer with three years of experience in React.\n\nMost recently, I rebuilt our checkout form with clearer errors, and drop-offs fell by 18%.\n\nThe front-end developer role asks for “Build accessible, well-tested user interfaces”, and that's the kind of work I've been doing. I'm looking for a team that cares about accessibility.",
  updatedAt: 1,
};

/** The pitch is stored on the device only. Stories seed it directly. */
export const Start: Story = { parameters: { tuftly: { account: learner, progress: emptyProgress } } };
export const DraftStep: Story = { parameters: { tuftly: { account: learner, progress: emptyProgress, pitch: filled } } };
export const FollowUps: Story = { parameters: { tuftly: { account: learner, progress: emptyProgress, pitch: { ...filled, step: 4 } } } };
