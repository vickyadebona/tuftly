/**
 * Sharing a gap to improve lessons. Only ever sent when the learner checks the box. The request
 * carries the public key alone, never their sign-in, so a row can't be tied to an account.
 */
export const MAX_GAP = 500;

export interface GapFeedback {
  drill_id: string;
  gap: string;
  points: string[];
}

/** What would be shared, or null when there's nothing to say. */
export function gapFeedback(drillId: string, text: string, points: string[]): GapFeedback | null {
  const gap = text.trim().slice(0, MAX_GAP);
  // Key points are stored without the formatting marks used on screen.
  const picked = points.slice(0, 10).map((p) => p.replace(/`|\*\*/g, "").slice(0, 150));
  return gap || picked.length ? { drill_id: drillId.slice(0, 80), gap, points: picked } : null;
}

/** Send and forget: practice never waits on this, and a failure changes nothing for the learner. */
export function shareGap(url: string, key: string, feedback: GapFeedback): void {
  fetch(`${url}/rest/v1/lesson_feedback`, {
    method: "POST",
    headers: { apikey: key, "content-type": "application/json", prefer: "return=minimal" },
    body: JSON.stringify(feedback),
    keepalive: true,
  }).catch(() => {});
}
