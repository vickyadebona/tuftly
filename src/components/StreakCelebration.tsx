"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "@/lib/account";
import { todayStr } from "@/lib/dates";
import { useHydrated, useProgress } from "@/lib/store";
import { streakSummary } from "@/lib/streak";
import { useSeason } from "@/lib/useSeason";
import { PixelArtBobbin } from "./PixelArtBobbin";
import { StreakWeek } from "./StreakDays";

/** The date this device last celebrated, so it happens once a day. */
const KEY = "tuftly-celebrated-v1";

function celebrated(today: string): boolean {
  try {
    return window.localStorage.getItem(KEY) === today;
  } catch {
    return true; // Storage blocked: better no pop-up than one on every screen.
  }
}

/**
 * Cheers the first practice of the day. Put it only where someone has reached a natural stop, so
 * it never interrupts a question.
 */
export function StreakCelebration() {
  const hydrated = useHydrated();
  const progress = useProgress();
  const account = useAccount();
  const [closed, setClosed] = useState(false);

  if (!hydrated || closed || !account?.tourDone) return null;
  const today = todayStr();
  if (!progress.activeDays.includes(today) || celebrated(today)) return null;

  return (
    <CelebrationDialog
      today={today}
      summary={streakSummary(progress, today)}
      onClose={() => {
        try {
          window.localStorage.setItem(KEY, today);
        } catch {
          // Nothing to remember it with.
        }
        setClosed(true);
      }}
    />
  );
}

function CelebrationDialog({
  today,
  summary,
  onClose,
}: {
  today: string;
  summary: ReturnType<typeof streakSummary>;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const season = useSeason();
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="streak-title"
      className="pixel-box m-auto w-[min(24rem,calc(100%-2rem))] bg-teal-wash p-6 text-center backdrop:bg-ink/40"
    >
      <div className="flex flex-col items-center gap-3">
        <PixelArtBobbin mood="cheering" outfit={season} size={150} priority />
        <h2 id="streak-title" className="font-pixel text-3xl font-bold text-ink">
          {summary.current} day streak!
        </h2>
        <p className="text-ink">That&apos;s today counted. Anything more is a bonus.</p>
        <StreakWeek today={today} start={summary.weekStart} statusOf={summary.statusOf} />
        <button type="button" className="btn-primary w-full" onClick={onClose}>
          Keep going
        </button>
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={() => {
            onClose();
            router.push("/streak");
          }}
        >
          See my calendar
        </button>
      </div>
    </dialog>
  );
}
