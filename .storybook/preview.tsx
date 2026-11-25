import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { Nunito, Pixelify_Sans } from "next/font/google";
import "../src/app/globals.css";

// Same fonts as src/app/layout.tsx, so type looks like the app.
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const pixelify = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const withFonts: Decorator = (Story) => (
  <div
    className={`${nunito.variable} ${pixelify.variable} antialiased`}
    style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", color: "var(--foreground)" }}
  >
    <Story />
  </div>
);

/**
 * Screens read their state from localStorage (progress, profile, pitch). A story can set what
 * they see with `parameters: { tuftly: { progress, account, pitch } }`. Anything not given is
 * cleared, so every story starts from a known state.
 */
export interface TuftlyState {
  progress?: unknown;
  account?: unknown;
  pitch?: unknown;
}
const KEYS: Record<keyof TuftlyState, string> = {
  progress: "tuftly-progress-v1",
  account: "tuftly-account-v1",
  pitch: "tuftly-pitch-v1",
};
const OTHER_KEYS = ["tuftly-last-profile-v1", "tuftly-tour-seen-v1"];

const withTuftlyState: Decorator = (Story, context) => {
  if (typeof window !== "undefined") {
    const state = (context.parameters.tuftly ?? {}) as TuftlyState;
    try {
      for (const [name, key] of Object.entries(KEYS)) {
        const value = state[name as keyof TuftlyState];
        if (value === undefined) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, JSON.stringify(value));
      }
      for (const key of OTHER_KEYS) window.localStorage.removeItem(key);
    } catch {
      // Storage blocked: the story just shows the empty state.
    }
  }
  return <Story />;
};

const preview: Preview = {
  decorators: [withFonts, withTuftlyState],
  initialGlobals: { backgrounds: { value: "cream" } },
  parameters: {
    layout: "centered",
    backgrounds: {
      options: {
        cream: { name: "Cream", value: "#fff8e7" },
        paper: { name: "Paper", value: "#fffdf4" },
        sky: { name: "Sky", value: "#e1f3f8" },
      },
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: "todo" },
  },
};

export default preview;
