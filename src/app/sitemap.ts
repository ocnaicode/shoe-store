import type { MetadataRoute } from "next";
import { products } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://hokolifestylebd.com";
  const productUrls = products.map((p) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/track-order`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...productUrls,
  ];
}
