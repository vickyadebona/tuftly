import { claim, disown, release } from "./owner";
import { forgetPitch } from "./pitch";
import { resetProgress } from "./store";

/** Everything personal on this device that isn't already kept apart by account. */
function wipe() {
  resetProgress();
  forgetPitch();
}

// Storage can be blocked (private mode). Then nothing is kept here to leak.
function guard<T>(run: () => T, otherwise: T): T {
  try {
    return run();
  } catch {
    return otherwise;
  }
}

/** On sign-in. True when another account's work was cleared from this device. */
export const claimDevice = (userId: string) => guard(() => claim(window.localStorage, userId, wipe), false);

/** Before creating a new profile here. */
export const releaseDevice = () => guard(() => release(window.localStorage, wipe), undefined);

/** Someone else is taking over the device: clear it whoever it belonged to. */
export function clearDevice() {
  wipe();
  guard(() => disown(window.localStorage), undefined);
}
