import { PixelIcon } from "./PixelIcon";

export type NodeState = "done" | "current" | "locked";

/** A stop on a quest path: a check once passed, a star where you are, a lock still ahead. */
export function PathNode({ state }: { state: NodeState }) {
  const base = "flex h-14 w-14 shrink-0 items-center justify-center border-[3px] border-line sm:h-[68px] sm:w-[68px]";
  if (state === "done")
    return (
      <span className={`${base} bg-teal`}>
        <PixelIcon name="check" size={32} color="#4a3326" />
      </span>
    );
  if (state === "current")
    return (
      <span className={`${base} bg-butter`}>
        <PixelIcon name="star" size={32} color="#f2b93b" />
      </span>
    );
  return (
    <span className={`${base} bg-paper`}>
      <PixelIcon name="lock" size={28} color="#7a6253" />
    </span>
  );
}
