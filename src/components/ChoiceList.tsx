/** Answer choices. After reveal: right answer in green, a wrong pick in soft amber (never red). */
export function ChoiceList({
  options,
  picked,
  answerIndex,
  revealed,
  onPick,
}: {
  options: string[];
  picked: number | null;
  answerIndex: number;
  revealed: boolean;
  onPick: (i: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt, i) => {
        let style = "border-line bg-paper hover:bg-cream-deep";
        if (!revealed && picked === i) style = "border-line bg-sky";
        if (revealed && i === answerIndex)
          style = "border-line bg-mint";
        else if (revealed && picked === i) style = "border-line bg-butter/50";
        return (
          <button
            key={opt}
            type="button"
            disabled={revealed}
            onClick={() => onPick(i)}
            className={`border-[3px] px-4 py-3 text-left font-mono text-sm text-ink transition-colors disabled:cursor-default ${style}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
