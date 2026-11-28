"use client";

import { useEffect } from "react";
import { adoptAccount, dropAccount, getAccount, subscribeAccount } from "@/lib/account";
import { claimDevice } from "@/lib/device";
import { mergeProgress } from "@/lib/merge";
import { getPitch, newerPitch, replacePitch, subscribePitch, type PitchData } from "@/lib/pitch";
import { getProgress, replaceProgress, subscribeProgress, type Progress } from "@/lib/store";
import { getSupabase } from "@/lib/supabase/client";
import { startSync } from "@/lib/sync";
import { useAuthUser } from "@/lib/useAuthUser";

interface Remote {
  name: string | null;
  tour_done: boolean;
  progress: Progress | null;
  pitch: PitchData | null;
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
    // The pitch as last saved online. It is only sent when it differs, so a tab left open
    // doesn't overwrite a newer pitch from another device while saving something else.
    let savedPitch = "";

    async function push() {
      const account = getAccount();
      const progress = getProgress();
      const pitch = getPitch();
      const pitchJson = JSON.stringify(pitch);
      // An untouched pitch (never edited here) has nothing to save.
      const sendPitch = pitch.updatedAt > 0 && pitchJson !== savedPitch;
      const snapshot = JSON.stringify({ progress, pitch, name: account?.name, tour: account?.tourDone });
      if (snapshot === lastPushed) return;
      const { error } = await supabase!.from("user_data").upsert({
        user_id: userId,
        name: account?.name ?? null,
        tour_done: account?.tourDone ?? false,
        progress,
        ...(sendPitch ? { pitch } : {}),
        updated_at: new Date().toISOString(),
      });
      if (error) return;
      lastPushed = snapshot;
      if (sendPitch) savedPitch = pitchJson;
    }

    // First, even if loading fails: what another account left on this device is never shown to or
    // merged into this one, their name included.
    if (claimDevice(userId)) dropAccount();

    return startSync<Remote>({
      load: async () =>
        supabase.from("user_data").select("name, tour_done, progress, pitch").eq("user_id", userId).maybeSingle<Remote>(),
      apply: (data) => {
        // Same person on a new device: set up the profile from what is saved online.
        adoptAccount(data?.name || metaName || (email ? email.split("@")[0] : "Friend"), email, data?.tour_done ?? false);
        if (data?.progress) replaceProgress(mergeProgress(getProgress(), data.progress));
        if (data?.pitch) {
          savedPitch = JSON.stringify(data.pitch);
          replacePitch(newerPitch(getPitch(), data.pitch));
        }
      },
      push,
      watch: (onChange) => {
        const offProgress = subscribeProgress(onChange);
        const offAccount = subscribeAccount(onChange);
        const offPitch = subscribePitch(onChange);
        return () => {
          offProgress();
          offAccount();
          offPitch();
        };
      },
    });
  }, [userId, email, metaName]);

  return null;
}
