/** Pixel art for the landing page's floating island, built as SVG paths, one per color. */
import type { Season } from "./season.ts";

export const SCENE_W = 84;
export const SCENE_H = 50;
/** The row Bobbin stands on. */
export const FEET = 34;

const INK = "#4a3326";
const PAPER = "#fffdf4";
const DIRT = "#c99160";
const DIRT_DARK = "#a97248";
const DIRT_LIGHT = "#dcab7c";

export const SKY: Record<Season, string> = { autumn: "#fbead2", winter: "#dcebfa", spring: "#d9f3f7", summer: "#bfeaf7" };
const GRASS: Record<Season, { base: string; dark: string; light: string }> = {
  autumn: { base: "#c9c25a", dark: "#a39a3c", light: "#e4dd86" },
  winter: { base: "#f4faff", dark: "#c3d9ee", light: "#ffffff" },
  spring: { base: "#6fdc96", dark: "#45bd76", light: "#aef0b8" },
  summer: { base: "#4fce78", dark: "#2fa75c", light: "#8fe89a" },
};

export interface Layer {
  color: string;
  d: string;
}

/** The same "random" numbers every time, so the server and the browser draw the same island. */
function seeded(seed: number) {
  let s = seed;
  return (n: number) => {
    s = (s * 48271) % 2147483647;
    return s % n;
  };
}

function canvas() {
  const layers: Layer[] = [];
  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    const d = `M${x} ${y}h${w}v${h}h${-w}z`;
    const last = layers[layers.length - 1];
    if (last?.color === color) last.d += d;
    else layers.push({ color, d });
  };
  /** Filled pixels with a one-pixel ink outline around the whole shape. */
  const shape = (pixels: Map<string, string>) => {
    const edge = new Set<string>();
    for (const key of pixels.keys()) {
      const [x, y] = key.split(",").map(Number);
      for (const next of [`${x + 1},${y}`, `${x - 1},${y}`, `${x},${y + 1}`, `${x},${y - 1}`]) {
        if (!pixels.has(next)) edge.add(next);
      }
    }
    for (const key of edge) {
      const [x, y] = key.split(",").map(Number);
      rect(x, y, 1, 1, INK);
    }
    const colors = new Set(pixels.values());
    for (const color of colors) {
      for (const [key, c] of pixels) {
        if (c !== color) continue;
        const [x, y] = key.split(",").map(Number);
        rect(x, y, 1, 1, color);
      }
    }
  };
  /** A little drawing from rows of text, where "X" is a pixel. */
  const stamp = (x: number, y: number, rows: string[], color: string) =>
    rows.forEach((row, j) => [...row].forEach((ch, i) => ch === "X" && rect(x + i, y + j, 1, 1, color)));
  return { layers, rect, shape, stamp };
}

type Canvas = ReturnType<typeof canvas>;

function island({ shape }: Canvas, season: Season) {
  const grass = GRASS[season];
  const random = seeded(11);
  const pixels = new Map<string, string>();
  const top = FEET - 1;
  const [from, to, depth] = [14, 70, 9];
  for (let x = from; x < to; x++) {
    const off = Math.abs(x + 0.5 - (from + to) / 2) / ((to - from) / 2);
    const below = Math.max(3, Math.floor(depth * (1 - off ** 1.7)) + [-1, 0, 0, 1][random(4)]);
    const drip = [0, 0, 1, 1, 2][random(5)];
    pixels.set(`${x},${top}`, grass.light);
    for (let y = 1; y < 4; y++) pixels.set(`${x},${top + y}`, grass.base);
    for (let y = 4; y < 5 + drip; y++) pixels.set(`${x},${top + y}`, grass.dark);
    for (let y = 5 + drip; y < 5 + below; y++) pixels.set(`${x},${top + y}`, (y - 5) / depth > 0.6 ? DIRT_DARK : DIRT);
  }
  // Little stones in the earth.
  for (let i = 0; i < 40; i++) {
    const x = from + 4 + random(to - from - 10);
    const y = top + 7 + random(6);
    const spot = [`${x},${y}`, `${x + 1},${y}`, `${x + 2},${y}`, `${x + 1},${y + 1}`];
    if (spot.every((key) => pixels.get(key) === DIRT)) spot.forEach((key) => pixels.set(key, DIRT_LIGHT));
  }
  shape(pixels);
}

const SUN = [
  "....XX....",
  "..........",
  "...XXXX...",
  "..XXXXXX..",
  "X.XXXXXX.X",
  "X.XXXXXX.X",
  "..XXXXXX..",
  "...XXXX...",
  "..........",
  "....XX....",
];
const PUMPKIN = ["..XXXXX..", ".XXXXXXX.", "XXXXXXXXX", "XXXXXXXXX", "XXXXXXXXX", ".XXXXXXX.", "..XXXXX.."];

function cloud({ rect }: Canvas, x: number, y: number, w: number) {
  const quarter = Math.floor(w / 4);
  rect(x + 2, y + 3, w - 4, 3, PAPER);
  rect(x, y + 5, w, 3, PAPER);
  rect(x + quarter, y + 1, Math.floor(w / 3), 3, PAPER);
  rect(x + quarter * 2, y + 2, quarter, 2, PAPER);
}

function tuft({ rect }: Canvas, x: number, y: number, color: string) {
  rect(x, y - 2, 1, 2, color);
  rect(x + 2, y - 3, 1, 3, color);
  rect(x + 4, y - 2, 1, 2, color);
}

function flower({ rect }: Canvas, x: number, y: number, petals: string, stem: string) {
  rect(x, y - 2, 1, 2, stem);
  rect(x - 1, y - 4, 3, 1, petals);
  rect(x, y - 5, 1, 3, petals);
  rect(x, y - 4, 1, 1, "#ffd966");
}

/**
 * Bobbin's own maple leaf, cut from the autumn outfit, so the fallen ones match it. `width` and
 * `height` keep it the same size as the one Bobbin wears (33 by 32 of the sprite's 200 pixels,
 * with Bobbin 36 scene pixels wide). `flip` mirrors some for variety.
 */
export const LEAF = { src: "/bobbin/pixel/autumn/leaf.png", width: 5.94, height: 5.76 };
export const LEAVES: { x: number; y: number; flip?: boolean }[] = [
  // All landed on the island
  { x: 15, y: FEET - 3 },
  { x: 23, y: FEET - 2, flip: true },
  { x: 54, y: FEET - 2, flip: true },
  { x: 62, y: FEET - 3 },
];

/**
 * Everything behind Bobbin for one season, apart from autumn's leaves. `sky` stays put, while
 * `land` (the island and what's on it) floats with Bobbin.
 */
export function scene(season: Season): { sky: Layer[]; land: Layer[] } {
  const sky = canvas();
  const c = canvas();
  const { rect, shape } = c;
  const grass = GRASS[season];
  const ground = FEET - 1;
  cloud(sky, 2, 14, 14);
  cloud(sky, 68, 24, 14);

  if (season === "summer") {
    sky.stamp(5, 0, SUN, "#ffd966");
  }
  if (season === "winter") {
    const random = seeded(7);
    for (let i = 0; i < 18; i++) {
      const [x, y] = [3 + random(78), 3 + random(26)];
      sky.rect(x, y - 1, 1, 3, PAPER);
      sky.rect(x - 1, y, 3, 1, PAPER);
    }
  }
  if (season === "spring") {
    const random = seeded(5);
    for (let i = 0; i < 18; i++) sky.rect(3 + random(78), 3 + random(26), 2, 1, "#ffb3c6");
  }
  island(c, season);

  if (season === "autumn") {
    tuft(c, 19, ground, grass.dark);
    rect(62, ground - 10, 2, 3, "#4a7a3a");
    const pumpkin = new Map<string, string>();
    PUMPKIN.forEach((row, j) =>
      [...row].forEach((ch, i) => ch === "X" && pumpkin.set(`${58 + i},${ground - 8 + j}`, i === 2 || i === 6 ? "#d96f14" : "#f28c28")),
    );
    shape(pumpkin);
  }
  if (season === "winter") {
    // A snowy pine.
    rect(20, ground - 3, 2, 3, DIRT_DARK);
    [10, 8, 5].forEach((w, i) => {
      const y = ground - 3 - 4 * (i + 1);
      const x = 21 - Math.floor(w / 2);
      rect(x, y + 2, w, 2, "#3f8f72");
      rect(x + 1, y + 1, w - 2, 1, PAPER);
      rect(20, y, 2, 1, PAPER);
    });
    rect(58, ground - 3, 6, 3, PAPER);
    rect(59, ground - 4, 4, 1, PAPER);
  }
  if (season === "spring") {
    tuft(c, 18, ground, grass.dark);
    for (const [x, color] of [[23, "#ff8fa3"], [27, PAPER], [58, "#ff8fa3"], [63, "#c9a6ff"], [67, PAPER]] as const) {
      flower(c, x, ground, color, grass.dark);
    }
  }
  if (season === "summer") {
    tuft(c, 18, ground, grass.dark);
    tuft(c, 63, ground, grass.dark);
    for (const [x, color] of [[24, "#ffd966"], [59, "#ff9e80"], [67, "#ffd966"]] as const) {
      flower(c, x, ground, color, grass.dark);
    }
  }

  // Bobbin's shadow.
  rect(31, FEET - 1, 22, 1, grass.dark);
  return { sky: sky.layers, land: c.layers };
}
