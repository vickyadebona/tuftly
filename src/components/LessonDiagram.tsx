import type { Diagram } from "@/lib/types";

/** A name that points at something: the yellow boxes. */
function Name({ children }: { children: string }) {
  return (
    <span className="font-pixel inline-flex w-14 shrink-0 items-center justify-center border-[3px] border-line bg-butter py-1 text-sm font-bold text-ink sm:w-16">
      {children}
    </span>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 36 12" preserveAspectRatio="xMaxYMid meet" className="h-3 w-6 shrink-0 text-line sm:w-9">
      <path d="M0 6H28" stroke="currentColor" strokeWidth="3" />
      <path d="M36 6 26 0v12z" fill="currentColor" />
    </svg>
  );
}

const box = "border-[3px] border-line bg-paper px-2 py-2 font-mono text-xs text-ink sm:text-[13px]";

function OneObject({ diagram }: { diagram: Extract<Diagram, { kind: "one-object" }> }) {
  return (
    <div className="flex h-32 items-center justify-center">
      <div className="flex h-full flex-col items-center justify-around">
        {diagram.names.map((n) => (
          <Name key={n}>{n}</Name>
        ))}
      </div>
      {/* The two names sit a quarter and three quarters of the way down; both lines meet the one box. */}
      <svg viewBox="0 0 80 128" className="h-32 w-20 shrink-0 text-line">
        <path d="M2 32 70 58M2 96 70 70" stroke="currentColor" strokeWidth="3" />
        <path d="m79 61-13-9-4 11zM79 67l-17-2 4 11z" fill="currentColor" />
      </svg>
      <div className={`${box} min-w-20`}>
        {diagram.rows.map((r) => (
          <p key={r}>{r}</p>
        ))}
      </div>
    </div>
  );
}

function TwoObjects({ diagram }: { diagram: Extract<Diagram, { kind: "two-objects" }> }) {
  const { shared } = diagram;
  const [top, bottom] = diagram.objects;
  const row = (o: typeof top) => (
    <div className="flex items-center gap-1">
      <Name>{o.name}</Name>
      <Arrow />
      {/* The line joining shared values is placed from these row heights: keep the tags row last. */}
      <div className={`${box} min-w-0 flex-1`}>
        <p className="h-6 leading-6">{o.field}</p>
        <div className="flex h-8 items-center gap-1.5">
          <span>tags:</span>
          <span className={`whitespace-nowrap border-[3px] px-1 ${shared ? "border-orange bg-peach" : "border-line bg-mint"}`}>
            {o.tags}
          </span>
          {shared && <span className="-mr-[calc(1.25rem+3px)] flex-1 border-t-[3px] border-orange" />}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`relative ${shared ? "pr-6" : ""}`}>
      {row(top)}
      <p className="font-pixel flex h-10 items-center justify-end pr-1 text-sm font-bold text-ink">
        {shared ? "same array" : ""}
      </p>
      {row(bottom)}
      {shared && (
        <span className="absolute bottom-[calc(1.5rem+3px)] right-3 top-[calc(3rem+3px)] w-[3px] translate-x-1/2 bg-orange" />
      )}
    </div>
  );
}

/** A boxes-and-arrows picture of what the names in a code sample point to. */
export function LessonDiagram({ diagram }: { diagram: Diagram }) {
  return (
    <figure className="flex flex-col gap-2">
      <div className="pixel-box p-3" aria-hidden="true">
        {diagram.kind === "one-object" ? <OneObject diagram={diagram} /> : <TwoObjects diagram={diagram} />}
      </div>
      <figcaption className="text-sm text-ink-soft">
        {diagram.caption}
        <span className="sr-only"> {diagram.description}</span>
      </figcaption>
    </figure>
  );
}

/** Text where **marked phrases** are shown bold, for the one idea to take away. */
export function Emphasis({ text }: { text: string }) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 ? (
      <strong key={i} className="font-extrabold">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}
