/**
 * schema.org JSON-LD builders. This is a personal site, so the identity
 * entity is a `Person` (not an Organization).
 */
import type { InfoPage, SitePage } from "../data/pages.ts";
import { profileEn, SITE_URL, socialLinks } from "../data/profile.ts";

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

type JsonLd = Record<string, unknown>;

export const absoluteUrl = (path: string): string => new URL(path, SITE_URL).href;

export function buildPerson(imageUrl?: string): JsonLd {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Heitor Hirose",
    alternateName: "広瀬 エイトル",
    description:
      "Student software engineer at Tokyo University of Technology with internship and contract experience in data engineering, LLMOps, and full-stack web development.",
    url: `${SITE_URL}/`,
    ...(imageUrl ? { image: imageUrl } : {}),
    jobTitle: profileEn.role,
    affiliation: {
      "@type": "CollegeOrUniversity",
      name: "Tokyo University of Technology",
      url: "https://www.teu.ac.jp/",
    },
    memberOf: {
      "@type": "Organization",
      name: "LinuxClub",
      url: "https://lcn.ad.jp/",
    },
    knowsAbout: [
      "Data engineering",
      "Data pipelines",
      "Snowflake",
      "LLMOps",
      "LLM observability",
      "Retrieval-augmented generation",
      "Semantic layers",
      "TypeScript",
      "Python",
      "Go",
    ],
    sameAs: socialLinks.map((link) => link.url),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "general inquiries",
      url: absoluteUrl("/contact"),
      availableLanguage: ["Japanese", "English"],
    },
  };
}

function buildWebSite(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: "Heitor Hirose",
    description: "Personal portfolio of Heitor Hirose (広瀬 エイトル).",
    inLanguage: ["ja", "en"],
    publisher: { "@id": PERSON_ID },
  };
}

const pageTypes: Record<InfoPage["slug"], string> = {
  about: "AboutPage",
  contact: "ContactPage",
  privacy: "WebPage",
};

/** JSON-LD graph for a page. Home pages are `ProfilePage`s. */
export function buildPageJsonLd(
  page: SitePage & { slug?: InfoPage["slug"] },
  imageUrl?: string,
): JsonLd {
  const isHome = page.path === "/" || page.path === "/en";
  const url = absoluteUrl(page.path);
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildWebSite(),
      buildPerson(imageUrl),
      {
        "@type": isHome ? "ProfilePage" : pageTypes[page.slug ?? "privacy"],
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: page.lang,
        isPartOf: { "@id": WEBSITE_ID },
        dateModified: page.lastmod,
        ...(isHome ? { mainEntity: { "@id": PERSON_ID } } : { about: { "@id": PERSON_ID } }),
      },
    ],
  };
}

/**
 * Serialize JSON-LD for inline `<script type="application/ld+json">`.
 * Escapes `<` so content can never close the script element.
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
