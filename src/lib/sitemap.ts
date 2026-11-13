/**
 * /sitemap.xml following the sitemaps.org 0.9 protocol, with hreflang
 * alternates (xhtml:link) for the Japanese/English home pages.
 */
import type { SitePage } from "../data/pages.ts";
import { homePageEn, homePageJa, sitePages } from "../data/pages.ts";
import { SITE_URL } from "../data/profile.ts";

const abs = (path: string) => new URL(path, SITE_URL).href;

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const homeAlternates = [
  { hreflang: "ja", href: abs(homePageJa.path) },
  { hreflang: "en", href: abs(homePageEn.path) },
  { hreflang: "x-default", href: abs(homePageJa.path) },
];

export function renderSitemap(pages: SitePage[] = sitePages): string {
  const urls = pages.map((page) => {
    const isHome = page === homePageJa || page === homePageEn;
    const alternates = isHome
      ? homeAlternates.map(
          (a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${escapeXml(a.href)}"/>`,
        )
      : [];
    return [
      "  <url>",
      `    <loc>${escapeXml(abs(page.path))}</loc>`,
      `    <lastmod>${page.lastmod}</lastmod>`,
      ...alternates,
      "  </url>",
    ].join("\n");
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}
