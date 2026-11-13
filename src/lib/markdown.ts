/**
 * Markdown renderings of the site's pages, served to agents that send
 * `Accept: text/markdown` (see vercel.json) and at the `.md` URLs.
 */
import type { ContentBlock, InfoPage } from "../data/pages.ts";
import { infoPages } from "../data/pages.ts";
import type { ProfileContent } from "../data/profile.ts";
import { profiles, SITE_URL, socialLinks, ZENN_URL } from "../data/profile.ts";
import type { Post } from "./zenn.ts";

export const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";

/** Escape characters that would break Markdown link text. */
export const escapeLinkText = (text: string): string => text.replace(/([\\[\]])/g, "\\$1");

const link = (text: string, url: string): string =>
  `[${escapeLinkText(text)}](${new URL(url, SITE_URL).href})`;

const siteLinks = (): string[] => [
  "## More from this site",
  "",
  ...infoPages.map((p) => `- ${link(p.heading, p.path)} (Markdown: ${link(p.markdownPath, p.markdownPath)})`),
  `- ${link("llms.txt (guide for AI agents)", "/llms.txt")}`,
  `- ${link("Sitemap", "/sitemap.xml")}`,
];

export function renderProfileMarkdown(profile: ProfileContent, posts: Post[] = []): string {
  const other = profile.lang === "ja" ? profiles.en : profiles.ja;
  const otherLabel = profile.lang === "ja" ? "English" : "日本語";
  const out: string[] = [
    `# ${profile.name} (${profile.nameAlt})`,
    "",
    `> ${profile.role} - ${profile.affiliation}`,
    "",
    `Canonical HTML: ${new URL(profile.path, SITE_URL).href} · ${otherLabel}: ${link(other.name, other.path)}`,
    "",
    "## About",
    "",
    profile.about.join("\n\n"),
    "",
    "## Career",
    "",
  ];

  for (const c of profile.careers) {
    out.push(`### ${c.company} - ${c.position}`, "", `${c.startDate} ~ ${c.endDate}`, "");
    out.push(...c.descriptions.map((d) => `- ${d}`));
    if (c.blogUrl) out.push(`- ${link(c.blogTitle ?? c.blogUrl, c.blogUrl)}`);
    out.push("");
  }

  out.push("## Interests", "", ...profile.interests.map((i) => `- ${i}`), "", "## Works", "");
  for (const w of profile.works) {
    out.push(`### ${link(w.projectName, w.projectLink)}`, "", w.projectDescription, "");
    out.push(`- Technologies: ${w.technologies.join(", ")}`);
    if (w.githubLink) out.push(`- GitHub: ${w.githubLink}`);
    out.push("");
  }
  out.push(profile.worksFooter, "");

  out.push("## Latest Articles", "");
  if (posts.length > 0) {
    out.push(...posts.map((p) => `- ${p.date}: ${link(p.title, p.slug)}`));
  }
  out.push(`- ${link(profile.moreArticles, ZENN_URL)}`, "");

  out.push("## Social", "", profile.socialIntro, "");
  out.push(...socialLinks.map((s) => `- ${link(s.label, s.url)}`), "");
  out.push(...siteLinks(), "");
  return out.join("\n");
}

function renderBlocks(blocks: ContentBlock[]): string[] {
  const out: string[] = [];
  for (const block of blocks) {
    out.push(`### ${block.heading}`, "");
    for (const p of block.paragraphs ?? []) out.push(p, "");
    if (block.items?.length) {
      out.push(...block.items.map((i) => (i.url ? `- ${link(i.text, i.url)}` : `- ${i.text}`)));
      out.push("");
    }
  }
  return out;
}

export function renderInfoPageMarkdown(page: InfoPage): string {
  return [
    `# ${page.heading}`,
    "",
    `> ${page.description}`,
    "",
    `Canonical HTML: ${new URL(page.path, SITE_URL).href} · Last updated: ${page.lastmod}`,
    "",
    "## 日本語",
    "",
    ...renderBlocks(page.ja),
    "## English",
    "",
    ...renderBlocks(page.en),
    ...siteLinks(),
    "",
  ].join("\n");
}

export function renderNotFoundMarkdown(): string {
  return [
    "# 404 Not Found",
    "",
    "The page you requested does not exist on hekuta.net. It may have been moved or the URL may contain a typo.",
    "",
    "This is the personal portfolio of Heitor Hirose (広瀬 エイトル). Useful starting points:",
    "",
    `- ${link("Profile (Japanese)", "/")} - Markdown: ${link("/index.md", "/index.md")}`,
    `- ${link("Profile (English)", "/en")} - Markdown: ${link("/en.md", "/en.md")}`,
    `- ${link("llms.txt (guide for AI agents)", "/llms.txt")}`,
    `- ${link("Sitemap", "/sitemap.xml")}`,
    "",
  ].join("\n");
}
