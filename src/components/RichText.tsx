/**
 * A line of lesson text with `code` in code formatting (inline, never a block) and **marked
 * phrases** in bold. Wrapped in one span so it stays a single piece inside flex rows.
 */
export function RichText({ text }: { text: string }) {
  return (
    <span>
      {text.split(/(`[^`]+`|\*\*.+?\*\*)/g).map((part, i) => {
        if (i % 2 === 0) return part;
        if (part.startsWith("`")) {
          return (
            <code key={i} className="break-words bg-teal-wash px-0.5 font-mono text-[0.9em]">
              {part.slice(1, -1)}
            </code>
          );
        }
        return (
          <strong key={i} className="font-extrabold">
            <RichText text={part.slice(2, -2)} />
          </strong>
        );
      })}
    </span>
  );
}
