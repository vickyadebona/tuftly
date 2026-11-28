import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BUILT_SEASON } from "@/lib/builtSeason";
import { SKY } from "@/lib/island";

/** The picture shown when a tuftly link is shared. */
export const alt = "tuftly: gentle practice for AI interviews, with Bobbin the pixel bird";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Read once, as the site is built, so the picture is made ahead of time. The image maker can't read
// the app's webp images or woff2 fonts, so assets/og keeps copies it can.
const asset = (name: string) => readFile(join(process.cwd(), "assets", "og", name));
const [bird, pixel, body] = await Promise.all([asset(`${BUILT_SEASON}.png`), asset("PixelifySans-Bold.ttf"), asset("Nunito-SemiBold.ttf")]);

// The app's colors (src/app/globals.css).
const INK = "#4a3326";
const TEAL = "#4fb3a9";
const PAPER = "#fffdf4";

/**
 * Where each letter of the wordmark starts at 100px, as the browser lays out Pixelify Sans in the
 * app's logo. The image maker spaces the letters further apart, so they're placed by hand.
 */
const WORD = {
  letters: [["t", 0], ["u", 69.2], ["f", 127.5], ["t", 187.8], ["l", 248], ["y", 270.9]] as const,
  width: 329.2,
};
const SCALE = 1.5;

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: SKY[BUILT_SEASON] }}>
        {/* A pixel box, like the app's cards: brown outline and a hard shadow. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 48,
            padding: "40px 72px 40px 48px",
            background: PAPER,
            border: `8px solid ${INK}`,
            boxShadow: `14px 14px 0 rgba(91, 58, 41, 0.28)`,
          }}
        >
          <img src={`data:image/png;base64,${bird.toString("base64")}`} alt="" width={360} height={360} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", position: "relative", width: WORD.width * SCALE, height: 150, fontFamily: "Pixelify Sans", fontSize: 150, lineHeight: 1 }}>
              {WORD.letters.map(([letter, x], i) => (
                <span key={i} style={{ position: "absolute", left: x * SCALE, top: 0, color: i < 4 ? INK : TEAL }}>
                  {letter}
                </span>
              ))}
            </div>
            <div style={{ fontFamily: "Nunito", fontSize: 44, color: INK, maxWidth: 520 }}>Gentle practice for AI interviews</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pixelify Sans", data: pixel, weight: 700, style: "normal" },
        { name: "Nunito", data: body, weight: 600, style: "normal" },
      ],
    },
  );
}
