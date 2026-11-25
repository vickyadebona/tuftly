import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { faviconFor } from "@/lib/favicon";
import { SEASONS } from "@/lib/season";

// The tab and home-screen icons, read through the same helper the app uses.
function Favicons() {
  return (
    <ul className="flex flex-col gap-4">
      {SEASONS.map((season) => {
        const { icon, apple } = faviconFor(season);
        return (
          <li key={season} className="pixel-box flex flex-wrap items-center gap-4 p-4">
            <span className="font-pixel w-20 font-bold capitalize text-ink">{season}</span>
            {[16, 32, 64].map((size) => (
              // eslint-disable-next-line @next/next/no-img-element -- showing the file exactly as served
              <img key={size} src={icon} alt={`${season} tab icon at ${size}px`} width={size} height={size} />
            ))}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={apple} alt={`${season} home-screen icon`} width={90} height={90} />
          </li>
        );
      })}
    </ul>
  );
}

const meta = { title: "Pixel art/Favicons", component: Favicons } satisfies Meta<typeof Favicons>;
export default meta;

export const BySeason: StoryObj<typeof meta> = {};
