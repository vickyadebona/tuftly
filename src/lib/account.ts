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

/** Set up the on-device profile from an online account (first time on a new device). */
export function adoptAccount(name: string, email: string | null, tourDone: boolean) {
  const a = read();
  if (a && !a.guest) write({ ...a, tourDone: a.tourDone || tourDone });
  else write({ name, email, guest: false, tourDone });
}

export function createAccount(name: string, email: string) {
  write({ name: name.trim(), email: email.trim() || null, guest: false, tourDone: false });
}

export function continueAsGuest() {
  write({ name: "Guest", email: null, guest: true, tourDone: false });
}

export function signOut() {
  write(null);
}

export function completeTour() {
  const a = read();
  if (a) write({ ...a, tourDone: true });
}

export function restartTour() {
  const a = read();
  if (a) write({ ...a, tourDone: false });
}
