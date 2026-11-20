import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Lets a production build run in its own folder without disturbing a running dev server.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
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
