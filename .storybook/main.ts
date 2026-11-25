import type { StorybookConfig } from "@storybook/nextjs-vite";
import tailwindcss from "@tailwindcss/vite";

// Storybook for tuftly. The app uses Tailwind through Turbopack, which Storybook's Vite builder
// can't use, so the Vite plugin is added here. It reads the same src/app/globals.css.
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: "@storybook/nextjs-vite",
  // No usage reporting from this project.
  core: { disableTelemetry: true },
  // Bobbin's art lives in public/bobbin/pixel and is loaded by absolute path.
  staticDirs: ["../public"],
  async viteFinal(viteConfig) {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    return viteConfig;
  },
};

export default config;
