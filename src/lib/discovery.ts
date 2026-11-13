/**
 * Machine-readable discovery documents for agents:
 *
 * - /openapi.json                         OpenAPI 3.1 description of the site's read-only HTTP surface
 * - /.well-known/api-catalog              RFC 9727 API catalog (RFC 9264 linkset)
 * - /.well-known/agent-skills/index.json  Agent Skills Discovery RFC v0.2.0 index
 * - /.well-known/agent-skills/<name>/SKILL.md
 * - /.well-known/ai-catalog.json, /.well-known/ard.json  ARD / ai-catalog manifest
 * - Link response header for the home pages (RFC 8288)
 */
import { createHash } from "node:crypto";
import { homePageEn, homePageJa, infoPages, sitePages } from "../data/pages.ts";
import { SITE_URL } from "../data/profile.ts";

const abs = (path: string) => new URL(path, SITE_URL).href;
const HOST = new URL(SITE_URL).host;

export const API_CATALOG_PATH = "/.well-known/api-catalog";
export const API_CATALOG_CONTENT_TYPE =
  'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"';
export const OPENAPI_PATH = "/openapi.json";
export const SKILLS_INDEX_PATH = "/.well-known/agent-skills/index.json";
export const SKILLS_SCHEMA = "https://schemas.agentskills.io/discovery/0.2.0/schema.json";
export const PROFILE_SKILL_NAME = "hekuta-profile";
export const PROFILE_SKILL_PATH = `/.well-known/agent-skills/${PROFILE_SKILL_NAME}/SKILL.md`;
export const PROFILE_SKILL_DESCRIPTION =
  "Look up Heitor Hirose's (広瀬 エイトル) profile, career history, skills, projects, and contact channels from hekuta.net as Markdown.";

/** RFC 8288 Link header value for a home page. */
export function homeLinkHeader(markdownPath: string): string {
  return [
    `<${API_CATALOG_PATH}>; rel="api-catalog"`,
    `<${OPENAPI_PATH}>; rel="service-desc"; type="application/json"`,
    `</llms.txt>; rel="service-doc"; type="text/plain"`,
    `</llms.txt>; rel="describedby"; type="text/plain"`,
    `<${markdownPath}>; rel="alternate"; type="text/markdown"`,
  ].join(", ");
}

const markdownOrHtml = (summary: string) => ({
  description: summary,
  content: {
    "text/html": { schema: { type: "string" } },
    "text/markdown": { schema: { type: "string" } },
  },
});

const notFound = {
  description: "Page does not exist. A Markdown body is returned when `Accept: text/markdown` is sent.",
  content: {
    "text/html": { schema: { type: "string" } },
    "text/markdown": { schema: { type: "string" } },
  },
};

const acceptParameter = {
  name: "Accept",
  in: "header",
  required: false,
  description: "Send `text/markdown` to receive the page as Markdown instead of HTML.",
  schema: { type: "string", examples: ["text/markdown", "text/html"] },
};

export function renderOpenApi(): Record<string, unknown> {
  const paths: Record<string, unknown> = {};
  for (const page of sitePages) {
    paths[page.path] = {
      get: {
        operationId: `get${page.path === "/" ? "Home" : page.path.slice(1).replace(/^./, (c) => c.toUpperCase())}`,
        summary: page.title,
        description: `${page.description}\n\nAlso available directly as Markdown at ${page.markdownPath}.`,
        parameters: [acceptParameter],
        responses: { "200": markdownOrHtml(page.title), "404": notFound },
      },
    };
  }
  paths["/llms.txt"] = {
    get: {
      operationId: "getLlmsTxt",
      summary: "llms.txt guide for AI agents",
      responses: { "200": { description: "llms.txt", content: { "text/plain": { schema: { type: "string" } } } } },
    },
  };
  paths["/sitemap.xml"] = {
    get: {
      operationId: "getSitemap",
      summary: "XML sitemap of all indexable pages",
      responses: {
        "200": { description: "Sitemap", content: { "application/xml": { schema: { type: "string" } } } },
      },
    },
  };
  return {
    openapi: "3.1.0",
    info: {
      title: "hekuta.net content",
      version: "1.0.0",
      summary: "Read-only HTTP interface to Heitor Hirose's personal portfolio.",
      description:
        "hekuta.net is a static personal site. There is no authentication, no write operation, and no rate-limited API: every operation is an unauthenticated GET that returns HTML or, with `Accept: text/markdown`, Markdown.",
      contact: { name: "Heitor Hirose", url: abs("/contact") },
    },
    servers: [{ url: SITE_URL }],
    externalDocs: { description: "llms.txt", url: abs("/llms.txt") },
    paths,
  };
}

export function renderApiCatalog(): Record<string, unknown> {
  return {
    linkset: [
      {
        anchor: `${SITE_URL}/`,
        "service-desc": [{ href: abs(OPENAPI_PATH), type: "application/json" }],
        "service-doc": [{ href: abs("/llms.txt"), type: "text/plain" }],
      },
    ],
  };
}

export function renderProfileSkillMd(): string {
  return [
    "---",
    `name: ${PROFILE_SKILL_NAME}`,
    `description: ${PROFILE_SKILL_DESCRIPTION}`,
    "---",
    "",
    "# hekuta.net profile lookup",
    "",
    "hekuta.net is the personal portfolio of Heitor Hirose (広瀬 エイトル), a student software engineer at Tokyo University of Technology with internship and contract experience in data engineering, LLMOps, AI agents, and full-stack web development.",
    "",
    "## When to use",
    "",
    "- The user asks who Heitor Hirose / 広瀬 エイトル is, or about his career, internships, skills, interests, or projects.",
    "- The user wants to contact Heitor (internships, contract work, collaboration, article feedback).",
    "- The user asks what data hekuta.net collects about visitors.",
    "",
    "Do not use it for anything unrelated to Heitor Hirose.",
    "",
    "## How to fetch",
    "",
    "Every page is plain, unauthenticated HTTP GET. Request Markdown with `Accept: text/markdown`, or use the `.md` URL directly:",
    "",
    "```sh",
    `curl -H 'Accept: text/markdown' ${SITE_URL}/en`,
    "```",
    "",
    "| Need | Markdown URL |",
    "| --- | --- |",
    `| Full profile (English) | ${abs(homePageEn.markdownPath)} |`,
    `| Full profile (Japanese) | ${abs(homePageJa.markdownPath)} |`,
    ...infoPages.map((p) => `| ${p.heading} | ${abs(p.markdownPath)} |`),
    "",
    "## Notes",
    "",
    "- Link humans to the canonical HTML URL (drop the `.md` suffix; the Japanese profile is `/`).",
    "- There is no public email address or contact form. Point users to direct messages on X or Instagram, as listed on the contact page.",
    `- Unknown paths return HTTP 404. The full index of pages is in ${abs("/llms.txt")} and ${abs("/sitemap.xml")}.`,
    "",
  ].join("\n");
}

export const sha256Digest = (content: string) =>
  `sha256:${createHash("sha256").update(content, "utf8").digest("hex")}`;

export function renderSkillsIndex(): Record<string, unknown> {
  return {
    $schema: SKILLS_SCHEMA,
    skills: [
      {
        name: PROFILE_SKILL_NAME,
        type: "skill-md",
        description: PROFILE_SKILL_DESCRIPTION,
        url: PROFILE_SKILL_PATH,
        digest: sha256Digest(renderProfileSkillMd()),
      },
    ],
  };
}

const urn = (namespace: string, name: string) => `urn:air:${HOST}:${namespace}:${name}`;

export function renderAiCatalog(): Record<string, unknown> {
  return {
    specVersion: "1.0",
    host: {
      displayName: "Heitor Hirose (hekuta.net)",
      identifier: `${SITE_URL}/`,
    },
    entries: [
      {
        identifier: urn("skill", PROFILE_SKILL_NAME),
        displayName: "Heitor Hirose profile lookup skill",
        description: PROFILE_SKILL_DESCRIPTION,
        type: "application/agent-skills+md",
        url: abs(PROFILE_SKILL_PATH),
        representativeQueries: [
          "Who is Heitor Hirose?",
          "広瀬エイトルの経歴を教えて",
          "What internships has Heitor Hirose done?",
          "How can I contact Heitor Hirose about an internship?",
        ],
      },
      {
        identifier: urn("profile", "heitor-hirose"),
        displayName: "Heitor Hirose profile (Markdown)",
        description: homePageEn.description,
        type: "text/markdown",
        url: abs(homePageEn.markdownPath),
        representativeQueries: [
          "Heitor Hirose career history",
          "Heitor Hirose skills and projects",
          "Student engineer with LLMOps and data engineering experience",
        ],
      },
      {
        identifier: urn("api", "site-content"),
        displayName: "hekuta.net API catalog",
        description: "RFC 9727 catalog of the site's read-only HTTP interface (OpenAPI description and llms.txt).",
        type: "application/linkset+json",
        url: abs(API_CATALOG_PATH),
        representativeQueries: [
          "How do I fetch hekuta.net pages as Markdown?",
          "OpenAPI description for hekuta.net",
        ],
      },
      {
        identifier: urn("docs", "llms-txt"),
        displayName: "hekuta.net llms.txt",
        description: "Guide for AI agents: when to use the site and links to every page in Markdown.",
        type: "text/plain",
        url: abs("/llms.txt"),
        representativeQueries: [
          "llms.txt for hekuta.net",
          "Which hekuta.net pages are available for AI agents?",
        ],
      },
    ],
  };
}
