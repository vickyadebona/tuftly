// Draws Bobbin's sipping pose for each season: the happy bird with the wings at its sides taken
// off, so the app can draw them wrapped round the cup instead of giving Bobbin four.
// Run from the repo root after changing a happy drawing: node scripts/make-sip.mjs
import sharp from "sharp";

const SIZE = 200;
const OUTLINE = [42, 18, 0, 255];

// For each side: the rows where the side wing is drawn, the body's edge just above and below it,
// and how far in from the edge the wing's own lines reach. Measured on each drawing.
const SIDES = {
  winter: [
    // Winter's wings start right under the scarf, so these run from there.
    { side: "left", from: 103, to: 137, x0: 39, x1: 39, inner: 50 },
    { side: "right", from: 102, to: 131, x0: 161, x1: 163, inner: 149 },
  ],
  spring: [
    { side: "left", from: 106, to: 140, x0: 37, x1: 40, inner: 50 },
    { side: "right", from: 106, to: 132, x0: 161, x1: 161, inner: 148 },
  ],
  summer: [
    { side: "left", from: 108, to: 141, x0: 38, x1: 41, inner: 50 },
    { side: "right", from: 108, to: 135, x0: 161, x1: 161, inner: 148 },
  ],
  autumn: [
    { side: "left", from: 108, to: 141, x0: 37, x1: 40, inner: 50 },
    { side: "right", from: 108, to: 133, x0: 160, x1: 161, inner: 147 },
  ],
};

const isBody = (p) => p[3] > 250 && p[0] > 235 && p[1] > 190 && p[2] > 90 && p[2] < 170;
// The scarf is teal: more blue than red. It is never painted over.
const isTeal = (p) => p[3] > 128 && p[2] > p[0] + 20;
const isDark = (p) => p[3] > 128 && p[0] < 140 && p[1] < 110 && p[2] < 100;

for (const [season, sides] of Object.entries(SIDES)) {
  const dir = `public/bobbin/pixel/${season}`;
  const img = Buffer.from(await sharp(`${dir}/happy.webp`).ensureAlpha().raw().toBuffer());
  const px = (x, y) => img.subarray((y * SIZE + x) * 4, (y * SIZE + x) * 4 + 4);

  // The scarf's own outline has teal right beside it, and stays.
  const original = Buffer.from(img);
  const scarfLine = (x, y) =>
    isDark(px(x, y)) &&
    [1, 2, 3, 4].some((d) => isTeal(original.subarray(((y - d) * SIZE + x) * 4, ((y - d) * SIZE + x) * 4 + 4)));

  for (const { side, from, to, x0, x1, inner } of sides) {
    const out = side === "left" ? -1 : 1; // which way is away from the body
    // Run a few rows past the wing so no stubs of its outline are left poking out. Not below on
    // the right, where the tail starts.
    const first = from - 3;
    const last = side === "left" ? to + 3 : to;
    for (let y = first; y <= last; y++) {
      const t = Math.min(1, Math.max(0, (y - from) / (to - from)));
      // A gentle curve between the two known points, stepped in twos like the rest of the art.
      const edge = Math.round((x0 + (x1 - x0) * t + out * 2 * Math.sin(Math.PI * t)) / 2) * 2;
      // The body colour of this row, from just inside the wing's lines.
      let sample = inner;
      while (!isBody(px(sample, y)) && Math.abs(sample - 100) > 1) sample -= out;
      const body = Uint8Array.from(px(sample, y));
      // Nothing beyond the new edge, a four-pixel outline on it, and plain body inside it.
      for (let x = edge + out; x > 0 && x < SIZE && x !== edge + out * 24; x += out) if (!isTeal(px(x, y))) px(x, y).fill(0);
      // The outline runs over the scarf's ends too, so there is no break at the shoulder.
      for (let d = 0; d < 4; d++) px(edge - out * d, y).set(OUTLINE);
      for (let x = edge - out * 4; side === "left" ? x <= inner : x >= inner; x -= out) {
        const p = px(x, y);
        if (!isTeal(p) && !scarfLine(x, y) && (isDark(p) || p[3] < 250 || !isBody(p))) p.set(body);
      }
    }
  }

  await sharp(img, { raw: { width: SIZE, height: SIZE, channels: 4 } }).webp({ lossless: true }).toFile(`${dir}/sip.webp`);
  // The two ends of the winter scarf on their own, for drawing over the tops of the arms.
  if (season === "winter") {
    const scarf = Buffer.alloc(img.length);
    const nearTeal = (x, y) => {
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) if (isTeal(px(x + dx, y + dy))) return true;
      return false;
    };
    for (let y = 80; y <= 126; y++) {
      for (let x = 10; x < SIZE - 10; x++) {
        if (x > 56 && x < 150) continue;
        if (isTeal(px(x, y)) || (isDark(px(x, y)) && nearTeal(x, y))) scarf.set(px(x, y), (y * SIZE + x) * 4);
      }
    }
    await sharp(scarf, { raw: { width: SIZE, height: SIZE, channels: 4 } }).webp({ lossless: true }).toFile(`${dir}/sip-scarf.webp`);
  }
  console.log(season, "done");
}
