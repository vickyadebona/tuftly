import type { CSSProperties } from "react";

/** Tiny pixel sprites drawn as SVG rects, so they stay crisp at any size and take any color. */
type Palette = Record<string, string>;

function Sprite({
  rows,
  palette,
  size,
  label,
}: {
  rows: string[];
  palette: Palette;
  size: number;
  label?: string;
}) {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const rects: React.ReactNode[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === "." || !palette[ch]) {
        x++;
        continue;
      }
      let end = x;
      while (end < row.length && row[end] === ch) end++;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={end - x} height={1} fill={palette[ch]} />);
      x = end;
    }
  });
  const style: CSSProperties = { width: size, height: (size * h) / w, shapeRendering: "crispEdges" };
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {rects}
    </svg>
  );
}

const ICONS = {
  star: ["....x....", "....x....", "...xxx...", "xxxxxxxxx", ".xxxxxxx.", "..xxxxx..", "..xxxxx..", ".xxx.xxx.", ".xx...xx."],
  check: ["......xx", ".....xx.", "xx..xx..", ".xxxx...", "..xx...."],
  lock: ["..xxxx..", ".xx..xx.", ".x....x.", "xxxxxxxx", "xxxxxxxx", "xxx..xxx", "xxx..xxx", "xxxxxxxx"],
  flame: ["...x....", "...xx...", "..xxx.x.", ".xxxxxxx", "xxxxxxxx", "xxxxxxxx", "xxxxxxxx", ".xxxxxx.", "..xxxx.."],
  heart: [".xx...xx.", "xxxx.xxxx", "xxxxxxxxx", "xxxxxxxxx", ".xxxxxxx.", "..xxxxx..", "...xxx...", "....x...."],
  gem: ["..xxxxx..", ".xxxxxxx.", "xxxxxxxxx", ".xxxxxxx.", "..xxxxx..", "...xxx...", "....x...."],
  coin: ["..xxxx..", ".xxxxxx.", "xxx..xxx", "xx....xx", "xx....xx", "xxx..xxx", ".xxxxxx.", "..xxxx.."],
  speech: [".xxxxxx.", "xxxxxxxx", "xxxxxxxx", "xxxxxxxx", "xxxxxxxx", "xxxxxxxx", ".xxxxxx.", "..xxx...", "..xx....", "..x....."],
  arrow: ["....x....", "....xx...", "xxxxxxx..", "xxxxxxxx.", "xxxxxxx..", "....xx...", "....x...."],
} as const;

export type PixelIconName = keyof typeof ICONS;

export function PixelIcon({
  name,
  size = 24,
  color = "#4a3326",
  label,
}: {
  name: PixelIconName;
  size?: number;
  color?: string;
  label?: string;
}) {
  return <Sprite rows={[...ICONS[name]]} palette={{ x: color }} size={size} label={label} />;
}

/** The little teacup for tea breaks. */
export function Teacup({ size = 72 }: { size?: number }) {
  return (
    <Sprite
      size={size}
      rows={[
        "...s...s....",
        "....s...s...",
        ".ooooooooo..",
        ".okkkkkkkooo",
        ".owwwwwwwo.o",
        ".owwttttwooo",
        ".owwwwwwwo..",
        "..owwwwwo...",
        "..ooooooo...",
        ".ooooooooooo",
      ]}
      palette={{ o: "#5b3a29", w: "#fffdf4", t: "#4fb3a9", k: "#d9954f", s: "#cdbfaf" }}
    />
  );
}
