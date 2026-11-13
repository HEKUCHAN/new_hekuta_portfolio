import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { infoPages, sitePages } from "../src/data/pages.ts";
import { profileEn, profileJa } from "../src/data/profile.ts";
import { renderLlmsTxt } from "../src/lib/llms.ts";
import {
  escapeLinkText,
  renderInfoPageMarkdown,
  renderNotFoundMarkdown,
  renderProfileMarkdown,
} from "../src/lib/markdown.ts";
import { renderSitemap } from "../src/lib/sitemap.ts";
import { buildPageJsonLd, serializeJsonLd } from "../src/lib/structured-data.ts";

const visibleText = (md: string) => md.replace(/\]\([^)]*\)/g, "]").replace(/[#>*\-[\]]/g, "");

describe("Markdown renderings", () => {
  it("renders the Japanese profile with every section and career", () => {
    const md = renderProfileMarkdown(profileJa, [
      { title: "記事 [1]", date: "2026-11-01", slug: "https://zenn.dev/hekuchandao/articles/x" },
    ]);
    assert.match(md, /^# 広瀬 エイトル \(Heitor Hirose\)\n/);
    for (const heading of ["About", "Career", "Interests", "Works", "Latest Articles", "Social"]) {
      assert.match(md, new RegExp(`^## ${heading}$`, "m"));
    }
    for (const career of profileJa.careers) assert.ok(md.includes(career.company));
    assert.ok(md.includes("- 2026-11-01: [記事 \\[1\\]](https://zenn.dev/hekuchandao/articles/x)"));
    assert.ok(md.includes("https://hekuta.net/llms.txt"));
  });

  it("renders the English profile and links to the Japanese one", () => {
    const md = renderProfileMarkdown(profileEn);
    assert.match(md, /^# Heitor Hirose \(広瀬 エイトル\)\n/);
    assert.ok(md.includes("日本語: [広瀬 エイトル](https://hekuta.net/)"));
  });

  it("renders every trust page with both languages and enough content", () => {
    for (const page of infoPages) {
      const md = renderInfoPageMarkdown(page);
      assert.match(md, /^## 日本語$/m);
      assert.match(md, /^## English$/m);
      assert.ok(visibleText(md).length >= 500, `${page.slug} is too short`);
    }
  });

  it("renders a helpful 404 body that links to llms.txt and the sitemap", () => {
    const md = renderNotFoundMarkdown();
    assert.match(md, /^# 404 Not Found/);
    assert.ok(md.length >= 20);
    assert.ok(md.includes("(https://hekuta.net/llms.txt)"));
    assert.ok(md.includes("(https://hekuta.net/sitemap.xml)"));
  });

  it("escapes brackets in link text", () => {
    assert.equal(escapeLinkText("a [b] \\c"), "a \\[b\\] \\\\c");
  });
});

describe("llms.txt", () => {
  const txt = renderLlmsTxt();
  const lines = txt.split("\n");

  it("follows the llmstxt.org structure", () => {
    assert.match(lines[0], /^# \S/, "first line must be the H1");
    assert.equal(lines.filter((l) => l.startsWith("# ")).length, 1, "exactly one H1");
    assert.match(lines[2], /^> \S/, "blockquote summary follows the H1");
    const firstH2 = lines.findIndex((l) => l.startsWith("## "));
    assert.ok(
      lines.slice(1, firstH2).every((l) => !/^#{1,6} /.test(l)),
      "no headings between H1 and the first H2",
    );
    const sections = txt.split(/^## /m).slice(1);
    for (const section of sections) {
      const items = section.split("\n").slice(1).filter((l) => l.startsWith("- "));
      assert.ok(items.length > 0);
      for (const item of items) {
        assert.match(item, /^- \[[^\]]+\]\(https?:\/\/[^)]+\)(: .+)?$/, "H2 sections may only contain file-list links");
      }
    }
  });

  it("has a specific when-to-use section", () => {
    assert.match(txt, /^## When to use this site$/m);
    assert.ok(txt.includes("Accept: text/markdown"));
    assert.ok(txt.includes("https://hekuta.net/contact.md"));
  });

  it("only links to Markdown pages that exist in the page registry", () => {
    const known = new Set(sitePages.map((p) => `https://hekuta.net${p.markdownPath}`));
    const mdLinks = [...txt.matchAll(/\((https:\/\/hekuta\.net\/[^)]+\.md)\)/g)].map((m) => m[1]);
    assert.ok(mdLinks.length >= sitePages.length);
    for (const url of mdLinks) assert.ok(known.has(url), `${url} is not a known page`);
  });
});

describe("sitemap.xml", () => {
  const xml = renderSitemap();

  it("lists every indexable page with lastmod", () => {
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'));
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    assert.deepEqual(locs, sitePages.map((p) => new URL(p.path, "https://hekuta.net").href));
    const lastmods = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
    assert.equal(lastmods.length, locs.length);
    for (const d of lastmods) assert.match(d, /^\d{4}-\d{2}-\d{2}$/);
  });

  it("declares hreflang alternates for the home pages", () => {
    assert.ok(xml.includes('<xhtml:link rel="alternate" hreflang="en" href="https://hekuta.net/en"/>'));
    assert.equal((xml.match(/<url>/g) ?? []).length, (xml.match(/<\/url>/g) ?? []).length);
  });
});

describe("JSON-LD", () => {
  it("describes the home page as a ProfilePage about a Person", () => {
    const data = buildPageJsonLd(sitePages[0], "https://hekuta.net/og.jpg") as {
      "@context": string;
      "@graph": Record<string, unknown>[];
    };
    assert.equal(data["@context"], "https://schema.org");
    const person = data["@graph"].find((n) => n["@type"] === "Person")!;
    assert.equal(person.name, "Heitor Hirose");
    assert.equal(person.url, "https://hekuta.net/");
    assert.equal(person.image, "https://hekuta.net/og.jpg");
    assert.ok(typeof person.description === "string" && person.description.length > 20);
    assert.ok(Array.isArray(person.sameAs) && person.sameAs.includes("https://github.com/HEKUCHAN"));
    const contact = person.contactPoint as Record<string, unknown>;
    assert.equal(contact.url, "https://hekuta.net/contact");
    const page = data["@graph"].find((n) => n["@type"] === "ProfilePage")!;
    assert.deepEqual(page.mainEntity, { "@id": "https://hekuta.net/#person" });
  });

  it("uses AboutPage / ContactPage types for trust pages", () => {
    const types = infoPages.map((p) => {
      const graph = (buildPageJsonLd(p) as { "@graph": Record<string, unknown>[] })["@graph"];
      return graph[2]["@type"];
    });
    assert.deepEqual(types, ["AboutPage", "ContactPage", "WebPage"]);
  });

  it("serializes safely for inline script tags", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    assert.ok(!out.includes("</script>"));
    assert.deepEqual(JSON.parse(out), { name: "</script><script>alert(1)</script>" });
  });
});
