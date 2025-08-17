import { MetadataRoute } from "next";
import { langListData } from "@/dictionaries";

export const dynamic = "force-static";

const defaultLang = "en";
const baseUrl = "https://bg-remover.codinasion.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [""];

  const now = new Date();

  const sitemapEntries: MetadataRoute.Sitemap = routes.map((route) => {
    const enUrl = `${baseUrl}/${defaultLang}/${route}`;
    const alternates: Record<string, string> = {};

    // Add non-default languages as alternates
    langListData.forEach((lang) => {
      if (lang !== defaultLang) {
        alternates[lang] = `${baseUrl}/${lang}/${route}`;
      }
    });

    return {
      url: enUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
      alternates: {
        languages: alternates,
      },
    };
  });

  return [...sitemapEntries];
}
