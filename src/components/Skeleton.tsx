/** Loading placeholders in the same chunky pixel style. Pulse is off for reduced-motion users. */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`border-[3px] border-line/25 bg-cream-deep motion-safe:animate-pulse ${className}`}
    />
  );
}

function Frame({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Quest map: welcome strip, then a unit banner with its lessons in a straight list, and the side panel. */
export function QuestSkeleton() {
  return (
    <Frame label="Loading your quest map" className="flex flex-col gap-8">
      <Skeleton className="h-64 w-full sm:h-32" />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Skeleton className="h-[102px] w-full" />
          <div className="flex flex-col gap-5 pl-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-14 w-14 shrink-0 sm:h-[68px] sm:w-[68px]" />
                <Skeleton className="h-[86px] min-w-0 flex-1" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </Frame>
  );
}

/** Interview screen: session and pace picker while saved progress loads. */
export function InterviewSkeleton() {
  return (
    <Frame label="Loading your interview" className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6">
      <Skeleton className="h-9 w-80 max-w-full" />
      <Skeleton className="h-5 w-56 max-w-full" />
      <div className="grid w-full gap-3 sm:grid-cols-2 sm:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-12 w-40" />
    </Frame>
  );
}

/** Practice and similar single-card screens. */
export function CardSkeleton({ label = "Loading" }: { label?: string }) {
  return (
    <Frame label={label} className="flex flex-col gap-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-12 w-40" />
    </Frame>
  );
}

/** Lesson page: title, step chips, question and choices. */
export function LessonSkeleton() {
  return (
    <Frame label="Loading lesson" className="flex flex-col gap-6">
      <Skeleton className="h-10 w-80 max-w-full" />
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-28 w-full" />
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </Frame>
  );
}
