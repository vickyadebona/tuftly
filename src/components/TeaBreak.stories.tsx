import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TeaBreak } from "./TeaBreak";

const meta = {
  title: "Screens/Tea break",
  component: TeaBreak,
  args: { onReady: () => {} },
} satisfies Meta<typeof TeaBreak>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
