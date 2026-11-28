import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

/** The pages worth finding by search. The rest is the app itself. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL }, { url: `${SITE_URL}/about` }];
}
