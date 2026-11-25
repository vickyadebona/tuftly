"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { restartTour, signOut, useAccount } from "@/lib/account";
import { getSupabase } from "@/lib/supabase/client";
import { useAuthUser } from "@/lib/useAuthUser";
import { STREAK } from "@/lib/config";
import { todayStr } from "@/lib/dates";
import { NAV_AGAIN } from "@/lib/events";
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
  { href: "/pitch", label: "Pitch", icon: "speech", color: "#8f73d0", match: ["/pitch"], tour: "nav-pitch" },
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
      <header className="flex items-center justify-between gap-2 border-b-[3px] border-line bg-paper px-3 py-2.5 sm:gap-4 sm:px-7 sm:py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="tuftly landing page">
          <PixelArtBobbin mood="sparkle" outfit={season} size={36} />
          <span className="font-pixel text-2xl font-bold text-ink sm:text-3xl">
            tuft<span className="text-teal">ly</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {hydrated && account && (
            <details className="relative">
              <summary className="pixel-chip max-w-[7rem] cursor-pointer list-none sm:max-w-none">
                <span className="truncate font-sans font-bold">{account.name}</span>
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
            <span data-tour="streak" className="pixel-chip whitespace-nowrap bg-peach" aria-label={`${streak} day streak`}>
              <PixelIcon name="flame" size={18} color="#f08a24" />
              <span className="font-sans font-bold">
                {streak}
                <span className="hidden sm:inline"> day streak</span>
              </span>
            </span>
          ) : (
            <Skeleton className="h-9 w-16 sm:w-36" />
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t-[3px] border-line bg-paper pb-[env(safe-area-inset-bottom)] md:static md:flex md:w-60 md:flex-col md:gap-2 md:border-r-[3px] md:border-t-0 md:p-4 md:pb-4"
        >
          {NAV.map((item) => {
            const active = item.match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                data-tour={item.tour}
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  if (pathname === item.href) window.dispatchEvent(new Event(NAV_AGAIN));
                }}
                className={`font-pixel flex flex-col items-center justify-center gap-1 border-[3px] px-0.5 py-2.5 text-xs font-bold min-[400px]:px-2 min-[400px]:text-sm md:flex-row md:justify-start md:gap-3 md:px-4 md:py-3 md:text-lg ${
                  active ? "border-line bg-butter text-ink" : "border-transparent text-ink hover:bg-cream-deep"
                }`}
              >
                <PixelIcon name={item.icon} size={22} color={item.color} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="flex min-w-0 flex-1 flex-col px-4 pb-28 pt-5 sm:px-8 sm:pt-8 md:pb-8">{children}</main>
      </div>
    </div>
  );
}
