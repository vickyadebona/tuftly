"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { faviconFor } from "@/lib/favicon";
import { useSeason } from "@/lib/useSeason";

function point(selector: string, rel: string, href: string) {
  const links = document.head.querySelectorAll<HTMLLinkElement>(selector);
  if (links.length === 0) {
    const link = document.createElement("link");
    link.rel = rel;
    link.href = href;
    document.head.appendChild(link);
    return;
  }
  links.forEach((link) => {
    if (link.getAttribute("href") === href) return;
    link.setAttribute("href", href);
    link.removeAttribute("type");
    link.removeAttribute("sizes");
  });
}

/**
 * Points the tab icon at Bobbin in the current season. The `icons` entry in the root layout is the
 * winter version the server sends first. Next puts its own copy of those tags back into the head
 * when you move between pages, so this watches the head and re-applies the season whenever it changes.
 */
export function SeasonFavicon() {
  const season = useSeason();
  const pathname = usePathname();
  useEffect(() => {
    const { icon, apple } = faviconFor(season);
    const apply = () => {
      point('link[rel~="icon"]', "icon", icon);
      point('link[rel="apple-touch-icon"]', "apple-touch-icon", apple);
    };
    apply();
    const watcher = new MutationObserver(apply);
    watcher.observe(document.head, { childList: true });
    return () => watcher.disconnect();
  }, [season, pathname]);
  return null;
}
