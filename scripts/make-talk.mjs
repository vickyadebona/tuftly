// Draws Bobbin mid-sentence for each season from art we already have: the "sparkle" bird with its
// closed beak swapped for the open one from "cheering".
// Run from the repo root after changing either drawing: node scripts/make-talk.mjs
import sharp from "sharp";

const SIZE = 200;
const SEASONS = ["winter", "spring", "summer", "autumn"];
// Where the beak is. The eyes and cheeks fall outside it.
const BOX = { x0: 84, x1: 112, y0: 78, y1: 112 };

const load = async (path) => (await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true })).data;
const px = (img, x, y) => img.subarray((y * SIZE + x) * 4, (y * SIZE + x) * 4 + 4);
// Orange, tongue and outline: everything darker or warmer than the yellow face.
const isBeak = (p) => p[3] > 128 && p[1] < 185 && p[2] < 110;

/** The biggest connected group of beak pixels lying wholly inside the box. */
function beak(img) {
  const seen = new Set();
  let best = null;
  for (let y = BOX.y0; y <= BOX.y1; y++) {
    for (let x = BOX.x0; x <= BOX.x1; x++) {
      if (seen.has(y * SIZE + x) || !isBeak(px(img, x, y))) continue;
      const points = [];
      const stack = [[x, y]];
      let inside = true;
      seen.add(y * SIZE + x);
      while (stack.length) {
        const [cx, cy] = stack.pop();
        points.push([cx, cy]);
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (seen.has(ny * SIZE + nx) || !isBeak(px(img, nx, ny))) continue;
            if (nx < BOX.x0 || nx > BOX.x1 || ny < BOX.y0 || ny > BOX.y1) {
              inside = false;
              continue;
            }
            seen.add(ny * SIZE + nx);
            stack.push([nx, ny]);
          }
        }
      }
      if (inside && (!best || points.length > best.points.length)) {
        const xs = points.map((p) => p[0]);
        const ys = points.map((p) => p[1]);
        best = { points, left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
      }
    }
  }
  return best;
}

const mid = (a, b) => Math.round((a + b) / 2);

for (const season of SEASONS) {
  const dir = `public/bobbin/pixel/${season}`;
  const bird = Buffer.from(await load(`${dir}/sparkle.webp`));
  const cheer = await load(`${dir}/cheering.webp`);

  const shut = beak(bird);
  const open = beak(cheer);
  if (!shut || !open) throw new Error(`${season}: couldn't find a beak`);

  // Paint over the closed beak with the face color just beside it.
  const skin = Uint8Array.from(px(bird, shut.left - 3, mid(shut.top, shut.bottom)));
  for (let y = shut.top - 1; y <= shut.bottom + 1; y++) {
    for (let x = shut.left - 1; x <= shut.right + 1; x++) px(bird, x, y).set(skin);
  }
  // Draw the open beak with its top where the closed one's was.
  const dx = mid(shut.left, shut.right) - mid(open.left, open.right);
  const dy = shut.top - open.top;
  for (const [x, y] of open.points) px(bird, x + dx, y + dy).set(px(cheer, x, y));

  await sharp(bird, { raw: { width: SIZE, height: SIZE, channels: 4 } }).webp({ lossless: true }).toFile(`${dir}/talk.webp`);
  console.log(season, "closed", shut.left, shut.top, shut.right, shut.bottom, "| open", open.left, open.top, open.right, open.bottom);
}
