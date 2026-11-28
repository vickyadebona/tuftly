/**
 * Whose progress is on this device. Without this, logging out and signing in as someone else would
 * merge the first person's progress into the second account.
 */
export type Keys = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const OWNER = "tuftly-progress-owner-v1";
/** Set by the pitch long before progress had an owner, so it's the best clue on older devices. */
const PITCH_OWNER = "tuftly-pitch-owner-v1";

const ownerOf = (keys: Keys) => keys.getItem(OWNER) ?? keys.getItem(PITCH_OWNER);

/** Forget who the device belonged to. */
export function disown(keys: Keys) {
  keys.removeItem(OWNER);
  keys.removeItem(PITCH_OWNER);
}

/** On sign-in. Wipes first if what's here belongs to a different account, and says whether it did. */
export function claim(keys: Keys, userId: string, wipe: () => void): boolean {
  const owner = ownerOf(keys);
  const someoneElses = owner !== null && owner !== userId;
  if (someoneElses) wipe();
  keys.setItem(OWNER, userId);
  return someoneElses;
}

/**
 * On starting a new profile. What a signed-in person left here is theirs (and saved to their
 * account), so the new one starts clean. Work done without ever signing in stays.
 */
export function release(keys: Keys, wipe: () => void) {
  if (ownerOf(keys) === null) return;
  wipe();
  disown(keys);
}
