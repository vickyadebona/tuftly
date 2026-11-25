import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardSkeleton, InterviewSkeleton, LessonSkeleton, QuestSkeleton, Skeleton } from "./Skeleton";

const meta = {
  title: "Loading/Skeletons",
  component: Skeleton,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Shown while saved progress is read in the browser, so nothing flashes the wrong state. */
export const Block: Story = { args: { className: "h-16 w-64" } };
export const Quest: Story = { render: () => <QuestSkeleton /> };
export const Interview: Story = { render: () => <InterviewSkeleton /> };
export const Card: Story = { render: () => <CardSkeleton label="Loading your practice" /> };
export const Lesson: Story = { render: () => <LessonSkeleton /> };
