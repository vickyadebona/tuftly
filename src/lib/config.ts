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
  // One missed day a week is covered (fixed rule, in src/lib/streak.ts).
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

/** What each pace changes. The interview rounds and the landing page both read this. */
export const PRESSURE: { id: PressureLevel; label: string; seconds: number | null; hints: boolean; note: string }[] = [
  { id: "relaxed", label: "Relaxed", seconds: null, hints: true, note: "Hints on · No timer" },
  { id: "standard", label: "Standard", seconds: 300, hints: true, note: "Hints on · Gentle timer" },
  { id: "zara-like", label: "Interview day", seconds: 180, hints: false, note: "Hints off · Strict timer" },
];

/**
 * Offer "Share this to help improve lessons" after "Almost". Off until the privacy page is live
 * and describes it. To turn on: also move supabase/pending/0003_lesson_feedback.sql into
 * supabase/migrations/ so the table is created.
 */
export const SHARE_GAPS: boolean = false;
