"use client";

import { useEffect } from "react";
import { useSeason } from "@/lib/useSeason";

/** Points the tab icon at Bobbin in the current season. The static icons in app/ are the winter fallback. */
export function SeasonFavicon() {
  const season = useSeason();
  useEffect(() => {
    const set = (selector: string, rel: string, href: string) => {
      const links = document.head.querySelectorAll<HTMLLinkElement>(selector);
      if (links.length === 0) {
        const link = document.createElement("link");
        link.rel = rel;
        link.href = href;
        document.head.appendChild(link);
        return;
      }
      links.forEach((link) => {
        link.href = href;
        link.removeAttribute("type");
        link.removeAttribute("sizes");
      });
    };
    set('link[rel~="icon"]', "icon", `/favicons/${season}.png`);
    set('link[rel="apple-touch-icon"]', "apple-touch-icon", `/favicons/${season}-apple.png`);
  }, [season]);
  return null;
}
