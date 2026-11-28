import type { Metadata } from "next";
import { Nunito, Pixelify_Sans } from "next/font/google";
import { faviconFor } from "@/lib/favicon";
import { SeasonFavicon } from "@/components/SeasonFavicon";
import { SITE_URL } from "@/lib/config";
import { BUILT_SEASON } from "@/lib/builtSeason";
import "./globals.css";

// Open-license Google fonts; confirm the licenses before shipping.
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const pixelify = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "tuftly: gentle practice for AI interviews", template: "%s · tuftly" },
  description:
    "Short lessons, spaced practice and a friendly bird to help you get ready for web developer interviews run by AI voice agents.",
  // The build's season until the browser knows the date; SeasonFavicon then goes by that.
  icons: {
    icon: [{ url: faviconFor(BUILT_SEASON).icon, type: "image/png" }],
    apple: faviconFor(BUILT_SEASON).apple,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} ${pixelify.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SeasonFavicon />
        {children}
      </body>
    </html>
  );
}
