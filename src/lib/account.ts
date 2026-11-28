import { useSyncExternalStore } from "react";

/**
 * Local-only account for now (browser localStorage), kept behind these functions so real sign-in
 * (Supabase) can replace the internals later without touching the screens. There is deliberately
 * no password: storing one in the browser would look secure without being secure.
 */
export interface Account {
  name: string;
  /** Collected for syncing later. Not used for anything yet. */
  email: string | null;
  guest: boolean;
  tourDone: boolean;
}

const KEY = "tuftly-account-v1";

let cache: { raw: string | null; value: Account | null } = { raw: null, value: null };
const listeners = new Set<() => void>();

function read(): Account | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cache.raw) return cache.value;
    cache = { raw, value: raw ? (JSON.parse(raw) as Account) : null };
    return cache.value;
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function write(next: Account | null) {
  try {
    if (next) window.localStorage.setItem(KEY, JSON.stringify(next));
    else window.localStorage.removeItem(KEY);
  } catch {
    // Storage blocked (private mode). The account just won't persist this session.
  }
  listeners.forEach((l) => l());
}

/** null until the browser state is readable, or when nobody is signed in. Pair with useHydrated(). */
export function useAccount(): Account | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function getAccount(): Account | null {
  return read();
}

export function subscribeAccount(cb: () => void) {
  return subscribe(cb);
}

/**
 * The tour is for people who are new. Logging out clears the profile (and its tour flag) but not
 * progress, so a returning person would otherwise get the tour again. Two signs this device has
 * already been through it: the tour was finished here before, or there is saved progress.
 */
const TOUR_SEEN_KEY = "tuftly-tour-seen-v1";

/** True when saved progress shows someone has already used the app on this device. */
export function looksReturning(rawProgress: string | null): boolean {
  if (!rawProgress) return false;
  try {
    const p = JSON.parse(rawProgress) as { lessonsDone?: unknown[]; activeDays?: unknown[]; cards?: Record<string, unknown> };
    return (p.lessonsDone?.length ?? 0) > 0 || (p.activeDays?.length ?? 0) > 0 || Object.keys(p.cards ?? {}).length > 0;
  } catch {
    return false;
  }
}

function tourAlreadySeen(): boolean {
  try {
    return !!window.localStorage.getItem(TOUR_SEEN_KEY) || looksReturning(window.localStorage.getItem("tuftly-progress-v1"));
  } catch {
    return false;
  }
}

function markTourSeen() {
  try {
    window.localStorage.setItem(TOUR_SEEN_KEY, "1");
  } catch {
    // Storage blocked: the flag on the profile still works for this session.
  }
}

/** Set up the on-device profile from an online account (first time on a new device). */
export function adoptAccount(name: string, email: string | null, tourDone: boolean) {
  const a = read();
  // Keep a finished tour from either side, including a guest profile this replaces.
  const done = !!a?.tourDone || tourDone || tourAlreadySeen();
  if (a && !a.guest) write({ ...a, tourDone: done });
  else write({ name, email, guest: false, tourDone: done });
}

/** Take the profile off this device without remembering it (it was someone else's). */
export function dropAccount() {
  write(null);
}

export function createAccount(name: string, email: string) {
  write({ name: name.trim(), email: email.trim() || null, guest: false, tourDone: tourAlreadySeen() });
}

export function continueAsGuest() {
  write({ name: "Guest", email: null, guest: true, tourDone: tourAlreadySeen() });
}

/**
 * Logging out keeps a note of who was here, so coming back is one tap instead of typing a name
 * again. It lives only on this device and holds no password (there isn't one to leak). Real
 * sign-in on other devices is the email link.
 */
const LAST_KEY = "tuftly-last-profile-v1";
let lastCache: { raw: string | null; value: Account | null } = { raw: null, value: null };

function readLast(): Account | null {
  try {
    const raw = window.localStorage.getItem(LAST_KEY);
    if (raw === lastCache.raw) return lastCache.value;
    lastCache = { raw, value: raw ? (JSON.parse(raw) as Account) : null };
    return lastCache.value;
  } catch {
    return null;
  }
}

/** The profile that last logged out on this device, if any. Pair with useHydrated(). */
export function useRememberedProfile(): Account | null {
  return useSyncExternalStore(subscribe, readLast, () => null);
}

export function signOut() {
  const a = read();
  if (a) {
    try {
      window.localStorage.setItem(LAST_KEY, JSON.stringify(a));
    } catch {
      // Storage blocked: logging out still works, it just won't be remembered.
    }
  }
  write(null);
}

/** Log back in as the remembered profile. Returns false when there isn't one. */
export function restoreProfile(): boolean {
  const last = readLast();
  if (!last) return false;
  write(last);
  try {
    window.localStorage.removeItem(LAST_KEY);
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
  return true;
}

/** Forget the remembered profile (someone else is using this device). */
export function forgetProfile() {
  try {
    window.localStorage.removeItem(LAST_KEY);
    window.localStorage.removeItem(TOUR_SEEN_KEY);
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

export function completeTour() {
  markTourSeen();
  const a = read();
  if (a) write({ ...a, tourDone: true });
}

export function restartTour() {
  const a = read();
  if (a) write({ ...a, tourDone: false });
}
