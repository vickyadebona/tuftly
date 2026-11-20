import { REVIEW } from "./config";
import { isDue } from "./scheduler";
import type { Progress } from "./store";
import type { Drill } from "./types";

/** Mix topics instead of blocking them (interleaving): A1 B1 C1 A2 B2 ... */
export function interleave(drills: Drill[]): Drill[] {
  const byTopic = new Map<string, Drill[]>();
  for (const d of drills) byTopic.set(d.topic, [...(byTopic.get(d.topic) ?? []), d]);
  const groups = [...byTopic.values()];
  const out: Drill[] = [];
  for (let i = 0; groups.some((g) => i < g.length); i++) {
    for (const g of groups) if (i < g.length) out.push(g[i]);
  }
  return out;
}

export interface QueueSummary {
  due: Drill[];
  fresh: Drill[];
  nextDue: string | null;
}

/** Drills from finished lessons: due reviews first, plus a few new ones. */
export function summarize(progress: Progress, drills: Drill[], today: string): QueueSummary {
  const eligible = drills.filter((d) => progress.lessonsDone.includes(d.lessonId));
  const due = eligible.filter((d) => {
    const c = progress.cards[d.id];
    return c !== undefined && isDue(c, today);
  });
  const fresh = eligible.filter((d) => !progress.cards[d.id]).slice(0, REVIEW.newDrillsPerSession);
  const upcoming = eligible
    .map((d) => progress.cards[d.id]?.due)
    .filter((d): d is string => d !== undefined && d > today)
    .sort();
  return { due, fresh, nextDue: upcoming[0] ?? null };
}

export function buildQueue(progress: Progress, drills: Drill[], today: string): Drill[] {
  const { due, fresh } = summarize(progress, drills, today);
  return interleave([...due, ...fresh]).slice(0, REVIEW.sessionSize);
}
