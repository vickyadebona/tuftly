/**
 * The order of events when syncing starts. Load the saved copy first and only then push, so a
 * device that has nothing yet can never overwrite saved progress because a load failed.
 */
export interface SyncSteps<T> {
  /** Read the saved copy. `null` data means nothing is saved yet; `error` means we don't know. */
  load: () => Promise<{ data: T | null; error: unknown }>;
  /** Merge the saved copy into this device. */
  apply: (data: T | null) => void;
  push: () => Promise<void>;
  /** Call `onChange` whenever this device's data changes. Returns an unsubscribe. */
  watch: (onChange: () => void) => () => void;
}

export function startSync<T>(steps: SyncSteps<T>, { retryMs = 10_000, debounceMs = 1500 } = {}): () => void {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let unwatch: (() => void) | undefined;

  function schedulePush() {
    clearTimeout(timer);
    timer = setTimeout(steps.push, debounceMs);
  }

  async function start() {
    // A thrown request (offline) is treated like a returned error.
    const { data, error } = await steps.load().catch((e: unknown) => ({ data: null, error: e ?? true }));
    if (stopped) return;
    if (error) {
      timer = setTimeout(start, retryMs);
      return;
    }
    steps.apply(data);
    unwatch = steps.watch(schedulePush);
    await steps.push();
  }

  start();
  return () => {
    stopped = true;
    clearTimeout(timer);
    unwatch?.();
  };
}
