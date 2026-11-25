// Draws Bobbin's wink for each season from art we already have: the open-eyed "sparkle" bird,
// with one eye swapped for the closed eye from "cheering" and one of its stars added.
// Run from the repo root: node scripts/make-wink.mjs
import sharp from "sharp";

const SIZE = 200;
const SEASONS = ["winter", "spring", "summer", "autumn"];

const load = async (path) => (await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true })).data;
const px = (img, x, y) => img.subarray((y * SIZE + x) * 4, (y * SIZE + x) * 4 + 4);
const isDark = (p) => p[3] > 128 && p[0] < 130 && p[1] < 100 && p[2] < 90;
const isGold = (p) => p[3] > 128 && p[0] > 200 && p[1] > 120 && p[2] < 170;

/** Connected groups of matching pixels that lie wholly inside the box. */
function blobs(img, match, [x0, y0, x1, y1], diagonals = true) {
  const seen = new Set();
  const found = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (seen.has(y * SIZE + x) || !match(px(img, x, y))) continue;
      const points = [];
      const stack = [[x, y]];
      let inside = true;
      seen.add(y * SIZE + x);
      while (stack.length) {
        const [cx, cy] = stack.pop();
        points.push([cx, cy]);
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (!diagonals && dx && dy) continue;
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE || seen.has(ny * SIZE + nx) || !match(px(img, nx, ny))) continue;
            if (nx < x0 || nx > x1 || ny < y0 || ny > y1) {
              inside = false;
              continue;
            }
            seen.add(ny * SIZE + nx);
            stack.push([nx, ny]);
          }
        }
      }
      if (!inside) continue;
      const xs = points.map((p) => p[0]);
      const ys = points.map((p) => p[1]);
      found.push({ points, left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) });
    }
  }
  return found.sort((a, b) => b.points.length - a.points.length);
}

const EYE_BOX = [102, 60, 146, 100];
// The autumn beret's outline meets the eye corner to corner, so there only side-by-side pixels join.
const DIAGONALS = { autumn: false };
const mid = (a, b) => Math.round((a + b) / 2);

for (const season of SEASONS) {
  const dir = `public/bobbin/pixel/${season}`;
  const bird = Buffer.from(await load(`${dir}/sparkle.webp`));
  const cheer = await load(`${dir}/cheering.webp`);

  const open = blobs(bird, isDark, EYE_BOX, DIAGONALS[season])[0];
  const shut = blobs(cheer, isDark, EYE_BOX, DIAGONALS[season])[0];
  if (!open || !shut) throw new Error(`${season}: couldn't find an eye`);

  // Paint over the open eye (and its white glint) with the face color just beside it.
  const skin = Uint8Array.from(px(bird, open.left - 3, mid(open.top, open.bottom)));
  for (let y = open.top - 1; y <= open.bottom + 1; y++) {
    for (let x = open.left - 1; x <= open.right + 1; x++) px(bird, x, y).set(skin);
  }
  // Draw the closed eye where the open one was.
  const dx = mid(open.left, open.right) - mid(shut.left, shut.right);
  const dy = mid(open.top, open.bottom) - mid(shut.top, shut.bottom);
  for (const [x, y] of shut.points) px(bird, x + dx, y + dy).set(px(cheer, x, y));

  // The biggest of the cheering bird's stars, set just outside the head beside the winking eye.
  const star = blobs(cheer, isGold, [0, 0, 75, 70])[0];
  if (!star) throw new Error(`${season}: couldn't find a star`);
  const toX = 164 - mid(star.left, star.right);
  const toY = 46 - mid(star.top, star.bottom);
  for (let y = star.top - 1; y <= star.bottom + 1; y++) {
    for (let x = star.left - 1; x <= star.right + 1; x++) {
      const from = px(cheer, x, y);
      if (from[3] && px(bird, x + toX, y + toY)[3] === 0) px(bird, x + toX, y + toY).set(from);
    }
  }

  await sharp(bird, { raw: { width: SIZE, height: SIZE, channels: 4 } }).webp({ lossless: true }).toFile(`${dir}/wink.webp`);
  console.log(season, "eye", open.left, open.top, open.right, open.bottom, "| closed", shut.left, shut.top, shut.right, shut.bottom, "| star px", star.points.length);
}
