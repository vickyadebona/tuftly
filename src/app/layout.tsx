import type { Metadata } from "next";
import { Nunito, Pixelify_Sans } from "next/font/google";
import { faviconFor } from "@/lib/favicon";
import { SeasonFavicon } from "@/components/SeasonFavicon";
import "./globals.css";

// Open-license Google fonts; confirm the licenses before shipping.
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const pixelify = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "tuftly: gentle practice for AI interviews",
  description:
    "Short lessons, spaced practice and a friendly bird to help you get ready for web developer interviews run by AI voice agents.",
  // Winter until the browser knows the date; SeasonFavicon then swaps in the current season.
  icons: {
    icon: [{ url: faviconFor("winter").icon, type: "image/png" }],
    apple: faviconFor("winter").apple,
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
