import type { Season } from "./season";

// Product decisions. Change here, not scattered through the code.

/** Product name. Always lowercase in branding and UI copy. */
export const APP_NAME = "tuftly";

/** Free AI interviews per user per day (cost control while the product is free-first). */
export const DAILY_INTERVIEW_CAP = 2;

/** How long the first lesson takes, as promised on the landing and About pages. A content test keeps it true. */
export const FIRST_LESSON_MINUTES = 6;

/** One companion character for v1. Users do not pick; customization comes later. */
export const COMPANION = {
  id: "bobbin",
  name: "Bobbin",
  species: "little round bird",
  tone: "friendly and outgoing, never cringy or fake",
} as const;

/** Seasonal outfits follow the device date. Flip for the southern hemisphere. */
export const HEMISPHERE: "north" | "south" = "north";

/** Force one season for testing or screenshots. `null` means follow the date. */
export const SEASON_OVERRIDE: Season | null = null;

/** Streak rules: gentle by design (no leaderboards, no guilt). */
export const STREAK = {
  graceDays: 1, // missing a single day does not break the streak
  restDaysPerWeek: 2, // user-chosen days off that never count against them
} as const;

/** Review session shape. Small and bounded so a session never feels like a wall. */
export const REVIEW = {
  sessionSize: 8,
  newDrillsPerSession: 3,
} as const;

/** AI-drafted content ships only after you review it. Drafts are visible in dev only. */
export const SHOW_UNREVIEWED = process.env.NODE_ENV !== "production";

export const PRESSURE_LEVELS = ["relaxed", "standard", "zara-like"] as const;
export type PressureLevel = (typeof PRESSURE_LEVELS)[number];
