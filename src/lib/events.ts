/** Sent when the menu item for the page already on screen is tapped, which doesn't reload it. */
export const NAV_AGAIN = "tuftly:nav-again";

/** Set while leaving the page would lose something. See useLeaveGuard. */
export const leaveGuard: { ask: ((href: string) => void) | null } = { ask: null };
