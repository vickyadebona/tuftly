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
  // display:block removes the inline baseline gap that made icons sit off-center beside text.
  const style: CSSProperties = { width: size, height: (size * h) / w, shapeRendering: "crispEdges", display: "block", flexShrink: 0 };
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
  exit: ["xxxxxx....", "x....x....", "x....x.x..", "x......xx.", "x..xxxxxxx", "x..xxxxxxx", "x......xx.", "x....x.x..", "x....x....", "xxxxxx...."],
  arrow: ["....x....", "....xx...", "xxxxxxx..", "xxxxxxxx.", "xxxxxxx..", "....xx...", "....x...."],
} as const;

export type PixelIconName = keyof typeof ICONS;

/** Every icon name, for galleries and docs. */
export const PIXEL_ICON_NAMES = Object.keys(ICONS) as PixelIconName[];

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

const CLOUD = [
  "......xxxx........",
  "....xxxxxxxx......",
  "...xxxxxxxxxxx.xx.",
  ".xxxxxxxxxxxxxxxxx",
  "xxxxxxxxxxxxxxxxxx",
  "xxxxxxxxxxxxxxxxxx",
  ".xxxxxxxxxxxxxxxx.",
];

/** A pixelated cloud. */
export function PixelCloud({ size = 120, color = "#ffffff" }: { size?: number; color?: string }) {
  return <Sprite rows={CLOUD} palette={{ x: color }} size={size} />;
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

export type TeaId = "matcha" | "bubble" | "breakfast" | "chai";

/**
 * One drawing per tea. `L` marks liquid you can see through the glass: it drops as the cup is
 * sipped. `s` is steam, which stops once a cup is finished.
 */
const TEAS: Record<TeaId, { rows: string[]; palette: Palette }> = {
  matcha: {
    rows: [
      "....s....s......",
      ".....s....s.....",
      "....s....s......",
      "................",
      ".oooooooooooooo.",
      ".oggfggggfggfgo.",
      ".owggggggggggwo.",
      ".owwwwwwwwwwwwo.",
      "..owwwttttwwwo..",
      "..owwwwwwwwwwo..",
      "...oowwwwwwoo...",
      ".....oooooo.....",
    ],
    palette: { o: "#5b3a29", w: "#e9d9bd", g: "#8dbb4a", f: "#c9e08f", t: "#a9784f", s: "#cdbfaf" },
  },
  bubble: {
    rows: [
      ".......pp.......",
      ".......pp.......",
      ".......pp.......",
      ".ooooooppooooo..",
      ".ooooooooooooo..",
      "..oGGGGppGGGo...",
      "..oLLLLppLLLo...",
      "..oLLLLppLLLo...",
      "..oLLLLppLLLo...",
      "...oLLLppLLo....",
      "...obLLbLbLo....",
      "...oLbbLbbLo....",
      "...obbLbbLbo....",
      "....ooooooo.....",
    ],
    palette: { o: "#5b3a29", p: "#ff9e80", L: "#d9a877", G: "#e1f3f8", b: "#3d2418" },
  },
  breakfast: {
    rows: [
      "...s...s........",
      "....s...s.......",
      "...s...s........",
      ".oooooooooo.....",
      ".okkkkkkkkoooo..",
      ".owwwwdwwwo..o..",
      ".owwwwdwwwo..o..",
      ".owwwryrwwoooo..",
      ".owwwyyywwo.....",
      "..owwwwwwo......",
      "...oooooo.......",
      "oooooooooooooo..",
      ".oooooooooooo...",
    ],
    palette: { o: "#5b3a29", w: "#fffdf4", k: "#a4471f", d: "#8a7766", r: "#e0645a", y: "#f2b93b", s: "#cdbfaf" },
  },
  chai: {
    rows: [
      "....s....s......",
      ".....s....s.....",
      "....s....s......",
      ".oooooooooooo...",
      ".oGGGGGGGGGGooo.",
      ".oLLLLLLLLLLo.o.",
      ".oLmLLLLLmLLo.o.",
      ".oLLLLmLLLLLo.o.",
      ".oLLmLLLLLmLooo.",
      ".oLLLLLLmLLLo...",
      ".oLmLLLLLLLLo...",
      "..oooooooooo....",
    ],
    palette: { o: "#5b3a29", L: "#c98a52", G: "#e1f3f8", m: "#f0d4a8", s: "#cdbfaf" },
  },
};

/** A cup of tea. `level` is how much is left, from 1 (full) to 0 (finished). */
export function TeaCup({
  tea,
  level = 1,
  size = 72,
  steam = true,
  compact = false,
}: {
  tea: TeaId;
  level?: number;
  size?: number;
  steam?: boolean;
  /** Just the cup, with no steam or blank rows above it, for sitting beside text. */
  compact?: boolean;
}) {
  const { rows, palette } = TEAS[tea];
  const liquid = rows.map((r, y) => (r.includes("L") ? y : -1)).filter((y) => y >= 0);
  const emptyRows = new Set(liquid.slice(0, Math.round(liquid.length * (1 - level))));
  const shown = rows.map((r, y) => {
    let row = emptyRows.has(y) ? r.replace(/[Lm]/g, "G") : r;
    if (level <= 0 || !steam || compact) row = row.replace(/s/g, ".");
    if (level <= 0) row = row.replace(/[gfk]/g, "w");
    return row;
  });
  const drawn = compact ? shown.filter((row) => /[^.]/.test(row)) : shown;
  return <Sprite size={size} rows={drawn} palette={{ G: "#e1f3f8", ...palette }} />;
}

type Point = [number, number];

function inside([px, py]: Point, shape: Point[]): boolean {
  let hit = false;
  for (let i = 0, j = shape.length - 1; i < shape.length; j = i++) {
    const [ax, ay] = shape[i];
    const [bx, by] = shape[j];
    if (ay > py !== by > py && px < ((bx - ax) * (py - ay)) / (by - ay) + ax) hit = !hit;
  }
  return hit;
}

/**
 * The wing from Bobbin's thinking pose, traced off that drawing. Points are measured from where
 * the hand meets what it holds: across as a share of the wing's length, down in drawing pixels.
 */
const WING_TOP: Point[] = [[-0.67, 4.5], [-0.06, -9.5]];
/** The two feathered tips of the hand, then the long curve underneath. */
const WING_EDGE: Point[] = [
  [-0.06, -9.5], [0, -6], [0, -0.5], [-0.12, 4], [0, 5], [0, 9.5], [-0.13, 17], [-0.34, 24], [-0.56, 27], [-0.84, 27.5], [-1, 25],
];

/**
 * Bobbin's wings folded round a cup, in the same shape and thin line as the thinking pose: no
 * line at the back, so each one is part of the body. All positions are screen pixels inside a
 * `size` square.
 */
export function HoldingWings({
  size,
  block,
  shoulders,
  cup,
}: {
  size: number;
  block: number;
  /** Where the body's sides are, which is as far back as a wing can start. */
  shoulders: { left: number; right: number };
  /** The cup's sides, and the height the wings take hold. */
  cup: { left: number; right: number; y: number };
}) {
  // The thinking pose is drawn 200 pixels square.
  const scale = size / 200;
  const wing = (side: number, hand: number, toward: 1 | -1) => {
    const length = Math.abs(hand - side) - block;
    const place = ([across, down]: Point): Point => [hand + toward * across * length, cup.y + down * scale];
    const top = WING_TOP.map(place);
    const edge = WING_EDGE.map(place);
    return { lines: [top, edge], fill: [...edge, top[0]] };
  };
  const wings = [wing(shoulders.left, cup.left, 1), wing(shoulders.right, cup.right, -1)];
  const cells = Math.ceil(size / block);
  const colors = new Map<string, string>();
  for (const { lines, fill } of wings) {
    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < cells; x++) {
        if (inside([(x + 0.5) * block, (y + 0.5) * block], fill)) colors.set(`${x},${y}`, "#fddb76");
      }
    }
    for (const line of lines) {
      line.slice(1).forEach(([bx, by], i) => {
        const [ax, ay] = line[i];
        const steps = Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay)) / block) || 1;
        for (let n = 0; n <= steps; n++) {
          const x = Math.floor((ax + ((bx - ax) * n) / steps) / block);
          const y = Math.floor((ay + ((by - ay) * n) / steps) / block);
          colors.set(`${x},${y}`, "#2a1200");
        }
      });
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges" aria-hidden="true">
      {[...colors].map(([cell, color]) => {
        const [x, y] = cell.split(",").map(Number);
        return <rect key={cell} x={x * block} y={y * block} width={block + 0.2} height={block + 0.2} fill={color} />;
      })}
    </svg>
  );
}

/** How many rows tall each tea drawing is, for standing a cup on the ground. */
export const teaRows = (tea: TeaId) => TEAS[tea].rows.length;
