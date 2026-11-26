"use client";

import { useEffect, useRef } from "react";
import { PixelIcon } from "./PixelIcon";

/** Check before throwing something away. Escape keeps it. */
export function LeaveDialog({
  onStay,
  onLeave,
  title = "Leave this interview?",
  message = "It ends here and your answers aren't saved. To pause instead, take a tea break.",
  stayLabel = "Keep going",
  leaveLabel = "Leave interview",
  exitIcon = true,
}: {
  onStay: () => void;
  onLeave: () => void;
  title?: string;
  message?: string;
  stayLabel?: string;
  leaveLabel?: string;
  exitIcon?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onStay}
      aria-labelledby="leave-title"
      className="pixel-box m-auto w-[min(26rem,calc(100%-2rem))] p-6 text-center backdrop:bg-ink/40"
    >
      <h2 id="leave-title" className="font-pixel text-2xl font-bold text-ink">
        {title}
      </h2>
      <p className="mt-2 text-ink">{message}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-primary" onClick={onStay}>
          {stayLabel}
        </button>
        <button type="button" className="btn-secondary gap-2" onClick={onLeave}>
          {exitIcon && <PixelIcon name="exit" size={18} color="#4a3326" />}
          {leaveLabel}
        </button>
      </div>
    </dialog>
  );
}
