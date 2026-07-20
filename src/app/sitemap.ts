import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { tools } from "@/lib/tools";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const pathnames = ["", ...tools.filter((t) => t.available).map((t) => `/${t.slug}`)];

  return pathnames.flatMap((pathname) =>
    routing.locales.map((locale) => ({
      url: `${siteUrl}/${locale}${pathname}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: pathname === "" ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${siteUrl}/${l}${pathname}`]),
        ),
      },
    })),
  );
}
