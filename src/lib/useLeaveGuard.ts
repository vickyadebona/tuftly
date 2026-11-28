import { useEffect } from "react";
import { leaveGuard } from "./events";

/**
 * While `active`, the app's own links call `ask` with where they were headed instead of going there,
 * and the browser checks before a reload or closing the tab.
 */
export function useLeaveGuard(active: boolean, ask: (href: string) => void) {
  useEffect(() => {
    if (!active) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    leaveGuard.ask = ask;
    window.addEventListener("beforeunload", warn);
    return () => {
      leaveGuard.ask = null;
      window.removeEventListener("beforeunload", warn);
    };
  }, [active, ask]);
}
