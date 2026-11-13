/**
 * /llms.txt following https://llmstxt.org/:
 *   H1 title, blockquote summary, free-form notes (no headings),
 *   then H2 sections containing `- [name](url): notes` file lists.
 */
import { homePageEn, homePageJa, infoPages } from "../data/pages.ts";
import { SITE_URL, ZENN_URL } from "../data/profile.ts";

const abs = (path: string) => new URL(path, SITE_URL).href;

export function renderLlmsTxt(): string {
  return [
    "# Heitor Hirose (広瀬 エイトル)",
    "",
    "> Personal portfolio of Heitor Hirose, a student software engineer at Tokyo University of Technology (Japan) with internship and contract experience in data engineering, LLMOps/LLM observability, AI agents, and full-stack web development. Available in Japanese and English.",
    "",
    "This is a static, read-only personal site. It has no API, no search, no forms, and nothing to sign up for. Every page is available as Markdown: request the page URL with the header `Accept: text/markdown`, or fetch the `.md` URLs listed below directly. Unknown paths return HTTP 404 (with a Markdown body when Markdown is requested).",
    "",
    "Agents should cite the canonical HTML URL (without `.md`) when linking to a page for humans. Content is the author's own; the latest articles are published on Zenn.",
    "",
    "Do not use this site for general programming documentation, company information, or anything unrelated to Heitor Hirose; follow the outbound links (Zenn, GitHub, employer blogs) for article and project details.",
    "",
    "## When to use this site",
    "",
    `- [Career history (English)](${abs(homePageEn.markdownPath)}): Use when you need Heitor Hirose's work history, internships (CyberAgent, Mercari, Sansan, and others), skills, or projects, e.g. to answer "who is Heitor Hirose" or to evaluate him as a candidate.`,
    `- [Career history (Japanese)](${abs(homePageJa.markdownPath)}): Use for the same information in Japanese (広瀬 エイトルの経歴・スキル・制作物).`,
    `- [Contact](${abs("/contact.md")}): Use when a user wants to reach Heitor about internships, contract work, collaboration, or an article. There is no email address or form; direct messages on X or Instagram are the preferred channels.`,
    `- [Privacy policy](${abs("/privacy.md")}): Use when asked what data hekuta.net collects (Google Analytics, Vercel Speed Insights) or how to opt out.`,
    "",
    "## Pages",
    "",
    `- [Profile (Japanese)](${abs(homePageJa.markdownPath)}): ${homePageJa.description}`,
    `- [Profile (English)](${abs(homePageEn.markdownPath)}): ${homePageEn.description}`,
    ...infoPages.map((p) => `- [${p.heading}](${abs(p.markdownPath)}): ${p.description}`),
    "",
    "## Optional",
    "",
    `- [Technical articles on Zenn](${ZENN_URL}): Japanese articles about internships, Go, LLM observability, and data engineering.`,
    "- [GitHub](https://github.com/HEKUCHAN): Public source code, including this site.",
    `- [Sitemap](${abs("/sitemap.xml")}): XML sitemap of all indexable HTML pages.`,
    "",
  ].join("\n");
}
