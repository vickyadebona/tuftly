export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto border-[3px] border-line bg-teal-wash/60 p-4 font-mono text-sm leading-6 text-ink">
      <code>{code}</code>
    </pre>
  );
}
