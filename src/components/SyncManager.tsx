"use client";

import { useEffect } from "react";
import { adoptAccount, getAccount, subscribeAccount } from "@/lib/account";
import { mergeProgress } from "@/lib/merge";
import { getProgress, replaceProgress, subscribeProgress, type Progress } from "@/lib/store";
import { getSupabase } from "@/lib/supabase/client";
import { useAuthUser } from "@/lib/useAuthUser";

interface Remote {
  name: string | null;
  tour_done: boolean;
  progress: Progress | null;
}

/**
 * Keeps progress saved online while signed in. Local first: the app always reads and writes
 * this device, and this quietly merges with the saved copy and pushes changes a moment later.
 * Renders nothing.
 */
export function SyncManager() {
  const { user } = useAuthUser();
  const userId = user?.id;
  const email = user?.email ?? null;
  const metaName = typeof user?.user_metadata?.name === "string" ? (user.user_metadata.name as string) : null;

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !userId) return;
    let cancelled = false;
    let timer: number | undefined;
    let lastPushed = "";

    async function push() {
      const account = getAccount();
      const progress = getProgress();
      const snapshot = JSON.stringify({ progress, name: account?.name, tour: account?.tourDone });
      if (snapshot === lastPushed) return;
      const { error } = await supabase!.from("user_data").upsert({
        user_id: userId,
        name: account?.name ?? null,
        tour_done: account?.tourDone ?? false,
        progress,
        updated_at: new Date().toISOString(),
      });
      if (!error) lastPushed = snapshot;
    }

    function schedulePush() {
      window.clearTimeout(timer);
      timer = window.setTimeout(push, 1500);
    }

    async function start() {
      const { data } = await supabase!
        .from("user_data")
        .select("name, tour_done, progress")
        .eq("user_id", userId!)
        .maybeSingle<Remote>();
      if (cancelled) return;
      // Same person on a new device: set up the profile from what is saved online.
      adoptAccount(data?.name || metaName || (email ? email.split("@")[0] : "Friend"), email, data?.tour_done ?? false);
      if (data?.progress) replaceProgress(mergeProgress(getProgress(), data.progress));
      await push();
    }

    start();
    const offProgress = subscribeProgress(schedulePush);
    const offAccount = subscribeAccount(schedulePush);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      offProgress();
      offAccount();
    };
  }, [userId, email, metaName]);

  return null;
}
