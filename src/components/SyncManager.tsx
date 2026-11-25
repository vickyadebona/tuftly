"use client";

import { useEffect } from "react";
import { adoptAccount, getAccount, subscribeAccount } from "@/lib/account";
import { mergeProgress } from "@/lib/merge";
import { getProgress, replaceProgress, subscribeProgress, type Progress } from "@/lib/store";
import { getSupabase } from "@/lib/supabase/client";
import { startSync } from "@/lib/sync";
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
  const meta = user?.user_metadata;
  // Google sends a full name; Bobbin only needs the first. A name typed at sign-up is kept whole.
  const metaName =
    typeof meta?.full_name === "string"
      ? meta.full_name.split(" ")[0]
      : typeof meta?.name === "string"
        ? meta.name
        : null;

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !userId) return;
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

    return startSync<Remote>({
      load: async () =>
        supabase.from("user_data").select("name, tour_done, progress").eq("user_id", userId).maybeSingle<Remote>(),
      apply: (data) => {
        // Same person on a new device: set up the profile from what is saved online.
        adoptAccount(data?.name || metaName || (email ? email.split("@")[0] : "Friend"), email, data?.tour_done ?? false);
        if (data?.progress) replaceProgress(mergeProgress(getProgress(), data.progress));
      },
      push,
      watch: (onChange) => {
        const offProgress = subscribeProgress(onChange);
        const offAccount = subscribeAccount(onChange);
        return () => {
          offProgress();
          offAccount();
        };
      },
    });
  }, [userId, email, metaName]);

  return null;
}
