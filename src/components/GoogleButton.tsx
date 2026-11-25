"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/config";

/** Whether the Google provider is switched on in Supabase, so the button never leads nowhere. */
export function useGoogleEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (!supabaseConfigured) return;
    let active = true;
    fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_KEY! } })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (active) setEnabled(s?.external?.google === true);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return enabled;
}

/** Google's "G", in its own colours on white as their branding rules require. */
function GoogleMark() {
  return (
    <span className="flex h-7 w-7 items-center justify-center bg-white" aria-hidden="true">
      <svg viewBox="0 0 48 48" width="18" height="18">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
    </span>
  );
}

/** "Continue with Google", in the app's chunky button style. */
export function GoogleButton() {
  const [failed, setFailed] = useState(false);

  async function signIn() {
    setFailed(false);
    const { error } = await getSupabase()!.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setFailed(true);
  }

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={signIn} className="btn-secondary w-full gap-3">
        <GoogleMark />
        Continue with Google
      </button>
      {failed && (
        <span role="alert" className="text-center text-sm font-semibold text-orange-deep">
          Google sign-in didn&apos;t start. Please try again.
        </span>
      )}
    </div>
  );
}
