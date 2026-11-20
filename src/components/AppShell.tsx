"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { restartTour, signOut, useAccount } from "@/lib/account";
import { getSupabase } from "@/lib/supabase/client";
import { useAuthUser } from "@/lib/useAuthUser";
import { STREAK } from "@/lib/config";
import { todayStr } from "@/lib/dates";
import { useHydrated, useProgress } from "@/lib/store";
import { computeStreak } from "@/lib/streak";
import { PixelArtBobbin } from "./PixelArtBobbin";
import { PixelIcon, type PixelIconName } from "./PixelIcon";
import { Skeleton } from "./Skeleton";
import { SyncManager } from "./SyncManager";
import { Tour } from "./Tour";
import { useSeason } from "@/lib/useSeason";

const NAV: { href: string; label: string; icon: PixelIconName; color: string; match: string[]; tour: string }[] = [
  { href: "/home", label: "Quest map", icon: "star", color: "#f2b93b", match: ["/home", "/lessons"], tour: "nav-quest" },
  { href: "/review", label: "Practice", icon: "gem", color: "#9fd5ea", match: ["/review"], tour: "nav-review" },
  { href: "/interview", label: "Interviews", icon: "heart", color: "#ff9e80", match: ["/interview"], tour: "nav-interview" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const account = useAccount();
  const auth = useAuthUser();
  const progress = useProgress();
  const season = useSeason();
  const streak = hydrated
    ? computeStreak(progress.activeDays, todayStr(), STREAK.graceDays, progress.restWeekdays)
    : 0;

  // Nobody set up on this device yet: send them to the welcome screen. Wait for the online
  // sign-in check first, since a signed-in person on a new device gets set up automatically.
  useEffect(() => {
    if (hydrated && auth.ready && !account && !auth.user) router.replace("/login");
  }, [hydrated, auth.ready, auth.user, account, router]);

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SyncManager />
      {hydrated && account && !account.tourDone && <Tour />}
      <header className="flex items-center justify-between gap-4 border-b-[3px] border-line bg-paper px-4 py-3 sm:px-7">
        <Link href="/" className="flex items-center gap-2" aria-label="tuftly landing page">
          <PixelArtBobbin mood="sparkle" outfit={season} size={40} />
          <span className="font-pixel text-3xl font-bold text-ink">
            tuft<span className="text-teal">ly</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {hydrated && account && (
            <details className="relative">
              <summary className="pixel-chip cursor-pointer list-none">
                <span className="font-sans font-bold">{account.name}</span>
              </summary>
              <div className="pixel-box absolute right-0 z-40 mt-2 flex w-44 flex-col gap-1 p-2">
                <button type="button" onClick={restartTour} className="px-3 py-2 text-left font-semibold text-ink hover:bg-cream-deep">
                  Take the tour
                </button>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    getSupabase()?.auth.signOut();
                    router.push("/");
                  }}
                  className="px-3 py-2 text-left font-semibold text-ink hover:bg-cream-deep"
                >
                  Log out
                </button>
              </div>
            </details>
          )}
          {hydrated ? (
            <span data-tour="streak" className="pixel-chip bg-peach" aria-label={`${streak} day streak`}>
              <PixelIcon name="flame" size={18} color="#f08a24" />
              <span className="font-sans font-bold">{streak} day streak</span>
            </span>
          ) : (
            <Skeleton className="h-9 w-36" />
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        <nav
          aria-label="Main"
          className="flex gap-2 border-b-[3px] border-line bg-paper p-3 md:w-60 md:flex-col md:border-b-0 md:border-r-[3px] md:p-4"
        >
          {NAV.map((item) => {
            const active = item.match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                data-tour={item.tour}
                aria-current={active ? "page" : undefined}
                className={`font-pixel flex flex-1 items-center gap-3 border-[3px] px-4 py-3 text-lg font-bold md:flex-none ${
                  active ? "border-line bg-butter text-ink" : "border-transparent text-ink hover:bg-cream-deep"
                }`}
              >
                <PixelIcon name={item.icon} size={22} color={item.color} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="flex min-w-0 flex-1 flex-col px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
