import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Lets a production build run in its own folder without disturbing a running dev server.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // The day this build was made. Pages are drawn ahead of time, so their first paint uses its
  // season; the browser then goes by the visitor's own date.
  env: { BUILT_ON: new Date().toISOString().slice(0, 10) },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
