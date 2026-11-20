"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getSupabase } from "./supabase/client";

/** The signed-in online user, if any. `ready` is false until the first check finishes. */
export function useAuthUser(): { user: User | null; ready: boolean } {
  const supabase = getSupabase();
  const [state, setState] = useState<{ user: User | null; ready: boolean }>({
    user: null,
    ready: supabase === null,
  });

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setState({ user: data.session?.user ?? null, ready: true });
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, ready: true });
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  return state;
}
